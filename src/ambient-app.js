import { LitElement, html, css } from 'lit';
import './inputs/play-pause.js';
import './inputs/lit-paper-button.js';
import { openDB } from 'idb';

class AmbientApp extends LitElement {
  static properties = {
    sounds: { type: Array },
    opusSupport: { type: Boolean },
  };

  static styles = css`
    :host {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      font-size: calc(10px + 2vmin);
      color: #1a2b42;
      max-width: 960px;
      margin: 0 auto;
      text-align: center;
      background-color: var(--ambient-app-background-color);
      --header-height: 64px;
    }

    main {
      flex-grow: 1;
    }

    h2 {
      font-weight: lighter;
      margin: 2px;
      font-size: 1.1em;
      color: #757575;
    }
    #header {
      position: fixed;
      top: 0px;
      left: 0px;
      right: 0px;
      height: var(--header-height);
      padding: 5px;
      box-sizing: border-box;
      background: #f8f8f8;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }
    #headerLogo {
      height: calc(var(--header-height) - 10px);
    }
    #headerText {
      padding-left: 10px;
    }
    .headerSpacer {
      height: var(--header-height);
    }
    #stopFooter {
      height: var(--header-height);
      position: fixed;
      display: flex;
      align-items: center;
      justify-content: center;
      bottom: 0px;
      left: 0px;
      right: 0px;
      z-index: 1000;
    }
    .soundItem {
      display: flex;
      max-width: 600px;
      width: 90vw;
      margin: 24px;
      background: white;
      border-radius: 5px;
      box-sizing: border-box;
      padding: 10px 15px 10px 5px;
      align-items: center;
      box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
    }
    .rightSideGroup {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      flex-grow: 1;
      text-align: left;
      gap: 10px;
      margin-left: min(5vw, 20px);
    }
  `;

  constructor() {
    super();
    this.version = '2.1.3';
    this.sounds = {
      white: {
        name: 'White',
        key: 'white',
        color: '#000',
        url: 'https://firebasestorage.googleapis.com/v0/b/ambient-6540d.appspot.com/o/WhiteNoise_001_10s_128kbps_opus.ogg?alt=media&token=05c6436f-e346-425d-aa4a-7eb71c6a7058',
      },
      brown: {
        name: 'Brown',
        key: 'brown',
        color: '#926239',
        url: 'https://firebasestorage.googleapis.com/v0/b/ambient-6540d.appspot.com/o/BrownNoise_001_10s_128kbps_opus.ogg?alt=media&token=36d35c5e-1368-4628-8597-65994f940d21',
      },
      pink: {
        name: 'Pink',
        key: 'pink',
        color: '#FFA7B6',
        url: 'https://firebasestorage.googleapis.com/v0/b/ambient-6540d.appspot.com/o/PinkNoise_001_10s_128kbps_opus.ogg?alt=media&token=d6928f72-f754-4700-bdcc-cf828a26706c',
      },
      oceanShoreline: {
        name: 'Ocean Shoreline',
        key: 'oceanShoreline',
        color: '#4988B3',
        url: 'https://firebasestorage.googleapis.com/v0/b/ambient-6540d.appspot.com/o/OceanClose_001_128kbps_opus.ogg?alt=media&token=ebbc84ea-5cbc-441f-bb2a-b95aa7db9dff',
      },
    };
    this.initIDB();
    this.playing = {};
    this.fetching = {};
    this.setOpusSupport();
    this.wakeLock = null;
  }

  initIDB() {
    openDB('ambientSounds', 1, {
      upgrade(db) {
        db.createObjectStore('sounds');
      },
    }).then(dbo => {
      this.idb = dbo;
    });
  }

  soundToggled(e) {
    const id = e.detail.id.split('_')[1];
    if (this.playing?.[id]?.playing) {
      this.stopSound(id);
    } else {
      this.playSound(id);
    }
  }

  stopSound(key) {
    this.playing[key].source.stop();
    this.playing[key].playing = false;
    clearTimeout(this.playing[key].restart);
    this.updateStopButton();
  }

  restartSound(key) {
    this.playing[key].source.stop();
    // this.playing[key].source.start();
    // this.setRestart(key);
    // this.stopSound(key);
    this.playSound(key);
  }

  setRestart(key) {
    this.playing[key].restart = setTimeout(() => {
      this.restartSound(key);
    }, 240 * 60 * 1000);
  }

  updatePlayPauseButton(key) {
    if (this.playing[key].playing === true) {
      this.shadowRoot.getElementById(`playPause_${key}`).play();
    } else {
      this.shadowRoot.getElementById(`playPause_${key}`).pause();
    }
  }

