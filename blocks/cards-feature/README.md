# cards-feature

Custom **cards** block. Purpose: cards-feature — grid of borderless feature cards, each a landscape image above a heading, short description and arrow call-to-action link; the whole card is clickable via that link.

## Authoring (Document Authoring)

Model: `collection`

Repeating rows — one row per item. Each item: 2 cells — cell 1: image (landscape picture); cell 2: rich text with an h3 heading, a description paragraph, and a paragraph containing one link (the card's call to action; its text is the link label).

## Supported variations

No variations.

## Universal Editor fields

- Content fields derived from the block's decorate contract.
- A separate `-item` model defines one repeated item.
