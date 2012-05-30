try {
    var reporter = require('nodeunit').reporters.junit;
} catch(e) {
    console.log("Cannot find nodeunit module.");
    process.exit();
}

process.chdir(__dirname);
reporter.run(['tests'],{output:'reports'});
