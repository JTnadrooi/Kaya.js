const STRING_EMPTY = "";
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
});
let amountCorrect = 0;

module.exports = {
    namespace: "q",
    ask(question) {
        return new Promise((resolve) => {
            console.log(question);
            rl.question(STRING_EMPTY, (answer) => {
                resolve(answer.replace(/[.!\?]+$/, STRING_EMPTY)); // remove emotions
            });
        });
    },
    validate(answerIsCorrect) {
        console.log(answerIsCorrect ? "correct! :)" : "false!");
        amountCorrect += Boolean(answerIsCorrect);
    },
    start() {
        amountCorrect = 0;
    },
    end() {
        return amountCorrect;
    },
    close() {
        rl.close();
    },
};