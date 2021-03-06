exports.run = run;

function run(program) {
    var tokens = tokenise(program);
    var ast = parse(tokens).ast;
    var stack = [];
    evaluate(ast, stack);
    return {
        stack: stack
    };
}

function repl() {
    var readline = require("readline");
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    var stack = [];
    rl.on("line", function(line) {
        var tokens = tokenise(line);
        var ast = parse(tokens).ast;
        evaluate(ast, stack);
        console.log(stack);
    }).on("close", function() {
        process.exit(0);
    });
}

function tokenise(program) {
    if (program) {
        return program.split(/ /);
    } else {
        return [];
    }
}

function parse(tokens, index) {
    var ast = [];
    index = index || 0;
    while (index < tokens.length) {
        var token = tokens[index++];
        if (token === "[") {
            var result = parse(tokens, index);
            ast.push(result.ast);
            index = result.index;
        } else if ("]" === token || "}" === token) {
            ast.reverse();
            return {
                ast: ast,
                index: index
            };
        } else if (token === "{") {
            var result = parse(tokens, index);
            index = result.index;
            var quote = result.ast;
            if (quote.length === 0) {
                ast.push({});
            } else {
                var key = quote[1];
                var value = quote[0];

                var obj = {};
                obj[key] = value;
                ast.push(obj);
            }
        } else {
            ast.push(token);
        }
    }
    ast.reverse();
    return {
        ast: ast,
        index: index
    };
}

function evaluate(tokens, stack) {
    while (tokens.length > 0) {
        var token = tokens[tokens.length - 1];
        if (Object.prototype.toString.call(token) === '[object Array]') {
            tokens.pop();
            stack.push(token);
        } else if (functions[token]) {
            functions[token](tokens, stack);
        } else if (/^\d+$/.test(token)) {
            tokens.pop();
            stack.push(parseInt(token, 10));
        } else {
            tokens.pop();
            stack.push(token);
        }
    }
}

function binop(op) {
    return function(tokens, stack) {
        tokens.pop();
        return stack.push(op(stack.pop(), stack.pop()));
    };
};

var functions = {
    "+": binop(function(a, b) { return b + a; }),
    "-": binop(function(a, b) { return b - a; }),
    "*": binop(function(a, b) { return b * a; }),
    "/": binop(function(a, b) { return b / a; }),
    "<": binop(function(a, b) { return b < a; }),
    ">": binop(function(a, b) { return b > a; }),
    "<=": binop(function(a, b) { return b <= a; }),
    ">=": binop(function(a, b) { return b >= a; }),
    "apply": function(tokens, stack) {
        tokens.pop();
        evaluate(stack.pop(), stack);
    },
    "dup": function(tokens, stack) {
        tokens.pop();
        var token = stack.pop();
        var dupe = Object.prototype.toString.call(token) === '[object Array]'
                ? token.slice(0)
                : token;
        stack.push(dupe);
        stack.push(token);
    },
    "pop": function(tokens, stack) {
        tokens.pop();
        stack.pop();
    },
    "swap": function(tokens, stack) {
        tokens.pop();
        var a = stack.pop();
        var b = stack.pop();
        stack.push(a);
        stack.push(b);
    },
    "clear": function(tokens, stack) {
        tokens.pop();
        stack.length = 0;
    },
    "true": function(tokens, stack) {
        tokens.pop();
        stack.push(true);
    },
    "false": function(tokens, stack) {
        tokens.pop();
        stack.push(false);
    },
    "if": function(tokens, stack) {
        tokens.pop();
        var c = stack.pop();
        var t = stack.pop();
        var f = stack.pop();
        evaluate(c ? t : f, stack);
    },
    "eq": binop(function(a, b) { return a === b; }),
    "quote": function(tokens, stack) {
        tokens.pop();
        stack.push([stack.pop()]);
    },
    "dip": function(tokens, stack) {
        tokens.pop();
        var q = stack.pop();
        var t = stack.pop();
        evaluate(q, stack);
        stack.push(t);
    },
    "def": function(tokens, stack) {
        tokens.pop();
        var n = stack.pop();
        var q = stack.pop();
        functions[n] = function(ts, s) {
            ts.pop();
            evaluate(q.slice(0), s);
        };
    }
};

if (require.main === module) {
    repl();
}
