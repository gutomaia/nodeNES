if (typeof define !== 'function') { var define = require('amdefine')(module);}

define([], function() {

function TabManager(ide, _jquery, _document){
    this.ide = ide;
    this.regex = /^(\/?([\w\d]+\/)*)([\w\d]+(\.asm|\.chr))$/;
    this.tabs=[];
    this.selectedTabIndex = 0;
    this.jquery = (_jquery != undefined)?_jquery:$;
    this.document = (_document != undefined)?_document:document;
}

TabManager.prototype.createTab = function (file){
    var m = this.regex.exec(file);
    if (m) {
        var tabs = this.jquery('#tabs')[0];
        var tabEl = this.document.createElement("li");
        this.jquery('#tabs li').removeClass("active");
        tabEl.className = 'active';
        var anchor = this.document.createElement('a');
        anchor.href = '#tab' + file;
        anchor.innerHTML = m[m.length -2];
        tabEl.appendChild(anchor);
        tabs.appendChild(tabEl);
        this.tabs.push(tabEl);
        /*
        net.get(full_path, function(content) {
            var session = new EditSession(content);
            session.setUndoManager(new UndoManager());
            session.modeName = 'NesAsm';
            session.setMode('ace/mode/nes');
            ide.editor.setSession(session);
            ide.editor.focus();
            var tab = {
                file: file,
                filename: m[m.length-2]
            };
            this.tabs.push(tab);
    
        });
        */
        return true;
    }
    return false;
};

TabManager.prototype.selectTab = function (file){

};

TabManager.prototype.nextTab = function(){

};

TabManager.prototype.previousTab = function (){

};

TabManager.prototype.closeTab = function (file){

};

TabManager.prototype.get_file = function(file){
    /*lookup on tabs if file is already open*/
};

return TabManager;

});
