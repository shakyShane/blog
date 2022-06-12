use std::cmp::Ordering;

fn binary_search(k: i32, items: &[i32]) -> Option<usize> {
    if items.is_empty() { return None }

    let mut low: usize = 0;
    let mut high: usize = items.len() - 1;

    while low <= high {
        let middle = (high + low) / 2;
        match items[middle].cmp(&k) {
            Ordering::Equal => return Some(middle),
            Ordering::Greater => {
                if middle == 0 { return None };
                high = middle - 1
            },
            Ordering::Less => low = middle + 1
        }
    }
    None
}