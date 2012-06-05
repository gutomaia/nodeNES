#!/usr/bin/env node

var nopt = require('nopt'),
    os = require('os'),
    querystring = require('querystring'),
    connect = require('connect'),
    async = require('async'),
    fs = require('fs');

var port = 8888;
var webServer = connect();
webServer
    .use(connect.logger())
    .use(connect.favicon('static/favicon.ico'))
    .use(connect.static('static'))
    .use(connect.static('src'))
    .use(connect.bodyParser())

console.log("=======================================");
console.log("Listening on http://" + os.hostname() + ":" + port + "/");
console.log("=======================================");
webServer.listen(port);
