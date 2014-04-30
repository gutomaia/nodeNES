;Battle Kid theme.  Original by Sivak

song6_header:
    .byte $04           ;4 streams
    
    .byte MUSIC_SQ1     ;which stream
    .byte $01           ;status byte (stream enabled)
    .byte SQUARE_1      ;which channel
    .byte $30           ;initial duty (01)
    .byte ve_battlekid_1      ;volume envelope
    .word song6_square1 ;pointer to stream
    .byte $4C           ;tempo
    
    .byte MUSIC_SQ2     ;which stream
    .byte $01           ;status byte (stream enabled)
    .byte SQUARE_2      ;which channel
    .byte $30           ;initial duty (10)
    .byte ve_battlekid_2      ;volume envelope
    .word song6_square2 ;pointer to stream
    .byte $4C           ;tempo
    
    .byte MUSIC_TRI     ;which stream
    .byte $01           ;status byte (stream enabled)
    .byte TRIANGLE      ;which channel
    .byte $80           ;initial volume (on)
    .byte ve_short_staccato    ;volume envelope
    .word song6_tri     ;pointer to stream
    .byte $4C           ;tempo
    
    .byte MUSIC_NOI     ;which stream
    .byte $01
    .byte NOISE
    .byte $30
    .byte ve_drum_decay
    .word song6_noise
    .byte $4C
    
song6_square1:
    .byte sixteenth
    .byte set_loop1_counter, 13
.intro_loop:
    .byte A3, C4, E4, A4 
    .byte loop1
    .word .intro_loop
    .byte A3, E4, E3, E2
    
    .byte duty, $B0
    .byte volume_envelope, ve_battlekid_1b
    .byte quarter, E4, E3
    
    .byte duty, $70
    .byte five_eighths, A3
    .byte eighth, B3, C4, D4
    .byte sixteenth, Ds4
    .byte five_sixteenths, E4 ;original probably uses a slide effect.  I fake it here with odd note lengths
    .byte d_quarter, A3
    .byte quarter, D4
    .byte five_eighths, A3
    .byte eighth, B3, C4, D4, C4, B3, A3
    .byte quarter, G3, E3
    .byte eighth, B3
    
    .byte five_eighths, A3
    .byte eighth, B3, C4, D4
    .byte sixteenth, Ds4
    .byte five_sixteenths, E4
    .byte d_quarter, A3
    .byte quarter, D4
    .byte five_eighths, A3
    .byte eighth, B3, C4, D4, C4, B3, A3
    .byte quarter, E4, E3
    .byte eighth, E3
    
    .byte duty, $30
    .byte volume_envelope, ve_battlekid_1
    
    .byte loop
    .word song6_square1
    
song6_square2:
    .byte sixteenth
    .byte rest
.loop_point:
    .byte set_loop1_counter, 13
.intro_loop:
    .byte A3, C4, E4, A4 
    .byte loop1
    .word .intro_loop
    .byte A3, E4, E3, E2
    
    .byte duty, $B0
    .byte volume_envelope, ve_battlekid_2b
    .byte quarter, E4, E3
    
    .byte duty, $70
    .byte five_eighths, A3
    .byte eighth, B3, C4, D4
    .byte sixteenth, Ds4
    .byte five_sixteenths, E4
    .byte d_quarter, A3
    .byte quarter, D4
    .byte five_eighths, A3
    .byte eighth, B3, C4, D4, C4, B3, A3
    .byte quarter, G3, E3
    .byte eighth, B3
    
    .byte five_eighths, A3
    .byte eighth, B3, C4, D4
    .byte sixteenth, Ds4
    .byte five_sixteenths, E4
    .byte d_quarter, A3
    .byte quarter, D4
    .byte five_eighths, A3
    .byte eighth, B3, C4, D4, C4, B3, A3
    .byte quarter, E4, E3
    .byte eighth, E3
    
    .byte duty, $30
    .byte volume_envelope, ve_battlekid_2
    .byte sixteenth
    .byte loop
    .word .loop_point
    
song6_tri:
    .byte eighth
    .byte set_loop1_counter, 4              ;repeat 4 times
.loop:
    .byte A3, A3, A4, A4, A3, A3, A4, A4    ;series of notes to repeat
    .byte adjust_note_offset, -2            ;go down a step
    .byte loop1
    .word .loop
    
    .byte set_note_offset, 0                ;after 4 repeats, reset note offset to 0.
    .byte loop                              ;infinite loop
    .word song6_tri                         
    ;21 bytes
    
song6_noise:
    .byte set_loop1_counter, 3
.loop_point1:
    .byte quarter, $01, $03, $01
    .byte eighth, $03, $05
    .byte loop1
    .word .loop_point1
    .byte eighth, $01, $02, $03, $03 
    .byte quarter, $07, $07
    .byte loop
    .word song6_noise