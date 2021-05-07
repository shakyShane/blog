import "./algo-stack.lit";
import Stack from "./algo-stack.lit";
import { name } from "./algo-controls.lit";
import { name as pointerName, Pointer } from "./algo-pointer.lit";
import { name as pointerRowName, PointerRow } from "./algo-pointer-row.lit";
import { name as resultName, Result } from "./algo-result.lit";
import { bounceInputIn, Color, fadeInPointer, PointerId, showPointer, sizes, XIndex } from "./common-animations";
import { balanced_recursive } from "./algos/balanced_recursive";

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
  | { kind: "move"; id: PointerId; left: XIndex; right: XIndex }
  | { kind: "match"; left: PointerId; right: PointerId }
  | { kind: "none-match"; left: PointerId; right: PointerId }
  | { kind: "remove"; id: PointerId }
  | { kind: "remove-many"; ids: PointerId[] }
  | { kind: "result"; result: boolean };

const results: Record<string, ResultOps> = {
  "3()[]": {
    input: "3()[]",
    ops: [
      { kind: "create", id: "a", left: 0, right: 0, color: Color.white },
      { kind: "move", id: "a", left: 1, right: 1 },
      { kind: "create", id: "b", left: 2, right: 2, color: Color.pink },
      { kind: "match", left: "a", right: "b" },
      { kind: "remove", id: "b" },
      { kind: "move", id: "a", left: 3, right: 3 },
      { kind: "create", id: "c", left: 4, right: 4, color: Color.yellow },
      { kind: "match", left: "a", right: "c" },
      { kind: "remove", id: "c" },
      { kind: "remove", id: "a" },
    ],
  },
  "3(000)[]": {
    input: "3(000)[]",
    ops: [
      { kind: "create", id: "a", left: 0, right: 0, color: Color.white },
      { kind: "move", id: "a", left: 1, right: 1 },
      { kind: "create", id: "b", left: 2, right: 2, color: Color.pink },
      { kind: "move", id: "b", left: 3, right: 3 },
      { kind: "move", id: "b", left: 4, right: 4 },
      { kind: "move", id: "b", left: 5, right: 5 },
      { kind: "match", left: "a", right: "b" },
      { kind: "remove", id: "b" },
      { kind: "move", id: "a", left: 6, right: 6 },
      { kind: "create", id: "c", left: 7, right: 7, color: Color.orange },
      { kind: "match", left: "a", right: "c" },
      { kind: "remove-many", ids: ["a", "c"] },
      { kind: "result", result: true },
    ],
  },
  "(1+2)": {
    input: "(1+2)",
    ops: [
      { kind: "create", id: "a", left: 0, right: 0, color: Color.white },
      { kind: "create", id: "b", left: 0, right: 0, color: Color.orange },
      { kind: "move", id: "b", left: 1, right: 1 },
      { kind: "move", id: "b", left: 2, right: 2 },
      { kind: "move", id: "b", left: 3, right: 3 },
      { kind: "move", id: "b", left: 4, right: 4 },
      { kind: "match", left: "a", right: "b" },
      { kind: "remove-many", ids: ["a", "b"] },
      { kind: "result", result: true },
    ],
  },
  "12(1+2": {
    input: "12(1+2",
    ops: [
      { kind: "create", id: "a", left: 0, right: 0, color: Color.white },
      { kind: "move", id: "a", left: 1, right: 1 },
      { kind: "move", id: "a", left: 2, right: 2 },
      { kind: "create", id: "b", left: 3, right: 3, color: Color.pink },
      { kind: "move", id: "b", left: 4, right: 4 },
      { kind: "move", id: "b", left: 5, right: 5 },
      { kind: "none-match", left: "a", right: "b" },
      { kind: "remove-many", ids: ["a", "b"] },
      { kind: "result", result: false },
    ],
  },
  "~([{}])~": {
    input: "~([{}])~",
    ops: [
      { kind: "create", id: "a", left: 0, right: 0, color: Color.white },
      { kind: "move", id: "a", left: 1, right: 1 },
      { kind: "create", id: "b", left: 2, right: 2, color: Color.pink },
      { kind: "create", id: "c", left: 3, right: 3, color: Color.orange },
      { kind: "create", id: "d", left: 4, right: 4, color: Color.lightgreen },
      { kind: "match", left: "c", right: "d" },
      { kind: "remove", id: "d" },
      { kind: "move", id: "c", left: 5, right: 5 },
      { kind: "match", left: "b", right: "c" },
      { kind: "remove", id: "c" },
      { kind: "move", id: "b", left: 6, right: 6 },
      { kind: "match", left: "a", right: "b" },
      { kind: "remove", id: "b" },
      { kind: "move", id: "a", left: 7, right: 7 },
      { kind: "remove", id: "a" },
      { kind: "result", result: true },
    ],
  },
  "([{123}])": {
    input: "([{123}])",
    ops: [
      { kind: "create", id: "a", left: 0, right: 0, color: Color.black },
      { kind: "create", id: "b", left: 1, right: 1, color: Color.red },
      { kind: "create", id: "c", left: 2, right: 2, color: Color.orange },
      { kind: "create", id: "d", left: 3, right: 3, color: Color.lightgreen },
      { kind: "move", id: "d", left: 4, right: 4 },
      { kind: "move", id: "d", left: 5, right: 5 },
      { kind: "move", id: "d", left: 6, right: 6 },
      { kind: "match", left: "c", right: "d" },
      { kind: "remove", id: "d" },
      { kind: "move", id: "c", left: 7, right: 7 },
      { kind: "match", left: "b", right: "c" },
      { kind: "remove", id: "c" },
      { kind: "move", id: "b", left: 8, right: 8 },
      { kind: "match", left: "a", right: "b" },
      { kind: "remove-many", ids: ["a", "b"] },
      { kind: "result", result: true },
    ],
  },
};

