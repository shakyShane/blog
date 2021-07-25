import {customElement, property, state} from "lit/decorators.js";
import {createRef, ref} from "lit/directives/ref.js";
import {css, html, LitElement} from "lit";
import invariant from "tiny-invariant";
import Stack, {name as stackName, StackItem} from "./algo-stack.lit";
import {name as inputName} from "./algo-input.lit";
import {name as inputsName} from "./algo-inputs.lit";
import {name as pointerName, Pointer, PointerVariant} from "./algo-pointer.lit";
import {name as pointerRowName, PointerRow, Row} from "./algo-pointer-row.lit";
import {name as resultName, Result} from "./algo-result.lit";
import {layout} from "./common-styles.lit";
import {CSSPlugin} from "gsap/CSSPlugin";
import {TimelineController} from "~/web-components/algo/controllers/timeline.controller";
import {TimelineLite} from "gsap/gsap-core";
import {
  bounceInputIn,
  Color,
  ElementId,
  fadeInPointer,
  PointerId, positionItems,
  sizes,
  XIndex
} from "~/web-components/algo/common-animations";

const plugins = [CSSPlugin];

console.log("register", stackName);
console.log("register", inputsName);
console.log("register", pointerName);
console.log("register", pointerRowName);
console.log("register", inputName);
console.log("register", resultName);

const DUR = 0.5;

@customElement("algo-quick-sort")
export class QuickSort extends LitElement {
  private timeline = new TimelineController(this, {loop: true, duration: DUR});

  static styles = [
    layout,
    css`
    .button-choice {
      margin-right: 5px;
    }
    `
  ];

  constructor() {
    super();
    const search = Number(this.getAttribute("search"));
    const input = JSON.parse(
      this.getAttribute("input")
    );
    const impl = (() => {
      switch (this.getAttribute('impl')) {
        case "alt": return "alt"
        default: return "base"
      }
    })();
    this.derivedState(input, impl);
  }

  pointerRowRef = createRef<PointerRow>();
  inputRef = createRef<Stack>();
  resultRef = createRef<Result>();

  @property({type: Array})
  input: number[] = [];

  @property({ type: String })
  impl: "base" | "alt" = "base";

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
   * @param impl
   */
  derivedState(input: number[], impl: QuickSort["impl"]) {
    const ops: Op[] = [];
    const fn = impl === "base" ? exec : exec;
    const res1 = fn(input.slice(), ops);
    this.result = {
      result: res1,
      input: input.slice(),
      ops,
    };
    this.inputStack = input.map((x, index) => {
      return {id: `${x}`, char: String(x)};
    });
    this.pointers = this.result.ops
      .filter((op) => op.kind === "create-many" || op.kind === "create")
      .map((op) => {
        invariant(op.kind === "create-many" || op.kind === "create", "only dealing with create-many messages");
        switch (op.kind) {
          case "create-many":
            return op.items;
          case "create":
            return op;
        }
      })
      .flat();
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
      this.timeline.timeline,
    );
  };

  /**
   * Set's the input and resets animations etc
   * @param input
   */
  setInput = async (input: string) => {
    this.timeline.timeline.clear();
    /**
     * This is here as an easy way to clear all inline-styles that GSAP adds
     */
    this.input = [];
    this.derivedState([], "base");
    await this.updateComplete;

    /**
     * This is the actual update
     */
    this.input = input.split(',')
      .map(x => x.trim())
      .filter(Boolean)
      .map(Number)
    this.derivedState(this.input, "base");
    await this.updateComplete;
    this.startAnimation().catch((e) => {
      console.error("an error occurred after submit", e);
    });
  };
  
  onPrev() {
    const [, _current] = this.timeline.timeline.currentLabel().split('-');
    const current = Number(_current);
    if (current > 0) {
      this.timeline.timeline.tweenTo('index-' + (current-1));
    }
  }

  onNext() {
    const [, _current] = this.timeline.timeline.currentLabel().split('-');
    const current = Number(_current);
    const indexLabels = Object.keys(this.timeline.timeline.labels)
      .filter(x => x.startsWith('index-'))
      .map(label => {
        const [, index] = label.split('-');
        return Number(index);
      })
    const highest = Math.max(...indexLabels)
    if (current < highest) {
      this.timeline.timeline.tweenTo('index-' + (current+1));
    }
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', (e) => {
      switch (e.code) {
        case "ArrowRight":
        case "ArrowDown": {
          return this.onNext()
        }
        case "ArrowLeft":
        case "ArrowUp": {
          return this.onPrev()
        }
      }
    })
  }

  /**
   * Output of this component
   */
  render() {
    return html`
        <algo-input .onSubmit=${this.setInput}></algo-input>
        <p>
            <button @click=${this.onPrev} type="button">Prev</button>
            <button @click=${this.onNext} type="button">Next</button>
        </p>
        <div class="row">
            <div>
                <p class="prefix">Input:</p>
                <div class="row-height">
                    <algo-pointer-row .rows=${this.pointers} ${ref(this.pointerRowRef)}></algo-pointer-row>
                </div>
                <algo-stack .stack=${this.inputStack} layout="absolute" ${ref(this.inputRef)}></algo-stack>
            </div>
        </div>
        <div class="gap">
          <p class="prefix">Legend: </p>
          <ul class="prefix legend">
              <li><algo-pointer variant="arrow"></algo-pointer>'i' cursor</li>
              <li><algo-pointer variant="pivot" style="color: purple"></algo-pointer>Pivot</li>
              <li><algo-pointer variant="low" style="color: orange"></algo-pointer>Low</li>
          </ul>
        </div>
    `;
  }
}

export const name = "binary-search";

