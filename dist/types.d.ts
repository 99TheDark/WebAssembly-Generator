export type WebAssemblyType = "int" | "long" | "float" | "double";
export type WebAssemblyIntegerType = "int" | "long";
export type WebAssemblyFloatingType = "float" | "double";
export type WebAssemblyReferenceType = "funcref" | "externref";
export declare const w: Record<WebAssemblyType, string>;
export type Parameters = Record<string, WebAssemblyType>;
export declare function parameterize(params: Parameters, sName: string): string[];
