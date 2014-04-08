if (typeof define !== 'function') { var define = require('amdefine')(module);}

define([], function() {

var util = function(){};

util.prototype.open_file = function(file){
	if (typeof jQuery !== 'undefined'){
        return this.open_file_with_jquery(file, jQuery);
    } else {
        return this.open_file_with_require(file);
    }
};

util.prototype.open_file_with_require = function (file){
	var fs = require('fs');
	return fs.readFileSync(file, 'binary');
};

util.prototype.open_file_with_jquery = function (file, jQuery) {
	var content;
	jQuery.ajax({
            url: file,
            xhr: function() {
                    var xhr = $.ajaxSettings.xhr();
                    if (typeof xhr.overrideMimeType !== 'undefined') {
                        xhr.overrideMimeType('text/plain; charset=x-user-defined');
                    }
                    self.xhr = xhr;
                    return xhr;
                },
            complete: function(xhr, status) {
                    content = xhr.responseText;
                },
            async: false
        });
    return content;
};

return new util();
});