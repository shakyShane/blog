mod async_block_01;


fn main() {
    async_block_01::main();
    let p2 = async_block_01::main3();
    dbg!(p2);
}
