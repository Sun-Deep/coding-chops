# Sources

The structure was checked against the specification rather than against
explanations of it.

- ISO/IEC 18004, QR Code bar code symbology specification. Section 6.3 for the
  function patterns, 6.5 for the format information, 6.6 for the codeword
  placement, and 6.5.1 for what each of the four error correction levels is
  nominally rated to recover.
- Reed and Solomon, "Polynomial Codes over Certain Finite Fields", 1960, for
  what the 44 error correction codewords are doing and why parity lets missing
  symbols be reconstructed rather than merely detected.

The symbol is produced by `qrcode` 1.5.4 and read by `jsqr` 1.4.0, two
independent implementations. The version, module count, structure map and
codeword split come from the encoder; every hole figure comes from the decoder
actually reading a damaged symbol.
