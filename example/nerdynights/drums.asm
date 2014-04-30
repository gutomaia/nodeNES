    .inesprg 2 ;2x 16kb PRG code
    .ineschr 1 ;1x 8kb CHR data
    .inesmap 0 ; mapper 0 = NROM, no bank swapping
    .inesmir 1 ;background mirroring (vertical mirroring = horizontal scrolling)

    .rsset $0000
joypad1 .rs 1           ;button states for the current frame
joypad1_old .rs 1       ;last frame's button states
joypad1_pressed .rs 1   ;current frame's off_to_on transitions
sleeping .rs 1          ;main program sets this and waits for the NMI to clear it.  Ensures the main program is run only once per frame.  
                        ;   for more information, see Disch's document: http://nesdevhandbook.googlepages.com/theframe.html
needdraw .rs 1          ;drawing flag.
dbuffer_index .rs 1     ;current position in the drawing buffer
ptr1 .rs 2              ;a pointer
sound_ptr .rs 2
sound_ptr2 .rs 2
current_song .rs 1
    
;----- first 8k bank of PRG-ROM
    .bank 0
    .org $8000  ;we have two 16k PRG banks now.  We will stick our sound engine in the first one, which starts at $8000.
    
    .include "sound_engine.asm"

;----- second 8k bank of PRG-ROM    
    .bank 1
    .org $A000
    
;----- third 8k bank of PRG-ROM    
    .bank 2
    .org $C000
    
irq:
    rti
NMI:
    pha     ;save registers
    txa
    pha
    tya
    pha
    
    ;do sprite DMA
    ;update palettes if needed
    ;draw stuff on the screen
    
    lda needdraw
    beq .drawing_done   ;if drawing flag is clear, skip drawing
    lda $2002           ;else, draw
    jsr draw_dbuffer
    lda #$00            ;finished drawing, so clear drawing flag
    sta needdraw
    
.drawing_done:    
    lda #$00
    sta $2005
    sta $2005   ;set scroll
    
    jsr sound_play_frame    ;run our sound engine after all drawing code is done.
                            ;this ensures our sound engine gets run once per frame.
                            
    lda #$00
    sta sleeping            ;wake up the main program
    
    pla     ;restore registers
    tay
    pla
    tax
    pla
    rti

RESET:
    sei
    cld
    ldx #$FF
    txs
    inx
    
vblankwait1:
    bit $2002
    bpl vblankwait1
    
clearmem:
    lda #$00
    sta $0000, x
    sta $0100, x
    sta $0300, x
    sta $0400, x
    sta $0500, x
    sta $0600, x
    sta $0700, x
    lda #$FE
    sta $0200, x
    inx
    bne clearmem
    
 vblankwait2:
    bit $2002
    bpl vblankwait2
    
;set a couple palette colors.  This demo only uses two
    lda $2002   ;reset PPU HI/LO latch
    
    lda #$3F
    sta $2006
    lda #$00
    sta $2006   ;palette data starts at $3F00
    
    lda #$0F    ;black
    sta $2007
    lda #$30    ;white
    sta $2007
    
    jsr draw_background
    
;Enable sound channels
    jsr sound_init
    
    lda #$01
    sta current_song
    ;jsr sound_load
    
    lda #$88
    sta $2000   ;enable NMIs
    lda #$18
    sta $2001   ;turn PPU on

forever:
    inc sleeping ;go to sleep (wait for NMI).
.loop:
    lda sleeping
    bne .loop ;wait for NMI to clear the sleeping flag and wake us up
    
    ;when NMI wakes us up, handle input, fill the drawing buffer and go back to sleep
    jsr read_joypad
    jsr handle_input
    jsr prepare_dbuffer
    jmp forever ;go back to sleep
    
    
;----------------------------
; read_joypad will capture the current button state and store it in joypad1.  
;       Off-to-on transitions will be stored in joypad1_pressed
read_joypad:
    lda joypad1
    sta joypad1_old ;save last frame's joypad button states
    
    lda #$01
    sta $4016
    lda #$00
    sta $4016
    
    ldx #$08
.loop:    
    lda $4016
    lsr a
    rol joypad1  ;A, B, select, start, up, down, left, right
    dex
    bne .loop
    
    lda joypad1_old ;what was pressed last frame.  EOR to flip all the bits to find ...
    eor #$FF    ;what was not pressed last frame
    and joypad1 ;what is pressed this frame
    sta joypad1_pressed ;stores off-to-on transitions
    
    rts

;---------------------
; handle_input will perform actions based on input:
;   up - play current song
;   down - stop playing the song
;   left - cycle down a song
;   right - cycle up a song
handle_input:
    lda joypad1_pressed
    and #$0F ;check d-pad only
    beq .done
.check_up:
    and #$08 ;up
    beq .check_down
    lda current_song
    jsr sound_load
.check_down:
    lda joypad1_pressed
    and #$04 ;down
    beq .check_left
    lda #$00
    jsr sound_load
.check_left:
    lda joypad1_pressed
    and #$02 ;left
    beq .check_right
    jsr song_down
.check_right:
    lda joypad1_pressed
    and #$01 ;right
    beq .done
    jsr song_up    
.done:
    rts

;--------------------
; song_down will move selection down a song.  Song 1 wraps around to last song
song_down:
    dec current_song
    lda current_song
    bne .done
    lda #NUM_SONGS-1    ;last song.  We wrapped from Song 1
    sta current_song
.done:
    rts
    
;----------------------
; song_up will move selection up a song.  Last song will wrap to song 1   
song_up:
    inc current_song
    lda current_song
    cmp #NUM_SONGS          ;did we move past the last song?
    bne .done           ;if not, no problem
    lda #$01            ;but if we did, wrap around to song 1
    sta current_song
.done:
    rts
    
