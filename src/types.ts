export type WebAssemblyType =
    "int" |
    "long" |
    "float" |
    "double"

export type WebAssemblyIntegerType =
    "int" |
    "long"

export type WebAssemblyFloatingType =
    "float" |
    "double"

export type WebAssemblyReferenceType =
    "funcref" |
    "externref"

export const w: Record<WebAssemblyType, string> = {
    int: "i32",
    long: "i64",
    float: "f32",
    double: "f64"
}

export type Parameters = Record<string, WebAssemblyType>;

export function parameterize(params: Parameters, sName: string): string[] {
    return Object.entries(params).map(entry => `(${sName} $${entry[0]} ${w[entry[1]]})`);
}