import { WebAssemblyGenerator } from "./generator";

const gen = new WebAssemblyGenerator("out/script");

gen.module(() => {
    gen.memory();
    gen.func("something", { a: "int", b: "int" }, "int", () => {
        gen.return(() => {
            gen.multiply("int",
                () => gen.const("int", 3),
                () => gen.add("int",
                    () => gen.get("a"),
                    () => gen.get("b")
                )
            );
        });
    });
    gen.func("fib", { n: "int" }, "int", () => {
        gen.if("int",
            () => {
                gen.lessThanOrEqualTo("int", () => gen.get("n"), () => gen.const("int", 1));
            },
            () => gen.return(() => {
                gen.const("int", 1);
            }),
            () => gen.return(() => {
                gen.add("int",
                    () => gen.call("fib", () => {
                        gen.subtract("int", () => gen.get("n"), () => gen.const("int", 1));
                    }),
                    () => gen.call("fib", () => {
                        gen.subtract("int", () => gen.get("n"), () => gen.const("int", 2));
                    })
                )
            })
        )
    });
    gen.func("main", {}, null, () => {
        gen.declare("val1", "float");
        gen.declare("val2", "float");
        gen.declare("maximum", "float");

        gen.set("val1", () => {
            gen.convert("int", "float", () => {
                gen.call("something", () => gen.const("int", 5), () => gen.const("int", 10));
            });
        });
        gen.set("val2", () => {
            gen.convert("int", "float", () => {
                gen.call("fib", () => gen.const("int", 5));
            });
        });

        gen.set("maximum", () => {
            gen.max(
                "float",
                () => gen.get("val1"),
                () => gen.get("val2")
            )
        });

        // instead should print to console using import
        // gen.return(() => gen.get("maximum"));
    });
    gen.start("main");
});

gen.compile()
    .then(() => gen.run())