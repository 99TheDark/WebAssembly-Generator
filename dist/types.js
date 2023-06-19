"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parameterize = exports.w = void 0;
exports.w = {
    int: "i32",
    long: "i64",
    float: "f32",
    double: "f64"
};
function parameterize(params, sName) {
    return Object.entries(params).map(entry => `(${sName} $${entry[0]} ${exports.w[entry[1]]})`);
}
exports.parameterize = parameterize;
//# sourceMappingURL=types.js.map