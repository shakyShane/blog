pub fn balanced(input: &str) -> bool {
    let mut stack: Vec<char> = vec![];
    for c in input.chars() {
        match c {
            '(' => stack.push(')'),
            '[' => stack.push(']'),
            '{' => stack.push('}'),
            ')' | ']' | '}' if stack.pop() != Some(c) => return false,
            _ => {}
        }
    }
    stack.is_empty()
}