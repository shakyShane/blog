import { customElement, property, state } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import { html, LitElement } from "lit";
import invariant from "tiny-invariant";
import Stack, { StackItem, name as stackName } from "./algo-stack.lit";
import { name as inputName } from "./algo-input.lit";
import { Input, name as inputsName } from "./algo-inputs.lit";
import { name as pointerName, Pointer } from "./algo-pointer.lit";
import {name as pointerRowName, PointerRow, Row} from "./algo-pointer-row.lit";
import { name as resultName, Result } from "./algo-result.lit";
import { layout } from "./common-styles.lit";
import { CSSPlugin } from "gsap/CSSPlugin";
import { TimelineController } from "~/web-components/algo/controllers/timeline.controller";
import {TimelineLite} from "gsap/gsap-core";
import {bounceInputIn, Color, fadeInPointer, PointerId, sizes, XIndex} from "~/web-components/algo/common-animations";

const plugins = [CSSPlugin];

console.log("register", stackName);
console.log("register", inputsName);
console.log("register", pointerName);
console.log("register", pointerRowName);
console.log("register", inputName);
console.log("register", resultName);

@customElement("algo-binary-search")
export class BinarySearch extends LitElement {
  private timeline = new TimelineController(this, { loop: true });

  static styles = [layout];

  constructor() {
    super();
    this.derivedState(JSON.parse(this.getAttribute("input")), Number(this.getAttribute('search')));
  }

  pointerRowRef = createRef<PointerRow>();
  inputRef = createRef<Stack>();
  resultRef = createRef<Result>();

  @property({ type: Array })
  input: number[] = [];

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
  derivedState(input: number[], search: number) {
    const ops: Op[] = [];
    const res1 = input ? binary_search(search, input, ops) : -1;
    this.result = {
      result: res1,
      input: input,
      search: search,
      ops,
    };
    this.inputStack = input.map((x, index) => {
      return { id: `${x}-${index}`, char: String(x) };
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
  startAnimation = async () => {
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
  };

  /**
   * Set's the input and resets animations etc
   * @param input
   * @param search
   */
  setInput = async (input: number[], search: number) => {
    this.timeline.timeline.clear();
    /**
     * This is here as an easy way to clear all inline-styles that GSAP adds
     */
    this.input = [];
    this.derivedState(input, search);
    await this.updateComplete;

    /**
     * This is the actual update
     */
    this.input = input;
    this.derivedState(input, search);
    await this.updateComplete;
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
    `;
  }
}

export const name = "binary-search";

export type ResultOps = {
  result: number;
  input: number[];
  search: number;
  ops: Op[];
};

export type Op =
  | { kind: "create"; color: Color; id: PointerId; x: XIndex }

interface Elems {
  INPUT: Stack;
  POINTER_ROW: PointerRow;
  RESULT: Result;
}

interface BinarySearchParams {
  elems: Elems;
  pointers: (id: string) => Pointer;
  timelines: {
    main: TimelineLite;
  };
}

export function init(res: ResultOps, elements: Elems, timeline: TimelineLite) {
  const params: BinarySearchParams = {
    elems: elements,
    pointers: (id) => {
      return elements.POINTER_ROW.byId(id);
    },
    timelines: { main: timeline },
  };
  bounceInputIn(timeline, params.elems.INPUT.cells());
  res.ops.forEach((op) => {
    process(op, params);
  });
}

function process(op: Op, params: BinarySearchParams) {
  const {main} = params.timelines;
  switch (op.kind) {
    case "create": {
      const x = params.pointers(op.id);
      main.set(x, { translateX: op.x * sizes.CELL, duration: 0 });
      fadeInPointer(main, x, op.color);
      break;
    }
  }
}

function binary_search(k: number, input: number[], ops: Op[]): number {

  let low =  0;
  let high = input.length - 1;

  ops.push({kind: "create-many", items: [
      {id: "low", x: 0, color: Color.black},
      {id: "high", x: high, color: Color.orange},
    ]})

  while (low <= high) {
    const middle = Math.floor((high + low) / 2);
    const current = input[middle];
    if (current === k) {
      return middle;
    }
    if (current > k) {
      high = middle - 1;
    }
    if (current < k) {
      low = middle + 1;
    }
  }
  return null;
}