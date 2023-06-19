import { WebAssemblyFloatingType, WebAssemblyIntegerType, WebAssemblyReferenceType, WebAssemblyType, Parameters } from "./types";
/**
 * Main generator function
 * @author 99TheDark <99thedark@gmail.com>
 * @version 1.3.1
 */
export declare class WebAssemblyGenerator {
    private location;
    private imports;
    private indention;
    private allocation;
    private mem;
    private code;
    constructor(location: string, imports: WebAssembly.Imports);
    private append;
    private closure;
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
    module(body: Function): void;
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
    import(library: string, funcName: string, name: string, params: WebAssemblyType[]): void;
    /**
     * Store a string in memory
     * @param {string} str String to be stored
     * @returns {void}
     * @example
     * gen.string("Hello, world!");
     */
    string(str: string): void;
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
    func(name: string, params: Parameters, result: WebAssemblyType | null, locals: Parameters, body: Function): void;
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
    call(name: string, ...params: Function[]): void;
    /**
     * Creates a table of references
     * @param {string} name Signature of the table
     * @param {number} size Starting size of the table
     * @param {WebAssemblyReferenceType} elements Reference type
     * @returns {void}
     * @example
     * gen.table("utils", 5, "funcref");
     */
    table(name: string, size: number, elements: WebAssemblyReferenceType): void;
    /**
     * Adds elements to a table and initializes it
     * @param {Function} alignment Offset in memory
     * @param {string[]} references Signatures of references
     * @returns {void}
     * @example
     * gen.table("myFunctions", 4, "funcref");
     * gen.elements(0, "func1", "someOtherFunc");
     */
    elements(alignment: Function, ...references: string[]): void;
    /**
     * Selects a starting function to run, which must return nothing
     * @param {string} name Signature of the function
     * @returns {void}
     * @example
     * gen.start("main");
     */
    start(name: string): void;
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
    add(type: WebAssemblyType, left: Function, right: Function): void;
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
    subtract(type: WebAssemblyType, left: Function, right: Function): void;
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
    multiply(type: WebAssemblyType, left: Function, right: Function): void;
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
    divide(type: WebAssemblyType, left: Function, right: Function): void;
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
    modulo(type: WebAssemblyIntegerType, left: Function, right: Function): void;
    lessThan(type: WebAssemblyType, left: Function, right: Function): void;
    greaterThan(type: WebAssemblyType, left: Function, right: Function): void;
    lessThanOrEqualTo(type: WebAssemblyType, left: Function, right: Function): void;
    greaterThanOrEqualTo(type: WebAssemblyType, left: Function, right: Function): void;
    equalTo(type: WebAssemblyType, left: Function, right: Function): void;
    notEqualTo(type: WebAssemblyType, left: Function, right: Function): void;
    not(type: WebAssemblyIntegerType, value: Function): void;
    and(type: WebAssemblyIntegerType, left: Function, right: Function): void;
    or(type: WebAssemblyIntegerType, left: Function, right: Function): void;
    xor(type: WebAssemblyIntegerType, left: Function, right: Function): void;
    leftShift(type: WebAssemblyIntegerType, left: Function, right: Function): void;
    rightShift(type: WebAssemblyIntegerType, left: Function, right: Function): void;
    rightUnsignedShift(type: WebAssemblyIntegerType, left: Function, right: Function): void;
    leftRotate(type: WebAssemblyIntegerType, left: Function, right: Function): void;
    rightRotate(type: WebAssemblyIntegerType, left: Function, right: Function): void;
    countLeadingZeros(type: WebAssemblyIntegerType, value: Function): void;
    countTrailingZeros(type: WebAssemblyIntegerType, value: Function): void;
    countOnes(type: WebAssemblyIntegerType, value: Function): void;
    min(type: WebAssemblyFloatingType, a: Function, b: Function): void;
    max(type: WebAssemblyFloatingType, a: Function, b: Function): void;
    floor(type: WebAssemblyFloatingType, a: Function, b: Function): void;
    ceil(type: WebAssemblyFloatingType, a: Function, b: Function): void;
    round(type: WebAssemblyFloatingType, a: Function, b: Function): void;
    truncate(type: WebAssemblyFloatingType, a: Function, b: Function): void;
    absoluteValue(type: WebAssemblyFloatingType, a: Function, b: Function): void;
    negate(type: WebAssemblyFloatingType, value: Function): void;
    squareRoot(type: WebAssemblyFloatingType, a: Function, b: Function): void;
    copySign(type: WebAssemblyFloatingType, a: Function, b: Function): void;
    convert(from: WebAssemblyType, to: WebAssemblyType, value: Function): void;
    reinterpret(fromType: WebAssemblyFloatingType, toType: WebAssemblyFloatingType, from: Function, to: Function): void;
    /**
     * @param type
     * @param value
     */
    const(type: WebAssemblyType, value: string | number): void;
    declare(variable: string, type: WebAssemblyType): void;
    declareGlobal(variable: string, type: WebAssemblyType, value: Function | void): void;
    set(variable: string, value: Function): void;
    setGlobal(variable: string, value: Function): void;
    get(variable: string): void;
    getGlobal(variable: string): void;
    allocate(body: Function): void;
    store(type: WebAssemblyType, offset: number, alignment: Function, value: Function): void;
    load(type: WebAssemblyType, offset: number, alignment: Function): void;
    size(): void;
    grow(value: Function): void;
    if(type: WebAssemblyType | null, boolean: Function, thenClause: Function, elseClause: Function | void): void;
    loop(name: string, condition: Function, body: Function): void;
    block(name: string, body: Function): void;
    break(block: string): void;
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
    return(body: Function): void;
    select(a: Function, b: Function, boolean: Function): void;
    /**
     * Returns currently generated code
     * @returns {string}
     * @example
     * const gen = new WebAssemblyGenerator("output/script", {});
     * // ...
     *
     * console.log(gen.stringify());
     */
    stringify(): string;
    /**
     * Compiles the stringified code to a .wat file, then converts it to a .wasm file using wat2wasm
     * @returns {Promise<void>}
     * @example
     * const gen = new WebAssemblyGenerator("output/script", {});
     * // ...
     *
     * gen.compile();
     */
    compile(): Promise<void>;
    /**
     * Runs the generated .wasm file
     * @returns {void}
     * @example
     * gen.compile().then(() => gen.run());
     */
    run(): void;
}
