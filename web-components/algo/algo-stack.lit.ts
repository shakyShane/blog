import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import { Cell, name } from "./algo-cell.lit";

console.log("register %O", name);

type Item = { id: string; char: string };

@customElement("algo-stack")
export class Stack extends LitElement {
  static styles = [
    css`
      .inline-array {
        width: 100%;
        display: flex;
        justify-content: flex-end;
      }
      algo-cell {
        opacity: 0;
      }
    `,
  ];

  /**
   * The stack to display
   */
  @property()
  stack: Item[] = [];

  /**
   * Create a stack from an input string
   * @param input
   */
  fromStr(input: string) {
    this.stack = input.split("").map((x, index) => {
      return { id: `${x}-${index}`, char: x };
    });
  }

  /**
   * The stack to display
   */
  @property({ type: Boolean })
  static: boolean = false;

  /**
   * Update the underlying stack
   * @param item
   */
  push(item: Item) {
    this.stack = this.stack.concat(item);
  }

  /**
   * Update the underlying stack
   */
  removeItem(id: Item["id"]) {
    this.stack = this.stack.filter((x) => x.id === id);
  }

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
   * Update the underlying cells
   */
  lastCell(): HTMLElement | Element | undefined {
    const cells = this.cells();
    if (cells.length > 0) {
      return cells[cells.length - 1];
    }
    return undefined;
  }

  /**
   * Output of this component
   */
  render() {
    if (this.static) {
      return html` <div class="inline-array" data-elem-stack>
        <slot></slot>
      </div>`;
    }
    return html` <div class="inline-array" data-elem-stack>
      ${this.stack.map((val, index) => {
        return html`<algo-cell data-id=${val.id} index=${index}>${val.char}</algo-cell>`;
      })}
    </div>`;
  }
}

export default Stack;
