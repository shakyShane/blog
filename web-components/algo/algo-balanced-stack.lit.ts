import { customElement, property, state } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import { html, LitElement } from "lit";
import invariant from "tiny-invariant";
import Stack from "./algo-stack.lit";
import { Result } from "./algo-result.lit";
import { AlgoInput, name as inputName } from "./algo-input.lit";
import { balanced_stack_2, init, Op } from "./balanced_stack";
import { PointerRow } from "./algo-pointer-row.lit";
import { times } from "./common-animations";
import { layout } from "./common-styles.lit";
import { TimelineLite } from "gsap";
import { CSSPlugin } from "gsap/CSSPlugin";

const plugins = [CSSPlugin];

console.log("register: %s", inputName);

export type ResultOps = {
  result: boolean;
  input: string;
  ops: Op[];
};

@customElement("algo-balanced-stack")
export class BalancedStack extends LitElement {
  static styles = [layout];

  constructor() {
    super();
    const ops: Op[] = [];
    const res1 = balanced_stack_2(this.getAttribute("input"), ops);
    this.result = {
      result: res1,
      input: this.getAttribute("input"),
      ops,
    };
  }

  pointerRowRef = createRef<PointerRow>();
  inputRef = createRef<Stack>();
  stackRef = createRef<Stack>();
  resultRef = createRef<Result>();

  @property({ type: String })
  input: string = "";

  @state()
  timeline: TimelineLite;

  @state()
  result: ResultOps;

  firstUpdated() {
    this.init();
  }

  init = () => {
    this.timeline = new TimelineLite({
      defaults: { duration: times.DURATION * 1.5 },
      onComplete: function () {
        setTimeout(() => {
          this.restart();
        }, 1000);
      },
    });
    invariant(this.pointerRowRef.value, "this.pointerRowRef.value");
    invariant(this.inputRef.value, "this.inputRef.value");
    invariant(this.stackRef.value, "this.stackRef.value");
    invariant(this.resultRef.value, "this.resultRef.value");

    init(
      this.result,
      {
        INPUT: this.inputRef.value,
        POINTER_ROW: this.pointerRowRef.value,
        RESULT: this.resultRef.value,
        STACK: this.stackRef.value,
      },
      this.timeline
    );
  };

  pause = () => this.timeline.pause();
  play = () => this.timeline.play();
  restart = () => this.timeline.restart();

  submit = (input: string) => {
    this.timeline.clear();
    const ops: Op[] = [];
    const res1 = balanced_stack_2(input, ops);
    this.input = input;
    this.result = {
      result: res1,
      input: input,
      ops,
    };
    this.init();
  };

  get pointers() {
    const output = [];
    this.result.ops.forEach((op) => {
      if (op.kind === "create") {
        output.push({ id: op.id });
      }
    });
    return output;
  }

  get inputStack() {
    return this.input.split("").map((x, index) => {
      return { id: `${x}-${index}`, char: x };
    });
  }

  get vecStack() {
    const output = [];
    this.result.ops.forEach((op) => {
      if (op.kind === "append-stack") {
        output.push({ id: op.id, char: op.char });
      }
    });
    return output;
  }

  /**
   * Output of this component
   */
  render() {
    return html`
      <algo-controls .pause=${this.pause} .play=${this.play} .restart=${this.restart}></algo-controls>
      <algo-input .onSubmit=${this.submit}></algo-input>
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
          <p class="prefix">Stack:</p>
          <algo-stack ${ref(this.stackRef)} .stack=${this.vecStack} layout="absolute"></algo-stack>
        </div>
      </div>
      <div class="row gap">
        <algo-result ${ref(this.resultRef)} .result=${this.result.result} prefix="Balanced"></algo-result>
      </div>
    `;
  }
}

export const name = "BalancedStack";
