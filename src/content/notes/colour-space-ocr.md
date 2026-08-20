---
title: The bug was in the colour space, not the parser
summary: Colour-coded cells in a schedule image stop matching your constants the moment the image goes through a messenger. CIE-Lab survives what RGB does not.
published: 2026-08-20
tags: [computer-vision, ocr, production]
draft: false
---

A schedule arrives as an image. Each cell is colour-coded — one colour per shift type — so reading
the schedule means reading the colours. The first version did the obvious thing: sample the pixel,
compare the RGB triple against a table of known colours, take the nearest one.

It worked on the files we tested with. It fell apart on the files users actually sent.

## What breaks

Nobody sends the original export. They screenshot it, forward it through a messenger, and the
messenger re-encodes it. JPEG quantisation shifts values, chroma subsampling smears the boundary
between adjacent cells, and a second forward compounds both. A colour that left as `#F4B183` can
arrive as `#F2B57F` — invisible to a human, three channels off for a table lookup.

You can widen the tolerance, and that is where the trap closes: widen it enough to absorb the
drift, and two of the palette's colours start claiming the same pixels. Narrow it enough to keep
them apart, and half the real cells match nothing.

## Why RGB is the wrong ruler

RGB distance measures how far apart two colours are _as numbers_, not how different they look. The
same numeric distance is a barely visible shift in one part of the space and an obvious change in
another. So "nearest colour in RGB" answers a question nobody asked.

CIE-Lab was designed for the question we actually have. It is built so that Euclidean distance
between two colours approximates how different they look to a human eye. Compression artefacts are
tuned — deliberately — to stay below human perception, which means they also stay small in Lab.
The distortion RGB reports as a large numeric jump is, in Lab, a small one.

The change was mechanical: convert both the sample and the palette to Lab, classify by nearest
neighbour there, keep a rejection threshold so an unknown colour stays unknown instead of being
forced into the palette.

## Finding the cells in the first place

Colour classification only matters once you know where a cell is. Grid detection here is
morphological rather than model-based: erode along one axis with a long thin kernel to leave only
horizontal runs, repeat along the other axis for vertical runs, intersect the two to get line
candidates, then cluster the coordinates to collapse a three-pixel-thick line into one index.

It is unglamorous and it has a property no learned detector gave us for free: when it fails, it
fails visibly and locally — one missing line, not a plausible-looking grid shifted by a row.

## The general lesson

When a pipeline is flaky and the logic reads correctly, the bug is usually in a representation
nobody is looking at: the colour space, the encoding, the timezone, the locale, the collation. The
code was never wrong. It was measuring the right thing with the wrong ruler.

That parser now runs against real user uploads on a Telegram bot, where every input has been
through at least one round of recompression before it arrives.
