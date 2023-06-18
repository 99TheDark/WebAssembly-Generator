import { WebAssemblyFloatingType, WebAssemblyIntegerType, WebAssemblyReferenceType, WebAssemblyType } from "./types";
/**
 * @author 99TheDark <99thedark@gmail.com>
 * @version 1.2.1
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
     * @param {Function} body Module body
     * @returns {void}
     * @description Wrapper around all the code inside a WebAssembly module
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
     * @param {string} library Library the imported function is from
     * @param {string} funcName Name of the imported function
     * @param {string} name Signature of the imported function
     * @param {WebAssemblyType[]} params Parameter types of the imported function
     * @returns {void}
     * @description Import functions from other libraries
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
     * @param {string} str String to be stored
     * @returns {void}
     * @description Store a string in memory
     * @example
     * gen.string("Hello, world!");
     */
    string(str: string): void;
    /**
     * @param {string} name
     * @param {Record<string, WebAssemblyType>} params Signatures and
     * @param {(WebAssemblyType | null)} result The return type, null being void
     * @param {Function} body Body of the function
     * @returns {void}
     * @description Generate a function
     * @example
     * gen.func("add", { a: "int", b: "int" }, "int", () => {
     *     gen.return(() => gen.add("int",
     *         gen.get("a"),
     *         gen.get("b")
     *     ));
     * });
     */
    func(name: string, params: Record<string, WebAssemblyType>, result: WebAssemblyType | null, body: Function): void;
    /**
     * @param {string} name Name of function to be called
     * @param {Function[]} params Function parameters
     * @returns {void}
     * @description Calls a function
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
     * @param {string} name Signature of the table
     * @param {number} size Starting size of the table
     * @param {WebAssemblyReferenceType} elements Reference type
     * @returns {void}
     * @description Creates a table of references
     * @example
     * gen.table("utils", 5, "funcref");
     */
    table(name: string, size: number, elements: WebAssemblyReferenceType): void;
    /**
     * @param {Function} alignment Offset in memory
     * @param {string[]} references Signatures of references
     * @returns {void}
     * @description Adds elements to a table and initializes it
     * @example
     * gen.table("myFunctions", 4, "funcref");
     * gen.elements(0, "func1", "someOtherFunc");
     */
    elements(alignment: Function, ...references: string[]): void;
    /**
     * @param {string} name Signature of the function
     * @returns {void}
     * @description Selects a starting function to run, which must return nothing
     * @example
     * gen.start("main");
     */
    start(name: string): void;
    /**
     * @param {WebAssemblyType} type Type of numbers being added
     * @param {Function} left Left-hand side of the operation
     * @param {Function} right Right-hand side of the operation
     * @returns {void}
     * @description Add two numbers
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
     * @param {WebAssemblyType} type Type of numbers being subtracted
     * @param {Function} left Left-hand side of the operation
     * @param {Function} right Right-hand side of the operation
     * @returns {void}
     * @description Subtract two numbers
     * @example
     * gen.subtract("double",
     *     gen.const("double", 23545.96),
     *     gen.const("double", 12.3)
     * );
     */
    subtract(type: WebAssemblyType, left: Function, right: Function): void;
    /**
     * @param {WebAssemblyType} type Type of numbers being multiplied
     * @param {Function} left Left-hand side of the operation
     * @param {Function} right Right-hand side of the operation
     * @returns {void}
     * @description Multiply two numbers
     * @example
     * gen.multiply("float",
     *     gen.get("aFloatingPointNumber"),
     *     gen.const("float", 916)
     * );
     */
    multiply(type: WebAssemblyType, left: Function, right: Function): void;
    /**
     * @param {WebAssemblyType} type Type of numbers being divided
     * @param {Function} left Left-hand side of the operation
     * @param {Function} right Right-hand side of the operation
     * @returns {void}
     * @description Divide two numbers
     * @example
     * gen.divide("float",
     *     gen.get("floatA"),
     *     gen.get("floatB")
     * );
     */
    divide(type: WebAssemblyType, left: Function, right: Function): void;
    remainder(type: WebAssemblyType, left: Function, right: Function): void;
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
    const(type: WebAssemblyType, value: string | number): void;
    declare(variable: string, type: WebAssemblyType): void;
    declareGlobal(variable: string, type: WebAssemblyType, value: Function | void): void;
    set(variable: string, value: Function): void;
    setGlobal(variable: string, value: Function): void;
    get(variable: string): void;
    getGlobal(variable: string): void;
    allocate(body: Function, size: number | void, pages: number | void): void;
    store(type: WebAssemblyType, offset: number, alignment: Function, value: Function): void;
    load(type: WebAssemblyType, offset: number, alignment: Function): void;
    size(): void;
    grow(value: Function): void;
    if(type: WebAssemblyType | null, boolean: Function, thenClause: Function, elseClause: Function | void): void;
    loop(name: string, condition: Function, body: Function): void;
    block(name: string, body: Function): void;
    break(block: string): void;
    return(body: Function): void;
    select(a: Function, b: Function, boolean: Function): void;
    stringify(): string;
    compile(): Promise<void>;
    run(): void;
}
