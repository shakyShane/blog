import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement } from "lit";

@customElement("algo-controls")
export class Controls extends LitElement {
  static styles = css`
    :host {
      display: flex;
      justify-content: center;
    }
    button {
      outline: 1px solid green;
    }
  `;

  @property()
  pause: () => void = () => {};

  @property()
  play: () => void = () => {};

  @property()
  restart: () => void = () => {};

  /**
   * Output of this component
   */
  render() {
    return html` <div>
      <button type="submit" @click=${this.play}>Play</button>
      <button type="submit" @click=${this.pause}>Pause</button>
      <button type="submit" @click=${this.restart}>Restart</button>
    </div>`;
  }
}

export const name = "Controls";
