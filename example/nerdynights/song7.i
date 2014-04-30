song7_header:
    .byte $01           ;1 stream
    
    .byte SFX_1         ;which stream
    .byte $01           ;status byte (stream enabled)
    .byte SQUARE_2      ;which channel
    .byte $70           ;initial duty (01)
    .byte ve_short_staccato ;volume envelope
    .word song7_square2 ;pointer to stream
    .byte $FF           ;tempo..very fast tempo


song7_square2:
    .byte set_loop1_counter, $08    ;repeat 8 times
.loop:
    .byte thirtysecond, D7, D6, G6      ;play two D notes at different octaves
    .byte adjust_note_offset, -4     ;go down 2 steps
    .byte loop1
    .word .loop
    .byte endsound