// Currently more a playground than the main script.

const BigEval = require('bigeval')
const bigEvalInstance = new BigEval();

const STRING_EMPTY = '';
/**
 * @returns {string[]} An array of splitted strings, or an empty array if the delimiter is not found.
 */
String.prototype.splitSafe = function (delimiter) {
    return this.indexOf(delimiter) === -1 ? [] : this.split(delimiter); // "this" doesnt work in arrow functions.
};
/**
 * @returns {string|boolean|number} string if surrounded by double quotiationmarks, bool if True or False and number if its a number and not surrounded by quotation marks.
 */
function dynamiccast(str) {
    const stringRegex = /^"(.*)"$/;

    // if (str.match(stringRegex)) return str.replace(stringRegex, '$1');
    if (str.match(stringRegex)) return console.log("uh");
    else if (str.endsWith("=")) return detokenize(str);
    else if (str.toLowerCase() === 'true') return true;
    else if (str.toLowerCase() === 'false') return false;

    const temp = bigEvalInstance.exec(str); // a bit slow to do this so often.
    if (temp !== 'ERROR') return temp;
    return +str; // NaN if fails.
};
const tokenize = (str) => btoa(str);
const detokenize = (encodedStr) => atob(encodedStr);

function deepLog(obj) {
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

class LineData {
    constructor(str) {
        /** @type {Call[]} */ this.Calls;

        const stringRegex = /(["'])(?:(?=(\\?))\2.)*?\1/g

        let withTokenizedStrings = str;
        str.match(stringRegex).forEach(s => withTokenizedStrings = withTokenizedStrings.replace(s, tokenize(s.slice(1, -1))));
        this.Calls = withTokenizedStrings.slice(0, -1) // no need for the ";".
            .split('|')
            .map(call => new Call(call.trim()));
    }
}
/**
 * Represents a single {@link Call} from a line. One line may have one or more calls, the {@link LineData}
 */
class Call {
    constructor(str) {
        /** @type {number | null} The memory pointer.*/ this.Pointer;
        /** @type {string} The namespace this {@link Call} calls to.*/ this.Namespace;
        /** @type {string} */ this.Name;
        /** @type {!Object[]} The call arguments. May be an empty array if no arguments are given. */ this.Args;

        const pointerRegex = /\*+$/; // only supports "simple" pointers.

        const pointerMatch = str.match(pointerRegex);
        this.Pointer = Number(pointerMatch ? pointerMatch[0].length : -1);

        const [fullFunc, argsStr] = str.replace(this.Pointer, STRING_EMPTY).split('(', 2);
        [this.Namespace, this.Name] = fullFunc.split('::', 2);

        this.Args = argsStr.slice(0, -1) // remove trailing ")".
            .splitSafe(',') // returns [] if delimiter is not found.
            .map(arg => dynamiccast(arg.trim()));
    }
}
const line = new LineData('ext::writel("hel()**|lo", 1*716+93)*|ext::writel();');
line.Calls.forEach(c =>
    deepLog(c)
);
