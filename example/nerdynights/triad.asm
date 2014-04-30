    .inesprg 1 ;1x 16kb PRG code
    .ineschr 0 ;0x 8kb CHR data
    .inesmap 0 ; mapper 0 = NROM, no bank swapping
    .inesmir 1 ;background mirroring (vertical mirroring = horizontal scrolling)


;----- first 8k bank of PRG-ROM    
    .bank 0
    .org $C000
    
irq:
NMI:
    rti

RESET:
    sei
    cld
    ldx #$FF
    txs
    
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
    
    lda #$80
    sta $2000 ;enable NMIs
    
;Enable sound channels
    lda #%00000111 
    sta $4015 ;enable Square 1, Square 2 and Triangle
    
;Square 1
    lda #%00111000 ;Duty 00, Length Counter Disabled, Saw Envelopes disabled, Volume 8
    sta $4000
    lda #$C9    ;0C9 is a C# in NTSC mode
    sta $4002   ;low 8 bits of period
    lda #$00
    sta $4003   ;high 3 bits of period
    
;Square 2
    lda #%01110110  ;Duty 01, Volume 6
    sta $4004
    lda #$A9        ;$0A9 is an E in NTSC mode
    sta $4006
    lda #$00
    sta $4007

;Triangle    
    lda #$81    ;disable internal counters, channel on
    sta $4008
    lda #$42    ;$042 is a G# in NTSC mode
    sta $400A
    lda #$00
    sta $400B
    
forever:
    jmp forever
    
;----- second 8k bank of PRG-ROM    
    .bank 1
    .org $E000
;---- vectors
    .org $FFFA     ;first of the three vectors starts here
    .dw NMI        ;when an NMI happens (once per frame if enabled) the 
                   ;processor will jump to the label NMI:
    .dw RESET      ;when the processor first turns on or is reset, it will jump
                   ;to the label RESET:
    .dw irq        ;external interrupt IRQ is not used in this tutorial
    