use std::fs::read_to_string;
use futures::TryStreamExt;

pub fn main() -> Result<usize, std::io::Error> {
    let paths = ["Cargo.toml", "Cargo.lock"];
    let mut count = 0;
    for path in paths {
        match std::fs::read_to_string(path) {
            Ok(str) => count += str.len(),
            Err(err) => return Err(err)
        }
    }
    Ok(count)
    // files.iter()
    //     .map(|p| std::fs::read_to_string(p))
    //     .try_fold(0, |acc, item| {
    //         match item {
    //             Ok(string) => Ok(acc + string.len()),
    //             Err(e) => Err(e)
    //         }
    // });
    // match measure_cargo_toml() {
    //     Ok(len) => println!("Cargo.toml has {len} bytes"),
    //     Err(err) => eprintln!("{err}")
    // }
}

pub fn main3() -> Result<usize, std::io::Error> {
    let paths = ["Cargo.toml", "Cargo.lock"];
    paths.iter()
        .map(|p| std::fs::read_to_string(p))
        .try_fold(0, |acc, item| {
            match item {
                Ok(string) => Ok(acc + string.len()),
                Err(e) => Err(e)
            }
        })
}

pub fn main4() -> Result<usize, std::io::Error> {
    let toml = read_to_string("Cargo.toml")?;
    let lock = read_to_string("Cargo.lock")?;
    Ok(toml.len() + lock.len())
}

pub fn main5() -> Result<usize, std::io::Error> {
    let toml = read_to_string("Cargo.toml");
    let lock = read_to_string("Cargo.lock");
    let mut count = 0;
    match toml {
        Ok(str) => count += str.len(),
        Err(e) => return Err(e)
    }
    match lock {
        Ok(str) => count += str.len(),
        Err(e) => return Err(e)
    }
    Ok(count)
}

pub fn main6() -> Result<usize, std::io::Error> {
    let toml = read_to_string("Cargo.toml");
    let lock = read_to_string("Cargo.lock");
    let mut count = 0;
    for result in [toml, lock] {
        match result {
            Ok(str) => count += str.len(),
            Err(e) => return Err(e)
        }
    }
    Ok(count)
}

// pub fn measure_cargo_toml_01() -> usize {
//     let toml = std::fs::read_to_string("Cargo.toml")?;
//     toml.len()
// }

pub fn measure_cargo_toml_02() -> Option<usize> {
    std::fs::read_to_string("Cargo.toml")
        .ok()
        .map(|toml| toml.len())
}

pub fn measure_cargo_toml_04() -> Result<usize, std::io::Error> {
    std::fs::read_to_string("Cargo.toml")
        .map(|s| s.len())
}

pub fn measure_cargo_toml_05() -> Result<usize, std::io::Error> {
    Ok(std::fs::read_to_string("Cargo.toml")?.len())
}

pub fn measure_cargo_toml_06() -> Result<usize, std::io::Error> {
    let toml = std::fs::read_to_string("Cargo.toml")?;
    Ok(toml.len())
}

pub fn measure_cargo_toml_07() -> Result<usize, std::io::Error> {
    match std::fs::read_to_string("Cargo.toml") {
        Ok(toml) => Ok(toml.len()),
        Err(err) => Err(err)
    }
}

pub fn measure_cargo_files() -> Result<usize, std::io::Error> {
    let toml = std::fs::read_to_string("Cargo.toml")?;
    let lock = std::fs::read_to_string("Cargo.lock")?;
    Ok(toml.len() + lock.len())
}

pub fn measure_cargo_files_large() -> Result<usize, std::io::Error> {
    // let items = vec!["Cargo.toml", "Cargo.lock"];
    //
    // items.iter()
    //     .map(|path| std::fs::read_to_string("Cargo.toml"))
    //     .try_fold(0, |(acc, item)| acc + str.len());
    //
    // let toml = std::fs::read_to_string("Cargo.toml")?;
    // let lock = std::fs::read_to_string("Cargo.lock")?;
    // Ok(toml.len() + lock.len())
    Ok(1)
}

pub fn measure_cargo_toml() -> Result<usize, std::io::Error> {
    let toml = match std::fs::read_to_string("Cargo.toml") {
        Ok(string) => string,
        Err(err) => {
            eprintln!("{err}");
            return Err(err);
        }
    };
    Ok(toml.len())
}

// use std::fs::read_to_string;
//
// pub fn process() {
//     futures::executor::block_on(async {
//         let config = async {
//             let cargo_toml = read_to_string("Cargo.toml")?;
//             let cargo_lock = read_to_string("Cargo.lock")?;
//             (cargo_toml, cargo_lock)
//         };
//         if let Ok((toml, lock)) = config.await {
//             println!("toml bytes: {}", toml.len());
//             println!("lock bytes: {}", lock.len());
//         }
//     })
// }
