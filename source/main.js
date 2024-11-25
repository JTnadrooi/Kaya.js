// import * as utils from './utils.js';
const utils = require("./utils.js");
const fs = require("fs");

class SpellScipt {
    constructor(str) {
        const stringRegex = /(["'])(?:(?=(\\?))\2.)*?\1/g

        /** @type {string} The subcompiled version of this spellscipt.*/ this.subCompiled;


        let withTokenizedStrings = str;
        str.match(stringRegex).forEach(s => {
            const noQuotes = s.slice(1, -1);
            withTokenizedStrings = withTokenizedStrings.replace(s, utils.tokenize(noQuotes));
            console.log("tokenizing line strings; " + noQuotes + " to " + utils.tokenize(noQuotes));
        });

        this.subCompiled = withTokenizedStrings;

        console.log(this.subCompiled);
    }

}

class LineData {
    constructor(str) {
        /** @type {Call[]} */ this.calls;

        const stringRegex = /(["'])(?:(?=(\\?))\2.)*?\1/g

        let withTokenizedStrings = str;
        str.match(stringRegex).forEach(s => {
            const noQuotes = s.slice(1, -1);
            withTokenizedStrings = withTokenizedStrings.replace(s, utils.tokenize(noQuotes));
            console.log("tokenizing line strings; " + noQuotes + " to " + utils.tokenize(noQuotes));
        });
        this.calls = withTokenizedStrings.slice(0, -1) // no need for the ";".
            .split("|")
            .map(call => new Call(call.trim()));
    }
}
/**
 * Represents a single {@link Call} from a line. One line may have one or more calls, the {@link LineData}
 */
class Call {
    constructor(str) {
        /** @type {number | null} The memory pointer.*/ this.pointer;
        /** @type {string} The namespace this {@link Call} calls to.*/ this.namespace;
        /** @type {string} */ this.name;
        /** @type {!Object[]} The call arguments. May be an empty array if no arguments are given. */ this.args;

        const pointerRegex = /\*+$/; // only supports "simple" pointers.

        const pointerMatch = str.match(pointerRegex);
        this.pointer = Number(pointerMatch ? pointerMatch[0].length : -1);

        const [fullFunc, argsStr] = str.replace(pointerRegex, utils.STRING_EMPTY).split("(", 2);
        [this.namespace, this.name] = fullFunc.split("::", 2);

        // console.log("agrs string: " + argsStr);

        this.args = argsStr.slice(0, -1) // remove trailing ")".
            .splitSafe(",") // returns [] if splitter is not found.
            .map(arg => utils.dynamicCast(arg.trim()));
    }
}
// const line = new LineData("ext::writel("hello world!", 1*716+93)*|ext::writel();");
// line.calls.forEach(c =>
//     utils.deepLog(c)
// );


fs.readFile("./docs/tests/advanced.spl", (err, data) => {
    if (err) throw err;

    console.log(utils.subCompile(data.toString()));
});