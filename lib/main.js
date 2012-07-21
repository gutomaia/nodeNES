if (document === undefined){
    var jsdom = require('jsdom').jsdom;
    var document = jsdom("<html><head></head><body></body></html>"),
        window = document.createWindow();
}

define([
    './ace/ace',
    './ace/theme/vibrant_ink.js',
    './compiler.js',
    './sprite.js',
    './ui.js'
    ], function(ace, theme, compiler, sprite, ui) {

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


/*** compiler open file handler ***/

var compiler_file_handler = {
    workspace: function(file){
        return data;
    },
    web: function (file){
        return data;
    }
};

var web_file_handler = {
    open: function(){

    }
};

var web_file_handler = {

};

/*** for workspace ***/

var local_file_handler = {
    open: function(){

    },
    close: function(){

    },
    save: function(){
    }
};


function Tab(name, file){

}

function TabManager(){
}

TabManager.prototype.get_file = function(file){
    /*lookup on tabs if file is already open*/
};


var ide = {
    init: function (){
        this.compiler = compiler;
        this.container = document.getElementById("editor");
        this.editor = this.createEditor(this.container);
        this.commandLine = this.createCommandLine();
        this.tabs = this.createTabs();
    },
    createEditor: function(container){
        var el = document.createElement("div");
        el.style.cssText = "position: absolute; top:0px; bottom:0px";
        el.className = "";        
        var editor = new Editor(new Renderer(el, theme));
        editor.setAnimatedScroll(true);
        container.appendChild(el);
        return editor
    },
    createCommandLine: function(){
    },
    createTabs: function(){

    }
};

var commands = {

}

ide.init();
window.ide = ide;

/*********** create editor ***************************/

var consoleEl = dom.createElement("div");
ide.container.parentNode.appendChild(consoleEl);
//consoleEl.style.position="relative";
consoleEl.style.bottom = "0px";
consoleEl.style.right = 0;
consoleEl.style.background = "white";
consoleEl.style.border = "1px solid #baf";
consoleEl.style.zIndex = "100";
var cmdLine = new singleLineEditor(consoleEl);
cmdLine.editor = ide.editor;
ide.editor.cmdLine = cmdLine;

ide.editor.on("onDocumentChange", function (e){
    console.log('enter');  
});
console.log('ok');

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

cmdLine.commands.bindKeys({
    "Shift-Return|Ctrl-Return|Alt-Return": function(cmdLine) { cmdLine.insert("\n");},
    "Esc|Shift-Esc": function(cmdLine){ cmdLine.editor.focus(); },
    "Return": function(cmdLine){
        var command = cmdLine.getValue().split(/\s+/);
        var editor = cmdLine.editor;
        editor.commands.exec(command[0], editor, command[1]);
        editor.focus();
    }
});

cmdLine.commands.removeCommands(["find", "goToLine", "findAll", "replace", "replaceAll"]);

/**
 * Commands
 */

var commands = ide.editor.commands;

commands.addCommand({
    name: "save",
    bindKey: {win: "Ctrl-S", mac: "Command-S"},
    exec: function() {
        var text = editor.getSession().selection.doc.$lines.join('\n');
        alert("Fake Save File");
    }
});

commands.addCommand({
    name: "build",
    bindKey: {win: "Ctrl-B", mac: "Command-B"},
    exec: function() {
        console.log("build");
        try {
            var data = env.compiler.nes_compiler(env.editor.getValue());
            /*
            var regex = /([a-z\d]+)(\.asm)$/;
            var m = regex.exec(ide.filename);
            if (m){
                ide.write_nesfile(m[1]+'.nes', data);
            } else {
                console.log('regex error');
            }
            _nes.loadRom(data);
            _nes.start();
            add_status_msg('Succefully compiled','OK', 'success');
            */
        } catch (e){
            console.log(e);
            for (var err in e){
              //  add_status_msg(e[err].type,e[err].message, 'error');
            }
        }

        //alert("Fake Build");
    }
});

commands.addCommand({
    name: "run",
    bindKey: {win: "Ctrl-R", mac: "Command-R"},
    exec: function() {
        alert("Fake Run");
    }
});

commands.addCommand({
    name: "newTab",
    bindKey: {win: "Ctrl-N", mac: "Command-N"},
    exec: function() {
        alert("New tab");
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



/*********** manage layout ***************************/
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

    consoleEl.style.width = width + "px";
    cmdLine.resize();
}

window.onresize = onResize;
onResize();

/************** dragover ***************************/
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
    // editor.renderer.setHighlightGutterLine(false);
    return editor;
}

$('#tabs li:eq(0)').addClass('active');

$('.dropdown-toggle').dropdown();

Path.map("#example/:path/:file").to(function(){
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

Path.map("#tab/:num").to(function(){

});

Path.listen();

});