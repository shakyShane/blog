import { customElement, property, query } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

@customElement("algo-input")
export class AlgoInput extends LitElement {
  static styles = css`
    :host {
    }
    button {
    }
  `;

  inputRef = createRef<HTMLInputElement>();

  @property()
  onSubmit: (input: string) => void = () => {};

  @property({ type: String })
  input: string = "";

  _submit = (e) => {
    e.preventDefault();
    const input = this.inputRef.value!.value.trim().slice(0, 15);
    this.onSubmit(input);
  };
  /**
   * Output of this component
   */
  render() {
    return html`<div>
      <form @submit=${this._submit}>
        <input type="text" name="input" maxlength="15" value=${this.input} ${ref(this.inputRef)} autocomplete="off" />
        <button type="submit">Submit</button>
      </form>
    </div>`;
  }
}

export const name = "Input";
