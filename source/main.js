// classes and such (idk if js has structs tbh)
const fs = require("fs");
const BigEval = require("bigeval");
const Enumerable = require("linq");
const bigEvalInstance = new BigEval();

class SpellScipt {
    constructor(str) { // str should be compiled
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

        let withTokenizedStrings = str;
        this.calls = withTokenizedStrings.slice(0, -1) // no need for the ";".
            .split("|")
            .map(call => new Call(call.trim()));
    }
}
class SectionHeader {
    constructor(str) {

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

const utils = {
    LineType: Object.freeze({
        LINE: "LINE",
        HEADER: "HEADER",
        IMPORT: "IMPORT",
    }),
    sectionReturnTypes: ["VOID", "STRING", "INT32", "SINGLE"],
    STRING_EMPTY: "",
    /**
     * @returns {string|boolean|number} detokenizes string if ends with "=", bool if True or False and number if its a number and not surrounded by quotation marks.
     */
    dynamicCast(str) {
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
    },
    /**
     * @returns {string}
     * @param {string} str
     */
    tokenize(str) {
        console.log("tokenizing str: " + str)
        return (str == STRING_EMPTY ? "=" : btoa(str)) + "=";
    },
    /**
     * @returns {string}
     * @param {string} encodedStr
     */
    detokenize(encodedStr) {
        console.log("detokenizing endoced str: " + encodedStr);
        if (!encodedStr.endsWith("=")) {
            console.log("INVALID STRING, NOT TOKENIZED/ENCODED");
        }
        const encodedStrWithoutIndicator = encodedStr.slice(0, -1);
        return encodedStrWithoutIndicator == "=" ? STRING_EMPTY : atob(encodedStrWithoutIndicator);
    },

    deepLog(obj) { // not mine but very usefull.
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
    },
    getLineType(str) {
        // const namespaceLessRegex = /^[^:]*:[^:]*$/g // matches (everything) if there is a <anychar>:<anychar>
        return sectionReturnTypes.some(s => str.toUpperCase().includes(s)) ? LineType.HEADER : LineType.LINE;
    },
    /**
     * @returns {LineData | SectionHeader}
     * @param {string} encodedStr
     */
    cast(str) {
        switch (getLineType(str)) {
            case "HEADER":
                return new SectionHeader(str);
                break;
            case "LINE":
                return new LineData(str);
                break;
            default:
                console.log("huh");
                break;
        }
    },
    /**
     * @returns {string}
     * @param {string} str
     */
    subCompile(str) {
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
    },
}


utils.deepLog(new LineData("ext::get_value1()*1|ext::get_value2()*2|ext::writel(*1,*2);"))