const EMPTY_STRING = "";
/**
 * The main logger, support varying indentations.
 */
module.exports = class AsitDebugStream {
    indentation = 0;
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
        if (displays) msg += "[" + (displays.length > 0 ? displays.map(toDisplay => toDisplay.constructor.name == "String" ? toDisplay : toDisplay.constructor.name) : ["_EMPTY_ARRAY_"]).join(", ") + "]";
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
    // /**
    //  * Write a msg with increased line indentation.
    //  * @param {string} msg 
    //  */
    // tree(msg) {
    //     this.log(msg, 1);
    // }
    // /**
    //  * Decreases indentation (depth) by one.
    //  * @param {string} msg 
    //  */
    // fail(msg) {
    //     this.log(msg, -1);
    // }
    // /**
    //  * Decreases indentation (depth) by one.
    //  * @param {string} msg 
    //  */
    // succes(msg) {
    //     this.log(msg, -1);
    // }

    //statics
    static toStyle(str) {
        return; // not implemented.
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
// const logger = new module.exports(module.exports.getStyle("default"), "KAYA.JS");
// logger.log("waiting..");
// logger.tree("starting process");
// logger.log("working..");
// logger.tree("starting another process");
// logger.log("working again..");