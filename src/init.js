
$("#source_files").change(function() {
      var value = $(this).val();
      open_file(value);
});

function open_file(file){
    $.get(file, function(data) {
        var regex = /([a-z\/]+\/)([a-z\d]+\.asm)/;
        var m  = regex.exec(file);
        compiler.path = m[1];
        console.log(m);
        asmEditor.setValue(data);
        update();
    });
}

function update(){
    clearTimeout(_idleTimer);
    console.log('compilling');
    var data;
    try {
        data = compiler.nes_compiler(asmEditor.getValue());
        _nes.loadRom(data);
        _nes.start();
        console.log('okay');
    } catch (e){
        console.log(e);
    }
}

var _idleTimer = null;

function scheduleUpdate(){
    if (_idleTimer !== null){
        clearTimeout(_idleTimer);
    }
    _idleTimer = setTimeout(update, 3000);
}

$(function() {
    asmEditor = CodeMirror.fromTextArea($("#asm")[0], {
        lineNumbers: true,
        matchBrackets: true,
        useCPP: true,
        mode: "text/x-asm",
        onChange: scheduleUpdate
        });
});

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
        $(document).
            bind('keydown', function(evt) {
                this.nes.keyboard.keyDown(evt); 
            }).
            bind('keyup', function(evt) {
                this.nes.keyboard.keyUp(evt); 
            }).
            bind('keypress', function(evt) {
                this.nes.keyboard.keyPress(evt);
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

function fillCanvas(sprt, imageData, palette, size){
    var a = 0;
    for (var y=0; y < 8*size; y++){
        for (var x=0; x < 8*size; x++) {
            var px = (x/size) >> 0;
            var py = (y/size) >> 0;
            var color_index = palette[sprt[py][px]];
            var color = sprite.get_color(color_index);
            imageData[a] = (color >> 16) & 0xff;
            imageData[a+1] = (color >> 8) & 0xff;
            imageData[a+2] = color & 0xff;
            imageData[a+3] = 0xff;
            a += 4;
        }
    }
}

function Widget(){
    this.colorListeners=[];
    this.spriteListeners=[];
}

Widget.prototype.was_clicked = function(x, y){
    if (x >= this.position_x && x <= this.position_x + this.width &&
        y >= this.position_y && y <= this.position_y + this.height){
        return true;
    }
    return false;
};

Widget.prototype.addSpriteChangedListener = function (widget){
    this.spriteListeners.push(widget);
};

Widget.prototype.onSpriteChanged = function(widget){
};

Widget.prototype.notifySpriteChangeListener = function() {
    for (var l in this.spriteListeners){
         this.spriteListeners[l].onSpriteChanged(this);
    }
};

Widget.prototype.addColorChangeListener = function (widget){
    this.colorListeners.push(widget);
};

Widget.prototype.onColorChanged = function (widget){
};

Widget.prototype.notifyColorChanged = function() {
    for (var l in this.colorListeners){
         this.colorListeners[l].onColorChanged(this);
    }
};

PixelEditor.prototype = new Widget();

function PixelEditor(canvas, position_x, position_y, opts) {
    this.canvas = canvas;
    this.position_x = position_x;
    this.position_y = position_y;

    this.pixelPadding = 1;
    this.pixelSize = 8;
    this.render();
}

PixelEditor.prototype.render = function() {
    var canvasContext = this.canvas.getContext('2d');
    fillCanvas(spr, imageData, this.palette, this.pixelSize);
    canvasContext.putImageData(canvasImageData, this.position_x, this.position_y);
};

Preview.prototype = new Widget();
Preview.prototype.constructor = Preview;

function Preview(canvas, position_x, position_y, opts) {
    this.canvas = canvas;
    this.position_x = position_x;
    this.position_y = position_y;

    this.pixelPadding = 1;

    this.panels = [0,1,2,3,4,5,6,7];
    this.panel_id = 0;

    this.pixelSize = 10;
    this.spriteSize = this.pixelSize * 8;
    if (opts !== undefined) {
        this.sprites = opts.sprites;
        this.palette = opts.palette;
        this.render();
    }
}

Preview.prototype.change_panel = function (sprite_id, panel_id){
    if (panel_id !== undefined){
        this.panel_id = panel_id;
    }
    this.panels[this.panel_id] = sprite_id;
    this.panel_id++;
    this.panel_id = this.panel_id % 8;
    this.render();
};

Preview.prototype.render = function(panel_id){
    var x = 0;
    var y = 0;
    var canvasContext = this.canvas.getContext('2d');
    for (var p in this.panels){
        var px = (x * this.spriteSize + (this.pixelPadding * x)) + this.position_x;
        var py = (y * this.spriteSize + (this.pixelPadding * y)) + this.position_y;
        var canvasImageData = canvasContext.getImageData(px, py, this.spriteSize, this.spriteSize);
        var spr = sprite.get_sprite(this.panels[p], this.sprites);
        var imageData = canvasImageData.data;
        fillCanvas(spr, imageData, this.palette, this.pixelSize);
        canvasContext.putImageData(canvasImageData, px, py);
        x++;
        if (x % 2 === 0){
            x = 0;
            y++;
        }
    }
};

Preview.prototype.onColorChanged = function(widget){
    this.palette = widget.palette;
    this.render();
};

SpriteSelector.prototype = new Widget();
SpriteSelector.prototype.constructor = SpriteSelector;

function SpriteSelector(canvas, position_x, position_y, opts){
    this.position_x = (position_x === null)?0:position_x;
    this.position_y = (position_y === null)?0:position_y;
    this.canvas = canvas;

    this.pixelSize = 2;
    this.pixelPadding = 3;

    this.spriteSize= this.pixelSize * 8;
    this.width = this.canvas.width - this.position_x;
    this.page = 0;

    if (opts !== undefined) {
        this.sprites = opts.sprites;
        this.sprite_total = this.sprites.length / 16 >> 0;
        //this.sprite_x = (this.width / (this.spriteSize + this.pixelPadding)) >> 0;
        //this.sprite_y = (this.sprite_total / this.sprite_x) >> 0;
        //this.sprite_y += (this.sprite_total % this.sprite_x !== 0)?1:0;
        this.sprite_x = 8;
        this.sprite_y = 16;
        this.palette = opts.palette;
        this.width = this.sprite_x * (this.spriteSize + this.pixelPadding) - this.pixelPadding;
        this.height = this.sprite_y * (this.spriteSize + this.pixelPadding) - this.pixelPadding;
        this.render();
    }

}

SpriteSelector.prototype.nextPage = function(){

};

SpriteSelector.prototype.previousPage = function(){

};

SpriteSelector.prototype.click = function (x, y){
    var line = Math.abs((this.position_y - y) / (this.spriteSize + this.pixelPadding) >> 0);
    var col = Math.abs((this.position_x - x) / (this.spriteSize + this.pixelPadding) >> 0);
    var sprite_id = line * this.sprite_x + col;
    //editor.change_panel(sprite_id);
};


SpriteSelector.prototype.render = function(){
    var sprite_id = this.page + (this.sprite_x + this.sprite_y);
    var canvasContext = this.canvas.getContext('2d');
    for (var y=0; y < this.sprite_y; y++){
        for (var x=0; x < this.sprite_x; x++){
            var px =  x * this.spriteSize + (this.pixelPadding * x);
            var py =  y * this.spriteSize + (this.pixelPadding * y);
            var canvasImageData = canvasContext.getImageData(px + this.position_x, py + this.position_y, this.spriteSize, this.spriteSize);
            var imageData = canvasImageData.data;
            var spr = sprite.get_sprite(sprite_id, sprites);
            fillCanvas(spr, imageData, this.palette, this.spriteSize/8);
            canvasContext.putImageData(canvasImageData, px + this.position_x, py + this.position_y);
            sprite_id++;
            if (sprite_id == this.sprite_total){
                break;
            }
        }
    }
};

SpriteSelector.prototype.onColorChanged = function(widget){
    this.palette = widget.palette;
    this.render();
};

Palette.prototype = new Widget();
Palette.prototype.constructor = Palette;

function Palette(canvas, position_x, position_y, opts){
    this.canvas = canvas;
    this.position_x = (position_x === null)?0:position_x;
    this.position_y = (position_y === null)?0:position_y;
    this.width = this.picker_size * 4;
    this.height = this.picker_size;
    if (opts !== undefined) {
        //this.picker_size = opt.picker_size;
        this.palette = opts.palette;
    }
    this.picker_size = 20;
    this.palette_id = 0;
    this.render();
}

Palette.prototype.render = function(){
    var context = this.canvas.getContext('2d');
    for (var x=0; x < 4; x++) {
        context.beginPath();
        context.rect(
            x * this.picker_size + this.position_x, 
            this.position_y, 
            this.picker_size, 
            this.picker_size
        );
        var color = sprite.get_color(this.palette[x]).toString(16);
        hex = "#000000".substr(0, 7 - color.length) + color;
        context.fillStyle = hex;
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = '#ffffff';
        context.stroke();
    }
};

Palette.prototype.click = function(x, y) {
    var line = Math.abs((this.position_y - y) / this.picker_size >> 0);
    var col = Math.abs((this.position_x - x) / this.picker_size >> 0);
    this.palette_id = line * this.picker_size + col;

    //this.notifyColorChanged();
};

Palette.prototype.onColorChanged = function(widget){
    this.palette[this.palette_id] = widget.color_id;
    this.palette_id++;
    this.palette_id = this.palette_id % 4;
    this.render();
    this.notifyColorChanged();
};

ColorPicker.prototype = new Widget();
ColorPicker.prototype.constructor = ColorPicker;

function ColorPicker(canvas, position_x, position_y, options){
    this.canvas = canvas;
    this.position_x = (position_x === null)?0:position_x;
    this.position_y = (position_y === null)?0:position_y;
    this.picker_size = 17;
    this.width = this.picker_size * 16;
    this.height = this.picker_size * 4;
    this.render();
}

ColorPicker.prototype.render = function(){
    var context = this.canvas.getContext('2d');
    var color_index = 0;
    for (var y=0; y < 4; y++){
        for (var x=0; x < 16; x++) {
            context.beginPath();
            context.rect(
                x * this.picker_size + this.position_x, 
                y * this.picker_size + this.position_y, 
                this.picker_size, 
                this.picker_size
            );
            var color = sprite.get_color(color_index).toString(16);
            hex = "#000000".substr(0, 7 - color.length) + color;
            context.fillStyle = hex;
            context.fill();
            context.lineWidth = 3;
            context.strokeStyle = '#ffffff';
            context.stroke();
            color_index++;
        }
    }
};

ColorPicker.prototype.click = function(x, y) {
    var line = Math.abs((this.position_y - y) / this.picker_size >> 0);
    var col = Math.abs((this.position_x - x) / this.picker_size >> 0);
    this.color_id = line * 16 + col;
    this.notifyColorChanged();
};




var spr_editor = $('#sprite-editor')[0];
var sprites = sprite.load_sprites('example/scrolling/mario.chr');
var options = {
    sprites: sprites,
    palette: [0x22,0x16,0x27,0x18],
    sprite_x: 8,
    sprite_y: 16
};


var selector = new SpriteSelector(spr_editor, 165, 0, options);
var palette = new Palette(spr_editor, 0 , 325, options);
var color_picker = new ColorPicker(spr_editor, 165,305,20, options);
var preview = new Preview(spr_editor, 0, 0, options);

palette.addColorChangeListener(selector);
palette.addColorChangeListener(preview);

color_picker.addColorChangeListener(palette);

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
        console.log('click');
        var canvas = $(this)[0];
        var pos = getCursorPosition(canvas, e);
        if (color_picker.was_clicked(pos.x, pos.y)){
            color_picker.click(pos.x, pos.y);
        }else if (selector.was_clicked(pos.x, pos.y)){
            selector.click(pos.x, pos.y);
        } else if (palette.was_clicked(pos.x, pos.y)){
            palette.click(pos.x, pos.y);
        }
    }
);

