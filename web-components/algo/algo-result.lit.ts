import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import { sizes } from "~/web-components/algo/common-animations";

@customElement("algo-result")
export class Result extends LitElement {
  static styles = css`
    :host {
      --size: ${sizes.CELL}px;
    }
    .result {
      margin: 0;
      font-family: monospace;
      font-size: 1rem;
    }
  `;

  @property({ type: String })
  prefix: string = "Result";

  @property()
  result: boolean | null = null;

  /**
   * Output of this component
   */
  render() {
    if (this.result === null) return;
    return html`<p class="result">${this.prefix}: ${this.result}</p>`;
  }
}

export const name = "Result";
