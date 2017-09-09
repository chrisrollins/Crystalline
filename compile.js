function timeAction(action)
{
	const start = process.hrtime();
	action();
	const diff = process.hrtime(start);
	return `${diff[0] + diff[1] / 1e9}s`;
}

console.log("Loading dependencies...");

const fs = require("fs");
const babel = require("babel-core");

console.log("Compiling...");

let source, result, code;

console.log("Reading source file: ".padEnd(30) + timeAction(function(){
	source = fs.readFileSync("./src/crystalline.js");
}) );

console.log("Compiling: ".padEnd(30) + timeAction(function(){
	result = babel.transform(source, {comments: false, minified: false, sourceType: "module", compact: false, presets: ["es2015"]});
}) );

console.log("Additional modifications: ".padEnd(30) + timeAction(function(){
	code = `var Crystalline = (function(){\n${(result.code).replace("var Crystalline = ", "return ")} })();`;
}) );

console.log("Writing output file: ".padEnd(30) + timeAction(function(){
	fs.writeFileSync("crystalline.js", code, {encoding: "utf-8"});
}) );

console.log("Done.");