  playSound(key) {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    if (!this.fetching[key]) {
      this.fetching[key] = true;
      this.getSound(key)
        .then(audioData =>
          audioData === null
            ? this.playing[key].source.buffer
            : this.audioContext.decodeAudioData(audioData)
        )
        .then(buffer => {
          this.playing[key] = this.playing[key] || {};
          this.playing[key].source = this.audioContext.createBufferSource();
          this.playing[key].source.buffer = buffer;
          this.playing[key].gainNode = this.audioContext.createGain();
          this.playing[key].gainNode.gain.value =
            this.shadowRoot.getElementById(`volumeSlider_${key}`).value / 100;
          this.playing[key].gainNode.connect(this.audioContext.destination);
          this.playing[key].source.connect(this.playing[key].gainNode);
          this.playing[key].source.loop = true;
          this.playing[key].playing = true;
          this.playing[key].source.start();
          this.setRestart(key);
          this.fetching[key] = false;
          this.updatePlayPauseButton(key);
          this.playing[key].source.onended = () => {
            this.updatePlayPauseButton(key);
          };
          this.updateStopButton();
        });
    }
  }

  stopAll() {
    Object.keys(this.playing).forEach(x => {
      if (this.playing[x]?.playing) {
        this.stopSound(x);
      }
    });
    this.updateStopButton();
  }

  updateStopButton() {
    this.anyPlaying = this.checkIfAnyPlaying();
    this.update();
  }

  checkIfAnyPlaying() {
    let anyPlaying = false;
    Object.keys(this.playing).forEach(x => {
      if (this.playing[x]?.playing) {
        anyPlaying = true;
      }
    });
    if (anyPlaying) {
      try {
        navigator.wakeLock.request('screen').then(wakeLock => {
          this.wakeLock = wakeLock;
        });
      } catch (err) {
        // Do Something with the Error
      }
    } else {
      try {
        this.wakeLock.release().then(() => {
          this.wakeLock = null;
        });
      } catch (err) {
        // Do Something with the Error
      }
    }
    return anyPlaying;
  }

  getSound(key) {
    return new Promise((resolve, reject) => {
      if (this.playing[key] == null) {
        this.idb
          .get('sounds', key)
          .then(data => {
            if (data == null) {
              fetch(this.sounds?.[key]?.url).then(response => {
                response.arrayBuffer().then(buff => {
                  this.idb.put('sounds', buff, key);
                  resolve(buff);
                });
              });
            } else {
              resolve(data);
            }
          })
          .catch(err => reject(err));
      } else {
        resolve(null);
      }
    });
  }

  volumeChanged(e) {
    const key = e.target.id.split('_')[1];
    if (this.playing?.[key]?.playing === true) {
      this.playing[key].gainNode.gain.value = e.target.value / 100;
    }
  }

  setOpusSupport() {
    // Create a dummy audio element
    const audio = document.createElement('audio');

    // Check if the browser supports the Opus audio codec
    const opusSupport = audio.canPlayType('audio/ogg; codecs=opus');

    // Return true if the browser supports Opus, false otherwise
    this.opusSupport = opusSupport === 'probably' || opusSupport === 'maybe';
  }

  render() {
    return html`
      <main>
        <div id="header">
          <img
            id="headerLogo"
            alt="Logo"
            src="../assets/AmbientLogo.svg"
            @click="${() => {
              this.showVersion = !this.showVersion;
              this.update();
            }}"
            @keyup="${e => {
              if (e.key === 'Enter' || e.key === ' ') {
                this.showVersion = !this.showVersion;
                this.update();
              }
            }}"
          />
          <div id="headerText">
            Ambient${this.showVersion ? ` (${this.version})` : ``}
          </div>
        </div>
        <div class="headerSpacer"></div>
        ${Object.keys(this.sounds).map(x => {
          const sound = this.sounds[x];
          return html`
            <div class="soundItem">
              <play-pause
                id="playPause_${x}"
                @toggled="${e => {
                  this.soundToggled(e);
                }}"
                style="--color:${sound.color}"
                label="${this.playing?.[x]?.playing
                  ? 'Pause'
                  : 'Play'} ${sound.name}"
              ></play-pause>
              <div class="rightSideGroup">
                <div>
                  <label for="volumeSlider_${x}"
                    ><h2 id="${sound.name} label">${sound.name}</h2></label
                  >
                </div>
                <input
                  id="volumeSlider_${x}"
                  type="range"
                  style="accent-color:${this.sounds[x].color}"
                  min="0"
                  max="100"
                  value="100"
                  label="${this.sounds[x].name} Volume"
                  @input="${e => {
                    this.volumeChanged(e);
                  }}"
                />
              </div>
            </div>
          `;
        })}
        ${this.anyPlaying === true
          ? html`<div class="headerSpacer"></div>
              <div id="stopFooter">
                <div style="width:auto;max-width:600px;">
                  <lit-paper-button
                    @click="${e => this.stopAll(e)}"
                    style="--paper-button-default-color:#000"
                    >STOP ALL</lit-paper-button
                  >
                </div>
              </div>`
          : ``}
      </main>
    `;
  }
}

customElements.define('ambient-app', AmbientApp);
