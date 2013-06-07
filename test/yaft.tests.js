var yaft = require("../");

function yaftTest(desc, program, expected) {
    exports[desc] = function(test) {
        var result = yaft.run(program);
        test.deepEqual(result.stack, expected);
        test.done();
    };
}

exports["the empty program results in an empty stack"] = function(test) {
    var result = yaft.run("");
    test.equals(result.stack.length, 0);
    test.done();
};

yaftTest("a single number results in that number on the stack",
         "42", [42]);

yaftTest("a zero results in a zero on the stack",
        "0", [0]);

yaftTest("two numbers results in those numbers on the stack",
         "42 47", [42, 47]);

function opTest(token, expected) {
    yaftTest(token + " two numbers, result is on stack", "7 42 " + token, [expected]);
}

opTest("+", 49);
opTest("-", 35);
opTest("*", 294);
opTest("/", 6);

yaftTest("empty quote puts empty quote on stack",
         "[ ]", [[]]);

yaftTest("apply pops a quote off the stack",
         "[ ] apply", []);

yaftTest("applied quoted plus adds two numbers",
         "2 3 [ + ] apply", [5]);

yaftTest("applied quote of two pluses adds three numbers",
         "1 2 3 [ + + ] apply", [6]);

yaftTest("double quote and two applys",
         "2 3 [ [ + ] ] apply apply", [5]);

yaftTest("dup duplicates top item of stack",
         "42 dup", [42, 42]);

yaftTest("pop removes top item of stack",
         "42 pop", []);

yaftTest("swap swaps the top two items of the stack",
         "42 1 swap", [1, 42]);

yaftTest("clear empties the stack",
         "1 2 3 4 5 6 7 8 9 clear", []);

yaftTest("true results in true on the stack",
         "true", [true]);

yaftTest("false results in false on the stack",
         "false", [false]);
