const fs = require("fs");
const BigEval = require("bigeval");
const Enumerable = require("linq");
const AsitDebugStream = require("../lib/asitdebug.js");

const bigEvalInstance = new BigEval();
const debugStream = new AsitDebugStream(undefined, "KAYA.JS<>PLAYGROUND");
// const namespace_ext = require("./spellbooks/example.book.js");

/**
 * A parameter depending on memory.
 */
class MemoryParameter {
    constructor(pointer) {
        this.pointer = pointer;
    }
}
/**
 * A header of a Spellscipt Section/function.
 */
class SectionHeader {
    constructor(str) {

    }
}
class SplEvaluable {
    constructor() {
        if (this.constructor == SplEvaluable) {
            throw new Error("abstract classes can't be instantiated.");
        }
    }
    /** 
     * Evaluate this splscript. (snipped)
    */
    evaluate(spellbooks = [], memorySize = 16) {
        utils.evaluate(this, spellbooks, memorySize)
    }
}

class SpellScipt extends SplEvaluable {
    /**
     * Initialize a new spellscipt from a (optionally subcompiled) string.
     * @param {string} str 
     */
    constructor(str) {
        super();
        /** @type {string} The subcompiled version of this spellscipt.*/ this.subCompiled;
        this.subCompiled = utils.subCompile(str, true);

        // const stringRegex = /(["'])(?:(?=(\\?))\2.)*?\1/g


        // let withTokenizedStrings = str;
        // str.match(stringRegex).forEach(s => {
        //     const noQuotes = s.slice(1, -1);
        //     withTokenizedStrings = withTokenizedStrings.replace(s, utils.tokenize(noQuotes));
        //     console.log("tokenizing line strings; " + noQuotes + " to " + utils.tokenize(noQuotes));
        // });

        // this.subCompiled = withTokenizedStrings;

        // console.log(this.subCompiled);
    }
}
/**
 * A single Spellscript "Line". A line is a region where the memory does not clear.
 */
class LineData extends SplEvaluable {
    /**
     * 
     * @param {string} str 
     */
    constructor(str) {
        super();
        /** @type {Call[]} */ this.calls;
        this.source = str;

        debugStream.log("casting (subcompiled) spl.LineData from \"" + str + "\"..");

        if (!this.source.endsWith(";")) throw new Error("missing \";\" while parsing linedata; \"" + str + "\".");

        let withTokenizedStrings = str;
        debugStream.log("splitting casts..");
        this.calls = withTokenizedStrings.slice(0, -1) // no need for the ";".
            .split("|")
            .map(call => new Call(call));
        debugStream.log("<splitting succes, " + this.calls.length + " calls created from \"" + this.source + "\".");
        debugStream.log("<spl.Call contruction/cast finished succesfully.");
    }
}
/**
 * Represents a single {@link Call} from a line. One line may have one or more calls, the {@link LineData}
 */
