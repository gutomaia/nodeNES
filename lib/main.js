if (document === undefined){
    var jsdom = require('jsdom').jsdom;
    var document = jsdom("<html><head></head><body></body></html>"),
        window = document.createWindow();
}
/*
define([
    './ace/ace',
    './compiler.js',
    './sprite.js',
    './ui.js'
    ], function(ace, compiler, sprite, ui) {
*/

define('nodeNES/main',function(require, exports, module) {
"never use strict";

require("ace/lib/fixoldbrowsers");
require("ace/config").init();

var env = {};
var dom = require("ace/lib/dom");
var net = require("ace/lib/net");

var event = require("ace/lib/event");
//var theme = require("ace/theme/cobalt");
var theme = null;
var EditSession = require("ace/edit_session").EditSession;
var UndoManager = require("ace/undomanager").UndoManager;

var HashHandler = require("ace/keyboard/hash_handler").HashHandler;

var Renderer = require("ace/virtual_renderer").VirtualRenderer;
var Editor = require("ace/editor").Editor;
var MultiSelect = require("ace/multi_select").MultiSelect;

/*********** demo documents ***************************/

var fileCache = {};

function initDoc(file, path, doc) {
    if (doc.prepare)
        file = doc.prepare(file);

    var session = new EditSession(file);
    session.setUndoManager(new UndoManager());
    doc.session = session;
    doc.path = path;
    if (doc.wrapped) {
        session.setUseWrapMode(true);
        session.setWrapLimitRange(80, 80);
    }
    session.modeName = 'NesAsm';
    session.setMode('ace/mode/nes');
}


function makeHuge(txt) {
    for (var i = 0; i < 5; i++)
        txt += txt;
    return txt;
}

var docs = {
    "example/movingsprite/movingsprite.asm": "NesAsm"
};

var ownSource = {
    /* filled from require*/
};

if (window.require && window.require.s) try {
    for (var path in window.require.s.contexts._.loaded) {
        if (path.indexOf("!") != -1)
            path = path.split("!").pop();
        else
            path = path + ".js";
        ownSource[path] = "";
    }
} catch(e) {}

function prepareDocList(docs) {
    var list = [];
    for (var path in docs) {
        var doc = docs[path];
        if (typeof doc != "object")
            doc = {name: doc || path};

        doc.path = path;
        doc.desc = doc.name.replace(/^(ace|docs|demo|build)\//, "");
        if (doc.desc.length > 18)
            doc.desc = doc.desc.slice(0, 7) + ".." + doc.desc.slice(-9);

        fileCache[doc.name] = doc;
        list.push(doc);
    }

    return list;
}

docs = prepareDocList(docs);
ownSource = prepareDocList(ownSource);

/*********** create editor ***************************/

var container = document.getElementById("editor");
var el = document.createElement("div");
el.style.cssText = "position: absolute; top:0px; bottom:0px";
el.className = "";
container.appendChild(el);
//var Editor = require("ace/editor").Editor;
//var Renderer = require("ace/virtual_renderer").VirtualRenderer;
//var EditSession = require("ace/edit_session").EditSession;
var editor = new Editor(new Renderer(el, theme));

/*
editor.on("focus", function() {
    this._emit("focus", editor);
}.bind(this));
*/

// Splitting.
//var Split = require("ace/split").Split;
//var split = new Split(container, theme, 1);
//split.on("focus", function(editor) {
//    env.editor = editor;
//    updateUIEditorOptions();
//});
//env.split = split;
env.container = container;
env.editor = editor;
window.env = env;
window.editor = window.ace = env.editor;
env.editor.setAnimatedScroll(true);

var consoleEl = dom.createElement("div");
container.parentNode.appendChild(consoleEl);
//consoleEl.style.position="relative";
consoleEl.style.bottom = "0px";
consoleEl.style.right = 0;
consoleEl.style.background = "white";
consoleEl.style.border = "1px solid #baf";
consoleEl.style.zIndex = "100";
var cmdLine = new singleLineEditor(consoleEl);
cmdLine.editor = env.editor;
env.editor.cmdLine = cmdLine;

env.editor.commands.addCommands([{
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

var commands = env.editor.commands;

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
        alert("Fake Build");
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
    var left = env.container.offsetLeft;
    var width = document.documentElement.clientWidth - left;
    container.style.width = width + "px";
    container.style.height = document.documentElement.clientHeight - consoleHight + "px";
    
    var cWidth = container.clientWidth;
    var cHeight = container.clientHeight;
    env.editor.container.style.width = cWidth + "px";
    editor.container.style.top = "0px";
    editor.container.style.left = 0 + "px";
    editor.container.style.height = (cHeight - 79) + "px";
    env.editor.resize();

    consoleEl.style.width = width + "px";
    cmdLine.resize();
}

window.onresize = onResize;
onResize();

/*********** options pane ***************************/
var docEl = document.getElementById("doc");
var wrapModeEl = document.getElementById("soft_wrap");
var themeEl = document.getElementById("theme");
var foldingEl = document.getElementById("folding");
var selectStyleEl = document.getElementById("select_style");
var highlightActiveEl = document.getElementById("highlight_active");
var showHiddenEl = document.getElementById("show_hidden");
var showGutterEl = document.getElementById("show_gutter");
var showPrintMarginEl = document.getElementById("show_print_margin");
var highlightSelectedWordE = document.getElementById("highlight_selected_word");
var showHScrollEl = document.getElementById("show_hscroll");
var animateScrollEl = document.getElementById("animate_scroll");
var softTabEl = document.getElementById("soft_tab");
var behavioursEl = document.getElementById("enable_behaviours");

var group = document.createElement("optgroup");
fillDropdown(docs, group);

docEl.appendChild(group);

bindDropdown("doc", function(name) {
    var doc = fileCache[name];
    if (!doc)
        return;

    if (doc.session)
        return setSession(doc.session);
    var path = doc.path;
    net.get(path, function(x) {
        initDoc(x, path, doc);
        setSession(doc.session);
    });

    function setSession(session) {
        env.editor.setSession(session);
        updateUIEditorOptions();
        env.editor.focus();
    }
});

function updateUIEditorOptions() {
    var editor = env.editor;
    var session = editor.session;

    session.setFoldStyle(foldingEl.value);

    saveOption(docEl, session.name);
    saveOption(wrapModeEl, session.getUseWrapMode() ? session.getWrapLimitRange().min || "free" : "off");

    saveOption(selectStyleEl, editor.getSelectionStyle() == "line");
    saveOption(themeEl, editor.getTheme());
    saveOption(highlightActiveEl, editor.getHighlightActiveLine());
    saveOption(showHiddenEl, editor.getShowInvisibles());
    saveOption(showGutterEl, editor.renderer.getShowGutter());
    saveOption(showPrintMarginEl, editor.renderer.getShowPrintMargin());
    saveOption(highlightSelectedWordE, editor.getHighlightSelectedWord());
    saveOption(showHScrollEl, editor.renderer.getHScrollBarAlwaysVisible());
    saveOption(animateScrollEl, editor.getAnimatedScroll());
    saveOption(softTabEl, session.getUseSoftTabs());
    saveOption(behavioursEl, editor.getBehavioursEnabled());
}

function saveOption(el, val) {
    if (!el.onchange && !el.onclick)
        return;
    if ("checked" in el) {
        if (val !== undefined)
            el.checked = val;
        if (localStorage)
            localStorage.setItem(el.id, el.checked ? 1 : 0);
    }
    else {
        if (val !== undefined)
            el.value = val;
        if (localStorage)
            localStorage.setItem(el.id, el.value);
    }
}

event.addListener(themeEl, "mouseover", function(e){
    this.desiredValue = e.target.value;
    if (!this.$timer)
        this.$timer = setTimeout(this.updateTheme);
});

event.addListener(themeEl, "mouseout", function(e){
    this.desiredValue = null;
    if (!this.$timer)
        this.$timer = setTimeout(this.updateTheme, 20);
});

themeEl.updateTheme = function(){
    env.editor.setTheme(themeEl.desiredValue || themeEl.selectedValue);
    themeEl.$timer = null;
};

bindDropdown("theme", function(value) {
    if (!value)
        return;
    env.editor.setTheme(value);
    themeEl.selectedValue = value;
});

/*
bindDropdown("keybinding", function(value) {
    env.editor.setKeyboardHandler(keybindings[value]);
});
*/

bindDropdown("fontsize", function(value) {
    //TODO env.split.setFontSize(value);
});

bindDropdown("folding", function(value) {
    env.editor.getSession().setFoldStyle(value);
    env.editor.setShowFoldWidgets(value !== "manual");
});

bindDropdown("soft_wrap", function(value) {
    var session = env.editor.getSession();
    var renderer = env.editor.renderer;
    switch (value) {
        case "off":
            session.setUseWrapMode(false);
            renderer.setPrintMarginColumn(80);
            break;
        case "40":
            session.setUseWrapMode(true);
            session.setWrapLimitRange(40, 40);
            renderer.setPrintMarginColumn(40);
            break;
        case "80":
            session.setUseWrapMode(true);
            session.setWrapLimitRange(80, 80);
            renderer.setPrintMarginColumn(80);
            break;
        case "free":
            session.setUseWrapMode(true);
            session.setWrapLimitRange(null, null);
            renderer.setPrintMarginColumn(80);
            break;
    }
});

bindCheckbox("select_style", function(checked) {
    env.editor.setSelectionStyle(checked ? "line" : "text");
});

bindCheckbox("highlight_active", function(checked) {
    env.editor.setHighlightActiveLine(checked);
});

bindCheckbox("show_hidden", function(checked) {
    env.editor.setShowInvisibles(checked);
});

bindCheckbox("show_gutter", function(checked) {
    env.editor.renderer.setShowGutter(checked);
});

bindCheckbox("show_print_margin", function(checked) {
    env.editor.renderer.setShowPrintMargin(checked);
});

bindCheckbox("highlight_selected_word", function(checked) {
    env.editor.setHighlightSelectedWord(checked);
});

bindCheckbox("show_hscroll", function(checked) {
    env.editor.renderer.setHScrollBarAlwaysVisible(checked);
});

bindCheckbox("animate_scroll", function(checked) {
    env.editor.setAnimatedScroll(checked);
});

bindCheckbox("soft_tab", function(checked) {
    env.editor.getSession().setUseSoftTabs(checked);
});

bindCheckbox("enable_behaviours", function(checked) {
    env.editor.setBehavioursEnabled(checked);
});

bindCheckbox("fade_fold_widgets", function(checked) {
    env.editor.setFadeFoldWidgets(checked);
});

var secondSession = null;

/*
bindDropdown("split", function(value) {
    var sp = env.split;
    if (value == "none") {
        if (sp.getSplits() == 2) {
            secondSession = sp.getEditor(1).session;
        }
        sp.setSplits(1);
    } else {
        var newEditor = (sp.getSplits() == 1);
        if (value == "below") {
            sp.setOrientation(sp.BELOW);
        } else {
            sp.setOrientation(sp.BESIDE);
        }
        sp.setSplits(2);

        if (newEditor) {
            var session = secondSession || sp.getEditor(0).session;
            var newSession = sp.setSession(session, 1);
            newSession.name = session.name;
        }
    }
});
*/

function bindCheckbox(id, callback) {
    var el = document.getElementById(id);
    if (localStorage && localStorage.getItem(id))
        el.checked = localStorage.getItem(id) == "1";

    var onCheck = function() {
        callback(!!el.checked);
        saveOption(el);
    };
    el.onclick = onCheck;
    onCheck();
}

function bindDropdown(id, callback) {
    var el = document.getElementById(id);
    if (localStorage && localStorage.getItem(id))
        el.value = localStorage.getItem(id);

    var onChange = function() {
        callback(el.value);
        saveOption(el);
    };

    el.onchange = onChange;
    onChange();
}

function fillDropdown(list, el) {
    list.forEach(function(item) {
        var option = document.createElement("option");
        option.setAttribute("value", item.name);
        option.innerHTML = item.desc;
        el.appendChild(option);
    });
}


/************** dragover ***************************/
event.addListener(container, "dragover", function(e) {
    return event.preventDefault(e);
});

event.addListener(container, "drop", function(e) {
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
require("ace/multi_select").MultiSelect(env.editor);



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

});