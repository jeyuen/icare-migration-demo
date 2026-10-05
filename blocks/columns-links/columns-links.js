/**
 * Quick-link columns: each cell holds a list of links rendered as bordered rows
 * with a trailing arrow. Cells authored as plain paragraphs of links (no list)
 * are normalised into a list so both authoring styles render the same.
 * @param {Element} block
 */
function normaliseCell(cell) {
  let list = cell.querySelector('ul, ol');
  if (!list) {
    const links = [...cell.querySelectorAll('a[href]')];
    if (!links.length) return;
    list = document.createElement('ul');
    links.forEach((a) => {
      const li = document.createElement('li');
      const holder = a.closest('p') || a;
      li.append(a);
      list.append(li);
      if (holder !== a && !holder.textContent.trim()) holder.remove();
    });
    cell.append(list);
  }
  list.classList.add('columns-links-list');
  [...list.children].forEach((li) => {
    const a = li.querySelector('a[href]');
    if (!a) return;
    li.classList.add('columns-links-item');
    a.classList.remove('button', 'primary', 'secondary', 'accent');
    a.classList.add('columns-links-link');
    if (!a.querySelector('.columns-links-arrow')) {
      const arrow = document.createElement('span');
      arrow.className = 'columns-links-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      a.append(arrow);
    }
  });
}

export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const cols = firstRow ? [...firstRow.children] : [];
  block.classList.add(`columns-links-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      cell.classList.add('columns-links-col');
      normaliseCell(cell);
    });
  });
}
