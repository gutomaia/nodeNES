var assert = require('assert');
var fs = require('fs');

var Canvas = require('canvas');

var sprite = require('../lib/sprite.js');
var ui = require('../lib/ui.js');
var utils = require('../lib/utils.js');

utils.path = __dirname + '/../static/example/scrolling/';
var mario_chr = sprite.load_sprites('mario.chr');

exports.setUp = function (callback) {

	this.canvas = new Canvas(800,600);
	global.Image = Canvas.Image;
	this.opts ={};
	this.opts.sprites = mario_chr;
	this.opts.palette = [0x22,0x16,0x27,0x18];
	this.opts.sprite_x = 8;
	this.opts.sprite_y = 16;
	this.pixel_editor = new ui.PixelEditor(this.canvas, 165, 0, this.opts);
	this.selector = new ui.SpriteSelector(this.canvas, 440, 0, this.opts);

	this.palette = new ui.Palette(this.canvas, 0 , 325, this.opts);
	this.color_picker = new ui.ColorPicker(this.canvas, 165,270);
	this.preview = new ui.Preview(this.canvas, 0, 0, this.opts);
	this.loader = new ui.SpriteLoader(this.canvas);

	//this.pixel_editor.addColorChangeListener(this.palette);
	//this.palette.addColorChangeListener(this.selector);
	//this.palette.addColorChangeListener(this.preview);
	//this.palette.addColorChangeListener(this.pixel_editor);
	//this.color_picker.addColorChangeListener(this.palette);

	//this.selector.addSpriteChangedListener(this.preview);
	//this.preview.addSpriteChangedListener(this.pixel_editor);
	//this.pixel_editor.addRedrawListener(this.preview);
	//this.pixel_editor.addRedrawListener(this.selector);

	callback();
};

exports.tearDown = function (callback) {
	this.canvas = null;
	global.Image = undefined;
	this.opt = null;
	callback();
};

exports.test_widget_click_outside = function (test){
	assert.equal(false, this.palette.was_clicked(this.palette.position_x -1,this.palette.position_y));
	assert.equal(false, this.palette.was_clicked(this.palette.position_x, this.palette.position_y -1));
	assert.equal(false, this.palette.was_clicked(this.palette.width + 1, this.palette.position_y));
	assert.equal(false, this.palette.was_clicked(this.palette.position_x, this.palette.height + 1));
	test.done();
};

function click_on_palette(palette, color_id){
	var x = palette.position_x + (palette.picker_size * color_id) + (palette.picker_size / 2);
	var y = palette.position_y + (palette.height / 2);
	assert.ok(palette.was_clicked(x, y));
	palette.click(x, y);
}

exports.test_palette_clicks = function (test){
	test.equal(0, this.palette.palette_id);
	click_on_palette(this.palette, 1);
	test.equal(1, this.palette.palette_id);
	click_on_palette(this.palette, 2);
	test.equal(2, this.palette.palette_id);
	click_on_palette(this.palette, 3);
	test.equal(3, this.palette.palette_id);
	click_on_palette(this.palette, 0);
	test.equal(0, this.palette.palette_id);
	test.done();
};

function click_on_color_picker(color_picker, color_id){
	var x = color_picker.position_x + (color_picker.picker_size * (color_id % 16)) + (color_picker.picker_size / 2);
	var y = color_picker.position_y + (color_picker.picker_size * Math.floor(color_id / 16)) + (color_picker.picker_size / 2);
	assert.ok(color_picker.was_clicked(x, y));
	color_picker.click(x, y);
}

exports.test_color_picker = function (test){
	test.equal(0, this.color_picker.color_id);
	for (var i = 1; i < 64; i++){
		click_on_color_picker(this.color_picker, i);
		test.equal(i, this.color_picker.color_id);
	}
	click_on_color_picker(this.color_picker, 0);
	test.equal(0, this.color_picker.color_id);
	test.done();
};


