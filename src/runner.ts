import * as fs from "fs";
import { exec } from "child_process";

export function run(wasmtxt: string) {
    fs.writeFile("out/script.wat", wasmtxt, err => {
        if(err) throw err;

        exec("wat2wasm out/script.wat -o out/script.wasm", (err, _, stderr) => {
            if(err) throw err;
            if(stderr) throw stderr;

            fs.readFile("out/script.wasm", async (err, buffer) => {
                if(err) throw err;

                const module = await WebAssembly.instantiate(buffer);

                const exports = module.instance.exports;

                // console.log((exports.main as Function)());
            });
        });
    });
}