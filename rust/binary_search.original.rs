///
/// Perform a binary search on a sorted list
///
pub fn binary_search(k: i32, items: &[i32]) -> Option<i32> {
    let mut low: i32 = 0;
    let mut high: i32 = items.len() as i32 - 1;

    while low <= high {
        let middle = (((high + low) / 2) as f64).floor() as i32;
        if let Some(current) = items.get(middle as usize) {
            if *current == k {
                return Some(middle);
            }
            if *current > k {
                high = middle - 1
            }
            if *current < k {
                low = middle + 1
            }
        }
    }
    None
}

#[test]
fn test_binary_search() {
    let items = vec![1, 2, 3, 4, 5];
    assert_eq!(Some(0), binary_search(1, &items));
    assert_eq!(Some(1), binary_search(2, &items));
    assert_eq!(Some(2), binary_search(3, &items));
    assert_eq!(Some(3), binary_search(4, &items));
    assert_eq!(Some(4), binary_search(5, &items));
    assert_eq!(None, binary_search(0, &items));
    assert_eq!(None, binary_search(90, &items));
    assert_eq!(None, binary_search(9000000, &items));

    let items = vec![2, 4, 6, 80, 90, 120, 180, 900, 2000, 4000, 5000, 60000];
    assert_eq!(None, binary_search(1, &items));

    assert_eq!(None, binary_search(1, &[]));
}