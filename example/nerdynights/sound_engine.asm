SQUARE_1 = $00 ;these are channel constants
SQUARE_2 = $01
TRIANGLE = $02
NOISE = $03

MUSIC_SQ1 = $00 ;these are stream # constants
MUSIC_SQ2 = $01 ;stream # is used to index into variables
MUSIC_TRI = $02
MUSIC_NOI = $03
SFX_1     = $04
SFX_2     = $05

    .rsset $0300 ;sound engine variables will be on the $0300 page of RAM
    
sound_disable_flag  .rs 1   ;a flag variable that keeps track of whether the sound engine is disabled or not. 
sound_temp1 .rs 1           ;temporary variables
sound_temp2 .rs 1
sound_sq1_old .rs 1  ;the last value written to $4003
sound_sq2_old .rs 1  ;the last value written to $4007
soft_apu_ports .rs 16

;reserve 6 bytes, one for each stream
stream_curr_sound .rs 6     ;current song/sfx loaded
stream_status .rs 6         ;status byte.   bit0: (1: stream enabled; 0: stream disabled)
stream_channel .rs 6        ;what channel is this stream playing on?
stream_ptr_LO .rs 6         ;low byte of pointer to data stream
stream_ptr_HI .rs 6         ;high byte of pointer to data stream
stream_ve .rs 6             ;current volume envelope
stream_ve_index .rs 6       ;current position within the volume envelope
stream_vol_duty .rs 6       ;stream volume/duty settings
stream_note_LO .rs 6        ;low 8 bits of period for the current note on a stream
stream_note_HI .rs 6        ;high 3 bits of period for the current note on a stream 
stream_tempo .rs 6          ;the value to add to our ticker total each frame
stream_ticker_total .rs 6   ;our running ticker total.
stream_note_length_counter .rs 6
stream_note_length .rs 6
stream_loop1 .rs 6          ;loop counter
stream_note_offset .rs 6
    
sound_init:
    lda #$0F
    sta $4015   ;enable Square 1, Square 2, Triangle and Noise channels
    
    lda #$00
    sta sound_disable_flag  ;clear disable flag
    ;later, if we have other variables we want to initialize, we will do that here.
    lda #$FF
    sta sound_sq1_old   ;initializing these to $FF ensures that the first notes of the first song isn't skipped
    sta sound_sq2_old
se_silence:
    lda #$30
    sta soft_apu_ports      ;set Square 1 volume to 0
    sta soft_apu_ports+4    ;set Square 2 volume to 0
    sta soft_apu_ports+12   ;set Noise volume to 0
    lda #$80
    sta soft_apu_ports+8     ;silence Triangle

    rts
    
sound_disable:
    lda #$00
    sta $4015   ;disable all channels
    lda #$01
    sta sound_disable_flag  ;set disable flag
    rts
    
;-------------------------------------
; load_sound will prepare the sound engine to play a song or sfx.
;   input:
;       A: song/sfx number to play
sound_load:
    sta sound_temp1         ;save song number
    asl a                   ;multiply by 2.  We are indexing into a table of pointers (words)
    tay
    lda song_headers, y     ;setup the pointer to our song header
    sta sound_ptr
    lda song_headers+1, y
    sta sound_ptr+1
    
    ldy #$00
    lda [sound_ptr], y      ;read the first byte: # streams
    sta sound_temp2         ;store in a temp variable.  We will use this as a loop counter: how many streams to read stream headers for
    iny
.loop:
    lda [sound_ptr], y      ;stream number
    tax                     ;stream number acts as our variable index
    iny
    
    lda [sound_ptr], y      ;status byte.  1= enable, 0=disable
    sta stream_status, x
    beq .next_stream        ;if status byte is 0, stream disabled, so we are done
    iny
    
    lda [sound_ptr], y      ;channel number
    sta stream_channel, x
    iny
    
    lda [sound_ptr], y      ;initial duty and volume settings
    sta stream_vol_duty, x
    iny
    
    lda [sound_ptr], y
    sta stream_ve, x
    iny
    
    lda [sound_ptr], y      ;pointer to stream data.  Little endian, so low byte first
    sta stream_ptr_LO, x
    iny
    
    lda [sound_ptr], y
    sta stream_ptr_HI, x
    iny
    
    lda [sound_ptr], y
    sta stream_tempo, x
    
    lda #$A0
    sta stream_ticker_total, x
    
    lda #$01
    sta stream_note_length_counter,x
    
    lda #$00
    sta stream_ve_index, x
    sta stream_loop1, x
    sta stream_note_offset, x
.next_stream:
    iny
    
    lda sound_temp1         ;song number
    sta stream_curr_sound, x
    
    dec sound_temp2         ;our loop counter
    bne .loop
    rts

;--------------------------
; sound_play_frame advances the sound engine by one frame
sound_play_frame:
    lda sound_disable_flag
    bne .done   ;if disable flag is set, don't advance a frame

    jsr se_silence  ;silence all channels.  se_set_apu will set volume later for all channels that are enabled.
                    ;the purpose of this subroutine call is to silence channels that aren't used by any streams.
    ldx #$00
