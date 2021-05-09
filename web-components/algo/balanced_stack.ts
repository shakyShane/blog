import "./algo-stack.lit";
import Stack from "./algo-stack.lit";
import { name } from "./algo-controls.lit";
import { bounceInputIn, Color, fadeInPointer, PointerId, showPointer, sizes, XIndex } from "./common-animations";
import { name as pointerName, Pointer } from "./algo-pointer.lit";
import { name as pointerRowName, PointerRow } from "./algo-pointer-row.lit";
import { name as resultName, Result } from "./algo-result.lit";
import invariant from "tiny-invariant";
import { TimelineLite } from "gsap/gsap-core";
import { ResultOps } from "~/web-components/algo/algo-balanced-stack.lit";

console.log("register %O", name);
console.log("register %O", pointerName);
console.log("register %O", pointerRowName);
console.log("register %O", resultName);

export type Op =
  | { kind: "init" }
  | { kind: "create"; color: Color; id: PointerId; x: XIndex }
  | { kind: "append-stack"; id: string; char: string; index: number }
  | { kind: "pop-stack"; id: string }
  | { kind: "move"; id: PointerId; x: XIndex }
  | { kind: "stack-match"; inputId: PointerId; stackId: PointerId }
  | { kind: "stack-none-match"; inputId: PointerId; stackId: PointerId }
  | { kind: "remove"; id: PointerId }
  | { kind: "result"; result: boolean }
  | { kind: "highlight-stack" };

export function initAnimations(resultOps: ResultOps, elems: Elems, timeline: TimelineLite) {
  const params: BalancedStack = {
    elems,
    pointers: (id) => {
      return elems.POINTER_ROW.byId(id)!;
    },
    timelines: { main: timeline },
  };

  bounceInputIn(timeline, params.elems.INPUT.cells());
  resultOps.ops.forEach((op) => {
    process(op, params);
  });
}

interface Elems {
  INPUT: Stack;
  STACK: Stack;
  POINTER_ROW: PointerRow;
  RESULT: Result;
}

interface BalancedStack {
  elems: Elems;
  pointers: (id: string) => Pointer;
  timelines: {
    main: TimelineLite;
  };
}

function process(op: Op, params: BalancedStack) {
  const { main } = params.timelines;
  const { STACK, INPUT } = params.elems;
  switch (op.kind) {
    case "create": {
      const pointer = params.pointers(op.id);
      main.set(pointer, { translateX: op.x * sizes.CELL, duration: 0 });
      fadeInPointer(main, pointer, op.color);
      break;
    }
    case "append-stack": {
      const stackElem = STACK.byId(op.id);
      invariant(stackElem, `missing stack elem id: ${op.id}`);
      main
        .set(stackElem, { translateX: sizes.CELL * op.index, color: Color.black, visibility: "visible" })
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
      const pointer = params.pointers(op.id);
      main.to(pointer, { translateX: op.x * sizes.CELL });
      break;
    }
    case "stack-match": {
      const inputChar = INPUT.byId(op.inputId);
      const stackChar = STACK.byId(op.stackId);
      invariant(inputChar && stackChar, "`stack-match` inputChar and stackChar required");
      main.to([inputChar, stackChar], { scale: 2.5 }).to([inputChar, stackChar], { scale: 1 });
      break;
    }
    case "stack-none-match": {
      const inputChar = INPUT.byId(op.inputId);
      const stackChar = STACK.byId(op.stackId);
      invariant(inputChar, "'stack-none-match' inputChar required");
      if (inputChar && stackChar) {
        main.to([inputChar, stackChar], { scale: 2, color: Color.red }).to([inputChar, stackChar], { scale: 1 });
      } else {
        main.to(inputChar, { scale: 2, color: Color.red }).to([inputChar], { scale: 1 });
      }
      break;
    }
    case "remove": {
      const x = params.pointers(op.id);
      main.to(x, { opacity: 0 });
      break;
    }
    case "result": {
      // main.to(params.elems.RESULT, { opacity: 1, visibility: "visible" });
      break;
    }
    case "highlight-stack": {
      console.log("shane:", params.elems.STACK.cells());
      main
        .to(params.elems.STACK.cells(), { scale: 2, color: Color.red })
        .to(params.elems.STACK.cells(), { scale: 1, color: Color.black, delay: 0.5 });
      break;
    }
    default:
      console.warn(`didn't expect to get here ${JSON.stringify(op)}`);
  }
}

let calls = 0;
export function balanced_stack_2(input: string, ops: Op[]): boolean {
  calls += 1;
  let nextId = "a";
  ops.push({ kind: "create", id: nextId, x: 0, color: Color.black });
  const stackIds: string[] = [];
  const stack: string[] = [];
  const map = {
    "(": ")",
    "[": "]",
    "{": "}",
  };
  let result = true;
  loop: for (let i = 0; i < input.length; i += 1) {
    ops.push({ kind: "move", id: nextId, x: i });
    const char = input[i];
    switch (char) {
      case "(":
      case "{":
      case "[": {
        stack.push(map[char]);
        const id = `vec-${i}`;
        stackIds.push(id);
        ops.push({ kind: "append-stack", id, char: map[char], index: stack.length - 1 });
        break;
      }
      case ")":
      case "]":
      case "}": {
        const prev = stack.pop();
        const match = prev === char;
        const lastId = stackIds.pop();
        if (match) {
          ops.push({ kind: "stack-match", inputId: `${char}-${i}`, stackId: lastId });
          ops.push({ kind: "pop-stack", id: lastId });
        } else {
          ops.push({ kind: "stack-none-match", inputId: `${char}-${i}`, stackId: lastId });
          result = false;
          break loop;
        }
        break;
      }
      default: {
        console.log("...");
      }
    }
  }
  const final_result = result === true && stack.length === 0;
  if (final_result) {
    ops.push({ kind: "remove", id: nextId });
  } else {
    if (stack.length !== 0) {
      console.log("shane: not empty", stackIds);
      ops.push({ kind: "highlight-stack" });
    }
  }
  ops.push({ kind: "result", result: final_result });
  return final_result;
}
