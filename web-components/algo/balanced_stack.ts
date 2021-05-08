import "./algo-stack.lit";
import Stack from "./algo-stack.lit";
import { name } from "./algo-controls.lit";
import { balanced_stack } from "./algos/balanced_stack";
import { bounceInputIn, Color, fadeInPointer, PointerId, showPointer, sizes, XIndex } from "./common-animations";
import { name as pointerName, Pointer } from "./algo-pointer.lit";
import { name as pointerRowName, PointerRow } from "./algo-pointer-row.lit";
import { name as resultName, Result } from "./algo-result.lit";
import invariant from "tiny-invariant";
import { TimelineLite } from "gsap/gsap-core";

console.log("register %O", name);
console.log("register %O", pointerName);
console.log("register %O", pointerRowName);
console.log("register %O", resultName);

type ResultOps = {
  input: string;
  ops: Op[];
};

type Op =
  | { kind: "create"; color: Color; id: PointerId; left: XIndex; right: XIndex }
  | { kind: "append-stack"; id: string; char: string }
  | { kind: "pop-stack"; id: string }
  | { kind: "move"; id: PointerId; left: XIndex; right: XIndex }
  | { kind: "stack-match"; inputId: PointerId; stackId: PointerId }
  | { kind: "stack-none-match"; inputId: PointerId; stackId: PointerId }
  | { kind: "none-match"; left: PointerId; right: PointerId }
  | { kind: "result"; result: boolean };

const results: Record<string, ResultOps> = {
  "([{123}])": {
    input: "([{123}])",
    ops: [
      { kind: "create", id: "a", left: 0, right: 0, color: Color.black },
      { kind: "append-stack", id: "vec-a", char: ")" },
      { kind: "move", id: "a", left: 1, right: 1 },
      { kind: "append-stack", id: "vec-b", char: "]" },
      { kind: "move", id: "a", left: 2, right: 2 },
      { kind: "append-stack", id: "vec-c", char: "}" },
      { kind: "move", id: "a", left: 3, right: 3 },
      { kind: "move", id: "a", left: 4, right: 4 },
      { kind: "move", id: "a", left: 5, right: 5 },
      { kind: "move", id: "a", left: 6, right: 6 },
      { kind: "stack-match", inputId: "}-6", stackId: "vec-c" },
      { kind: "pop-stack", id: "vec-c" },
      { kind: "move", id: "a", left: 7, right: 7 },
      { kind: "stack-match", inputId: "]-7", stackId: "vec-b" },
      { kind: "pop-stack", id: "vec-b" },
      { kind: "move", id: "a", left: 8, right: 8 },
      { kind: "stack-match", inputId: ")-8", stackId: "vec-a" },
      { kind: "pop-stack", id: "vec-a" },
      { kind: "result", result: true },
    ],
  },
  // empty
  "12(1+2": {
    input: "12(1+2",
    ops: [
      { kind: "create", id: "a", left: 0, right: 0, color: Color.black },
      { kind: "move", id: "a", left: 1, right: 1 },
      { kind: "move", id: "a", left: 2, right: 2 },
      { kind: "append-stack", id: "vec-a", char: ")" },
      { kind: "move", id: "a", left: 3, right: 3 },
      { kind: "move", id: "a", left: 4, right: 4 },
      { kind: "move", id: "a", left: 5, right: 5 },
      { kind: "result", result: false },
    ],
  },
  // empty
  "([})": {
    input: "([})",
    ops: [
      { kind: "create", id: "a", left: 0, right: 0, color: Color.black },
      { kind: "append-stack", id: "vec-0", char: ")" },
      { kind: "move", id: "a", left: 1, right: 1 },
      { kind: "append-stack", id: "vec-1", char: "]" },
      { kind: "move", id: "a", left: 2, right: 2 },
      { kind: "stack-none-match", inputId: "}-2", stackId: "vec-1" },
      { kind: "result", result: false },
    ],
  },
};

export function init(input: string, elems: Elems, timeline: TimelineLite) {
  const res = results[input];
  invariant(res, "not matching ops found");

  const res1 = balanced_stack(input);
  elems.RESULT.result = res1.result;
  elems.RESULT.prefix = "Balanced";

  elems.INPUT.fromStr(input);
  elems.POINTER_ROW.addRow({ id: "a" });

  res.ops.forEach((op) => {
    switch (op.kind) {
      case "append-stack": {
        elems.STACK.push({ id: op.id, char: op.char });
      }
    }
  });

  const params: BalancedStack = {
    elems,
    pointers: (id) => {
      return {
        left: elems.POINTER_ROW.byId(`${id}`)!,
        right: elems.POINTER_ROW.byId(`${id}`)!,
      };
    },
    timelines: { main: timeline },
  };

  setTimeout(() => {
    bounceInputIn(timeline, params.elems.INPUT.cells());
    res.ops.forEach((op) => {
      process(op, params);
    });
  }, 0);
}

interface Elems {
  INPUT: Stack;
  STACK: Stack;
  POINTER_ROW: PointerRow;
  RESULT: Result;
}

interface BalancedStack {
  elems: Elems;
  pointers: (id: string) => { left: Pointer; right: Pointer };
  timelines: {
    main: TimelineLite;
  };
}

function process(op: Op, params: BalancedStack) {
  const { main } = params.timelines;
  const { STACK, INPUT } = params.elems;
  switch (op.kind) {
    case "create": {
      const { left, right } = params.pointers(op.id);
      main.set(left, { translateX: op.left * sizes.CELL, duration: 0 });
      main.set(right, { translateX: op.right * sizes.CELL, duration: 0 });
      fadeInPointer(main, left, op.color);
      showPointer(main, right, op.color);
      break;
    }
    case "append-stack": {
      const stackElem = STACK.byId(op.id);
      invariant(stackElem, `missing stack elem id: ${op.id}`);
      main
        .set(stackElem, { color: Color.black, visibility: "visible" })
        .fromTo(stackElem, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1 });
      break;
    }
    case "pop-stack": {
      const stackElem = STACK.byId(op.id);
      invariant(stackElem, `missing stack elem id: ${op.id}`);
      main.to(stackElem, { scale: 0, opacity: 0, visibility: "hidden" });
      break;
    }
    case "move": {
      const { left, right } = params.pointers(op.id);
      if (op.left === op.right) {
        main.to([left, right], { translateX: op.left * sizes.CELL });
      } else {
        main.to(left, { translateX: op.left * sizes.CELL });
        main.to(right, { translateX: op.right * sizes.CELL });
      }
      break;
    }
    case "stack-match": {
      const inputChar = INPUT.byId(op.inputId);
      const stackChar = STACK.byId(op.stackId);
      invariant(inputChar && stackChar, "inputChar and stackChar required");
      main.to([inputChar, stackChar], { scale: 2 }).to([inputChar, stackChar], { scale: 1 });
      break;
    }
    case "stack-none-match": {
      const inputChar = INPUT.byId(op.inputId);
      const stackChar = STACK.byId(op.stackId);
      invariant(inputChar && stackChar, "inputChar and stackChar required");
      main.to([inputChar, stackChar], { scale: 2, color: Color.red }).to([inputChar, stackChar], { scale: 1 });
      break;
    }
    case "result": {
      main.to(params.elems.RESULT, { opacity: 1, visibility: "visible" });
      break;
    }
    default:
      console.warn(`didn't expect to get here ${JSON.stringify(op)}`);
  }
}
