var ui = require('../lib/ui.js');

exports.test_new_widget = function(test){
    var widget = new ui.Widget();
    test.equal(0, widget.colorListeners.length);
    test.equal(0, widget.spriteListeners.length);
    test.done();
};

exports.test_add_color_listener = function(test){
    var widget = new ui.Widget();
    test.equal(0, widget.colorListeners.length);
    var mockColorListener = {};
    widget.addColorChangeListener(mockColorListener);
    test.equal(1, widget.colorListeners.length);
    test.done();
};

exports.test_add_sprite_listener = function(test){
    var widget = new ui.Widget();
    test.equal(0, widget.spriteListeners.length);
    var mockSpriteListener = {};
    widget.addSpriteChangedListener(mockSpriteListener);
    test.equal(1, widget.spriteListeners.length);
    test.done();
};

exports.test_on_color_changed = function(test){
    var widget = new ui.Widget();
    var mockColorListener = {
        called: false,
        onColorChanged: function(widget){
            this.called = true;
        }
    };
    widget.addColorChangeListener(mockColorListener);
    widget.notifyColorChanged();
    test.ok(mockColorListener.called);
    test.done();
};

exports.test_on_sprite_changed = function(test){
    var widget = new ui.Widget();
    var mockSpriteListener = {
        called: false,
        onSpriteChanged: function(widget){
            this.called = true;
        }
    };
    widget.addSpriteChangedListener(mockSpriteListener);
    widget.notifySpriteChangeListener();
    test.ok(mockSpriteListener.called);
    test.done();
};

exports.test_pixel_editor_extends_widget = function(test){
    test.equal(ui.Widget.addColorChangeListener, ui.PixelEditor.addColorChangeListener);
    test.equal(ui.Widget.addSpriteChangedListener, ui.PixelEditor.addSpriteChangedListener);
    test.equal(ui.Widget.notifyColorChanged, ui.PixelEditor.notifyColorChanged);
    test.equal(ui.Widget.notifySpriteChangeListener, ui.PixelEditor.notifySpriteChangeListener);
    test.equal(ui.Widget.onColorChanged, ui.PixelEditor.onColorChanged);
    test.equal(ui.Widget.onSpriteChanged, ui.PixelEditor.onSpriteChanged);
    test.equal(ui.Widget.was_clicked, ui.PixelEditor.was_clicked);
    test.done();
};


exports.test_sprite_selector_extends_widget = function(test){
    test.equal(ui.Widget.addColorChangeListener, ui.SpriteSelector.addColorChangeListener);
    test.equal(ui.Widget.addSpriteChangedListener, ui.SpriteSelector.addSpriteChangedListener);
    test.equal(ui.Widget.notifyColorChanged, ui.SpriteSelector.notifyColorChanged);
    test.equal(ui.Widget.notifySpriteChangeListener, ui.SpriteSelector.notifySpriteChangeListener);
    test.equal(ui.Widget.onColorChanged, ui.SpriteSelector.onColorChanged);
    test.equal(ui.Widget.onSpriteChanged, ui.SpriteSelector.onSpriteChanged);
    test.equal(ui.Widget.was_clicked, ui.SpriteSelector.was_clicked);
    test.done();
};

exports.test_new_sprite_selector = function(test){
    var options = {};
    //var sprite_selector = new ui.SpriteSelector(this.mockCanvas, 0, 0, options);

    test.done();
};

exports.test_preview_extends_widget = function(test){
    test.equal(ui.Widget.addColorChangeListener, ui.Preview.addColorChangeListener);
    test.equal(ui.Widget.addSpriteChangedListener, ui.Preview.addSpriteChangedListener);
    test.equal(ui.Widget.notifyColorChanged, ui.Preview.notifyColorChanged);
    test.equal(ui.Widget.notifySpriteChangeListener, ui.Preview.notifySpriteChangeListener);
    test.equal(ui.Widget.onColorChanged, ui.Preview.onColorChanged);
    test.equal(ui.Widget.onSpriteChanged, ui.Preview.onSpriteChanged);
    test.equal(ui.Widget.was_clicked, ui.Preview.was_clicked);
    test.done();
};

exports.test_palette_extends_widget = function(test){
    test.equal(ui.Palette.addColorChangeListener, ui.Preview.addColorChangeListener);
    test.equal(ui.Palette.addSpriteChangedListener, ui.Preview.addSpriteChangedListener);
    test.equal(ui.Palette.notifyColorChanged, ui.Preview.notifyColorChanged);
    test.equal(ui.Palette.notifySpriteChangeListener, ui.Preview.notifySpriteChangeListener);
    test.equal(ui.Palette.onColorChanged, ui.Preview.onColorChanged);
    test.equal(ui.Palette.onSpriteChanged, ui.Preview.onSpriteChanged);
    test.equal(ui.Palette.was_clicked, ui.Preview.was_clicked);
    test.done();
};

exports.test_color_picker_extends_widget = function(test){
    test.equal(ui.ColorPicker.addColorChangeListener, ui.Preview.addColorChangeListener);
    test.equal(ui.ColorPicker.addSpriteChangedListener, ui.Preview.addSpriteChangedListener);
    test.equal(ui.ColorPicker.notifyColorChanged, ui.Preview.notifyColorChanged);
    test.equal(ui.ColorPicker.notifySpriteChangeListener, ui.Preview.notifySpriteChangeListener);
    test.equal(ui.ColorPicker.onColorChanged, ui.Preview.onColorChanged);
    test.equal(ui.ColorPicker.onSpriteChanged, ui.Preview.onSpriteChanged);
    test.equal(ui.ColorPicker.was_clicked, ui.Preview.was_clicked);
    test.done();
};

