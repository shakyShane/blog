import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { sizes } from "~/web-components/algo/common-animations";

@customElement("algo-cell")
export class Cell extends LitElement {
  static styles = css`
    .cell {
      width: ${sizes.CELL}px;
      height: ${sizes.CELL}px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-family: monospace;
    }
    .cell-inert {
      color: #747474;
      font-size: 0.8em;
      font-family: monospace;
    }
  `;

  /**
   * The stack to display
   */
  @property({ type: Number })
  index: number = -1;

  /**
   * The stack to display
   */
  @property({ type: String })
  variant: "normal" | "inert" = "normal";

  render() {
    const classes = {
      cell: true,
      "cell-inert": this.variant === "inert",
    };
    return html`<span class=${classMap(classes)} data-stack-cell="${String(this.index)}">
      <code><slot></slot></code>
    </span>`;
  }
}

export const name = "Cell";
