try {
    var reporter = require('nodeunit').reporters.minimal;
} catch(e) {
    console.log("Cannot find nodeunit module.");
    process.exit();
}

process.chdir(__dirname);
reporter.run(['tests']);