function click_on_pixel_editor(pixel_editor, x, y){
	var line = pixel_editor.position_y + ((pixel_editor.pixelSize + pixel_editor.pixelPadding) * y) + (pixel_editor.pixelSize / 2);
	var col = pixel_editor.position_x + ((pixel_editor.pixelSize + pixel_editor.pixelPadding) * x) + (pixel_editor.pixelSize / 2);
	assert.ok(pixel_editor.was_clicked(col, line));
	pixel_editor.click(col, line);
}

exports.test_pixel_editor_clicks = function (test){
	test.equal(0, this.pixel_editor.sprite_id);
	test.equal(0, this.pixel_editor.palette_id);
	var spr = sprite.get_sprite(0, this.opts.sprites);
	click_on_pixel_editor(this.pixel_editor, 0, 0);
	this.pixel_editor.palette_id = 4; //Cheating
	for (var line = 0; line < 8; line++){
		for (var col=0; col < 8; col++) {
			test.equal(spr[line][col], this.pixel_editor.sprite[line][col]);
			click_on_pixel_editor(this.pixel_editor, col, line);
			test.equal(4, this.pixel_editor.sprite[line][col]);
		}
	}
	test.done();
};

exports.test_pixel_editor_on_color_changed = function (test){
	test.equal(0, this.palette.palette_id);
	test.equal(0, this.pixel_editor.sprite_id);
	test.equal(0, this.pixel_editor.palette_id);
	this.palette.addColorChangeListener(this.pixel_editor);
	click_on_palette(this.palette, 1);
	test.equal(1, this.pixel_editor.palette_id);
	click_on_palette(this.palette, 2);
	test.equal(2, this.pixel_editor.palette_id);
	click_on_palette(this.palette, 3);
	test.equal(3, this.pixel_editor.palette_id);
	click_on_palette(this.palette, 0);
	test.equal(0, this.pixel_editor.palette_id);
	test.done();
};

function click_on_preview(preview, y, x){
	var line = preview.position_y + ((preview.spriteSize + preview.pixelPadding) * y) + (preview.spriteSize / 2);
	var col = preview.position_x + ((preview.spriteSize + preview.pixelPadding) * x) + (preview.spriteSize / 2);
	assert.ok(preview.was_clicked(col, line));
	preview.click(col, line);

}

exports.test_preview_clicks = function (test) {
	var sprite_id = 0;
	for (var line = 0; line < 4; line++){
		for (var col=0; col < 2; col++, sprite_id++) {
			click_on_preview(this.preview, line, col);
			test.equal(sprite_id, this.preview.sprite_id);
		}
	}
	test.done();
};

exports.test_preview_on_color_changed = function (test){
	this.color_picker.addColorChangeListener(this.palette);
	this.palette.addColorChangeListener(this.preview);
	test.deepEqual([0x22,0x16,0x27,0x18], this.palette.palette);
	test.deepEqual([0x22,0x16,0x27,0x18], this.preview.palette);

	click_on_color_picker(this.color_picker, 51);

	test.deepEqual([51,0x16,0x27,0x18], this.preview.palette);

	click_on_palette(this.palette, 1);
	click_on_color_picker(this.color_picker, 51);

	test.deepEqual([51,51,0x27,0x18], this.preview.palette);

	test.done();
};

exports.test_pixel_editor_on_sprite_changed = function (test){
	this.preview.addSpriteChangedListener(this.pixel_editor);
	test.equal(0, this.pixel_editor.sprite_id);
	var sprite_id = 0;
	for (var line = 0; line < 4; line++){
		for (var col=0; col < 2; col++, sprite_id++) {
			click_on_preview(this.preview, line, col);
			test.equal(sprite_id, this.pixel_editor.sprite_id);
		}
	}
	test.done();
};

