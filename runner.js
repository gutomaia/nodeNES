try {
    var reporter = require('nodeunit').reporters.minimal;
} catch(e) {
    console.log(e);
    process.exit();
}

process.chdir(__dirname);
reporter.run(['tests']);