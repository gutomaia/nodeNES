
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

function sprite_test(){
    var chr_editor = $('#chr-editor')[0];
    var canvasContext = chr_editor.getContext('2d');
    var sprites = sprite.load_sprites('/example/scrolling/mario.chr');
    var pallete = [0xffffff, 0xff0000, 0x00ff00, 0x0000ff ];
        pallete = [0x22, 0x30, 0x21, 0x0f];

    //one
    var canvasImageData = canvasContext.getImageData(0, 0, 80, 80);
    spr = sprite.get_sprite(0, sprites);
    var imageData = canvasImageData.data;
    fillCanvas(spr, imageData, pallete, 10);
    canvasContext.putImageData(canvasImageData, 0, 0);

    //two
    canvasImageData = canvasContext.getImageData(81, 0, 80, 80);
    spr = sprite.get_sprite(1, sprites);
    imageData = canvasImageData.data;
    fillCanvas(spr, imageData, pallete, 10);
    canvasContext.putImageData(canvasImageData, 81, 0);

    //three
    canvasImageData = canvasContext.getImageData(0, 81, 80, 80);
    spr = sprite.get_sprite(2, sprites);
    imageData = canvasImageData.data;
    fillCanvas(spr, imageData, pallete, 10);
    canvasContext.putImageData(canvasImageData, 0, 81);

    //four
    canvasImageData = canvasContext.getImageData(81, 81, 80, 80);
    spr = sprite.get_sprite(3, sprites);
    imageData = canvasImageData.data;
    fillCanvas(spr, imageData, pallete, 10);
    canvasContext.putImageData(canvasImageData, 81, 81);

}
sprite_test();

function sprite_test2(){
    var sprite_selector = $('#chr-selector')[0];
    var canvasContext = sprite_selector.getContext('2d');
    var sprites = sprite.load_sprites('/example/scrolling/mario.chr');
/*
palette:
  .db $22,$29,$1A,$0F,  $22,$36,$17,$0F,  $22,$30,$21,$0F,  $22,$27,$17,$0F   ;;background palette
  .db $22,$1C,$15,$14,  $22,$02,$38,$3C,  $22,$1C,$15,$14,  $22,$02,$38,$3C   ;;sprite palette
*/

    var pallete = [0x22, 0x29, 0x1a, 0x0f];
    pallete = [0x22, 0x36, 0x17, 0x0f];
    pallete = [0x22, 0x30, 0x21, 0x0f];
    pallete = [0x22, 0x27, 0x17, 0x0f];
    pallete = [0x22, 0x1c, 0x15, 0x14];
    pallete = [0x22, 0x02, 0x38, 0x3c];
    pallete = [0x22, 0x1c, 0x15, 0x14];
    pallete = [0x22, 0x02, 0x38, 0x3c];

    var pixelSize = 2;
    var pixelPadding = 3;



    //do not change;
    var spriteSize= pixelSize * 8;
    var width = sprite_selector.width;
    var height = sprite_selector.height;
    var sprite_id = 0;
    var sprite_total = sprites.length / 16 >> 0;

    var sprite_x = (width / (spriteSize + pixelPadding)) >> 0;
    var sprite_y = (sprite_total / sprite_x);
    //var sprite_y = width


    for (var y=0; y<sprite_y; y++){
        for (var x=0; x<sprite_x; x++){
            var px =  x * spriteSize + (pixelPadding*x);
            var py =  y * spriteSize + (pixelPadding*y);
            var canvasImageData = canvasContext.getImageData(px, py, spriteSize, spriteSize);
            var imageData = canvasImageData.data;
            var spr = sprite.get_sprite(sprite_id, sprites);
            fillCanvas(spr, imageData, pallete, spriteSize/8);
            canvasContext.putImageData(canvasImageData, px, py);
            sprite_id++;
            if (sprite_id == sprite_total){
                break;
            }
        }
    }
}

sprite_test2();

function Palette(canvas, position_x, position_y, picker_size){
    //this.position_x = (position_x === null)?0:position_x;
    //this.position_y = (position_y === null)?0:position_y;
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

function color_picker_test(){
    var color_picker = $('#color-picker')[0];
    new Palette(color_picker, 0,0,20);
}


color_picker_test();

var spr_editor = $('#sprite-editor')[0];

new Palette(spr_editor, 40,40,20);


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

