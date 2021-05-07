export type Op =
  | { name: "push" | "pop"; value?: string }
  | { name: "cmp"; values: { lhs: string | undefined; rhs: string } };
export type Val = { index: number; ops: Op[]; stack: string[] };
export type Res = { result: boolean; values: Val[] };

export function balanced_stack(input: string): Res {
  const values: Val[] = [];
  const stack: string[] = [];
  const map = {
    "(": ")",
    "[": "]",
    "{": "}",
  };
  let result = true;
  loop: for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    switch (char) {
      case "(":
      case "{":
      case "[": {
        stack.push(map[char]);
        values.push({
          stack: stack.slice(),
          index: i,
          ops: [{ name: "push", value: map[char] }],
        });
        break;
      }
      case ")":
      case "]":
      case "}": {
        const prev = stack.pop();
        values.push({
          stack: stack.slice(),
          index: i,
          ops: [{ name: "pop" }, { name: "cmp", values: { lhs: prev, rhs: char } }],
        });
        if (prev !== char) {
          console.log("set false");
          result = false;
          break loop;
        }
        break;
      }
      default: {
        values.push({ stack: stack.slice(), index: i, ops: [] });
      }
    }
  }
  return { result: result && stack.length === 0, values };
}
