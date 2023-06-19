import fs from "fs";
import { exec } from "child_process";
import {
    WebAssemblyFloatingType,
    WebAssemblyIntegerType,
    WebAssemblyReferenceType,
    WebAssemblyType,
    Parameters,
    parameterize,
    w
} from "./types";

function escapify(ch: string): string {
    let full = ch.charCodeAt(0).toString(16).padStart(4, "0");
    return (full.match(/.{1,2}/g) ?? []).map(strItem => `\\${strItem}`).join("");
};

// TODO: Make all functions closures
/**
 * Main generator function
 * @author 99TheDark <99thedark@gmail.com>
 * @version 1.3.1
 */
export class WebAssemblyGenerator {
    private location: string;
    private imports: WebAssembly.Imports;
    private indention: number;
    private allocation: number;
    private mem: WebAssembly.Memory;
    private code: string;

    constructor(location: string, imports: WebAssembly.Imports) {
        this.location = location;
        this.imports = imports;
        this.indention = 0;
        this.allocation = 0;
        this.mem = new WebAssembly.Memory({ initial: 0 });
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

    // Main
    /**
     * Wrapper around all the code inside a WebAssembly module
     * @param {Function} body Module body
     * @returns {void} 
     * @example
     * gen.module(() => {
     *     gen.import("stdlib", "println", "log", ["int", "int"]);
     *     gen.allocate(() => gen.string("Hello, world!"));
     *     gen.func("main", {}, null, () => gen.call("log", 
     *         () => gen.const("int", 0), 
     *         () => gen.const("int", 13)
     *     ));
     *     gen.start("main");
     * });
     */
    module(body: Function): void {
        this.closure(
            ["module"],
            [body]
        );
    }

    /**
     * Import functions from other libraries
     * @param {string} library Library the imported function is from
     * @param {string} funcName Name of the imported function
     * @param {string} name Signature of the imported function
     * @param {WebAssemblyType[]} params Parameter types of the imported function
     * @returns {void}
     * @example
     * const gen = new WebAssemblyGenerator("script", { console: { log: console.log } });
     * gen.module(() => {
     *     gen.import("console", "log", "logint", ["int"]);
     *     gen.func("main", {}, null, () => gen.call("logint", 
     *         () => gen.const("int", -38)
     *     ));
     * });
     */
    import(library: string, funcName: string, name: string, params: WebAssemblyType[]): void {
        const paramString = params.map(param => w[param]).join(" ");
        this.closure(
            ["import", `"${library}"`, `"${funcName}"`, `(func $${name} (param ${paramString}))`]
        );
    }

    /**
     * Store a string in memory
     * @param {string} str String to be stored
     * @returns {void}
     * @example
     * gen.string("Hello, world!");
     */
    string(str: string): void {
        const string = [...(str + "\x00")].map(ch => escapify(ch)).join("");
        this.closure(
            ["data", `(i32.const ${this.allocation})`, `"${string}"`]
        );
        this.allocation += string.length;
    }

    /**
     * Generate a function
     * @param {string} name 
     * @param {Parameters} params Signatures and 
     * @param {(WebAssemblyType | null)} result The return type, null being void
     * @param {Function} body Body of the function
     * @returns {void}
     * @example 
     * gen.func("add", { a: "int", b: "int" }, "int", () => {
     *     gen.return(() => gen.add("int",
     *         gen.get("a"),
     *         gen.get("b")
     *     ));
     * });
     */
    func(name: string, params: Parameters, result: WebAssemblyType | null, locals: Parameters, body: Function): void {
        const res = result ? [`(result ${w[result]})`] : [];
        this.closure(
            ["func", `$${name}`, ...parameterize(params, "param"), ...parameterize(locals, "local"), ...res],
            [body]
        );
        this.closure(
            ["export", `"${name}"`, `(func $${name})`]
        );
    }

    /**
     * Calls a function
     * @param {string} name Name of function to be called
     * @param {Function[]} params Function parameters
     * @returns {void}
     * @example
     * gen.call("multiplyThreeNumbers", 
     *     () => gen.const("int", 5),
     *     () => gen.add("int",
     *         gen.const("int", 12),
     *         gen.const("int", -18)
     *     ),
     *     () => gen.subtract("int", 
     *         gen.const("int", 8),
     *         gen.const("int", 10)
     *     )
     * );
     */
    call(name: string, ...params: Function[]): void {
        this.closure(
            [`call $${name}`],
            params
        );
    }

    /**
     * Creates a table of references
     * @param {string} name Signature of the table
     * @param {number} size Starting size of the table
     * @param {WebAssemblyReferenceType} elements Reference type
     * @returns {void}
     * @example
     * gen.table("utils", 5, "funcref");
     */
    table(name: string, size: number, elements: WebAssemblyReferenceType): void {
        this.closure(
            ["table", `$${name}`, `${size}`, elements]
        );
    }

    /**
     * Adds elements to a table and initializes it
     * @param {Function} alignment Offset in memory
     * @param {string[]} references Signatures of references
     * @returns {void}
     * @example
     * gen.table("myFunctions", 4, "funcref");
     * gen.elements(0, "func1", "someOtherFunc");
     */
    elements(alignment: Function, ...references: string[]): void {
        this.closure(
            ["elem"],
            [alignment, ...references.map(ref => () => this.append(`$${ref}`))]
        );
    }

    /**
     * Selects a starting function to run, which must return nothing
     * @param {string} name Signature of the function
     * @returns {void}
     * @example
     * gen.start("main");
     */
    start(name: string): void {
        this.closure(
            ["start", `$${name}`]
        );
    }

    // Operators
    /**
     * Adds two numbers
     * @param {WebAssemblyType} type Type of numbers being added
     * @param {Function} left Left-hand side of the operation
     * @param {Function} right Right-hand side of the operation
     * @returns {void}
     * @example
     * gen.add("long",
     *     gen.const("long", 1042),
     *     gen.call("doLongOperation", 
     *         gen.const("long", -12),
     *         gen.get("someOtherLong")
     *     )
     * );
     */
    add(type: WebAssemblyType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.add`],
            [left, right]
        );
    }

    /**
     * Subtracts two numbers
     * @param {WebAssemblyType} type Type of numbers being subtracted
     * @param {Function} left Left-hand side of the operation
     * @param {Function} right Right-hand side of the operation
     * @returns {void}
     * @example 
     * gen.subtract("double", 
     *     gen.const("double", 23545.96),
     *     gen.const("double", 12.3)
     * );
     */
    subtract(type: WebAssemblyType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.sub`],
            [left, right]
        );
    }

    /**
     * Multiplies two numbers
     * @param {WebAssemblyType} type Type of numbers being multiplied
     * @param {Function} left Left-hand side of the operation
     * @param {Function} right Right-hand side of the operation
     * @returns {void}
     * @example 
     * gen.multiply("float", 
     *     gen.get("aFloatingPointNumber"),
     *     gen.const("float", 916)
     * );
     */
    multiply(type: WebAssemblyType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.mul`],
            [left, right]
        );
    }

    /**
     * Divides two numbers
     * @param {WebAssemblyType} type Type of numbers being divided
     * @param {Function} left Left-hand side of the operation
     * @param {Function} right Right-hand side of the operation
     * @returns {void}
     * @example 
     * gen.divide("float", 
     *     gen.get("floatA"),
     *     gen.get("floatB")
     * );
     */
    divide(type: WebAssemblyType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.div`],
            [left, right]
        );
    }

    /**
     * Modulates two numbers
     * @param {WebAssemblyIntegerType} type Type of numbers being modulated
     * @param {Function} left Left-hand side of the operation
     * @param {Function} right Right-hand side of the operation
     * @returns {void}
     * @example
     * gen.modulo("int", 
     *     () => gen.const("int", 5),
     *     () => gen.const("int", 2)
     * );
     */
    modulo(type: WebAssemblyIntegerType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.rem_s`],
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

    not(type: WebAssemblyIntegerType, value: Function): void {
        this.closure(
            [`${w[type]}.eqz`],
            [value]
        );
    }

    and(type: WebAssemblyIntegerType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.and`],
            [left, right]
        )
    }

    or(type: WebAssemblyIntegerType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.or`],
            [left, right]
        )
    }

    xor(type: WebAssemblyIntegerType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.xor`],
            [left, right]
        )
    }

    leftShift(type: WebAssemblyIntegerType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.shl`],
            [left, right]
        )
    }

    rightShift(type: WebAssemblyIntegerType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.shr_s`],
            [left, right]
        )
    }

    rightUnsignedShift(type: WebAssemblyIntegerType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.shr_u`],
            [left, right]
        )
    }

    leftRotate(type: WebAssemblyIntegerType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.rotl`],
            [left, right]
        )
    }

    rightRotate(type: WebAssemblyIntegerType, left: Function, right: Function): void {
        this.closure(
            [`${w[type]}.rotr`],
            [left, right]
        )
    }

    countLeadingZeros(type: WebAssemblyIntegerType, value: Function): void {
        this.closure(
            [`${w[type]}.clz`],
            [value]
        );
    }

    countTrailingZeros(type: WebAssemblyIntegerType, value: Function): void {
        this.closure(
            [`${w[type]}.clz`],
            [value]
        );
    }

    countOnes(type: WebAssemblyIntegerType, value: Function): void {
        this.closure(
            [`${w[type]}.popcnt`],
            [value]
        );
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

    negate(type: WebAssemblyFloatingType, value: Function): void {
        this.closure(
            [`${w[type]}.neg`],
            [value]
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
    /**
     * @param type 
     * @param value 
     */
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
    allocate(body: Function/*, size: number | void, pages: number | void*/): void {
        body();
        this.closure(
            ["memory", "$memory", this.allocation.toString()]
        );
        this.closure(
            ["export", `"memory"`, `(memory $memory)`]
        );
        this.mem.grow(this.allocation);
    }

    store(type: WebAssemblyType, offset: number, alignment: Function, value: Function): void {
        this.closure(
            [`${w[type]}.store`],
            [() => this.append(`offset=${offset}`), alignment, value]
        );
    }

    load(type: WebAssemblyType, offset: number, alignment: Function): void {
        this.closure(
            [`${w[type]}.load`],
            [() => this.append(`offset=${offset}`), alignment]
        );
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

    loop(name: string, condition: Function, body: Function): void {
        this.closure(
            ["loop", `$${name}`],
            [
                body,
                () => this.closure(
                    ["br_if", `$${name}`],
                    [condition]
                )
            ]
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

    /**
     * Returns the body from the function
     * @param {Function} body 
     * @example
     * gen.func("getMax", { a: "double", b: "double" }, "double", () => {
     *     gen.if("double",
     *         () => gen.lessThan("double", 
     *             () => gen.get("a"),
     *             () => gen.get("b")
     *         ),
     *         () => gen.return(() => gen.get("b")),
     *         () => gen.return(() => gen.get("a"))
     *     )
     * });
     */
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

    // Output
    /**
     * Returns currently generated code
     * @returns {string}
     * @example
     * const gen = new WebAssemblyGenerator("output/script", {});
     * // ...
     * 
     * console.log(gen.stringify());
     */
    stringify(): string {
        return this.code;
    }

    /**
     * Compiles the stringified code to a .wat file, then converts it to a .wasm file using wat2wasm
     * @returns {Promise<void>}
     * @example
     * const gen = new WebAssemblyGenerator("output/script", {});
     * // ...
     * 
     * gen.compile();
     */
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

    /**
     * Runs the generated .wasm file
     * @returns {void}
     * @example
     * gen.compile().then(() => gen.run());
     */
    run(): void {
        fs.readFile(`${this.location}.wasm`, async (err, wasmBuffer) => {
            if(err) throw err;

            const module = await WebAssembly.instantiate(wasmBuffer, this.imports);
            const exports = module.instance.exports;
        });
    }
}