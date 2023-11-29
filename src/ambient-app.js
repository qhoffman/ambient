import { LitElement, html, css } from 'lit';
import { playPause } from './inputs/play-pause.js';

class AmbientApp extends LitElement {
  static properties = {
    sounds: { type: Array },
    opusSupported: { type: Boolean },
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
    }

    main {
      flex-grow: 1;
    }

    h2 {
      font-weight: lighter;
      margin: 2px;
      font-size: 1.3em;
    }

    .soundItem {
      display: flex;
      max-width: 600px;
      width: 90vw;
      margin: 15px;
      background: white;
      border-radius: 15px;
      box-sizing: border-box;
      padding: 10px;
      align-items: center;
    }
    .rightSideGroup {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      flex-grow: 1;
      text-align: left;
      gap: 10px;
    }
  `;

  constructor() {
    super();
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
    this.playing = {};
    this.opusSupport = this.supportsOpus();
    this.audioContext = new AudioContext();
  }

  soundToggled(e) {
    let id = e.detail.id.split('_')[1];
    if (this.playing?.[id]?.playing) {
      this.stopSound(id);
    } else {
      this.playSound(id);
    }
  }

  stopSound(key) {
    this.playing[key].source.stop();
    this.playing[key].playing = false;
  }

  playSound(key) {
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
        this.playing[key].source.onended = () => {
          // this.shadowRoot.getElementById(`playPause_${key}`).pause();
        };
      });
  }
  getSound(key) {
    return new Promise((resolve, reject) => {
      if (this.playing[key] == null) {
        fetch(this.sounds?.[key]?.url).then(response => {
          resolve(response.arrayBuffer());
        });
      } else {
        resolve(null);
      }
    });
  }

  volumeChanged(e) {
    let key = e.target.id.split('_')[1];
    this.playing[key].gainNode.gain.value = e.target.value / 100;
  }
  supportsOpus() {
    // Create a dummy audio element
    var audio = document.createElement('audio');

    // Check if the browser supports the Opus audio codec
    var opusSupport = audio.canPlayType('audio/ogg; codecs=opus');

    // Return true if the browser supports Opus, false otherwise
    return opusSupport === 'probably' || opusSupport === 'maybe';
  }

  render() {
    return html`
      <main>
        ${Object.keys(this.sounds).map(x => {
          let sound = this.sounds[x];
          return html`
            <div class="soundItem">
              <play-pause
                id="playPause_${x}"
                @toggled="${e => {
                  this.soundToggled(e);
                }}"
                style="--color:${this.sounds[x].color}"
              ></play-pause>
              <div class="rightSideGroup">
                <div>
                  <label for="volumeSlider_${x}"><h2>${sound.name}</h2></label>
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
      </main>
    `;
  }
}

customElements.define('ambient-app', AmbientApp);
