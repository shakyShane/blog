import {customElement, property, state} from "lit/decorators.js";
import {createRef, ref} from "lit/directives/ref.js";
import {css, html, LitElement} from "lit";
import invariant from "tiny-invariant";
import Stack, {StackItem, name as stackName} from "./algo-stack.lit";
import {name as inputName} from "./algo-input.lit";
import {name as inputsName} from "./algo-inputs.lit";
import {name as pointerName, Pointer, PointerVariant} from "./algo-pointer.lit";
import {name as pointerRowName, PointerRow, Row} from "./algo-pointer-row.lit";
import {name as resultName, Result} from "./algo-result.lit";
import {layout} from "./common-styles.lit";
import {CSSPlugin} from "gsap/CSSPlugin";
import {TimelineController} from "~/web-components/algo/controllers/timeline.controller";
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
  private timeline = new TimelineController(this, {loop: true, duration: 1});

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
    this.derivedState(input, search, impl);
  }

  pointerRowRef = createRef<PointerRow>();
  inputRef = createRef<Stack>();
  resultRef = createRef<Result>();

  @property({type: Array})
  input: number[] = [];

  @property({type: Number})
  search: number;

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
   * @param search
   * @param impl
   */
  derivedState(input: number[], search: number, impl: BinarySearch['impl']) {
    const ops: Op[] = [];
    const fn = impl === "base" ? binary_search : binary_search_alt;
    const res1 = input ? fn(search, input, ops) : -1;
    this.result = {
      result: res1,
      input: input,
      search: search,
      ops,
    };
    this.inputStack = input.map((x, index) => {
      return {id: `${x}-${index}`, char: String(x)};
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
      this.timeline.timeline
    );
  };

  /**
   * Set's the input and resets animations etc
   * @param evt
   */
  setSearch = async (evt) => {

    const search = Number(evt.target.dataset?.search);
    this.timeline.timeline.clear();
    const old = this.input.slice();
    /**
     * This is here as an easy way to clear all inline-styles that GSAP adds
     */
    this.input = [];
    this.derivedState([], -1, this.impl);
    await this.updateComplete;

    /**
     * This is the actual update
     */
    this.input = old;
    this.search = search;
    this.derivedState(old, search, this.impl);
    await this.updateComplete;
    this.startAnimation().catch((e) => {
      console.error("an error occurred after submit", e);
    });
  };

  get searchChoice(): { label: string, value: number }[] {
    return this.input.map(num => {
      return {label: 'Search', value: num}
    })
  }

  /**
   * Output of this component
   */
  render() {
    return html`
        <div class="row">
            <p class="prefix">
                Choose a search target:
            </p>
        </div>
        <div class="row">
            ${this.searchChoice.map(x => {
                return html`
                    <button class="button-choice" type="button" ?disabled=${this.search === x.value} @click=${this.setSearch}
                            data-search=${x.value}>${x.value}
                    </button>`
            })}
        </div>
        <div class="row">
            <div>
                <p class="prefix">Input:</p>
                <div class="row-height">
                    <algo-pointer-row .rows=${this.pointers} ${ref(this.pointerRowRef)}></algo-pointer-row>
                </div>
                <algo-stack .stack=${this.inputStack} ${ref(this.inputRef)}></algo-stack>
            </div>
        </div>
        <div class="gap">
          <p class="prefix">Legend: </p>
          <ul class="prefix legend">
              ${this.pointers.map(p => {
                return html`<li><algo-pointer variant=${p.variant|| "arrow"}></algo-pointer>${p.id} cursor</li>`
              })}
          </ul>
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

// prettier-ignore
export type Op =
  | { kind: "create"; color: Color; id: PointerId; x: XIndex }
  | { kind: "create-many"; items: Array<{ color: Color; id: PointerId; x: XIndex, variant: PointerVariant }> }
  | { kind: "highlight-index"; index: number }
  | { kind: "move"; id: PointerId; x: XIndex };

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
    timelines: {main: timeline},
  };
  bounceInputIn(timeline, params.elems.INPUT.cells());
  res.ops.forEach((op) => {
    process(op, params);
  });
}

function process(op: Op, params: BinarySearchParams) {
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
  }
}

function binary_search(k: number, input: number[], ops: Op[]): number {
  let low = 0;
  let high = input.length - 1;
  let firstMiddle = Math.floor((high + low) / 2);

  ops.push({
    kind: "create-many",
    items: [
      {id: "low", x: 0, color: Color.black, variant: "low"},
      {id: "high", x: high, color: Color.orange, variant: 'high'},
    ],
  });

  ops.push({
    kind: "create",
    id: "middle",
    x: firstMiddle,
    color: Color.purple,
  });

  while (low <= high) {
    const middle = Math.floor((high + low) / 2);
    if (middle !== firstMiddle) {
      ops.push({
        kind: "move",
        id: "middle",
        x: middle,
      });
    }
    const current = input[middle];
    if (current === k) {
      ops.push({
        kind: "highlight-index",
        index: middle,
      });
      return middle;
    }
    if (current > k) {
      high = middle - 1;
      ops.push({
        kind: "move",
        id: "high",
        x: high,
      });
    }
    if (current < k) {
      low = middle + 1;
      ops.push({
        kind: "move",
        id: "low",
        x: low,
      });
    }
  }
  return null;
}

function binary_search_alt(k: number, input: number[], ops: Op[]): number {
  let low = 0;
  let high = input.length;
  let firstMiddle = Math.floor((high + low) / 2);

  ops.push({
    kind: "create-many",
    items: [
      {id: "low", x: 0, color: Color.black, variant: "low"},
      {id: "high", x: high, color: Color.orange, variant: 'high'},
    ],
  });

  ops.push({
    kind: "create",
    id: "middle",
    x: firstMiddle,
    color: Color.purple,
  });

  while (low < high) {
    const middle = Math.floor((high + low) / 2);
    if (middle !== firstMiddle) {
      ops.push({
        kind: "move",
        id: "middle",
        x: middle,
      });
    }
    const current = input[middle];
    if (current === k) {
      ops.push({
        kind: "highlight-index",
        index: middle,
      });
      return middle;
    }
    if (current > k) {
      high = middle;
      ops.push({
        kind: "move",
        id: "high",
        x: high,
      });
    }
    if (current < k) {
      low = middle + 1;
      ops.push({
        kind: "move",
        id: "low",
        x: low,
      });
    }
  }
  return null;
}
