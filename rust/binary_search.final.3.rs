use std::cmp::Ordering;

fn binary_search(k: i32, items: &[i32]) -> Option<usize> {
    let mut low: usize = 0;
    let mut high: usize = items.len();

    while low < high {
        let middle = (high + low) / 2;
        match items[middle].cmp(&k) {
            Ordering::Equal => return Some(middle),
            Ordering::Greater => high = middle,
            Ordering::Less => low = middle + 1
        }
    }
    None
}