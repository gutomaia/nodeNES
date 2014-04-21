if (typeof define !== 'function') { var define = require('amdefine')(module);}

define([
    './compiler.js',
    './sprite.js',
    './ui.js',
    './utils.js'
    ], function(compiler, sprite, ui, utils) {

var spr_editor = $('#sprite-editor')[0];

var loader = new ui.SpriteLoader(spr_editor);

var ide = {
    files_opened: [],
    init: function(){
        ide.codemirror = CodeMirror.fromTextArea($("#asm")[0], {
            lineNumbers: true,
            matchBrackets: true,
            useCPP: true,
            mode: "text/x-asm"
            });
        ide.codemirror.on("change", scheduleUpdate);

        utils.on_write_end = function (filename, url){
            add_status_msg('Build success', '<a href="' + url + '">' + filename + '</a> file is now available', 'success');
        };

    },
    filename: null,
    load_file: function(file){
        $.get(file, function(data) {
            var regex = /([a-z\-\/]+\/)([a-z\-\d]+\.(asm|s))/;
            var m  = regex.exec(file);
            if (m) {
                ide.files_opened = []; //
                utils.path = m[1];
                ide.filename = m[2];
                ide.codemirror.setValue(data);
                build();
                for (var f in ide.files_opened){
                    if (ide.files_opened[f].match(/\.chr$/)){
                        loader.load(ide.files_opened[f]);
                        break;
                    }
                }
            }
        });
    },
    compiler_open_file: function(file){
        ide.files_opened.push(file);
        if (loader.file == file){
            return String.fromCharCode.apply(undefined, loader.sprites);
        } else {
            return compiler.open_file(file);
        }
    }
};

ide.init();

function add_status_msg(name, msg, type){
    var div = $('<div />');
    div.addClass('alert');
    div.addClass('alert-'+type);
    div.append("<b>" + name + "</b> " + msg);
    $('#status').append(div);
}

function build(){
    clearTimeout(_idleTimer);
    $('#status').empty();
    try {
        var data = compiler.nes_compiler(ide.codemirror.getValue());
        var regex = /([a-z\-\d]+)(\.asm|\.s)$/;
        var m = regex.exec(ide.filename);
        if (m){
            utils.write_file(m[1]+'.nes', data);
        } else {
            console.log('regex error');
        }
        _nes.loadRom(data);
        _nes.start();
        add_status_msg('Succefully compiled','OK', 'success');
    } catch (e){
        for (var err in e){
            add_status_msg(e[err].type,e[err].message, 'error');
        }
    }
}

var _idleTimer = null;

function scheduleUpdate(){
    if (_idleTimer !== null){
        clearTimeout(_idleTimer);
    }
    _idleTimer = setTimeout(build, 3000);
}

var _nes;

function emulatorUI () {
    var parent = this;
    var UI = function(nes) {
        this.nes = nes;
        _nes = nes;
        this.screen = $('#nes-screen')[0];
        this.zoomed = false;

        this.canvasContext = this.screen.getContext('2d');
        this.canvasImageData = this.canvasContext.getImageData(0, 0, 256, 240);
        this.resetCanvas();
        /*
        TODO: by enabling it. The source editor stops working
        $(document).
            bind('keydown', function(evt) {
                _nes.keyboard.keyDown(evt);
            }).
            bind('keyup', function(evt) {
                _nes.keyboard.keyUp(evt);
            }).
            bind('keypress', function(evt) {
                _nes.keyboard.keyPress(evt);
            });
        */
        this.dynamicaudio = new DynamicAudio({
            swf: nes.opts.swfPath+'dynamicaudio.swf'
        });
    };

    UI.prototype = {
        resetCanvas: function() {
            this.canvasContext.fillStyle = 'black';
            this.canvasContext.fillRect(0, 0, 256, 240);
            for (var i = 3; i < this.canvasImageData.data.length-3; i += 4) {
                this.canvasImageData.data[i] = 0xFF;
            }
        },
        enable: function() {
        },
        updateStatus: function(s) {
        },
        writeAudio: function(samples) {
            return this.dynamicaudio.writeInt(samples);
        },
        writeFrame: function(buffer, prevBuffer) {
            var imageData = this.canvasImageData.data;
            var pixel, i, j;

            for (i=0; i<256*240; i++) {
                pixel = buffer[i];

                if (pixel != prevBuffer[i]) {
                    j = i*4;
                    imageData[j] = pixel & 0xFF;
                    imageData[j+1] = (pixel >> 8) & 0xFF;
                    imageData[j+2] = (pixel >> 16) & 0xFF;
                    prevBuffer[i] = pixel;
                }
            }
            this.canvasContext.putImageData(this.canvasImageData, 0, 0);
        }
    };
    return UI;
}



$(function() {
    new JSNES({
        'swfPath': '',
        'ui': emulatorUI()
    });
});

// window resize

function onResize() {
    var tab_content = $('.tab-content')[0];
    var left = tab_content.offsetLeft;
    var top = tab_content.offsetTop;
    var width = document.documentElement.clientWidth - left;
    var height = document.documentElement.clientHeight - top;
    tab_content.style.width = width + "px";
    tab_content.style.height = height + "px";
}

window.onresize = onResize;
onResize();

//sprite editor

var sprites = sprite.load_sprites('example/scrolling/mario.chr');

var options = {
    sprites: sprites,
    palette: [0x22,0x16,0x27,0x18],
    sprite_x: 8,
    sprite_y: 16
};

var pixel_editor = new ui.PixelEditor(spr_editor, 165, 0, options);
var selector = new ui.SpriteSelector(spr_editor, 440, 0, options);
var palette = new ui.Palette(spr_editor, 0 , 325, options);
var color_picker = new ui.ColorPicker(spr_editor, 165,270);
var preview = new ui.Preview(spr_editor, 0, 0, options);

pixel_editor.addColorChangeListener(palette);
palette.addColorChangeListener(selector);
palette.addColorChangeListener(preview);
palette.addColorChangeListener(pixel_editor);
color_picker.addColorChangeListener(palette);
selector.addPreviousPageButton("fast_backward.png", 440, 315);
selector.addNextPageButton("fast_forward.png", 475, 315);

//TODO selector sprite one by one
//TODO selector sprite 8 by 8

selector.addSpriteChangedListener(preview);
preview.addSpriteChangedListener(pixel_editor);
pixel_editor.addRedrawListener(preview);
pixel_editor.addRedrawListener(selector);

loader.addRedrawListener(selector);
loader.addRedrawListener(preview);
loader.addRedrawListener(pixel_editor);
loader.updater = build;
loader.addUpdateCompileButton("check.png", 510, 315);


function getCursorPosition(canvas, event) {
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;

    var element = canvas;

    do {
        totalOffsetX += element.offsetLeft;
        totalOffsetY += element.offsetTop;
        element = element.offsetParent;
    }
    while (element !== null);

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    canvasX = Math.round( canvasX * (canvas.width / canvas.offsetWidth) );
    canvasY = Math.round( canvasY * (canvas.height / canvas.offsetHeight) );

    return {x:canvasX, y:canvasY};
}

$('#sprite-editor').click(
    function(e) {
        var canvas = $(this)[0];
        var pos = getCursorPosition(canvas, e);
        var widgets = [pixel_editor, palette, preview, color_picker, selector, loader];
        for (var w in widgets){
            if (widgets[w].was_clicked(pos.x, pos.y)){
                widgets[w].click(pos.x, pos.y);
                break;
            }
        }
    }
);

//Bootstrap

$('#tabs li:eq(0) a').tab('show');
$('.dropdown-toggle').dropdown();

var AppRouter = Backbone.Router.extend({

  routes: {
    "example/:path/:file": "example",
    "source": "source",
    "sprites": "sprites"
  },

  example: function(path, file) {
    $('#tabs li:eq(0) a').tab('show');
    ide.load_file('example/'+path+'/'+file);
  },
  source: function() {
    $('#tabs li:eq(0) a').tab('show');
  },
  sprites: function(){
    $('#tabs li:eq(1) a').tab('show');
  },
  about: function(){
    $('#tabs li:eq(2) a').tab('show');
  }
});

var app_router = new AppRouter();

app_router.on('route:defaultRoute', function(actions) {
    alert(actions);
});

Backbone.history.start();

});
