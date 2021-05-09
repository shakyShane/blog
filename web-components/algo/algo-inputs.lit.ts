import { customElement, property } from "lit/decorators.js";
import { html, LitElement } from "lit";

export interface Input {
  value: string;
  label?: string;
}

@customElement("algo-inputs")
export class AlgoInput extends LitElement {
  @property()
  onChange: (input: string) => void = () => {};

  @property({ type: Array })
  inputs: Input[] = [];

  _change = (e) => {
    e.preventDefault();
    this.onChange(e.target.value);
  };
  /**
   * Output of this component
   */
  render() {
    return html`<div>
      <form>
        <select @change=${this._change}>
          ${this.inputs.map(
            (input) => html`<option value=${input.value}>${input.label || input.value}: ${input.value}</option>`
          )}
        </select>
      </form>
    </div>`;
  }
}

export const name = "Inputs";
