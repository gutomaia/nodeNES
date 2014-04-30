song8_header:
    .byte 4
    
    .byte MUSIC_SQ1
    .byte 0
    
    .byte MUSIC_SQ2
    .byte 0
    
    .byte MUSIC_TRI
    .byte 0
    
    .byte MUSIC_NOI
    .byte $01
    .byte NOISE
    .byte $30
    .byte ve_tgl_2
    .word song8_noise
    .byte $4C
    
song8_noise:
    .byte half                  ;first play through as half notes
    .byte set_loop1_counter, 2  ;play two times
.loop_point:
    .byte $00, $01, $02, $03, $04, $05, $06, $07, $08
    .byte $09, $0A, $0B, $0C, $0D, $0E, $0F
    .byte $10, $11, $12, $13, $14, $15, $16, $17, $18
    .byte $19, $1A, $1B, $1C, $1D, $1E, $1F
    .byte volume_envelope, ve_drum_decay        ;change to 7-frame decay volume envelope
    .byte quarter                               ;play quarter notes
    .byte loop1                                 ;repeat
    .word .loop_point
    .byte endsound