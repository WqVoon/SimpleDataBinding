const path = require('path');
const rollup = require("rollup").rollup;

rollup({
    input: path.resolve(__dirname, "../src/main.js")
}).then(bundle => {
    bundle.write({
        file: path.resolve(__dirname, "../dist/SDB.js"),
        format: "umd",
        name: "SDB"
    }).then(() => console.log("Build Successfully"));
}).catch(err => {
    console.error(err);
})