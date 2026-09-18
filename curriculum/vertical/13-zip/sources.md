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

The encoder itself is Node's `node:zlib`, which is zlib. It is not a
reimplementation and the reel's byte counts are its output.
