import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import { Cell, name as cellName } from "./algo-cell.lit";
import {sizes} from "~/web-components/algo/common-animations";

console.log("register", cellName);

export type StackItem = { id: string; char: string };

@customElement("algo-stack")
export class Stack extends LitElement {
  static styles = [
    css`
      .inline-array {
        width: 100%;
        display: flex;
      }
      algo-cell {
        opacity: 0;
      }
      [data-layout="absolute"] {
        position: relative;
        height: ${sizes.CELL}px;
      }
      [data-layout="absolute"] algo-cell {
        position: absolute;
      }
    `,
  ];

  @property({ type: String })
  input: string = "";

  @property()
  stack: StackItem[] = [];

  /**
   * The stack to display
   */
  @property()
  layout: "absolute" | "relative" = "relative";

  /**
   * Update the underlying cells
   */
  cells(): HTMLElement[] {
    return Array.from(this.shadowRoot?.querySelectorAll("algo-cell")!);
  }

  byId(id: string): Cell | undefined {
    const index = this.stack.findIndex((x) => x.id === id);
    if (index !== undefined && this.stack[index]) {
      const id = this.stack[index].id;
      const match = this.shadowRoot?.querySelector(`algo-cell[data-id="${id}"]`);
      if (match) {
        return match as Cell;
      }
    }
    return undefined;
  }

  /**
   * Output of this component
   */
  render() {
    return html`<div class="inline-array" data-layout=${this.layout}>
      ${this.stack.map((val, index) => {
        return html`<algo-cell data-id=${val.id} index=${index}>${val.char}</algo-cell>`;
      })}
    </div>`;
  }
}

export default Stack;

export const name = "AlgoStack";