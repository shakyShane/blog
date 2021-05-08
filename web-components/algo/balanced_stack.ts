import "./algo-stack.lit";
import Stack from "./algo-stack.lit";
import { name } from "./algo-controls.lit";
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
  | { kind: "create"; color: Color; id: PointerId; x: XIndex }
  | { kind: "append-stack"; id: string; char: string; index: number }
  | { kind: "pop-stack"; id: string }
  | { kind: "move"; id: PointerId; x: XIndex }
  | { kind: "stack-match"; inputId: PointerId; stackId: PointerId }
  | { kind: "stack-none-match"; inputId: PointerId; stackId: PointerId }
  | { kind: "remove"; id: PointerId }
  | { kind: "result"; result: boolean };

export function init(input: string, elems: Elems, timeline: TimelineLite) {
  const ops: Op[] = [];
  const res1 = balanced_stack_2(input, ops);
  ops.forEach((op) => console.log("op: ", op));
  const result: ResultOps = {
    input,
    ops,
  };
  elems.RESULT.result = res1;
  elems.RESULT.prefix = "Balanced";

  elems.INPUT.fromStr(input);

  result.ops.forEach((op) => {
    switch (op.kind) {
      case "create": {
        elems.POINTER_ROW.addRow({ id: op.id });
      }
    }
  });

  result.ops.forEach((op) => {
    switch (op.kind) {
      case "append-stack": {
        elems.STACK.push({ id: op.id, char: op.char });
      }
    }
  });

  const params: BalancedStack = {
    elems,
    pointers: (id) => {
      return elems.POINTER_ROW.byId(id)!;
    },
    timelines: { main: timeline },
  };

  setTimeout(() => {
    bounceInputIn(timeline, params.elems.INPUT.cells());
    result.ops.forEach((op) => {
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
    case "remove": {
      const x = params.pointers(op.id);
      main.to(x, { opacity: 0, visibility: "visible" });
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

export function balanced_stack_2(input: string, ops: Op[]): boolean {
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
        ops.push({ kind: "append-stack", id: `vec-${i}`, char: map[char], index: stack.length - 1 });
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
  }
  ops.push({ kind: "result", result: final_result });
  return final_result;
}
