#!/usr/bin/env node

var os = require('os'),
    connect = require('connect');

var port = 8888;
var webServer = connect();
webServer
    .use(connect.logger())
    .use(connect.favicon('static/favicon.ico'))
    .use(connect.static('static'))
    .use(connect.static('external'))
    .use(connect.static('lib'))
    .use(connect.bodyParser())

console.log("=======================================");
console.log("Listening on http://" + os.hostname() + ":" + port + "/");
console.log("=======================================");
webServer.listen(port);