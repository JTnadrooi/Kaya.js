// import BigEval from 'bigeval';
const BigEval = require("bigeval");

const bigEvalInstance = new BigEval();

const TineType = Object.freeze({
    LINE: "LINE",
    HEADER: "HEADER",
    IMPORT: "IMPORT",
});

const STRING_EMPTY = "";
/**
 * @returns {string[]} An array of split strings, or an empty array if the delimiter is not found.
 * @this {string} The string that the method is called on.
 */
String.prototype.splitSafe = function (delimiter) {
    return this.indexOf(delimiter) === -1 ? [] : this.split(delimiter);
};
// Object.defineProperty(String.prototype, "splitSafe", {
//     /**
//      * @returns {string[]} An array of split strings, or an empty array if the delimiter is not found.
//      * @this {string} The string that the method is called on.
//      */
//     value: function (delimiter) {
//         return this.indexOf(delimiter) === -1 ? [] : this.split(delimiter);
//     },
//     writable: true,
//     configurable: true,
// });
/**
 * @returns {string|boolean|number} detokenizes string if ends with "=", bool if True or False and number if its a number and not surrounded by quotation marks.
 */
function dynamicCast(str) {
    const stringRegex = /^"(.*)"$/;
    console.log("attempting dc of string: " + str);

    // if (str.match(stringRegex)) return str.replace(stringRegex, '$1');
    if (str.match(stringRegex)) console.log("uh");
    else if (str.endsWith("=")) return detokenize(str);
    else if (str.toLowerCase() === "true") return true;
    else if (str.toLowerCase() === "false") return false;

    const temp = bigEvalInstance.exec(str); // a bit slow to do this so often.
    if (temp !== "ERROR") return temp;
    return +str; // NaN if fails.
};
/**
 * @returns {string}
 * @param {string} str
 */
const tokenize = (str) => {
    console.log("tokenizing str: " + str)
    return (str == STRING_EMPTY ? "=" : btoa(str)) + "=";
}
/**
 * @returns {string}
 * @param {string} encodedStr
 */
const detokenize = (encodedStr) => {
    console.log("detokenizing endoced str: " + encodedStr);
    if (!encodedStr.endsWith("=")) {
        console.log("INVALID STRING, NOT TOKENIZED/ENCODED");
    }
    const encodedStrWithoutIndicator = encodedStr.slice(0, -1);
    return encodedStrWithoutIndicator == "=" ? STRING_EMPTY : atob(encodedStrWithoutIndicator);
}

function deepLog(obj) { // not mine but very usefull
    const seen = new WeakSet();
    const recursiveDump = (value, indent = 0) => {
        if (value === null) return "null";
        if (typeof value !== "object") return `${typeof value}: ${value}`;
        if (seen.has(value)) return "[Circular]";
        seen.add(value);
        const isArray = Array.isArray(value);
        const typeInfo = isArray ? `Array(${value.length})` : value.constructor?.name || "Object";
        const entries = isArray
            ? value.map((v, i) => [i, v])
            : Object.entries(value);
        const nestedIndent = "  ".repeat(indent + 1);
        const closingIndent = "  ".repeat(indent);
        const content = entries
            .map(([key, val]) => `${nestedIndent}${isArray ? `[${key}]` : key}: ${recursiveDump(val, indent + 1)}`)
            .join(",\n");
        return `${typeInfo} {\n${content}\n${closingIndent}}`;
    };
    console.dir(recursiveDump(obj));
}
function getLineType(str) {

}
/**
 * @returns {string}
 * @param {string} str
 */
function subCompile(str) {
    // regex galore! (cat walked on keyboard fr)
    const stringRegex = /(["'])(?:(?=(\\?))\2.)*?\1/g; // matches strings. (including the quotes)
    const commentsRegex = /\/\*(?:[^*]|(?:\*+[^*/]))*\*+\/|\/\/.*/g; // matches inline comments. (including the slashes)

    let subcompiled = str;

    subcompiled = subcompiled.replace(/\r\n|\r|\n/g, "\n"); // normalize line endings.
    subcompiled = subcompiled.replaceAll(commentsRegex, STRING_EMPTY); // remove comments.
    subcompiled = subcompiled.split("\n") // linemapping.
        .map(line => line.trim()) // trim each lines whitespace.
        .filter(line => line) // strings are bools now! (its a empty string check)
        // .map(line => (({ "4": "case1", "8": "case2" })[getLineType(line)] ?? "Unknown") + line)
        .join("\n");
    str.match(stringRegex).forEach(s => { // tokenize strings.
        const noQuotes = s.slice(1, -1);
        subcompiled = subcompiled.replace(s, tokenize(noQuotes));
        console.log("tokenizing line strings; " + noQuotes + " to " + tokenize(noQuotes));
    });
    return subcompiled;
}

module.exports = {
    bigEvalInstance,
    STRING_EMPTY,
    dynamicCast,
    tokenize,
    detokenize,
    deepLog,
    subCompile,
} 
