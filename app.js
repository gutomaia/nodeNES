#!/usr/bin/env node

var os = require('os');
var connect = require('connect');
var http = require('http');
var serveStatic = require('serve-static');

var _static = serveStatic('static');
var _external = serveStatic('external');
var _lib = serveStatic('lib');

var app = connect();
var compression = require('compression');

app.use(compression());
app.use(_static);
app.use(_external);
app.use(_lib);

var port = 8888;

console.log("=======================================");
console.log("Listening on http://" + os.hostname() + ":" + port + "/");
console.log("=======================================");

http.createServer(app).listen(port);
