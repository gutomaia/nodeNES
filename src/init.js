
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

function fillCanvas(s1, imageData, pallete){
    var a = 0;
    for (var y=0; y<80; y++){
        for (var x=0; x<80; x++) {
            var px = (x/10) >> 0;
            var py = (y/10) >> 0;
            var color = pallete[s1[py][px]];
            imageData[a] = pallete[s1[py][px]] & 0xFF;
            imageData[a+1] = (pallete[s1[py][px]] >> 8) & 0xFF;
            imageData[a+2] = (pallete[s1[py][px]] >> 16) & 0xFF;
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
    //one
    var canvasImageData = canvasContext.getImageData(0, 0, 80, 80);
    spr = sprite.get_sprite(0, sprites);
    var imageData = canvasImageData.data;
    fillCanvas(spr, imageData, pallete);
    canvasContext.putImageData(canvasImageData, 0, 0);

    //two
    canvasImageData = canvasContext.getImageData(0, 81, 80, 80);
    spr = sprite.get_sprite(1, sprites);
    imageData = canvasImageData.data;
    fillCanvas(spr, imageData, pallete);
    canvasContext.putImageData(canvasImageData, 81, 0);

    //three
    canvasImageData = canvasContext.getImageData(0, 81, 80, 80);
    spr = sprite.get_sprite(2, sprites);
    imageData = canvasImageData.data;
    fillCanvas(spr, imageData, pallete);
    canvasContext.putImageData(canvasImageData, 0, 81);

    //four
    canvasImageData = canvasContext.getImageData(0, 81, 80, 80);
    spr = sprite.get_sprite(3, sprites);
    imageData = canvasImageData.data;
    fillCanvas(spr, imageData, pallete);
    canvasContext.putImageData(canvasImageData, 81, 81);

}
sprite_test();