.loop:
    lda stream_status, x
    and #$01    ;check whether the stream is active
    beq .endloop  ;if the stream isn't active, skip it
    
    ;add the tempo to the ticker total.  If there is a FF-> 0 transition, there is a tick
    lda stream_ticker_total, x
    clc
    adc stream_tempo, x
    sta stream_ticker_total, x
    bcc .set_buffer    ;carry clear = no tick.  if no tick, we are done with this stream
    
    dec stream_note_length_counter, x   ;else there is a tick. decrement the note length counter
    bne .set_buffer    ;if counter is non-zero, our note isn't finished playing yet
    lda stream_note_length, x   ;else our note is finished. reload the note length counter
    sta stream_note_length_counter, x
    
    jsr se_fetch_byte   ;read the next byte from the data stream
    
.set_buffer:
    jsr se_set_temp_ports   ;copy the current stream's sound data for the current frame into our temporary APU vars (soft_apu_ports)
.endloop:
    inx
    cpx #$06
    bne .loop
    jsr se_set_apu      ;copy the temporary APU variables (soft_apu_ports) to the real APU ports ($4000, $4001, etc)
.done:
    rts

;--------------------------
; se_fetch_byte reads one byte from a sound data stream and handles it
;   input: 
;       X: stream number    
se_fetch_byte:
    lda stream_ptr_LO, x
    sta sound_ptr
    lda stream_ptr_HI, x
    sta sound_ptr+1
    
    ldy #$00
.fetch:
    lda [sound_ptr], y
    bpl .note                ;if < #$80, it's a Note
    cmp #$A0
    bcc .note_length         ;else if < #$A0, it's a Note Length
.opcode:                     ;else it's an opcode
    ;do Opcode stuff
    jsr se_opcode_launcher
    iny                      ;next position in the data stream
    lda stream_status, x
    and #%00000001
    bne .fetch               ;after our opcode is done, grab another byte unless the stream is disabled
    rts                      ; in which case we quit  (explained below)
.note_length:
    ;do note length stuff
    and #%01111111          ;chop off bit7
    sty sound_temp1         ;save Y because we are about to destroy it
    tay
    lda note_length_table, y    ;get the note length count value
    sta stream_note_length, x
    sta stream_note_length_counter, x   ;stick it in our note length counter
    ldy sound_temp1         ;restore Y
    iny                     ;set index to next byte in the stream
    jmp .fetch              ;fetch another byte
.note:
    ;do Note stuff
    sta sound_temp2
    lda stream_channel, x
    cmp #NOISE
    bne .not_noise
    jsr se_do_noise
    jmp .reset_ve
.not_noise:
    lda sound_temp2
    sty sound_temp1     ;save our index into the data stream
    clc
    adc stream_note_offset, x   ;add note offset
    asl a
    tay
    lda note_table, y
    sta stream_note_LO, x
    lda note_table+1, y
    sta stream_note_HI, x
    ldy sound_temp1     ;restore data stream index
    
    ;check if it's a rest and modify the status flag appropriately
    jsr se_check_rest
.reset_ve:    
    lda #$00
    sta stream_ve_index, x  
.update_pointer:
    iny
    tya
    clc
    adc stream_ptr_LO, x
    sta stream_ptr_LO, x
    bcc .end
    inc stream_ptr_HI, x
.end:
    rts

se_do_noise:
    lda sound_temp2
    and #%00010000
    beq .mode0
    lda sound_temp2
    ora #%10000000      ;set bit 7 to set mode1
    sta sound_temp2
.mode0:
    lda sound_temp2
    sta stream_note_LO, x
    rts
;--------------------------------------------------
; se_check_rest will read a byte from the data stream and
;       determine if it is a rest or not.  It will set or clear the current
;       stream's rest flag accordingly.
;       input:
;           X: stream number
;           Y: data stream index
se_check_rest:
    lda [sound_ptr], y  ;read the note byte again
    cmp #rest
    bne .not_rest
    lda stream_status, x
    ora #%00000010  ;set the rest bit in the status byte
    bne .store  ;this will always branch.  bne is cheaper than a jmp.
.not_rest:
    lda stream_status, x
    and #%11111101  ;clear the rest bit in the status byte
.store:
    sta stream_status, x
    rts
    
;-----------------------------------------
; se_opcode_launcher will read an address from the opcode jump table and indirect jump there.
;    input: A: opcode byte
;               Y: data stream position
;               X: stream number
se_opcode_launcher:
    sty sound_temp1         ;save y register, because we are about to destroy it
    sec
    sbc #$A0                ;turn our opcode byte into a table index by subtracting $A0
    asl a                   ;multiply by 2 because we index into a table of addresses (words)
    tay
    lda sound_opcodes, y    ;get low byte of subroutine address
    sta sound_ptr2
    lda sound_opcodes+1, y  ;get high byte
    sta sound_ptr2+1
    ldy sound_temp1         ;restore our y register
    iny                     ;set to next position in data stream (assume an argument)
    jmp [sound_ptr2]           ;indirect jump to our opcode subroutine    
    
