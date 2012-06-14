
$("#source_files").change(function() {
      var value = $(this).val();
      open_file(value);
});

function open_file(file){
    $.get(file, function(data) {
        var regex = /([a-z\/]+\/)([a-z\d]+\.asm)/;
        var m  = regex.exec(file);
        compiler.path = m[1];
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

var spr_editor = $('#sprite-editor')[0];
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
var color_picker = new ui.ColorPicker(spr_editor, 165,270,20, options);
var preview = new ui.Preview(spr_editor, 0, 0, options);

pixel_editor.addColorChangeListener(palette);

palette.addColorChangeListener(selector);
palette.addColorChangeListener(preview);
palette.addColorChangeListener(pixel_editor);

color_picker.addColorChangeListener(palette);

selector.addNextPageButton("fast_forward.png", 440,310);


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
        var widgets = [pixel_editor, color_picker, selector, palette];
        for (var w in widgets){
            if (widgets[w].was_clicked(pos.x, pos.y)){
                widgets[w].click(pos.x, pos.y);
                break;
            }
        }
    }
);

