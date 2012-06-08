
$("#source_files").change(function() {
      var value = $(this).val();
      open_file(value);
});

function open_file(file){
    $.get(file, function(data) {
        var regex = /(\/[a-z\/]+\/)([a-z\d]+\.asm)/;
        var m  = regex.exec(file);
        compiler.path = m[1];
        console.log(m);
        asmEditor.setValue(data);
    });
}

function update(){
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
        'swfPath': '/ext/jsnes/',
        'ui': emulatorUI()
    });
});

function fillCanvas(s1, imageData, palette, size){
    var a = 0;
    for (var y=0; y < 8*size; y++){
        for (var x=0; x < 8*size; x++) {
            var px = (x/size) >> 0;
            var py = (y/size) >> 0;
            var color_index = palette[s1[py][px]];
            var color = sprite.get_color(color_index);
            imageData[a] = color & 0xFF;
            imageData[a+1] = (color >> 8) & 0xFF;
            imageData[a+2] = (color >> 16) & 0xFF;
            imageData[a+3] = 0xff;
            a += 4;
        }
    }
}

function Editor(canvas, position_x, position_y) {
    this.canvas = canvas;
    var sprites = sprite.load_sprites('/example/scrolling/mario.chr');
    //var pallete = [0xffffff, 0xff0000, 0x00ff00, 0x0000ff ];
    var palette = [0x22, 0x30, 0x21, 0x0f];

    this.panels = [0,1,2,3];

    this.pixelSize = 10;
    this.spriteSize = this.pixelSize * 8;
    this.render(sprites, palette);
}

Editor.prototype.render = function(sprites, palette){
    var x = 0;
    var y = 0;
    var canvasContext = this.canvas.getContext('2d');
    for (var p in this.panels){
        var px = x * this.spriteSize;
        var py = y * this.spriteSize;
        var canvasImageData = canvasContext.getImageData(px, py, this.spriteSize, this.spriteSize);
        var spr = sprite.get_sprite(this.panels[p], sprites);
        var imageData = canvasImageData.data;
        fillCanvas(spr, imageData, palette, this.pixelSize);
        canvasContext.putImageData(canvasImageData, px, py);
        x++;
        if (x % 2 == 0){
            x = 0;
            y++;
        }
    }
}

function SpriteSelector(canvas, position_x, position_y, opts){
    this.position_x = (position_x === null)?0:position_x;
    this.position_y = (position_y === null)?0:position_y;
    this.canvas = canvas;

    this.pixelSize = 2;
    this.pixelPadding = 3;

    this.spriteSize= this.pixelSize * 8;
}

SpriteSelector.prototype.render = function(sprites, palette){
    var sprite_id = 0;
    this.sprite_total = sprites.length / 16 >> 0;
    sprite_x = (this.canvas.width / (this.spriteSize + this.pixelPadding)) >> 0;
    sprite_y = (this.sprite_total / sprite_x);
    var canvasContext = this.canvas.getContext('2d');

    for (var y=0; y < sprite_y; y++){
        for (var x=0; x < sprite_x; x++){
            var px =  x * this.spriteSize + (this.pixelPadding * x);
            var py =  y * this.spriteSize + (this.pixelPadding * y);
            var canvasImageData = canvasContext.getImageData(px + this.position_x, py + this.position_y, this.spriteSize, this.spriteSize);
            var imageData = canvasImageData.data;
            var spr = sprite.get_sprite(sprite_id, sprites);
            fillCanvas(spr, imageData, palette, this.spriteSize/8);
            canvasContext.putImageData(canvasImageData, px + this.position_x, py + this.position_y);
            sprite_id++;
            if (sprite_id == this.sprite_total){
                break;
            }
        }
    }
};

function Palette(canvas, position_x, position_y, picker_size){
    this.position_x = (position_x === null)?0:position_x;
    this.position_y = (position_y === null)?0:position_y;
    picker_size = (picker_size === null)?0:picker_size;

    var context = canvas.getContext('2d');
    var color_index = 0;
    for (var y=0; y < 4; y++){
        for (var x=0; x < 16; x++) {
            context.beginPath();
            context.rect(x * picker_size + position_x, y * picker_size + position_y, picker_size, picker_size);
            var color = sprite.get_color(color_index);
            hex = "#000000".substr(1, 6 - color.toString(16).length) + color.toString(16); 
            context.fillStyle = hex;
            context.fill();
            context.lineWidth = 3;
            context.strokeStyle = 'white';
            context.stroke();
            color_index++;
        }
    }
}

Palette.prototype.get_color = function (x,y){
};

var spr_editor = $('#sprite-editor')[0];
var sprites = sprite.load_sprites('/example/scrolling/mario.chr');

var editor = new Editor(spr_editor, 0, 0);
var sselector = new SpriteSelector(spr_editor, 165, 0);
sselector.render(sprites, [0x22, 0x02, 0x38, 0x3c]);
var color_picker = new Palette(spr_editor, 165,305,20);


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

var color_picker = $('#color-picker').click(
    function(e) {
        var canvas = $(this)[0];
        var pos = getCursorPosition(canvas, e);
        var x = pos.x / 20 >> 0;
        var y = pos.y / 20 >> 0;
        var color_index = (y * 16) + x;
        console.log(sprite.get_color(color_index).toString(16)); 
    }
);

