;note length constants (aliases)
thirtysecond = $80
sixteenth = $81
eighth = $82
quarter = $83
half = $84
whole = $85
d_sixteenth = $86
d_eighth = $87
d_quarter = $88
d_half = $89
d_whole = $8A   ;don't forget we are counting in hex
t_quarter = $8B
five_eighths =$8C
five_sixteenths=$8D

note_length_table:
    .byte $01   ;32nd note
    .byte $02   ;16th note
    .byte $04   ;8th note
    .byte $08   ;quarter note
    .byte $10   ;half note
    .byte $20   ;whole note
              ;---dotted notes
    .byte $03   ;dotted 16th note
    .byte $06   ;dotted 8th note
    .byte $0C   ;dotted quarter note
    .byte $18   ;dotted half note
    .byte $30   ;dotted whole note?
              ;---other
    .byte $07   ;modified quarter to fit after d_sixteenth triplets
    .byte $14   ;2 quarters plus an 8th
    .byte $0A