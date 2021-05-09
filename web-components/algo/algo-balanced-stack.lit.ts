import { customElement, property, state } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import { html, LitElement } from "lit";
import invariant from "tiny-invariant";
import Stack, { StackItem } from "./algo-stack.lit";
import { Result } from "./algo-result.lit";
import { name as inputName } from "./algo-input.lit";
import { balanced_stack_2, initAnimations, Op } from "./balanced_stack";
import { PointerRow, Row } from "./algo-pointer-row.lit";
import { layout } from "./common-styles.lit";
import { CSSPlugin } from "gsap/CSSPlugin";
import { TimelineController } from "./controllers/timeline.controller";

const plugins = [CSSPlugin];

console.log("register: %s", inputName);

export type ResultOps = {
  result: boolean;
  input: string;
  ops: Op[];
};

@customElement("algo-balanced-stack")
export class BalancedStack extends LitElement {
  private timeline = new TimelineController(this, 1000);

  static styles = [layout];

  constructor() {
    super();
    this.derivedState(this.getAttribute("input"));
  }

  pointerRowRef = createRef<PointerRow>();
  inputRef = createRef<Stack>();
  stackRef = createRef<Stack>();
  resultRef = createRef<Result>();

  @property({ type: String })
  input: string = "";

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
   * The growing vec stack
   */
  @state()
  vecStack: StackItem[];

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
    const res1 = balanced_stack_2(stringInput, ops);
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
    this.vecStack = this.result.ops
      .filter((op) => op.kind === "append-stack")
      .map((op) => {
        invariant(op.kind === "append-stack", "only dealing with append stack messages");
        return { id: op.id, char: op.char };
      });
  }

  /**
   * Ensure we also begin the animation once the component is ready
   */
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
    initAnimations(
      this.result,
      {
        INPUT: this.inputRef.value,
        POINTER_ROW: this.pointerRowRef.value,
        RESULT: this.resultRef.value,
        STACK: this.stackRef.value,
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
      <div class="row">
        <div>
          <p class="prefix">Input:</p>
          <div class="row-height">
            <algo-pointer-row .rows=${this.pointers} ${ref(this.pointerRowRef)}></algo-pointer-row>
          </div>
          <algo-stack ${ref(this.inputRef)} .stack=${this.inputStack}></algo-stack>
        </div>
      </div>
      <div class="row gap">
        <div>
          <p class="prefix">Stack: <code>Vec&lt;char&gt;</code></p>
          <div class="row-height">
            <algo-stack ${ref(this.stackRef)} .stack=${this.vecStack} layout="absolute"></algo-stack>
          </div>
        </div>
      </div>
      <div class="row gap">
        <algo-result ${ref(this.resultRef)} .result=${this.result.result} prefix="Balanced"></algo-result>
      </div>
    `;
  }
}

export const name = "BalancedStack";