;----------------------------------------------------
; se_set_temp_ports will copy a stream's sound data to the temporary apu variables
;      input:
;           X: stream number
se_set_temp_ports:
    lda stream_channel, x
    asl a
    asl a
    tay
    
    jsr se_set_stream_volume
    
    lda #$08
    sta soft_apu_ports+1, y     ;sweep
    
    lda stream_note_LO, x
    sta soft_apu_ports+2, y     ;period LO
    
    lda stream_note_HI, x
    sta soft_apu_ports+3, y     ;period HI

    rts    

;----------------------------------
;    
se_set_stream_volume:
    sty sound_temp1             ;save our index into soft_apu_ports (we are about to destroy y)
    
    lda stream_ve, x            ;which volume envelope?
    asl a                       ;multiply by 2 because we are indexing into a table of addresses (words)
    tay
    lda volume_envelopes, y     ;get the low byte of the address from the pointer table
    sta sound_ptr               ;put it into our pointer variable
    lda volume_envelopes+1, y   ;get the high byte of the address
    sta sound_ptr+1
    
.read_ve:
    ldy stream_ve_index, x      ;our current position within the volume envelope.
    lda [sound_ptr], y          ;grab the value.
    cmp #$FF
    bne .set_vol                ;if not FF, set the volume
    dec stream_ve_index, x      ;else if FF, go back one and read again
    jmp .read_ve                ;  FF essentially tells us to repeat the last
                                ;  volume value for the remainder of the note
.set_vol:
    sta sound_temp2             ;save our new volume value (about to destroy A)
    
    cpx #TRIANGLE               
    bne .squares                ;if not triangle channel, go ahead
    lda sound_temp2
    bne .squares                ;else if volume not zero, go ahead (treat same as squares)
    lda #$80
    bmi .store_vol              ;else silence the channel with #$80
.squares:
    lda stream_vol_duty, x      ;get current vol/duty settings
    and #$F0                    ;zero out the old volume
    ora sound_temp2             ;OR our new volume in.

.store_vol:
    ldy sound_temp1             ;get our index into soft_apu_ports
    sta soft_apu_ports, y       ;store the volume in our temp port
    inc stream_ve_index, x      ;set our volume envelop index to the next position

.rest_check:
    ;check the rest flag. if set, overwrite volume with silence value 
    lda stream_status, x
    and #%00000010
    beq .done                   ;if clear, no rest, so quit
    lda stream_channel, x
    cmp #TRIANGLE               ;if triangle, silence with #$80
    beq .tri                    ;else, silence with #$30
    lda #$30        
    bne .store                  ;this always branches.  bne is cheaper than a jmp
.tri:
    lda #$80
.store:    
    sta soft_apu_ports, y
.done:
    rts   
    
;--------------------------
; se_set_apu copies the temporary RAM ports to the APU ports
se_set_apu:
.square1:
    lda soft_apu_ports+0
    sta $4000
    lda soft_apu_ports+1
    sta $4001
    lda soft_apu_ports+2
    sta $4002
    lda soft_apu_ports+3
    cmp sound_sq1_old       ;compare to last write
    beq .square2            ;don't write this frame if they were equal
    sta $4003
    sta sound_sq1_old       ;save the value we just wrote to $4003
.square2:
    lda soft_apu_ports+4
    sta $4004
    lda soft_apu_ports+5
    sta $4005
    lda soft_apu_ports+6
    sta $4006
    lda soft_apu_ports+7
    cmp sound_sq2_old
    beq .triangle
    sta $4007
    sta sound_sq2_old       ;save the value we just wrote to $4007
.triangle:
    lda soft_apu_ports+8
    sta $4008
    lda soft_apu_ports+10   ;there is no $4009, so we skip it
    sta $400A
    lda soft_apu_ports+11
    sta $400B
.noise:
    lda soft_apu_ports+12
    sta $400C
    lda soft_apu_ports+14   ;there is no $400D, so we skip it
    sta $400E
    lda soft_apu_ports+15
    sta $400F
    rts
    
    
NUM_SONGS = $09 ;if you add a new song, change this number.    
                ;the main asm file checks this number in its song_up and song_down subroutines
                ;to determine when to wrap around.

;this is our pointer table.  Each entry is a pointer to a song header                
song_headers:
    .word song0_header  ;this is a silence song.  See song0.i for more details
    .word song1_header  ;The Guardian Legend Boss song
    .word song2_header  ;a sound effect.  Try playing it over the other songs.
    .word song3_header  ;Dragon Warrior overland song
    .word song4_header  ;a new song taking advantage of note lengths and rests
    .word song5_header  ;another sound effect played at a very fast tempo.
    .word song6_header
    .word song7_header
    .word song8_header
    
    .include "sound_opcodes.asm"    ;our opcode subroutines, jump table and aliases
    .include "note_table.i" ;period lookup table for notes
    .include "note_length_table.i"
    .include "vol_envelopes.i"
    .include "song0.i"  ;holds the data for song 0 (header and data streams)
    .include "song1.i"  ;holds the data for song 1
    .include "song2.i"
    .include "song3.i"
    .include "song4.i"
    .include "song5.i"
    .include "song6.i"
    .include "song7.i"
    .include "song8.i"