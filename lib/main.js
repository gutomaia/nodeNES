if (document === undefined){
    var document = require('jsdom').jsdom("<html><head></head><body></body></html>"),
    window = document.createWindow();
}

define([
    './ace/ace',
    './ace/theme/vibrant_ink.js',
    './compiler.js',
    './sprite.js',
    './ui.js',
    './ide/tabs.js'
    ], function(ace, theme, compiler, sprite, ui, TabManager) {

/*** Start Ace ***/

require("ace/lib/fixoldbrowsers");
require("ace/config").init();

/*** Require Imports ***/

var dom = require("ace/lib/dom");
var net = require("ace/lib/net");

var event = require("ace/lib/event");

var EditSession = require("ace/edit_session").EditSession;
var UndoManager = require("ace/undomanager").UndoManager;

var HashHandler = require("ace/keyboard/hash_handler").HashHandler;

var Renderer = require("ace/virtual_renderer").VirtualRenderer;
var Editor = require("ace/editor").Editor;
var MultiSelect = require("ace/multi_select").MultiSelect;

window.requestFileSystem  = window.MozRequestFileSystem || window.webkitRequestFileSystem || window.requestFileSystem;
BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder || window.BlobBuilder;

/*** compiler open file handler ***/

var compiler_file_handler = {
    workspace: function(file){
        return data;
    },
    web: function (file){
        return data;
    }
};

/*** for workspace ***/

var local_file_handler = {
    cp: function(src, dest){
    },
    mv: function(src, dest){
    },
    touch: function(){

    }
};


var ide = {
    idleTimer:null,
    scheduleBuild: function(){
        if (ide.idleTimer !== null){
            clearTimeout(ide.idleTimer);
        }
        ide.idleTimer = setTimeout(ide.build, 400);
    },
    build: function(){
        $("#status").empty();
        try {
            var data = ide.compiler.nes_compiler(ide.editor.getValue());
            var regex = /([a-z\d]+)(\.asm)$/;
            var m = regex.exec(ide.filename);
            if (m){
                ide.write_nesfile(m[1]+'.nes', data);
            } else {
                console.log('regex error');
            }
            add_status_msg('Succefully builded','OK', 'success');
            return data;
        } catch (e){
            for (var err in e){
                add_status_msg(e[err].type,e[err].message, 'error');
            }
        }
    },
    run: function(){

    },
    init: function (){
        this.compiler = compiler;
        this.container = document.getElementById("editor");
        this.tabs = new TabManager();
        this.createEditor(this.container);
        this.createCommandLine();
        this.initFileSystem();
    },
    createEditor: function(){
        var el = document.createElement("div");
        el.style.cssText = "position: absolute; top:0px; bottom:0px";
        el.className = "";
        var editor = new Editor(new Renderer(el, theme));
        editor.setAnimatedScroll(true);
        this.container.appendChild(el);
        editor.on("change", function (e){
            ide.scheduleBuild();
        });
        this.editor = editor;
    },
    createCommandLine: function(){
        var consoleEl = dom.createElement("div");
        this.container.parentNode.appendChild(consoleEl);
        //consoleEl.style.position="relative";
        consoleEl.style.bottom = "0px";
        consoleEl.style.right = 0;
        consoleEl.style.background = "white";
        consoleEl.style.border = "1px solid #baf";
        consoleEl.style.zIndex = "100";
        var cmdLine = new singleLineEditor(consoleEl);
        cmdLine.editor = ide.editor;
        this.editor.cmdLine = cmdLine;
        this.consoleEl = consoleEl;
    },
    openFile: function (file, mode){
        if (mode === null){
            mode = 'web';
        }
        if (mode == 'web'){
            net.get(file, function(content) {
                var session = new EditSession(content);
                session.setUndoManager(new UndoManager());
                session.modeName = 'NesAsm';
                session.setMode('ace/mode/nes');
                setSession(session);
            });
        }else if (mode == 'workspace'){
            if (this.fs === null){
                this.init_fs();
            }
            fs.root.getFile('log.txt', {}, function(fileEntry) {
                fileEntry.file(function(file) {
                    var reader = new FileReader();
                    reader.onloadend = function(e) {
                        var session = new EditSession(this.result);
                        session.setUndoManager(new UndoManager());
                        session.modeName = 'NesAsm';
                        session.setMode('ace/mode/nes');
                        setSession(session);
                    };
                    reader.readAsText(file);
                }, errorHandler);

            }, errorHandler);
        }
        function setSession(session) {
            ide.editor.setSession(session);
            ide.editor.focus();
        }
    },
    createDir: function (path) {
        var folders = path.split('/');
        if (folders[0] === '.' || folders[0] === '') {
            folders = folders.slice(1);
        }
        this.fs.root.getDirectory(folders[0], {create: true}, function(dirEntry) {
            if (folders.length) {
                createDir(dirEntry, folders.slice(1));
            }
        }, errorHandler);
    },
    onInitFs: function(fs){
        ide.fs = fs;
    },
    onFSInitError: function(e){
        console.log('Error', e);
    },
    errorFileHandler: function (e) {
        var msg = '';
        switch (e.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
              msg = 'QUOTA_EXCEEDED_ERR';
              break;
            case FileError.NOT_FOUND_ERR:
              msg = 'NOT_FOUND_ERR';
              break;
            case FileError.SECURITY_ERR:
              msg = 'SECURITY_ERR';
              break;
            case FileError.INVALID_MODIFICATION_ERR:
              msg = 'INVALID_MODIFICATION_ERR';
              break;
            case FileError.INVALID_STATE_ERR:
              msg = 'INVALID_STATE_ERR';
              break;
            default:
              msg = 'Unknown Error';
              break;
        }
        console.log('Error: ' + msg);
    },
    initFileSystem: function () {
        if (window.requestFileSystem !== undefined){
            window.requestFileSystem(TEMPORARY, 1024*1024, ide.onInitFs, ide.errorFileHandler, ide.onFSInitError);
        }
    },
    write_nesfile: function (filename, data){
        if (this.fs === undefined){
            this.init_fs();
        } else {
            var buf = new ArrayBuffer(data.length);
            var uint = new Uint8Array(buf);
            for (var i=0, strLen=data.length; i<strLen; i++) {
                uint[i] = data.charCodeAt(i);
            }
            this.fs.root.getFile(filename, {create: true}, function(fileEntry) {
                fileEntry.createWriter(function(fileWriter) {
                    fileWriter.onwriteend = function(e) {
                        add_status_msg('Build success', '<a href="' + fileEntry.toURL() + '">' + filename + '</a> file is now available', 'success');
                    };
                    fileWriter.onerror = function(e) {
                        add_status_msg('File', '<a href="' + fileEntry.toURL() + '">Download</a>', 'warning');
                    };
                    var bb = new BlobBuilder();
                    bb.append(uint.buffer);
                    fileWriter.write(bb.getBlob("application/octet-stream"));
                }, ide.errorHandler);
            }, ide.errorHandler);
        }
    }
};

ide.init();
window.ide = ide;

/*** Commands ***/


ide.editor.commands.addCommands([{
    name: "gotoline",
    bindKey: {win: "Ctrl-L", mac: "Command-L"},
    exec: function(editor, line) {
        if (typeof needle == "object") {
            var arg = this.name + " " + editor.getCursorPosition().row;
            editor.cmdLine.setValue(arg, 1);
            editor.cmdLine.focus();
            return;
        }
        line = parseInt(line, 10);
        if (!isNaN(line))
            editor.gotoLine(line);
    },
    readOnly: true
}, {
    name: "find",
    bindKey: {win: "Ctrl-F", mac: "Command-F"},
    exec: function(editor, needle) {
        if (typeof needle == "object") {
            var arg = this.name + " " + editor.getCopyText();
            editor.cmdLine.setValue(arg, 1);
            editor.cmdLine.focus();
            return;
        }
        editor.find(needle);
    },
    readOnly: true
}, {
    name: "focusCommandLine",
    bindKey: "shift-esc",
    exec: function(editor, needle) { editor.cmdLine.focus(); },
    readOnly: true
}]);

ide.editor.cmdLine.commands.bindKeys({
    "Shift-Return|Ctrl-Return|Alt-Return": function(cmdLine) { cmdLine.insert("\n");},
    "Esc|Shift-Esc": function(cmdLine){ cmdLine.editor.focus(); },
    "Return": function(cmdLine){
        var command = cmdLine.getValue().split(/\s+/);
        var editor = cmdLine.editor;
        editor.commands.exec(command[0], editor, command[1]);
        editor.focus();
    }
});

ide.editor.cmdLine.commands.removeCommands(["find", "goToLine", "findAll", "replace", "replaceAll"]);

/**
 * Commands
 */

var commands = ide.editor.commands;

commands.addCommand({
    name: "save",
    bindKey: {win: "Ctrl-S", mac: "Command-S"},
    exec: function() {
        var text = ide.editor.getValue();
        console.log(text);
        alert("Fake Save File");
    }
});

commands.addCommand({
    name: "build",
    bindKey: {win: "Ctrl-B", mac: "Command-B"},
    exec: function() {
        console.log("build");
        ide.build();
    }
});

commands.addCommand({
    name: "run",
    bindKey: {win: "Ctrl-R", mac: "Command-R"},
    exec: function() {
        $('#modal_emulator').modal();
        //window.nes.loadRom(data);
        //window.nes.start();
    }
});

commands.addCommand({
    name: "nextTab",
    bindKey: {win: "Ctrl-]", mac: "Command-]"},
    exec: function() {
        alert("Next tab");
    }
});

commands.addCommand({
    name: "previousTab",
    bindKey: {win: "Ctrl-[", mac: "Command-["},
    exec: function() {
        alert("Previous tab");
    }
});

var keybindings = {
    ace: null,
    // This is a way to define simple keyboard remappings
    custom: new HashHandler({
        "gotoright":      "Tab",
        "indent":         "]",
        "outdent":        "[",
        "gotolinestart":  "^",
        "gotolineend":    "$"
     })
};


$('#tabs li:eq(0)').addClass('active');

$('.dropdown-toggle').dropdown();


/*** emulator ***/

function emulatorUI () {
    var parent = this;
    var UI = function(nes) {
        this.nes = nes;
        window.nes = nes;
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

function add_status_msg(name, msg, type){
    var div = $('<div />');
    div.addClass('alert');
    div.addClass('alert-'+type);
    div.append("<b>" + name + "</b> " + msg);
    $('#status').append(div);
}

/*** Sprite Editor ***/

/*
var SpriteEditor = function(){
    var spr_editor = $('#sprite-editor')[0];
    var sprites = sprite.load_sprites('example/scrolling/mario.chr');
    var options = {
        sprites: sprites,
        palette: [0x22,0x16,0x27,0x18],
        sprite_x: 8,
        sprite_y: 16
    };
    this.loader = new ui.SpriteLoader(spr_editor);
    this.pixel_editor = new ui.PixelEditor(spr_editor, 165, 0, options);
    this.selector = new ui.SpriteSelector(spr_editor, 440, 0, options);
    this.palette = new ui.Palette(spr_editor, 0 , 325, options);
    this.color_picker = new ui.ColorPicker(spr_editor, 165,270,20, options);
    this.preview = new ui.Preview(spr_editor, 0, 0, options);
};

SpriteEditor.prototype.resize = function(){
    this.preview.render();
    this.pixel_editor.render();
    this.selector.render();
    this.palette.render();
    this.color_picker.render();
};


var se = new SpriteEditor();
window.se = se;
*/

//pixel_editor.addColorChangeListener(palette);
//palette.addColorChangeListener(selector);
//palette.addColorChangeListener(preview);
//palette.addColorChangeListener(pixel_editor);
//color_picker.addColorChangeListener(palette);
//selector.addPreviousPageButton("fast_backward.png", 440, 315);
//selector.addNextPageButton("fast_forward.png", 475, 315);

//TODO selector sprite one by one
//TODO selector sprite 8 by 8

//selector.addSpriteChangedListener(preview);
//preview.addSpriteChangedListener(pixel_editor);
//pixel_editor.addRedrawListener(preview);
//pixel_editor.addRedrawListener(selector);

//loader.addRedrawListener(selector);
//loader.addRedrawListener(preview);
//loader.addRedrawListener(pixel_editor);
//loader.updater = build;
//loader.addUpdateCompileButton("check.png", 510, 315);


/*** manage layout ***/

var consoleHight = 20;
function onResize() {
    var left = ide.container.offsetLeft;
    var width = document.documentElement.clientWidth - left;
    ide.container.style.width = width + "px";
    ide.container.style.height = document.documentElement.clientHeight - consoleHight + "px";
    
    var cWidth = ide.container.clientWidth;
    var cHeight = ide.container.clientHeight;
    ide.editor.container.style.width = cWidth + "px";
    ide.editor.container.style.top = "0px";
    ide.editor.container.style.left = 0 + "px";
    ide.editor.container.style.height = (cHeight - 79) + "px";
    ide.editor.resize();

    ide.consoleEl.style.width = width + "px";
    ide.editor.cmdLine.resize();

    var sprite = $('#sprite')[0];
    sprite.style.width = cWidth + "px";
    sprite.style.height = (cHeight - 79) + "px";

    /*
    var sprite_editor = $('#sprite-editor')[0];
    sprite_editor.width = cWidth;
    sprite_editor.height = cHeight;
    sprite_editor.style.width = cWidth + "px";
    sprite_editor.style.top = "0px";
    sprite_editor.style.left = 0 + "px";
    sprite_editor.style.height = (cHeight - 79) + "px";

    se.resize();
    */
    $('#status')[0].style.top = (cHeight / 2) + "px";
}

window.onresize = onResize;
onResize();

/*** dragover ***/
event.addListener(ide.container, "dragover", function(e) {
    return event.preventDefault(e);
});

event.addListener(ide.container, "drop", function(e) {
    var file;
    try {
        file = e.dataTransfer.files[0];
        if (window.FileReader) {
            var reader = new FileReader();
            reader.onload = function() {
                env.editor.session.doc.setValue(reader.result);
                env.editor.session.setMode('ace/mode/nes');
                env.editor.session.modeName = 'NesAsm';
            };
            reader.readAsText(file);
        }
        return event.preventDefault(e);
    } catch(err) {
        return event.stopEvent(e);
    }
});

// add multiple cursor support to editor
MultiSelect(ide.editor);

function singleLineEditor(el) {
    var renderer = new Renderer(el);
    renderer.scrollBar.element.style.display = "none";
    renderer.scrollBar.width = 0;
    renderer.content.style.height = "auto";

    renderer.screenToTextCoordinates = function(x, y) {
        var pos = this.pixelToScreenCoordinates(x, y);
        return this.session.screenToDocumentPosition(
            Math.min(this.session.getScreenLength() - 1, Math.max(pos.row, 0)),
            Math.max(pos.column, 0)
        );
    };
    // todo size change event
    renderer.$computeLayerConfig = function() {
        var longestLine = this.$getLongestLine();
        var firstRow = 0;
        var lastRow = this.session.getLength();
        var height = this.session.getScreenLength() * this.lineHeight;

        this.scrollTop = 0;
        var config = this.layerConfig;
        config.width = longestLine;
        config.padding = this.$padding;
        config.firstRow = 0;
        config.firstRowScreen = 0;
        config.lastRow = lastRow;
        config.lineHeight = this.lineHeight;
        config.characterWidth = this.characterWidth;
        config.minHeight = height;
        config.maxHeight = height;
        config.offset = 0;
        config.height = height;

        this.$gutterLayer.element.style.marginTop = 0 + "px";
        this.content.style.marginTop = 0 + "px";
        this.content.style.width = longestLine + 2 * this.$padding + "px";
        this.content.style.height = height + "px";
        this.scroller.style.height = height + "px";
        this.container.style.height = height + "px";
    };
    renderer.isScrollableBy=function(){return false;};

    var editor = new Editor(renderer);
    new MultiSelect(editor);
    editor.session.setUndoManager(new UndoManager());

    editor.setHighlightActiveLine(false);
    editor.setShowPrintMargin(false);
    editor.renderer.setShowGutter(false);
    editor.renderer.setHighlightGutterLine(false);
    return editor;
}


/*** paths ***/

Path.map("#example/:path/:file").to(function(){
    $('#editor')[0].style.display = "block"; 
    $('#sprite')[0].style.display = "none";

    var path = this.params['path'];
    var file = this.params['file'];
    var full_path = 'example/' + path + '/' + file;
    ide.compiler.path = 'example/' + path + '/';
    net.get(full_path, function(content) {
        var session = new EditSession(content);
        session.setUndoManager(new UndoManager());
        session.modeName = 'NesAsm';
        session.setMode('ace/mode/nes');
        setSession(session);
    });
    function setSession(session) {
        ide.editor.setSession(session);
        ide.editor.focus();
    }
    //TODO: $('#tabs li:eq(0) a').tab('show');
    //TODO: ide.load_file('example/'+path+'/'+file);
});

function pog_get_path(params){
    path = [];
    for (var i in params){
        if (i.match(/^p\d$/)){
            path.push(params[i]);
        }
    }
    return path;
}

function switch_tab(params){
    var path = pog_get_path(params);
    var file = path.join("/");
    console.log(file);
    ide.tabs.selectTab(file);
}

Path.map("#tab/:p1").to(function(){
    switch_tab(this.params);
});

Path.map("#tab/:p1/:p2").to(function(){
    switch_tab(this.params);
});

Path.map("#tab/:p1/:p2/:p3").to(function(){
    switch_tab(this.params);
});

Path.map("#tab/:p1/:p2/:p3/:p4").to(function(){
    switch_tab(this.params);
});

Path.map("#workspace").to(function (){
});


Path.map("#sprites").to(function (){
    $('#editor')[0].style.display = "none";
    $('#sprite')[0].style.display = "block";
    se.resize();
});

Path.map("#sprites").to(function (){
    $('#editor')[0].style.display = "block";
    $('#sprite')[0].style.display = "none";
});

Path.map("#about").to(function(){
    $('#modal_about').modal();
});

Path.map("#fisl").to(function(){
    ide.compiler.path = 'example/movingsprite/';

    var session = ide.editor.getSession();
    session.modeName = 'NesAsm';
    session.setMode('ace/mode/nes');
    $('#editor')[0].style.display = "block";
    $('#sprite')[0].style.display = "none";
    se.resize();    
});

Path.listen();

});