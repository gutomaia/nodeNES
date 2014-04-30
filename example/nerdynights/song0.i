;silence song.  disables all streams

song0_header:
    .byte 6          ;6 streams
    
    .byte MUSIC_SQ1
    .byte $00
    
    .byte MUSIC_SQ2
    .byte $00
    
    .byte MUSIC_TRI
    .byte $00
    
    .byte MUSIC_NOI
    .byte $00
    
    .byte SFX_1
    .byte $00
    
    .byte SFX_2
    .byte $00