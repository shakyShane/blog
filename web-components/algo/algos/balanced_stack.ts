export function balanced_stack(input: string): boolean {
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
        break;
      }
      case ")":
      case "]":
      case "}": {
        const prev = stack.pop();
        if (prev !== char) {
          console.log("set false");
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
  return stack.length === 0;
}
