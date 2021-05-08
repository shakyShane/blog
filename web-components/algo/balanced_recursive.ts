import "./algo-stack.lit";
import Stack from "./algo-stack.lit";
import { name } from "./algo-controls.lit";
import { name as pointerName, Pointer } from "./algo-pointer.lit";
import { name as pointerRowName, PointerRow } from "./algo-pointer-row.lit";
import { name as resultName, Result } from "./algo-result.lit";
import { bounceInputIn, Color, fadeInPointer, PointerId, showPointer, sizes, XIndex } from "./common-animations";
import { TimelineLite } from "gsap/gsap-core";

console.log("register %O", name);
console.log("register %O", pointerName);
console.log("register %O", pointerRowName);
console.log("register %O", resultName);

type ResultOps = {
  result: boolean;
  input: string;
  ops: Op[];
};

type Op =
  | { kind: "create"; color: Color; id: PointerId; x: XIndex }
  | { kind: "move"; id: PointerId; left: XIndex; right: XIndex }
  | { kind: "match"; left: PointerId; right: PointerId }
  | { kind: "none-match"; left: PointerId; right: PointerId }
  | { kind: "remove"; id: PointerId }
  | { kind: "remove-many"; ids: PointerId[] }
  | { kind: "result"; result: boolean };

function process(op: Op, params: BalancedStack) {
  const { main } = params.timelines;
  switch (op.kind) {
    case "create": {
      const x = params.pointers(op.id);
      main.set(x, { translateX: op.x * sizes.CELL, duration: 0 });
      fadeInPointer(main, x, op.color);
      break;
    }
    case "move": {
      const x = params.pointers(op.id);
      main.to(x, { translateX: op.left * sizes.CELL });
      break;
    }
    case "match": {
      const x = params.pointers(op.left);
      const xr = params.pointers(op.right);
      main.to([x, xr], { scale: 1.5 });
      main.to([x, xr], { scale: 1 });
      break;
    }
    case "none-match": {
      const x = params.pointers(op.left);
      const xr = params.pointers(op.right);
      main.to([x, xr], { scale: 1.5, color: Color.red });
      main.to([x, xr], { scale: 1 });
      break;
    }
    case "remove": {
      const x = params.pointers(op.id);
      main.to(x, { opacity: 0, visibility: "visible" });
      break;
    }
    case "remove-many": {
      const elems: any[] = [];
      op.ids.forEach((id) => {
        const x = params.pointers(id);
        elems.push(x);
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

export function init(input: string, elements: Elems, timeline: TimelineLite) {
  const ops: Op[] = [];
  const res2_result = balanced_recursive_2(input, ops);

  const res: ResultOps = {
    input: input,
    ops: ops,
    result: res2_result,
  };
  //
  // elements.RESULT.prefix = "Balanced";
  // elements.RESULT.result = res2_result;
  // elements.INPUT.fromStr(input);

  // res.ops.forEach((op) => {
  //   switch (op.kind) {
  //     case "create": {
  //       elements.POINTER_ROW.addRow({ id: op.id });
  //     }
  //   }
  // });

  setTimeout(() => {
    const params: BalancedStack = {
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
  }, 0);
}

interface Elems {
  INPUT: Stack;
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

const mapping = {
  "(": ")",
  "[": "]",
  "{": "}",
};

/**
 * @param {string} slice
 * @param {Op[]} ops
 * @returns {boolean}
 */
export function balanced_recursive_2(slice: string, ops: Op[]): boolean {
  const colors = {
    "0": Color.black,
    "1": Color.purple,
    "2": Color.orange,
    "3": Color.lightgreen,
  };
  const pointers: string[] = [];
  const cursor = { index: 0, max: slice.length };
  const res_bool = expect(null, slice.split(""), cursor, 0, ops);
  ops.push({ kind: "result", result: res_bool });
  /**
   * @param {string|null} end
   * @param {string[]} chars
   * @param cursor
   * @param {number} callCursor
   * @param {Op[]} ops
   * @param prevId
   * @returns {boolean}
   */
  function expect(
    end,
    chars,
    cursor: { index: number; max: number },
    callCursor: number,
    ops: Op[],
    prevId?: string
  ): boolean {
    const nextId = `pid-${pointers.length}`;
    const nextColor = colors[String(pointers.length)] || colors[0];
    pointers.push(nextId);
    ops.push({
      kind: "create",
      id: nextId,
      color: nextColor,
      x: cursor.index,
    });

    while (true) {
      let c = chars.shift();
      cursor.index += 1;
      // console.log("Equal: char='%O', index=%O, loop=%d", c, callIndex, loopIndex + callIndex);
      if (c === undefined) c = null; // just here to allow JSON
      let good;
      switch (c) {
        case "(":
        case "{":
        case "[": {
          good = expect(mapping[c], chars, cursor, callCursor, ops, nextId);
          break;
        }
        case null:
        case ")":
        case "}":
        case "]": {
          const res = end === c;
          if (end && c) {
            if (res) {
              ops.push({ kind: "match", left: prevId, right: nextId });
              ops.push({ kind: "remove", id: nextId });
            } else {
              ops.push({ kind: "none-match", left: prevId, right: nextId });
            }
          }
          return res;
        }
        default: {
          good = true; // any other char
        }
      }
      if (!good) {
        return false;
      } else {
        if (cursor.index < cursor.max) {
          ops.push({ kind: "move", id: nextId, left: cursor.index, right: cursor.index });
        } else {
          ops.push({ kind: "remove", id: nextId });
        }
      }
    }
  }

  return res_bool;
}
