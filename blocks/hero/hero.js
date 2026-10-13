/**
 * Hero: [background image] row + [text] row (h1, intro paragraph, optional CTA).
 * Rows are tagged by content rather than position so an author omitting the
 * image (or reordering rows) still renders correctly.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  let hasImage = false;
  let hasContent = false;

  rows.forEach((row) => {
    const onlyPicture = row.querySelector('picture') && row.textContent.trim() === '';
    if (onlyPicture) {
      row.classList.add('hero-image');
      hasImage = true;
    } else if (!row.textContent.trim()) {
      // empty row (e.g. unset image/text field) — kept for UE instrumentation, hidden via CSS
      row.classList.add('hero-empty');
    } else {
      row.classList.add('hero-content');
      hasContent = true;
    }
  });

  if (!hasImage) block.classList.add('no-image');
  // image-only: a plain photo banner with no copy (text field left empty)
  else if (!hasContent) block.classList.add('image-only');
}