class Call extends SplEvaluable {
    /**
     * @param {string} str
     */
    constructor(str) {
        super();
        /** @type {number | null} The memory pointer.*/ this.pointer;
        /** @type {string} The namespace this {@link Call} calls to.*/ this.namespace;
        /** @type {string} */ this.name;
        /** @type {!Object[]} The call arguments. May be an empty array if no arguments are given. */ this.args;
        /** @type {string} The source string. */ this.source;

        this.source = str;

        debugStream.log("casting (subcompiled) spl.Call from \"" + this.source + "\"..");
        const pointerRegex = /\*\d*$/g; // only supports "simple" pointers, this is why it needs to be subcompiled first.

        debugStream.log("spl.Call.pointer..");
        const pointerMatch = str.match(pointerRegex) ?? ["NULL"];
        this.pointer = pointerMatch[0] == "NULL" ? null : Number(pointerMatch[0].substring(1));
        debugStream.log("<found: " + this.pointer);

        if (this.pointer == 0) throw new Error();

        debugStream.log("spl.Call.namespace/spl.Call.name..");
        const [fullFunc, argsStr] = str.replace(pointerRegex, utils.STRING_EMPTY).split("(", 2);
        [this.namespace, this.name] = fullFunc.split("::", 2);
        debugStream.log("<found: ", 0, [this.namespace, this.name]);

        debugStream.log("spl.Call.args(splitting)..");
        this.args = argsStr.slice(0, -1) // remove trailing ")".
            .splitSafe(",") // returns [] if splitter is not found.
            .map(arg => utils.dynamicCast(arg.trim()));
        debugStream.log("<found: ", 0, [...this.args]);
        debugStream.log("<spl.Call contruction/cast finished succesfully; source: \"" + this.source + "\"");
    }
    /**
     * Get this Call as a Linedata wrapper.
     * @returns {LineData}
     */
    asLine() {
        return new LineData(this.source + ";")
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

/**
 * Utils, sometimes used for testing.
 */
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
        debugStream.log("attempting dynamic cast of string: \"" + str + "\".");

        if (str.match(stringRegex)) throw new Error("strings cannot have double quotes, these should already be filtered out.");
        else if (str.endsWith("=")) return detokenize(str);
        else if (str.toLowerCase() === "true") return true;
        else if (str.toLowerCase() === "false") return false;
        else if (str.startsWith("*")) return new MemoryParameter(+(str.substring(1)));

        const temp = bigEvalInstance.exec(str); // a bit slow to do this so often.
        if (temp !== "ERROR") return temp;
        return +str; // NaN if fails.
    },
    /**
     * @param {string} str A normal string, NO QUOTES.
     * @returns {string} Returns a string without any funny characters.
     * @see {detokenize} A function that detokenizes a string.
     */
    tokenize(str) {
        debugStream.log("tokenizing string: \"" + str + "\"..");
        const toret = (str == this.STRING_EMPTY ? "=" : btoa(str)) + "=";
        debugStream.log("<succes (as): \"" + toret + "\".");
        return toret;
    },
    /**
     * @returns {string}
     * @param {string} str
     */
    detokenize(str) {
        debugStream.log("detokenizing string: \"" + str + "\"..");
        if (!str.endsWith("=")) throw new Error("INVALID STRING, NOT TOKENIZED/ENCODED");
        const toret = str.slice(0, -1) == "=" ? this.STRING_EMPTY : atob(str.slice(0, -1));
        debugStream.log("<succes (as): \"" + toret + "\".");
        return toret;
    },
    isSubCompiled(str) {
        return str.startsWith("<HEADER><");
    },
    /**
     * A recursive logging method. Should be excluded from the final build.
     */
    deepLog(obj) { // not mine but very usefull.
        const seen = new WeakSet();
        const recursiveDump = (value, indent = 0) => {
            if (value === null) return "null";
            if (typeof value !== "object") return `${typeof value}: ${value}`;
            if (seen.has(value)) return "[circular]";
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
        return this.sectionReturnTypes.some(s => str.toUpperCase().includes("<" + s + ">")) ? this.LineType.HEADER : this.LineType.LINE;
    },
    /**
     * Casts a string to the designated spl line.
     * @param {string} encodedStr The encoded string, should be precompiled.
     * @returns {LineData | SectionHeader} This depends on the linetype. 
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
     * @param {string} str A unsubcompiled Spellscipt. (This must be the data, not the path to the spl file.)
     * @returns {string} Returns the spellscipt subcompiled to something more easilty understanded by the class-parsers.
     */
    subCompile(str, guarantee) {

        // regex galore! (cat walked on keyboard fr)
        const stringRegex = /(["'])(?:(?=(\\?))\2.)*?\1/g; // matches strings. (including the quotes)
        const commentsRegex = /\/\*(?:[^*]|(?:\*+[^*/]))*\*+\/|\/\/.*/g; // matches inline comments. (including the slashes)
        const evalRegex = /\[[^\[\]]*\]/g;  // matches all [] expressions. (including the []'s)
        const numericRegex = /\*+(?!\d)/g; // matches all direct numerics directly after the * symbol. // including the *, does not return ALL *'s.

        let subcompiled = str;
        debugStream.log("subcompiling string: \"" + (str.length > 50 ? "[TO_LONG_STRING]" : str) + "\"..");
        if (this.isSubCompiled(str)) {
            debugStream.log("str already subcompiled.");
            if (guarantee) {
                debugStream.log("<[\"guarantee\" = TRUE], subcompile skipped.");
                return str
            }
            else {
                debugStream.log("[\"guarantee\" = FALSE], throwing error!");
                throw new Error("can't subcompile an already subcompiled spellscript.");
            }
        }

        debugStream.log("normalizing line endings..");
        subcompiled = subcompiled.replace(/\r\n|\r|\n/g, "\n"); // normalize line endings.
        debugStream.log("<succes.");
        debugStream.log("removing comments..");
        subcompiled = subcompiled.replaceAll(commentsRegex, this.STRING_EMPTY); // remove comments.
        debugStream.log("<succes.");
        debugStream.log("tokenizing strings..");
        str.match(stringRegex).forEach(s => { // tokenize strings.
            const noQuotes = s.slice(1, -1);
            subcompiled = subcompiled.replace(s, this.tokenize(noQuotes));
        });
        debugStream.log("<succes.");
        debugStream.log("initializing linemapping; (whitespace removal, linetag inserting)..");
        subcompiled = subcompiled.split("\n") // (post) linemapping.
            .map(line => line.replaceAll(/[\n\r\s\t]+/g, this.STRING_EMPTY)) // remove ALL whitespace. (Does not have to be trailing => (AFTER) strings tokenized, comments removed.)
            .filter(line => line) // strings are bools now. (its a empty string check)
            .map(line => "<" + this.getLineType(line) + ">" + line)
            .join("\n");
        debugStream.log("<succes.");
        debugStream.log("evaluating expressions..");
        subcompiled.match(evalRegex).forEach(rm => // evaluate constant [] expressions.
            subcompiled = subcompiled.replace(rm, bigEvalInstance.exec(rm.slice(1, -1)))
        );
        debugStream.log("<succes.");
        debugStream.log("normalizing pointers..");
        [...subcompiled.matchAll(numericRegex)]
            .reverse() // from back to front to prevent index-shifting.
            .forEach(match => // to collapsed format replace() sequence.
                subcompiled = subcompiled.replaceAtIndex(match.index, match[0].length, "*" + match[0].length)
            );
        return subcompiled;
    },
    /**
     * @param {LineData|SpellScipt|Call} splData
     * @param {number} memorySize
     * @param {Object[]} spellbooks
     * @returns {number} The error code or 1 if succes.
     */
    evaluate(splData, spellbooks = [], memorySize = 16) {
        let memory = {};
        if (spellbooks.length == 0) console.error("ERROR");
        if (memorySize < 0) console.error("ERROR");
        if (splData instanceof LineData) {
            splData.calls.forEach(c => {
                const targetBook = spellbooks.find(item => item.namespace === c.namespace);
                const returnValue = targetBook[c.name](...c.args.map(a =>
                    (a instanceof MemoryParameter) ? memory[a.pointer - 1] : a
                ));
                if (c.pointer !== null) memory[c.pointer - 1] = returnValue;
            });
        }
    }
}

// let testSpl = null;
// // new LineData("ext::get_value1()|ext::get_value1();");
// fs.readFile('C:\\Users\\Gebruiker\\Documents\\homework\\_mbo\\Kaya.js\\docs\\tests\\advanced.spl', 'utf8', (err, data) => {
//     if (err) {
//         console.error('error reading the file:', err);
//         return;
//     }
//     console.log(data);
//     // console.log(utils.subCompile(data));
//     testSpl = new SpellScipt(data);
// });
new LineData("ext::get_value1()*1|ext::get_value2()*2|ext::writel(*1,*2);").evaluate([
    require("./spellbooks/example.book.js"),
])

// utils.deepLog(new LineData("ext::get_value1()*1|ext::get_value2()*2|ext::writel(*1,*2);")); // compiled linedata
// // utils.evaluate(new LineData("ext::get_value1()*1|ext::get_value2()*2|ext::writel(*1,*2);"), [
// //     require("./spellbooks/example.book.js"),
// // ]);
// utils.evaluate(new Call("ext::writel(\"Hello \",\"world!\")").asLine(), [
//     require("./spellbooks/example.book.js"),
// ]);