function click_on_sprite_selector(sprite_selector, sprite_id){
	var size = (sprite_selector.spriteSize + sprite_selector.pixelPadding);
	var x = sprite_selector.position_x + (size * (sprite_id % sprite_selector.sprite_x)) + (sprite_selector.spriteSize / 2);
	var y = sprite_selector.position_y + (size * Math.floor(sprite_id / sprite_selector.sprite_x)) + (sprite_selector.spriteSize / 2);
	assert.ok(sprite_selector.was_clicked(x, y));
	sprite_selector.click(x, y);
}

function click_on_sprite_selector_next_page(sprite_selector){
	var x = sprite_selector.nextPageButton.position_x + sprite_selector.nextPageButton.width / 2;
	var y = sprite_selector.nextPageButton.position_y + sprite_selector.nextPageButton.height / 2;
	assert.ok(sprite_selector.was_clicked(x, y));
	sprite_selector.click(x, y);
}

function click_on_sprite_selector_previous_page(sprite_selector){
	var x = sprite_selector.previousPageButton.position_x + sprite_selector.previousPageButton.width / 2;
	var y = sprite_selector.previousPageButton.position_y + sprite_selector.previousPageButton.height / 2;
	assert.ok(sprite_selector.was_clicked(x, y));
	sprite_selector.click(x, y);
}


exports.test_sprite_selector_clicks = function (test){
	test.equal(0, this.selector.sprite_id);
	click_on_sprite_selector(this.selector, 1);
	test.equal(1, this.selector.sprite_id);

	click_on_sprite_selector(this.selector, 2);
	test.equal(2, this.selector.sprite_id);

	click_on_sprite_selector(this.selector, 8);
	test.equal(8, this.selector.sprite_id);

	test.done();
};

exports.test_preview_on_sprite_change = function (test){
	test.equal(0, this.selector.sprite_id);
	test.deepEqual([0,1,2,3,4,5,6,7], this.preview.panels);
	this.selector.addSpriteChangedListener(this.preview);

	click_on_sprite_selector(this.selector, 8);
	test.deepEqual([8,9,10,11,12,13,14,15], this.preview.panels);

	test.done();
};

exports.test_sprite_selector_on_color_change = function (test){
	this.color_picker.addColorChangeListener(this.palette);
	test.deepEqual([0x22,0x16,0x27,0x18], this.palette.palette);
	test.deepEqual([0x22,0x16,0x27,0x18], this.selector.palette);
	this.palette.addColorChangeListener(this.selector);

	click_on_palette(this.palette, 2);
	click_on_color_picker(this.color_picker, 51);

	test.deepEqual([0x22,0x16,51,0x18], this.selector.palette);

	click_on_palette(this.palette, 3);
	click_on_color_picker(this.color_picker, 51);

	test.deepEqual([0x22,0x16,51,51], this.selector.palette);

	test.done();
};

exports.test_add_next_page_button = function (test){
	var drawed = false;
	this.selector.canvas = {
		getContext: function (type){
			test.equal('2d', type);
			return {
				drawImage: function(img, x, y){
					test.equal(475, x);
					test.equal(315, y);
					drawed = true;
				}
			};
		}
	};

	test.equal(undefined, this.selector.nextPageButton);
	this.selector.addNextPageButton("fast_forward.png", 475, 315);
	test.notEqual(undefined, this.selector.nextPageButton);
	test.equal("fast_forward.png", this.selector.nextPageButton.src);

	this.selector.nextPageButton.onload();
	test.ok(drawed);

	test.equal(475, this.selector.nextPageButton.position_x);
	test.equal(315, this.selector.nextPageButton.position_y);
	test.done();
};

