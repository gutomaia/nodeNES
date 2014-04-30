;these are aliases to use in the sound data.
endsound = $A0
loop = $A1
volume_envelope = $A2
duty = $A3
set_loop1_counter = $A4
loop1 = $A5
set_note_offset = $A6
adjust_note_offset = $A7
transpose = $A8

;-----------------------------------------------------------------------
;this is our JUMP TABLE!
sound_opcodes:
    .word se_op_endsound            ;$A0
    .word se_op_infinite_loop       ;$A1
    .word se_op_change_ve           ;$A2
    .word se_op_duty                ;$A3
    .word se_op_set_loop1_counter   ;$A4
    .word se_op_loop1               ;$A5
    .word se_op_set_note_offset     ;$A6
    .word se_op_adjust_note_offset  ;$A7
    .word se_op_transpose           ;$A8
    ;etc, 1 entry per subroutine

    
;-----------------------------------------------------------------
; these are the actual opcode subroutines
se_op_endsound:
    lda stream_status, x    ;end of stream, so disable it and silence
    and #%11111110
    sta stream_status, x    ;clear enable flag in status byte
    
    lda stream_channel, x
    cmp #TRIANGLE
    beq .silence_tri        ;triangle is silenced differently from squares and noise
    lda #$30                ;squares and noise silenced with #$30
    bne .silence            ; (this will always branch.  bne is cheaper than a jmp)
.silence_tri:
    lda #$80                ;triangle silenced with #$80
.silence:
    sta stream_vol_duty, x  ;store silence value in the stream's volume variable.

    rts
    
se_op_infinite_loop:
    lda [sound_ptr], y      ;read ptr LO from the data stream
    sta stream_ptr_LO, x    ;update our data stream position
    iny
    lda [sound_ptr], y      ;read ptr HI from the data stream
    sta stream_ptr_HI, x    ;update our data stream position
    
    sta sound_ptr+1         ;update the pointer to reflect the new position.
    lda stream_ptr_LO, x
    sta sound_ptr
    ldy #$FF                ;after opcodes return, we do an iny.  Since we reset  
                            ;the stream buffer position, we will want y to start out at 0 again.
    rts
    
se_op_change_ve:
    lda [sound_ptr], y      ;read the argument
    sta stream_ve, x        ;store it in our volume envelope variable
    lda #$00
    sta stream_ve_index, x  ;reset volume envelope index to the beginning
    rts
    
se_op_duty:
    lda [sound_ptr], y
    sta stream_vol_duty, x
    rts
    
se_op_set_loop1_counter:
    lda [sound_ptr], y      ;read the argument (# times to loop)
    sta stream_loop1, x     ;store it in the loop counter variable
    rts
    
se_op_loop1:
    dec stream_loop1, x     ;decrement the counter
    lda stream_loop1, x
    beq .last_iteration     ;if zero, we are done looping
    jmp se_op_infinite_loop ;if not zero, jump back
.last_iteration:
    iny                     ;skip the first byte of the address argument
                            ; the second byte will be skipped automatically upon return
                            ; (see se_fetch_byte after "jsr se_opcode_launcher")
    rts
    
se_op_set_note_offset:
    lda [sound_ptr], y          ;read the argument
    sta stream_note_offset, x      ;set the note offset.
    rts
    
se_op_adjust_note_offset:
    lda [sound_ptr], y          ;read the argument (what value to add)
    clc
    adc stream_note_offset, x   ;add it to the current offset
    sta stream_note_offset, x   ;and save.
    rts
    
se_op_transpose:
    lda [sound_ptr], y          ;read low byte of the pointer to our lookup table
    sta sound_ptr2              ;store it in a new pointer variable
    iny
    lda [sound_ptr], y          ;read high byte of pointer to table
    sta sound_ptr2+1
    
    sty sound_temp1             ;save y because we are about to destroy it
    lda stream_loop1, x         ;get loop counter, put it in Y
    tay                         ;   this will be our index into the lookup table
    dey                         ;subtract 1 because indexes start from 0.
    
    lda [sound_ptr2], y         ;read a value from the table.
    clc
    adc stream_note_offset, x   ;add it to the note offset
    sta stream_note_offset, x
    
    ldy sound_temp1             ;restore Y
    rts