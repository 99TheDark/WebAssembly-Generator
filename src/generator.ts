import fs from "fs";
import { exec } from "child_process";
import { WebAssemblyFloatingType, WebAssemblyIntegerType, WebAssemblyType, w } from "./types";

// TODO: Make all functions closures
export class WebAssemblyGenerator {
    private location: string;
    private indention: number;
    private code: string;

    constructor(location: string) {
        this.location = location;
        this.indention = 0;
        this.code = "";
    }

    private append(line: string): void {
        this.code += " ".repeat(this.indention) + line + "\n";
    }

    private closure(params: string[], bodies: Function[] | void): void {
        if(bodies) {
            this.append(`(${params.join(" ")}`);
            this.indention++;
            bodies.forEach(body => body());
            this.indention--;
            this.append(")");
        } else {
            this.append(`(${params.join(" ")})`);
        }
    }

    private closureify(body: Function): Function {
        return () => this.closure(
            [],
            [body]
        );
    }

    // Main
    module(body: Function): void {
        this.closure(
            ["module"],
            [body]
        );
    }

    func(name: string, params: Record<string, WebAssemblyType>, result: WebAssemblyType | null, body: Function): void {
        const plist = Object.entries(params).map(entry => `(param $${entry[0]} ${w[entry[1]]})`);
        const res = result ? [`(result ${w[result]})`] : [];
        this.closure(
            ["func", `$${name}`, ...plist, ...res],
            [body]
        );
        this.closure(
            ["export", `"${name}"`, `(func $${name})`]
        );
    }

    call(name: string, ...params: Function[]): void {
        this.closure(
            [`call $${name}`],
            params
        );
    }

    start(name: string): void {
        this.closure(
            ["start", `$${name}`]
        );
    }

