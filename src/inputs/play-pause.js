import { LitElement, html, css } from 'lit';

export class playPause extends LitElement {
  static properties = {
    playing: { type: Boolean },
    label: {type:String}
  };

  static styles = css`
    :host {
      display: block;
      
    }
    #playPause {
      position: relative;
      transform: rotate(90deg);
      transform-origin: center;
      transition: transform 0.3s ease-out;
      display:flex;
      padding: var(--padding, 10px)
    }
    #playPause > * {
      flex-basis:50%
    }
    #playPause.paused {
      transform: rotate(var(--rotate-amount, 180deg));
    }
    #pt1 {
      background: var(--color, #000);;
      transform: scaleX(-1);
    }
    .part {
      width: 50px;
      background: var(--color, #000);;
      transition: clip-path 0.3s ease-out;
      height: 88px;
    }
    .play {
      clip-path: polygon(0% 0%, 0% 100%, 100% 100%, 0% 0%);
    }
    .pause {
      clip-path: polygon(20% 0%, 20% 100%, 100% 100%, 100% 0%);
    }
  `;

  constructor() {
    super();
    this.playing = false;
  }

  togglePlayPause() {
    if (this.playing === false) {
      this.play();
    } else {
      this.pause();
    }
    let ev = new CustomEvent('toggled', {
      bubbles: true,
      composed: true,
      detail: { id: this.id },
    });
    this.dispatchEvent(ev);
  }

  removeAdd(el, remove, add) {
    el.classList.remove(remove);
    el.classList.add(add);
  }

  play() {
    this.playing = true;
    const bl = this.shadowRoot.getElementById('pt2');
    this.removeAdd(bl, 'play', 'pause');
    const re = this.shadowRoot.getElementById('pt1');
    this.removeAdd(re, 'play', 'pause');
    const holder = this.shadowRoot.getElementById('playPause');
    this.removeAdd(holder, 'played', 'paused');
  }

  pause() {
    this.playing = false;
    const bl = this.shadowRoot.getElementById('pt2');
    this.removeAdd(bl, 'pause', 'play');
    const re = this.shadowRoot.getElementById('pt1');
    this.removeAdd(re, 'pause', 'play');
    const holder = this.shadowRoot.getElementById('playPause');
    this.removeAdd(holder, 'paused', 'played');
  }

  keyUp(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      this.togglePlayPause(e);
    }
  }

  render() {
    return html`
      <div id="playPause" role="button" tabindex="0" @keyup="${e => this.keyUp(e)}" @click="${e => this.togglePlayPause(e)}" aria-label="${this.label}">
        <div id="pt1" class="part play"></div>
        <div id="pt2" class="part play"></div>
      </div>
    `;
  }
}

customElements.define('play-pause', playPause);
