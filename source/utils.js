// import BigEval from 'bigeval';
const BigEval = require("bigeval");
const Enumerable = require("linq");
const { SpellScipt, LineData, Call, SectionHeader, } = require("./components.js");

const bigEvalInstance = new BigEval();

const LineType = Object.freeze({
    LINE: "LINE",
    HEADER: "HEADER",
    IMPORT: "IMPORT",
});
const sectionReturnTypes = ["VOID", "STRING", "INT32", "SINGLE"];
const STRING_EMPTY = "";
/**
 * @returns {string[]} An array of split strings, or an empty array if the delimiter is not found.
 * @this {string} The string that the method is called on.
 */
String.prototype.splitSafe = function (delimiter) {
    return this.indexOf(delimiter) === -1 ? [] : this.split(delimiter);
};
String.prototype.replaceAtIndex = function (index, length, replacement) {
    if (index < 0 || index >= this.length || length < 0) throw new RangeError("Invalid index or length for replacement.");
    return this.slice(0, index) + replacement + this.slice(index + length);
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

function deepLog(obj) { // not mine but very usefull.
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
    // const namespaceLessRegex = /^[^:]*:[^:]*$/g // matches (everything) if there is a <anychar>:<anychar>
    return sectionReturnTypes.some(s => str.toUpperCase().includes(s)) ? LineType.HEADER : LineType.LINE;
}
/**
 * @returns {LineData | SectionHeader}
 * @param {string} encodedStr
 */
function cast(str) {
    switch (getLineType(str)) {
        case "HEADER":
            return new SectionHeader();
            break;
        case "LINE":
            return new LineData();
            break;
        default:
            console.log("huh");
            break;
    }
}
/**
 * @returns {string}
 * @param {string} str
 */
function subCompile(str) {
    // regex galore! (cat walked on keyboard fr)
    const stringRegex = /(["'])(?:(?=(\\?))\2.)*?\1/g; // matches strings. (including the quotes)
    const commentsRegex = /\/\*(?:[^*]|(?:\*+[^*/]))*\*+\/|\/\/.*/g; // matches inline comments. (including the slashes)
    const evalRegex = /\[[^\[\]]*\]/g;  // matches all [] expressions. (including the []'s)
    const numericRegex = /\*+(?!\d)/g; // matches all direct numerics directly after the * symbol. // including the *, does not return ALL *'s.

    let subcompiled = str;

    subcompiled = subcompiled.replace(/\r\n|\r|\n/g, "\n"); // normalize line endings.
    subcompiled = subcompiled.replaceAll(commentsRegex, STRING_EMPTY); // remove comments.
    str.match(stringRegex).forEach(s => { // tokenize strings.
        const noQuotes = s.slice(1, -1);
        subcompiled = subcompiled.replace(s, tokenize(noQuotes));
        console.log("tokenizing line strings; " + noQuotes + " to " + tokenize(noQuotes));
    });
    subcompiled = subcompiled.split("\n") // (post) linemapping.
        .map(line => line.replaceAll(/[\n\r\s\t]+/g, STRING_EMPTY)) // remove ALL whitespace. (Does not have to be trailing => (AFTER) strings tokenized, comments removed.)
        .filter(line => line) // strings are bools now (its a empty string check)
        .map(line => "<" + getLineType(line) + ">" + line)
        .join("\n");
    subcompiled.match(evalRegex).forEach(rm => // evaluate constant [] expressions.
        subcompiled = subcompiled.replace(rm, bigEvalInstance.exec(rm.slice(1, -1)))
    );
    [...subcompiled.matchAll(numericRegex)] // matchall or it does not work for reasons unknown.
        .reverse() // from back to front to prevent index-shifting.
        .forEach(match => // to collapsed replace.
            subcompiled = subcompiled.replaceAtIndex(match.index, match[0].length, "*" + match[0].length)
        );

    return subcompiled;
}

module.exports = {
    bigEvalInstance,
    STRING_EMPTY,
    getLineType,
    cast,
    dynamicCast,
    tokenize,
    detokenize,
    deepLog,
    subCompile,
} 
