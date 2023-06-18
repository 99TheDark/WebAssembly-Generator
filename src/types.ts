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