import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import { sizes } from "~/web-components/algo/common-animations";

@customElement("algo-pointer")
export class Pointer extends LitElement {
  static styles = css`
    :host {
      --size: ${sizes.CELL}px;
    }
    .wrap {
      display: inline-block;
      width: var(--size);
      height: var(--size);
    }
    .icon {
      width: var(--size);
      height: var(--size);
    }
    path[stroke-width] {
      stroke: currentColor;
    }
    [data-dir="down"] {
    }
    [data-dir="up"] {
      transform: rotate(180deg);
    }
  `;

  @property({ type: String })
  direction: "up" | "down" = "down";

  /**
   * Output of this component
   */
  render() {
    return html`<span class="wrap">
      <svg viewBox="0 0 40 40" class="icon" data-dir=${this.direction}>
        <path
          stroke-linejoin="round"
          stroke-linecap="round"
          stroke-width="4"
          fill="none"
          d="
            M 20 10
            v 20
            l -8 -8
            m 8 8
            l 8 -8
            "
        />
      </svg>
    </span>`;
  }
}

export const name = "Pointer";
