import BigEval from 'bigeval'; // Use import instead of require
export const bigEvalInstance = new BigEval();

export const TineType = Object.freeze({
    LINE: 'LINE',
    HEADER: 'HEADER',
    IMPORT: 'IMPORT',
});

export const STRING_EMPTY = '';
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
export function dynamicCast(str) {
    const stringRegex = /^"(.*)"$/;
    console.log("attempting dc of string: " + str);

    // if (str.match(stringRegex)) return str.replace(stringRegex, '$1');
    if (str.match(stringRegex)) console.log("uh");
    else if (str.endsWith("=")) return detokenize(str);
    else if (str.toLowerCase() === 'true') return true;
    else if (str.toLowerCase() === 'false') return false;

    const temp = bigEvalInstance.exec(str); // a bit slow to do this so often.
    if (temp !== 'ERROR') return temp;
    return +str; // NaN if fails.
};
/**
 * @returns {string}
 * @param {string} str
 */
export const tokenize = (str) => {
    console.log('tokenizing str: ' + str)
    return (str == STRING_EMPTY ? '=' : btoa(str)) + "=";
}
/**
 * @returns {string}
 * @param {string} encodedStr
 */
export const detokenize = (encodedStr) => {
    console.log('detokenizing endoced str: ' + encodedStr);
    if (!encodedStr.endsWith('=')) {
        console.log("INVALID STRING, NOT TOKENIZED/ENCODED");
    }
    const encodedStrWithoutIndicator = encodedStr.slice(0, -1);
    return encodedStrWithoutIndicator == '=' ? STRING_EMPTY : atob(encodedStrWithoutIndicator);
}

export function deepLog(obj) { // not mine but very usefull
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