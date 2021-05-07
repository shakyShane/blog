const mapping = {
  "(": ")",
  "[": "]",
  "{": "}",
};

/**
 * @param {string} slice
 * @returns {boolean}
 */
export function balanced_recursive(slice: string): boolean {
  return expect(null, slice.split(""));
}

/**
 * @param {string|null} end
 * @param {string[]} chars
 * @param charIndex
 * @param {Value[]} values
 * @returns {boolean}
 */
function expect(end, chars): boolean {
  while (true) {
    let c = chars.shift();
    if (c === undefined) c = null; // just here to allow JSON
    let good;
    switch (c) {
      case "(":
      case "{":
      case "[": {
        good = expect(mapping[c], chars);
        break;
      }
      case null:
      case ")":
      case "}":
      case "]": {
        return end === c;
      }
      default: {
        good = true; // any other char
      }
    }
    if (!good) {
      return false;
    }
  }
}
