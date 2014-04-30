song3_header:
    .byte $04           ;4 streams
    
    .byte MUSIC_SQ1     ;which stream
    .byte $01           ;status byte (stream enabled)
    .byte SQUARE_1      ;which channel
    .byte $B0           ;initial duty (10)
    .byte ve_tgl_1      ;volume envelope
    .word song3_square1 ;pointer to stream
    .byte $40           ;tempo
    
    .byte MUSIC_SQ2     ;which stream
    .byte $00           ;status byte (stream disabled)
    
    .byte MUSIC_TRI     ;which stream
    .byte $01           ;status byte (stream enabled)
    .byte TRIANGLE      ;which channel
    .byte $81           ;initial volume (on)
    .byte ve_tgl_2      ;volume envelope
    .word song3_tri     ;pointer to stream
    .byte $40           ;tempo
    
    .byte MUSIC_NOI     ;which stream
    .byte $00           ;disabled.  Our load routine will skip the
                        ;   rest of the reads if the status byte is 0.
                        ;   We are disabling Noise because we haven't covered it yet.
    
song3_square1:
    .byte eighth
    .byte D4, A4, F4, A4, D4, B4, G4, B4
    .byte D4, C5, A4, C5, D4, As4, F4, As4
    .byte E4, A4, E4, A4, D4, A4, Fs4, A4
    .byte D4, A4, Fs4, A4, G4, As4, A4, C5
    .byte D4, C5, A4, C5, D4, B4, G4, B4
    .byte D4, B4, G4, B4, D4, As4, Gs4, As4
    .byte Cs4, A4, E4, A4, D4, A4, E4, A4
    .byte Cs4, A4, E4, A4, B3, A4, Cs4, A4
    .byte loop
    .word song3_square1
        
song3_tri:
    .byte quarter, D6, A6, d_half, G6
    .byte eighth, F6, E6, quarter, D6
    .byte eighth, C6, As5, C6, A5
    .byte quarter, E6, d_whole, D6
    .byte quarter, A6, C7, d_half, B6
    .byte eighth, G6, F6, quarter, E6
    .byte eighth, F6, G6, whole, A6, A6
    .byte loop
    .word song3_tri