function process(op: Op, params: BalancedStack) {
  const { main } = params.timelines;
  switch (op.kind) {
    case "create": {
      const { left, right } = params.pointers(op.id);
      main.set(left, { translateX: op.left * sizes.CELL, duration: 0 });
      main.set(right, { translateX: op.right * sizes.CELL, duration: 0 });
      fadeInPointer(main, left, op.color);
      showPointer(main, right, op.color);
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
    case "match": {
      const { left, right } = params.pointers(op.left);
      const { left: rleft, right: rright } = params.pointers(op.right);
      main.to([left, right, rleft, rright], { scale: 1.5 });
      main.to([left, right, rleft, rright], { scale: 1 });
      break;
    }
    case "none-match": {
      const { left, right } = params.pointers(op.left);
      const { left: rleft, right: rright } = params.pointers(op.right);
      main.to([left, right, rleft, rright], { scale: 1.5, color: Color.red });
      main.to([left, right, rleft, rright], { scale: 1 });
      break;
    }
    case "remove": {
      const { left, right } = params.pointers(op.id);
      main.to([left, right], { opacity: 0, visibility: "visible" });
      break;
    }
    case "remove-many": {
      const elems: any[] = [];
      op.ids.forEach((id) => {
        const { left, right } = params.pointers(id);
        elems.push(left);
        elems.push(right!);
      });
      main.to(elems, { opacity: 0, visibility: "visible" });
      break;
    }
    case "result": {
      main.to(params.elems.RESULT, { opacity: 1, visibility: "visible" });
      break;
    }
    default:
      throw new Error(`didn't expect to get here ${JSON.stringify(op)}`);
  }
}

export function init(input: string, elements: Elems, timeline: gsap.core.Timeline) {
  const res = results[input];
  if (!res) throw new Error("input not found");

  const res1 = balanced_recursive(input);

  elements.RESULT.prefix = "Balanced";
  elements.RESULT.result = res1;
  elements.INPUT.fromStr(input);

  res.ops.forEach((op) => {
    switch (op.kind) {
      case "create": {
        elements.POINTER_ROW.addRow({ id: `${op.id}-left` });
        elements.POINTER_ROW.addRow({ id: `${op.id}-right` });
      }
    }
  });

  setTimeout(() => {
    const params: BalancedStack = {
      elems: elements,
      pointers: (id) => {
        return {
          left: elements.POINTER_ROW.byId(`${id}-left`)!,
          right: elements.POINTER_ROW.byId(`${id}-right`)!,
        };
      },
      timelines: { main: timeline },
    };
    bounceInputIn(timeline, params.elems.INPUT.cells());
    res.ops.forEach((op) => {
      process(op, params);
    });
  }, 0);
}

interface Elems {
  INPUT: Stack;
  POINTER_ROW: PointerRow;
  RESULT: Result;
}

interface BalancedStack {
  elems: Elems;
  pointers: (id: string) => { left: Pointer; right: Pointer };
  timelines: {
    main: gsap.core.Timeline;
  };
}
