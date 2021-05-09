import { customElement, property, state } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import { html, LitElement } from "lit";
import invariant from "tiny-invariant";
import Stack, { StackItem } from "./algo-stack.lit";
import { Result } from "./algo-result.lit";
import { name as inputName } from "./algo-input.lit";
import { Input, name as inputsName } from "./algo-inputs.lit";
import { balanced_recursive_2, init, Op, ResultOps } from "./balanced_recursive";
import { PointerRow, Row } from "./algo-pointer-row.lit";
import { layout } from "./common-styles.lit";
import { CSSPlugin } from "gsap/CSSPlugin";
import { TimelineController } from "~/web-components/algo/controllers/timeline.controller";

const plugins = [CSSPlugin];

console.log(inputName);
console.log(inputsName);

@customElement("algo-balanced-recursive")
export class BalancedRecursive extends LitElement {
  private timeline = new TimelineController(this);

  static styles = [layout];

  constructor() {
    super();
    this.derivedState(this.getAttribute("input"));
  }

  pointerRowRef = createRef<PointerRow>();
  inputRef = createRef<Stack>();
  resultRef = createRef<Result>();

  @property({ type: String })
  input: string = "";

  @property({ type: Array })
  inputs: Input[] = [];

  /**
   * The computed result, done once per input
   */
  @state()
  result: ResultOps;

  /**
   * The top input row stack
   */
  @state()
  inputStack: StackItem[];

  /**
   * Any pointers
   */
  @state()
  pointers: Row[];

  /**
   * This is to be called once initially, and then for
   * any time the 'input' is changed. This will set state
   * on this component and cause child components to re-render
   * @param input
   */
  derivedState(input: string) {
    const ops: Op[] = [];
    const stringInput = input;
    const res1 = balanced_recursive_2(stringInput, ops);
    this.result = {
      result: res1,
      input: stringInput,
      ops,
    };
    this.inputStack = input.split("").map((x, index) => {
      return { id: `${x}-${index}`, char: x };
    });
    this.pointers = this.result.ops
      .filter((op) => op.kind === "create")
      .map((op) => {
        invariant(op.kind === "create", "only dealingwith create messages");
        return { id: op.id };
      });
  }

  firstUpdated() {
    this.startAnimation().catch((e) => {
      console.error("Could not init from `firstUpdated`", e);
    });
  }

  /**
   * Once this component has stopped updating/creating
   * DOM nodes or other components, start the animations
   */
  async startAnimation() {
    await this.updateComplete;
    init(
      this.result,
      {
        INPUT: this.inputRef.value,
        POINTER_ROW: this.pointerRowRef.value,
        RESULT: this.resultRef.value,
      },
      this.timeline.timeline
    );
  }

  /**
   * Set's the input and resets animations etc
   * @param input
   */
  setInput = (input: string) => {
    this.timeline.timeline.clear();
    this.input = input;
    this.derivedState(this.input);
    this.startAnimation().catch((e) => {
      console.error("an error occurred after submit", e);
    });
  };

  /**
   * Output of this component
   */
  render() {
    return html`
      <algo-input .onSubmit=${this.setInput}></algo-input>
      <algo-inputs .onChange=${this.setInput} .inputs=${this.inputs}></algo-inputs>
      <div class="row">
        <div>
          <p class="prefix">Input:</p>
          <div class="row-height">
            <algo-pointer-row .rows=${this.pointers} ${ref(this.pointerRowRef)}></algo-pointer-row>
          </div>
          <algo-stack .stack=${this.inputStack} ${ref(this.inputRef)}></algo-stack>
        </div>
      </div>
      <div class="row gap">
        <algo-result ${ref(this.resultRef)} .result=${this.result.result} prefix="Balanced"></algo-result>
      </div>
    `;
  }
}

export const name = "BalancedRecursive";
