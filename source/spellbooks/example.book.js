const STRING_EMPTY = "";
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
});

module.exports = {
    namespace: "ext",
    get_value1() {
        return "Hello ";
    },
    get_value2() {
        return "world!";
    },
    equals_or(a, b, c) {
        return a === b || a === c;
    },
    equals(a, b) {
        return a === b;
    },
    readline() {
        return new Promise((resolve) => {
            rl.question(STRING_EMPTY, (answer) => {
                resolve(answer);
            });
        });
    },
    writel(...parameters) {
        console.log(parameters.map(p => (p ?? STRING_EMPTY).toString()).join(STRING_EMPTY));
    },
    close() {
        rl.close();
    },
};