    // Operators
    add(type: WebAssemblyType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.add`],
            [left, right]
        );
    }

    subtract(type: WebAssemblyType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.sub`],
            [left, right]
        );
    }

    multiply(type: WebAssemblyType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.mul`],
            [left, right]
        );
    }

    divide(type: WebAssemblyType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.div`],
            [left, right]
        );
    }

    remainder(type: WebAssemblyType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.rem`],
            [left, right]
        );
    }

    lessThan(type: WebAssemblyType, left: Function, right: Function): void {
        switch(type) {
            case "int":
            case "long":
                this.closure(
                    [`${w[type]}.lt_s`],
                    [left, right]
                );
                break;
            case "float":
            case "double":
                this.closure(
                    [`${w[type]}.lt`],
                    [left, right]
                );
                break;
        }
    }

    greaterThan(type: WebAssemblyType, left: Function, right: Function): void {
        switch(type) {
            case "int":
            case "long":
                this.closure(
                    [`${w[type]}.gt_s`],
                    [left, right]
                );
                break;
            case "float":
            case "double":
                this.closure(
                    [`${w[type]}.gt`],
                    [left, right]
                );
                break;
        }
    }

    lessThanOrEqualTo(type: WebAssemblyType, left: Function, right: Function): void {
        switch(type) {
            case "int":
            case "long":
                this.closure(
                    [`${w[type]}.le_s`],
                    [left, right]
                );
                break;
            case "float":
            case "double":
                this.closure(
                    [`${w[type]}.le`],
                    [left, right]
                );
                break;
        }
    }

    greaterThanOrEqualTo(type: WebAssemblyType, left: Function, right: Function): void {
        switch(type) {
            case "int":
            case "long":
                this.closure(
                    [`${w[type]}.ge_s`],
                    [left, right]
                );
                break;
            case "float":
            case "double":
                this.closure(
                    [`${w[type]}.ge`],
                    [left, right]
                );
                break;
        }
    }

    equalTo(type: WebAssemblyType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.eq`],
            [left, right]
        );
    }

    notEqualTo(type: WebAssemblyType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.ne`],
            [left, right]
        );
    }

    not(type: WebAssemblyType): void {
        this.append(`${w[type]}.eqz`);
    }

    and(type: WebAssemblyType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.and`],
            [left, right]
        )
    }

    or(type: WebAssemblyType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.or`],
            [left, right]
        )
    }

    xor(type: WebAssemblyType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.xor`],
            [left, right]
        )
    }

    leftShift(type: WebAssemblyType): void {
        this.append(`${w[type]}.shl`);
    }

    rightShift(type: WebAssemblyType): void {
        this.append(`${w[type]}.shr`);
    }

    leftRotate(type: WebAssemblyIntegerType): void {
        this.append(`${w[type]}.rotl`);
    }

    rightRotate(type: WebAssemblyIntegerType): void {
        this.append(`${w[type]}.rotr`);
    }

    countLeadingZeros(type: WebAssemblyIntegerType): void {
        this.append(`${w[type]}.clz`);
    }

    countTrailingZeros(type: WebAssemblyIntegerType): void {
        this.append(`${w[type]}.ctz`);
    }

    countOnes(type: WebAssemblyIntegerType): void {
        this.append(`${w[type]}.popcnt`);
    }

    min(type: WebAssemblyFloatingType, a: Function, b: Function): void {
        this.closure(
            [`${w[type]}.min`],
            [a, b]
        );
    }

    max(type: WebAssemblyFloatingType, a: Function, b: Function): void {
        this.closure(
            [`${w[type]}.max`],
            [a, b]
        );
    }

    floor(type: WebAssemblyFloatingType, a: Function, b: Function): void {
        this.closure(
            [`${w[type]}.floor`],
            [a, b]
        );
    }

    ceil(type: WebAssemblyFloatingType, a: Function, b: Function): void {
        this.closure(
            [`${w[type]}.ceil`],
            [a, b]
        );
    }

    round(type: WebAssemblyFloatingType, a: Function, b: Function): void {
        this.closure(
            [`${w[type]}.nearest`],
            [a, b]
        );
    }

    truncate(type: WebAssemblyFloatingType, a: Function, b: Function): void {
        this.closure(
            [`${w[type]}.trunc`],
            [a, b]
        );
    }

    absoluteValue(type: WebAssemblyFloatingType, a: Function, b: Function): void {
        this.closure(
            [`${w[type]}.abs`],
            [a, b]
        );
    }

    negate(type: WebAssemblyFloatingType, a: Function, b: Function): void {
        this.closure(
            [`${w[type]}.neg`],
            [a, b]
        );
    }

    squareRoot(type: WebAssemblyFloatingType, a: Function, b: Function): void {
        this.closure(
            [`${w[type]}.sqrt`],
            [a, b]
        );
    }

    copySign(type: WebAssemblyFloatingType, a: Function, b: Function): void {
        this.closure(
            [`${w[type]}.copysign`],
            [a, b]
        );
    }

    convert(from: WebAssemblyType, to: WebAssemblyType, value: Function): void {
        const func = (() => {
            switch(`${from}>${to}`) {
                default: return ""; // will never happen

                case "int>long": return "i64.extend_i32";
                case "int>float": return "f32.convert_i32_s";
                case "int>double": return "f64.convert_i32_s";

                case "long>int": return "i32.wrap_i64";
                case "long>float": return "f32.convert_i64_s";
                case "long>double": return "f64.convert_i64_s";

                case "float>int": return "i32.trunc_f32_s";
                case "float>long": return "i64.trunc_f32_s";
                case "float>double": return "f64.promote_f32";

                case "double>int": return "i32.trunc_f64_s";
                case "double>long": return "i64.trunc_f64_s";
                case "double>float": return "f32.demote_f64";
            }
        })();

        this.closure(
            [func],
            [value]
        );
    }

    reinterpret(fromType: WebAssemblyFloatingType, toType: WebAssemblyFloatingType, from: Function, to: Function): void {
        this.closure(
            [`${w[toType]}.reinterpret_${w[fromType]}`],
            [from, to]
        );
    }

    // Variables & Constants
    const(type: WebAssemblyType, value: string | number): void {
        this.closure(
            [`${w[type]}.const ${value}`]
        );
    }

    declare(variable: string, type: WebAssemblyType): void {
        this.closure(
            ["local", `$${variable}`, w[type]]
        );
    }

    declareGlobal(variable: string, type: WebAssemblyType, value: Function | void): void {
        this.closure(
            ["global", `$${variable}`, w[type]],
            value ? [value] : value
        );
    }

    set(variable: string, value: Function): void {
        this.closure(
            ["local.set", `$${variable}`],
            [value]
        );
    }

    setGlobal(variable: string, value: Function): void {
        this.closure(
            ["global.set", `$${variable}`],
            [value]
        );
    }

    get(variable: string): void {
        this.closure(
            [`local.get $${variable}`]
        );
    }

    getGlobal(variable: string): void {
        this.closure(
            [`global.get $${variable}`]
        );
    }

    // Memory
    memory(): void {
        this.closure(
            ["memory", "0"]
        );
    }

    store(type: WebAssemblyType): void {
        this.append(`${w[type]}.store`);
    }

    load(type: WebAssemblyType): void {
        this.append(`${w[type]}.load`);
    }

    size(): void {
        this.append("memory.size");
    }

    grow(value: Function): void {
        this.closure(
            ["memory.grow"],
            [value]
        );
    }

    // Control flow
    if(type: WebAssemblyType | null, boolean: Function, thenClause: Function, elseClause: Function | void): void {
        const bodies = [
            boolean,
            () => this.closure(
                ["then"],
                [thenClause]
            )
        ];
        if(elseClause) bodies.push(
            () => this.closure(
                ["else"],
                [elseClause]
            )
        );

        const header = ["if"];
        if(type) header.push(`(result ${w[type]})`);

        this.closure(
            header,
            bodies
        );
    }

    loop(name: string, body: Function): void {
        this.closure(
            ["loop", `$${name}`],
            [body]
        );
    }

    block(name: string, body: Function): void {
        this.closure(
            ["block", `$${name}`],
            [body]
        );
    }

    break(block: string): void {
        this.append(`br $${block}`);
    }

    return(body: Function): void {
        this.closure(
            ["return"],
            [body]
        );
    }

    select(a: Function, b: Function, boolean: Function): void {
        this.closure(
            ["select"],
            [a, b, boolean]
        );
    }

    pop(): void {
        this.append("drop");
    }

    // Output
    stringify(): string {
        return this.code;
    }

    async compile(): Promise<void> {
        return new Promise(
            (resolve, reject) => {
                fs.writeFile(`${this.location}.wat`, this.code, err => {
                    if(err) reject(err);

                    exec(`wat2wasm ${this.location}.wat -o ${this.location}.wasm`, (err, _, stderr) => {
                        if(err) reject(err);
                        if(stderr) reject(stderr);

                        resolve();
                    });
                });
            }
        );
    }

    run(): void {
        fs.readFile(`${this.location}.wasm`, async (err, buffer) => {
            if(err) throw err;

            const module = await WebAssembly.instantiate(buffer);

            const exports = module.instance.exports;

            // console.log((exports.main as Function)());
        });
    }
}