exports.test_add_previous_page_button = function (test){
	var drawed = false;
	this.selector.canvas = {
		getContext: function (type){
			test.equal('2d', type);
			return {
				drawImage: function(img, x, y){
					test.equal(440, x);
					test.equal(315, y);
					drawed = true;
				}
			};
		}
	};

	test.equal(undefined, this.selector.previousPageButton);
	this.selector.addPreviousPageButton("fast_backward.png", 440, 315);
	test.notEqual(undefined, this.selector.previousPageButton);
	test.equal("fast_backward.png", this.selector.previousPageButton.src);

	this.selector.previousPageButton.onload();
	test.ok(drawed);

	test.equal(440, this.selector.previousPageButton.position_x);
	test.equal(315, this.selector.previousPageButton.position_y);
	test.done();
};

exports.test_selector_next_page = function (test){
	test.equal(0, this.selector.page);
	this.selector.addNextPageButton("fast_forward.png", 475, 315);
	click_on_sprite_selector_next_page(this.selector);
	test.equal(1, this.selector.page);
	click_on_sprite_selector_next_page(this.selector);
	test.equal(2, this.selector.page);
	test.done();
};

exports.test_selector_previous_page = function (test){
	this.selector.page = 2;
	this.selector.addPreviousPageButton("fast_backward.png", 440, 315);
	click_on_sprite_selector_previous_page(this.selector);
	test.equal(1, this.selector.page);
	click_on_sprite_selector_previous_page(this.selector);
	test.equal(0, this.selector.page);
	test.done();
};

exports.test_loader_load_sprite = function (test) {
	utils.path = __dirname + '/../static/example/scrolling/';
	this.pixel_editor.sprites = undefined;
	this.pixel_editor.sprite = undefined;
	this.loader.addRedrawListener(this.pixel_editor);
	this.loader.load('mario.chr');
	test.equal(8192, this.pixel_editor.sprites.length);

	var mario =
    [
        [0,0,0,0,0,0,1,1],
        [0,0,0,0,1,1,1,1],
        [0,0,0,1,1,1,1,1],
        [0,0,0,1,1,1,1,1],
        [0,0,0,3,3,3,2,2],
        [0,0,3,2,2,3,2,2],
        [0,0,3,2,2,3,3,2],
        [0,3,3,2,2,3,3,2]
    ];

	test.deepEqual(mario, this.pixel_editor.sprite);
	test.done();
};

exports.test_loader_on_notify_redraw = function (test) {
	utils.path = __dirname + '/../static/example/scrolling/';
    var rendered = false;
    var widget = new ui.Widget();
    widget.render = function(){
        rendered = true;
    };
    this.loader.addRedrawListener(widget);
	this.loader.load('mario.chr');
    test.equal(8192, widget.sprites.length);
    test.ok(rendered);
    test.done();
};

exports.test_loader_add_update_compile_button = function (test){
	var drawed = false;
	this.loader.canvas = {
		getContext: function (type){
			test.equal('2d', type);
			return {
				drawImage: function(img, x, y){
					test.equal(510, x);
					test.equal(315, y);
					drawed = true;
				}
			};
		}
	};

	test.equal(undefined, this.loader.updateCompileButton);
	this.loader.addUpdateCompileButton("check.png", 510, 315);
	test.notEqual(undefined, this.loader.updateCompileButton);
	test.equal("check.png", this.loader.updateCompileButton.src);

	this.loader.updateCompileButton.onload();
	test.ok(drawed);

	test.equal(510, this.loader.updateCompileButton.position_x);
	test.equal(315, this.loader.updateCompileButton.position_y);
	test.done();
};

function click_on_loader_check(loader){
	var x = loader.updateCompileButton.position_x + loader.updateCompileButton.width / 2;
	var y = loader.updateCompileButton.position_y + loader.updateCompileButton.height / 2;
	assert.ok(loader.was_clicked(x, y));
	loader.click(x, y);
}

exports.test_loader_calls_update_function_on_click = function (test){
	var build = false;
	this.loader.updater = function (){
		build = true;
	};
	this.loader.addUpdateCompileButton("check.png", 510, 315);
	click_on_loader_check(this.loader);
	test.ok(build);
	test.done();
};
