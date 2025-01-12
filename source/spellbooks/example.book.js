/**
 * An example spellbook to be used with the evaluate() method.
 */
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
    readline() {
        return new Promise((resolve) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
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