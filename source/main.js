// import * as utils from './utils.js';
const utils = require("./utils.js");
const fs = require("fs");
const { SpellScipt, LineData, Call, SectionHeader, } = require("./components.js");


// const line = new LineData("ext::writel("hello world!", 1*716+93)*|ext::writel();");
// line.calls.forEach(c =>
//     utils.deepLog(c)
// );

utils.deepLog(new LineData("ext::get_value1()*1|ext::get_value2()*2|ext::writel(*1,*2);"))

// fs.readFile("./docs/tests/advanced.spl", (err, data) => {
//     if (err) throw err;
//     console.log(utils.subCompile(data.toString()));
// });

// const arr = ["void", "0", "main", ""];
// const result = arr.filter(part => part);
// console.log("0" == true);