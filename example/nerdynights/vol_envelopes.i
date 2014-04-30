volume_envelopes:
    .word se_ve_1
    .word se_ve_2
    .word se_ve_3
    .word se_ve_tgl_1
    .word se_ve_tgl_2
    .word se_battlekid_loud
    .word se_battlekid_loud_long
    .word se_battlekid_soft
    .word se_battlekid_soft_long
    .word se_drum_decay
    
se_ve_1:
    .byte $0F, $0E, $0D, $0C, $09, $05, $00
    .byte $FF
se_ve_2:
    .byte $01, $01, $02, $02, $03, $03, $04, $04, $07, $07
    .byte $08, $08, $0A, $0A, $0C, $0C, $0D, $0D, $0E, $0E
    .byte $0F, $0F
    .byte $FF
se_ve_3:
    .byte $0D, $0D, $0D, $0C, $0B, $00, $00, $00, $00, $00
    .byte $00, $00, $00, $00, $06, $06, $06, $05, $04, $00
    .byte $FF
    
se_ve_tgl_1:
    .byte $0F, $0B, $09, $08, $07, $06, $00
    .byte $FF
    
se_ve_tgl_2:
    .byte $0B, $0B, $0A, $09, $08, $07, $06, $06, $06, $05
    .byte $FF
    
    
se_battlekid_loud:
    .byte $0f, $0e, $0c, $0a, $00
    .byte $FF
    
se_battlekid_loud_long:
    .byte $0f, $0e, $0c, $0a, $09
    .byte $FF
    
se_battlekid_soft:
    .byte $09, $08, $06, $04, $00
    .byte $FF
    
se_battlekid_soft_long:
    .byte $09, $08, $06, $04, $03
    .byte $FF
    
se_drum_decay:
    .byte $0E, $09, $08, $06, $04, $03, $02, $01, $00
    .byte $FF
    
ve_short_staccato = $00
ve_fade_in = $01
ve_blip_echo = $02
ve_tgl_1 = $03
ve_tgl_2 = $04
ve_battlekid_1 = $05
ve_battlekid_1b = $06
ve_battlekid_2 = $07
ve_battlekid_2b = $08
ve_drum_decay = $09
