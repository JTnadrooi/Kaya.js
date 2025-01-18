const EMPTY_STRING = "";
/**
 * The main logger, support varying indentations.
 */
module.exports = class AsitDebugStream {
    indentation = 0;
    silent = false;
    style;
    constructor(style, header) {
        this.style = style || AsitDebugStream.getStyle();
        if (header) this.header(header);
    }
    header(msg) {
        console.log(this.style.getHeaderIndentation() + "[" + msg.toUpperCase() + "]")
    }
    /**
     * 
     * @param {string|Array} msg 
     * @param {number} delta 
     * @param {Array} displays 
     */
    log(msg, delta = 0, displays) {
        if (this.silent) return;
        let consoleArgs;
        if (Array.isArray(msg)) {
            consoleArgs = msg[0];
            msg = msg[1].trim();
        }
        if (msg.startsWith("\t") || msg.endsWith("..")) delta += 1;
        else if (msg.startsWith(">")) {
            delta += 1;
            msg = msg.slice(1);
        }
        else if (msg.startsWith("<")) {
            delta -= 1;
            msg = msg.slice(1);
        }
        if (displays) msg += "[" + (displays.length > 0 ? displays.map(toDisplay => {
            if (toDisplay == undefined) {
                return "undefined";
            }
            return toDisplay.constructor.name == "String" ? toDisplay : toDisplay.constructor.name;
        }) : ["_EMPTY_ARRAY_"]).join(", ") + "]";
        console.log(consoleArgs ?? EMPTY_STRING, this.style.getIndentation(this.indentation).slice(consoleArgs ? (consoleArgs.match(new RegExp("\x1b", "g")) || []).length : 0) + msg);
        this.indentation = Math.max(this.indentation + delta, 0);
    }
    /**
     * @param {string} msg 
     * @param {number} delta 
     * @param {Array} displays 
     */
    error(msg, delta = 0, displays) {
        this.log(["\x1b[31m", "WARNING: " + msg], delta, displays);
    }
    static getStyle(styleId) {
        switch (styleId) {
            case "box-drawing":
                return {
                    getIndentation: (amount) => amount === 0 ? "│" : "│   ".repeat(amount - 1) + (amount > 0 ? "├──" : ""),
                    getHeaderIndentation: (amount) => "╭──",
                }
            default:
                return {
                    getIndentation: (amount) => "   ".repeat(amount) + "^--",
                    getHeaderIndentation: () => "^",
                }
                break;
        }
    }
}