export type ResultOps = {
  result: number[];
  input: number[];
  ops: Op[];
};

// prettier-ignore
export type Op =
  | { kind: "create"; color: Color; id: PointerId; x: XIndex; variant: PointerVariant }
  | { kind: "create-many"; items: Array<{ color: Color; id: PointerId; x: XIndex, variant: PointerVariant }> }
  | { kind: "highlight-index"; index: number }
  | { kind: "move"; id: PointerId; x: XIndex }
  | { kind: "swap"; a: string; b: string, aX: XIndex, bX: XIndex }
  | { kind: "focus"; from: XIndex; to: XIndex }
  | { kind: "remove"; id: PointerId }
  | { kind: "remove-many"; ids: PointerId[] };

interface Elems {
  INPUT: Stack;
  POINTER_ROW: PointerRow;
  RESULT: Result;
}

interface QuickSortParams {
  elems: Elems;
  pointers: (id: string) => Pointer;
  timelines: {
    main: TimelineLite;
  };
}

export function init(res: ResultOps, elements: Elems, timeline: TimelineLite) {
  const params: QuickSortParams = {
    elems: elements,
    pointers: (id) => {
      return elements.POINTER_ROW.byId(id);
    },
    timelines: {main: timeline},
  };
  const cells = params.elems.INPUT.cells();
  positionItems(timeline, cells);
  bounceInputIn(timeline, cells);
  res.ops.forEach((op, index) => {
    timeline.addLabel('index-' + index);
    process(op, params);
  });
  if (window.location.search.indexOf('pause') > -1) {
    timeline.pause();
    timeline.tweenTo('index-1');
  }
}

let cc = 0;

function process(op: Op, params: QuickSortParams) {
  const {main} = params.timelines;
  switch (op.kind) {
    case "move": {
      const x = params.pointers(op.id);
      main.to(x, {translateX: op.x * sizes.CELL});
      break;
    }
    case "create": {
      const elem = params.pointers(op.id);
      main.set(elem, {translateX: op.x * sizes.CELL, duration: 0});
      fadeInPointer(main, elem, op.color);
      break;
    }
    case "highlight-index": {
      const x = params.elems.INPUT.cells()[op.index];
      invariant(x, "params.elems.INPUT.cells()[op.index] should give an element");
      main.to(x, {scale: 2}).set(x, {delay: 2});
      break;
    }
    case "create-many": {
      op.items.forEach((item) => {
        const elem = params.pointers(item.id);
        main.set(elem, {translateX: item.x * sizes.CELL, duration: 0});
      });
      main.addLabel("pre-create");
      op.items.forEach((item) => {
        const elem = params.pointers(item.id);
        main.fromTo(
          elem,
          {color: item.color, visibility: "hidden", opacity: 0, scale: 0},
          {color: item.color, visibility: "visible", opacity: 1, scale: 1},
          "pre-create"
        );
      });
      break;
    }
    case "swap": {
      const next = cc++;
      const a = params.elems.INPUT.byId(op.a);
      const b = params.elems.INPUT.byId(op.b)
      main.addLabel("inner" + next);
      main.to(a, { translateX: op.bX * sizes.CELL }, 'inner' + next);
      main.to(b, { translateX: op.aX * sizes.CELL }, 'inner' + next);
      break;
    }
    case "remove": {
      const x = params.pointers(op.id);
      main.to(x, { opacity: 0, visibility: "visible" });
      break;
    }
    case "remove-many": {
      const xs = op.ids.map(id => params.pointers(id));
      main.to(xs, { opacity: 0, visibility: "visible" });
      break;
    }
    case "focus": {
      const cells = params.elems.INPUT.cells();
      const focus = cells.slice(op.from, op.to+1);
      const others = cells.filter((cell, index) => {
        return index < op.from || index > op.to;
      })
      main.addLabel('re-focus');
      main.to(others, { opacity: 0.2 }, 're-focus');
      main.to(focus, { opacity: 1 }, 're-focus');
    }
  }
}

function exec(input: number[], ops: Op[]): number[] {

  let callcount = 0;
  ops.push({kind: "create", id: "low", x: 0, color: Color.orange, variant: "low"})
  quicksort(input, 0, input.length-1);
  return input;

  function quicksort(A, lo, hi) {
    if (callcount !== 0) {
      ops.push({kind: "move", id:"low", x: lo});
    }
    callcount+=1;
    if (lo < hi) {
      const p = partition(A, lo, hi);
      quicksort(A, lo, p - 1)
      quicksort(A, p + 1, hi)
    }
  }

  /**
   * @param A
   * @param {number} lo
   * @param {number} hi
   * @returns {*}
   */
  function partition(A, lo, hi) {
    let pivot = A[hi];
    let lastLow = lo;
    ops.push({kind: "create-many", items: [
      {id: `j-${callcount}`, x: lastLow, color: Color.black, variant: "arrow"},
      {id: `pivot-${callcount}`, x: hi, color: Color.purple, variant: "pivot"}
    ]});
    for (let current = lo; current < hi; current += 1) {
      ops.push({kind: "move", id: `j-${callcount}`, x: current})
      if (A[current] < pivot) {
        swap(A, lastLow, current);
        lastLow += 1;
      }
    }
    swap(A, lastLow, hi);
    ops.push({kind: "remove-many", ids: [
      `j-${callcount}`,
      `pivot-${callcount}`
    ]})
    return lastLow;
  }

  function swap(A, i, j) {
    if (i === j) return; // do nothing if the indexes are equal
    ops.push({
      kind: "swap",
      a: String(A[i]),
      aX: i,
      b: String(A[j]),
      bX: j
    })
    const first = A[i];
    A[i] = A[j];
    A[j] = first;
  }
}

