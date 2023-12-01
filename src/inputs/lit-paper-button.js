import { LitElement, html, css } from 'lit';

export class litPaperButton extends LitElement {

  static get properties() {
    return {
      color: { type: String , attribute: 'color'},
      border: { type: String , attribute: 'border'},
      borderRadius: { type: String , attribute: 'border-radius'},
      backgroundColor: { type: String , attribute: 'background-color'},
      rippleColor: { type: String , attribute: 'ripple-color'},
      padding: { type: String , attribute: 'padding'},
    };
  }
  static get styles() {
    return css`
      #button {
        position:relative;
        background-color: var(--paper-button-default-color, #536DFE);
        color: var(--paper-button-default-text-color, #FFFFFF);
        padding:10px;
        overflow:hidden;
        user-select:none;
        cursor:pointer;
        display:flex;
        align-items:center;
        justify-content:center;
        box-sizing:border-box;
      }
      #ripple {
        border-radius:50%;
        position:absolute;
        background-color: #FFFFFF;
        animation-name: ripple;
        animation-play-state: paused;
        animation-duration: 0.5s;
        pointer-events:none;
        transform:scale(0);
      }
      @keyframes ripple {
        from {opacity:0.8; transform:scale(0);}
        to {opacity:0; transform:scale(1);}
      }
    `;
  }
  constructor() {
    super();
  }
  updated () {
    if (this.color !== '') {
      this.shadowRoot.getElementById('button').style.color = this.color;
    }
    if (this.backgroundColor !== '') {
      this.shadowRoot.getElementById('button').style.backgroundColor = this.backgroundColor;
    }
    if (this.border !== '') {
      this.shadowRoot.getElementById('button').style.border = `1px solid ${this.color}`;
    }
    if (this.borderRadius !== '0px') {
      this.shadowRoot.getElementById('button').style.borderRadius = this.borderRadius || '5px';
    }
    if (this.padding !== '') {
      this.shadowRoot.getElementById('button').style.padding = this.padding || '10px';
    }
  }
  render() {
    return html`
      <div id="button" role="button" aria-pressed="false" tabindex="0" @click="${e => {this.doThing(e)}}" @keyup="${e => {this.keyPressed(e)}}">
      <div id="ripple"></div>
        <slot style="pointer-events:none"></slot>
      </div>
      `
  }
  keyPressed(e) {
    if (e.keyCode == 13) {
      console.log('enter')
      let box = this.shadowRoot.getElementById('button').getBoundingClientRect()
      let xCenter = (box.left + box.right) / 2
      let yCenter = (box.top + box.bottom) / 2
      let event = new CustomEvent("click", { detail: '', clientY:yCenter, clientX:xCenter});
      this.doThing(e);    
      this.dispatchEvent(event);
    }
  }
  doThing(e) {
    this.removeElement('ripple');
    var parent = this.shadowRoot.getElementById('button');
    var rip = document.createElement('div');
    rip.id='ripple';
    parent.appendChild(rip);
    var parentDims = parent.getBoundingClientRect();
    var max = Math.max(parentDims.width, parentDims.height);
    if (this.rippleColor) {
      rip.style.backgroundColor = this.rippleColor;
    }
    rip.style.width = 2*max +'px';
    rip.style.height = 2*max +'px';
    rip.style.top = `${e.clientY - parentDims.y - max}px`;
    rip.style.left = `${e.clientX - parentDims.x - max}px`;
    rip.style.animationPlayState = 'running';
  }
  removeElement(elementId) {
    // Removes an element from the document
    var element = this.shadowRoot.getElementById(elementId);
    element.parentNode.removeChild(element);
  }

}
customElements.define('lit-paper-button', litPaperButton);