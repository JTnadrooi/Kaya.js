/**
 * An example spellbook to be used with the evaluate() method.
 */
const STRING_EMPTY = "";
module.exports = {
    namespace: "ext",
    get_value1() {
        return "Hello "
    },
    get_value2() {
        return "world!"
    },
    writel(...parameters) {
        console.log(parameters.map(p => (p ?? STRING_EMPTY).toString()).join(STRING_EMPTY));
    },
};