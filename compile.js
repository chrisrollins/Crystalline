const fs = require("fs");
const babel = require("babel-core");

const result = babel.transformFileSync("./src/crystalline.js", {comments: false, minified: false, sourceType: "module", compact: false, presets: ["es2015"]});

let code = `var Crystalline = (function(){\n${(result.code).replace("var Crystalline = ", "return ")} })();`;

fs.writeFileSync("crystalline.js", code, {encoding: "utf-8"});