;-------------------------------
; prepare_dbuffer fills the drawing buffer with the text strings we need 
prepare_dbuffer:    
    ;write either "playing" or "not playing" to the dbuffer
    lda stream_status
    ora stream_status+1
    ora stream_status+2
    ora stream_status+3
    ora stream_status+4
    ora stream_status+5
    and #$01
    beq .sound_not_playing  ;if all streams disabled, write "NOT PLAYING" on the screen
    lda sound_disable_flag
    bne .sound_not_playing  ;if the disable flag is set, we want to write "NOT PLAYING" too
.sound_playing:
    lda #LOW(text_playing)  ;set ptr1 to point to beginning of text string
    sta ptr1
    lda #HIGH(text_playing)
    sta ptr1+1
    jmp .dbuffer
.sound_not_playing:
    lda #LOW(text_not_playing)
    sta ptr1
    lda #HIGH(text_not_playing)
    sta ptr1+1
.dbuffer:
    lda #$21    ;target PPU address.  add_to_dbuffer expects the HI byte in A and the LO byte in Y
    ldy #$0B
    jsr add_to_dbuffer
    
    jsr song_num_to_dbuffer
    
    lda #$01
    sta needdraw    ;set drawing flag so the NMI knows to draw
    
    rts

;-------------------------
; add_to_dbuffer will convert a text string into a dbuffer string and add it to the drawing buffer.
;   add_to_dbuffer expects:
;       HI byte of the target PPU address in A, 
;       LO byte of the target PPU address in Y
;       pointer to the source text string in ptr1
;   dbuffer string format:
;       byte 0: length of data (ie, length of the text string)
;       byte 1-2: target PPU address (HI byte first)
;       byte 3-n: bytes to copy
;   Note:   dbuffer starts at $0100.  This is the stack page.  The
;               stack counts backwards from $1FF, and this program is small enough that there
;               will never be a conflcit.  But for larger programs, watch out.
add_to_dbuffer:
    ldx dbuffer_index
    sta $0101, x    ;write target PPU address to dbuffer
    tya
    sta $0102, x
    
    ldy #$00
.loop:
    lda [ptr1], y
    cmp #$FF
    beq .done
    sta $0103, x    ;copy the text string to dbuffer,
    iny
    inx
    bne .loop
.done:
    ldx dbuffer_index
    tya
    sta $0100, x        ;store string length at the beginning of the string header
    
    clc
    adc dbuffer_index
    adc #$03        
    sta dbuffer_index   ;update buffer index.  new index = old index + 3-byte header + string length
    
    tax
    lda #$00
    sta $0100, x        ;stick a 0 on the end to terminate dbuffer.
    rts

;----------------------------------------------
; song_num_to_dbuffer tells the drawing buffer to write the currently selected song number on the screen.
song_num_to_dbuffer:
    ldx dbuffer_index
    lda #$01        ;write one byte
    sta $0100, x
    lda #$21        ;destination PPU $214A
    sta $0101, x
    lda #$4A
    sta $0102, x
    lda current_song ;which byte to write
    sta $0103, x
    lda #$00         ;terminate the dbuffer with 0
    sta $0104,x
    txa              ;update our index
    clc
    adc #$04
    sta dbuffer_index
    rts
    
;------------------------
; draw_dbuffer will write the contents of the drawing buffer to the PPU
;       dbuffer is made up of a series of drawing strings.  dbuffer is 0-terminated.
;       See add_to_dbuffer for drawing string format.
draw_dbuffer:
    ldy #$00
.header_loop:
    lda $0100, y
    beq .done       ;if 0, we are at the end of the dbuffer, so quit
    tax             ;else this is how many bytes we want to copy to the PPU
    iny
    lda $0100, y    ;set the target PPU address
    sta $2006
    iny
    lda $0100, y
    sta $2006
    iny
.copy_loop:
    lda $0100, y    ;copy the contents of the drawing string to PPU
    sta $2007
    iny
    dex
    bne .copy_loop
    beq .header_loop    ;when we finish copying, see if there is another drawing string.    
.done:
    ldy #$00
    sty dbuffer_index   ;reset index and "empty" the dbuffer by sticking a zero in the first position
    sty $0100
    rts

;----------------------------
; draw_background will draw some background strings on the screen
;   this hard-coded routine is called only once in RESET
draw_background:

    lda #$21
    sta $2006
    lda #$04
    sta $2006
    ldy #$00
.loop:
    lda text_sound, y
    bmi .sound_done
    sta $2007
    iny
    bne .loop
.sound_done:
    lda #$21
    sta $2006
    lda #$44
    sta $2006
    ldy #$00
.loop2:
    lda text_song, y
    bmi .done
    sta $2007
    iny
    bne .loop2
.done:
    rts
    
;----- fourth 8k bank of PRG-ROM    
    .bank 3
    .org $E000

;these are our text strings.  They are all terminated by $FF

text_song:
    .byte $22, $1E, $1D, $16, $0D, $FF ;"SONG:"
    
text_sound:
    .byte $22, $1E, $24, $1D, $13, $0D, $FF ;"SOUND:"
text_not_playing:
    .byte $1D, $1E, $23, $00 ;"NOT "
text_playing:
    .byte $1F, $1B, $10, $28, $18, $1D, $16, $00, $00, $00, $00, $FF ;"PLAYING    "

    
;---- vectors
    .org $FFFA     ;first of the three vectors starts here
    .dw NMI        ;when an NMI happens (once per frame if enabled) the 
                   ;processor will jump to the label NMI:
    .dw RESET      ;when the processor first turns on or is reset, it will jump
                   ;to the label RESET:
    .dw irq        ;external interrupt IRQ is not used in this tutorial
    
    .bank 4
    .org $0000
    .incbin "drums.chr"