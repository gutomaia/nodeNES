var fs = require('fs');
var Canvas = require('canvas');
var sprite = require('../lib/sprite.js');
var ui = require('../lib/ui.js');
var utils = require('../lib/utils.js');

var reports_path = __dirname + '/../reports/';

function snapshot(canvas, filename){
	var path = reports_path + filename;
	if (fs.existsSync(path)){
		fs.unlinkSync(path);
	}
	var out = fs.createWriteStream(path);
	var stream = canvas.pngStream();
	stream.on('data', function (chunk) {
		out.write(chunk);
	});
}

exports.setUp = function (callback) {
	if (!fs.existsSync(reports_path))
		fs.mkdirSync(reports_path);
	this.canvas = new Canvas(800,600);
	utils.path = __dirname + '/../static/example/scrolling/';
	this.opts ={};
	this.opts.sprites = sprite.load_sprites('mario.chr');
	this.opts.palette = [0x22,0x16,0x27,0x18];
	callback();
};

exports.tearDown = function (callback) {
	this.canvas = null;
	this.opt = null;
	callback();
};

exports.test_pixel_editor = function (test){
	var pe = new ui.PixelEditor(this.canvas, 0, 0, this.opts);
	snapshot(this.canvas, 'pixel_editor.png');
    test.done();
};

exports.test_preview = function (test) {
	var pe = new ui.Preview(this.canvas, 0, 0, this.opts);
	snapshot(this.canvas, 'preview.png');
    test.done();
};

exports.test_sprite_selector = function (test) {
	var ss = new ui.SpriteSelector(this.canvas, 0, 0, this.opts);
	snapshot(this.canvas, 'sprite_selector.png');
    test.done();
};

exports.test_palette = function (test) {
	var p = new ui.Palette(this.canvas, 0, 0, this.opts);
	snapshot(this.canvas, 'palette.png');
    test.done();
 };

exports.test_color_picker = function (test) {
	var cp = new ui.ColorPicker(this.canvas, 0, 0, this.opts);
	snapshot(this.canvas, 'color_picker.png');
    test.done();
};
