"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../src");
const gen = new src_1.WebAssemblyGenerator("out/script", {
    std: {
        println: function (value) {
            console.log(value);
        }
    }
});
gen.module(() => {
    gen.import("std", "println", "log_int", ["int"]);
    gen.import("std", "println", "log_float", ["float"]);
    gen.allocate(() => {
        gen.string("Hello world!");
        gen.string("A WASM 'string'");
    });
    gen.table("myTable", 5, "funcref");
    gen.elements(() => gen.const("int", 1), "something", "fib");
    gen.func("something", { a: "int", b: "int" }, "int", () => {
        gen.return(() => {
            gen.multiply("int", () => gen.const("int", 3), () => gen.add("int", () => gen.get("a"), () => gen.get("b")));
        });
    });
    gen.func("fib", { n: "int" }, "int", () => {
        gen.if("int", () => {
            gen.lessThanOrEqualTo("int", () => gen.get("n"), () => gen.const("int", 1));
        }, () => gen.return(() => {
            gen.const("int", 1);
        }), () => gen.return(() => {
            gen.add("int", () => gen.call("fib", () => {
                gen.subtract("int", () => gen.get("n"), () => gen.const("int", 1));
            }), () => gen.call("fib", () => {
                gen.subtract("int", () => gen.get("n"), () => gen.const("int", 2));
            }));
        }));
    });
    gen.func("main", {}, null, () => {
        // Declarations go at the top
        gen.declare("val1", "float");
        gen.declare("val2", "float");
        gen.declare("maximum", "float");
        gen.declare("i", "int");
        gen.set("val1", () => {
            gen.convert("int", "float", () => {
                gen.call("something", () => gen.const("int", 5), () => gen.const("int", 10));
            });
        });
        gen.set("val2", () => {
            gen.convert("int", "float", () => {
                gen.call("fib", () => gen.const("int", 10));
            });
        });
        gen.set("maximum", () => {
            gen.max("float", () => gen.get("val1"), () => gen.get("val2"));
        });
        gen.call("log_float", () => gen.get("maximum"));
        gen.set("i", () => gen.const("int", 0));
        gen.loop("loop", () => gen.lessThan("int", () => gen.get("i"), () => gen.const("int", 10)), () => {
            gen.call("log_int", () => gen.get("i"));
            gen.set("i", () => gen.add("int", () => gen.get("i"), () => gen.const("int", 1)));
        });
    });
    gen.start("main");
});
gen.compile().then(() => gen.run());
//# sourceMappingURL=test.js.map