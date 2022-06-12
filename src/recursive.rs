pub fn balanced(input: &str) -> bool {
    expect(None, &mut input.chars())
}
fn expect(end: Option<char>, input: &mut Chars) -> bool {
    loop {
        let c = input.next();
        let good = match c {
            Some('(') => expect(Some(')'), input),
            Some('[') => expect(Some(']'), input),
            Some('{') => expect(Some('}'), input),
            Some(')') | Some(']') | Some('}') | None => {
                return end == c
            },
            _ => true,
        };
        if !good { return false; }
    }
}