# Sources

The mechanism was checked against the specification rather than against
explanations of it.

- RFC 1951, DEFLATE Compressed Data Format Specification version 1.3. Section 4
  carries the matching rules the parse implements: the minimum match of 3, the
  maximum of 258, and the 32K window.
- RFC 1952, GZIP File Format Specification version 4.3, for what the gzip header
  and trailer add on top of a raw DEFLATE stream. This is why the script reports
  195 bytes for gzip and 177 for the raw stream, and why the reel uses the raw
  number and says which it is.
- zlib manual, `deflateInit2` and the `strategy` argument, for what
  `Z_HUFFMAN_ONLY` actually switches off.
- Ziv and Lempel, "A Universal Algorithm for Sequential Data Compression", IEEE
  Transactions on Information Theory, 1977, for the original of the sliding
  window and why a match may overlap its own source.

- APPNOTE.TXT, the ZIP File Format Specification, sections 4.3 and 4.4, for the
  local file header, the central directory and the end-of-central-directory
  record. This is where the archive's 308 bytes of structure come from, and why
  the bar steps up when a new member begins.

The archive is built by Info-ZIP 3.0, the `zip` on this machine, and the reel's
archive sizes are its output. The per-member curves come from Node's
`node:zlib`, which is zlib, and the script asserts the two agree on the finished
size of every member rather than assuming it.
