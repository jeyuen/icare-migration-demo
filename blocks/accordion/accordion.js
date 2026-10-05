/*
 * Accordion Block
 * Each row is one collapsible item: [label cell (optional icon + title), body cell].
 * Renders as native <details>/<summary> for built-in keyboard and screen reader support.
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// No authored options yet; branch on these tokens when variations are added.
const OPTION_CLASSES = [];

function buildLabel(labelCell) {
  const summary = document.createElement('summary');
  summary.className = 'accordion-item-label';

  // Optional leading icon: a picture/img or an EDS icon span authored in the label cell.
  const iconSource = labelCell.querySelector('picture, img, span.icon');
  if (iconSource) {
    const icon = document.createElement('span');
    icon.className = 'accordion-item-icon';
    icon.setAttribute('aria-hidden', 'true');
    const parent = iconSource.parentElement;
    const img = iconSource.tagName === 'SPAN' ? null : iconSource.querySelector('img') || iconSource;
    if (img) {
      icon.append(createOptimizedPicture(img.src, '', false, [{ width: '64' }]));
      iconSource.remove();
    } else {
      icon.append(iconSource);
    }
    // Drop the wrapper paragraph if the icon was its only content.
    if (parent && parent !== labelCell && parent.tagName === 'P' && !parent.textContent.trim() && !parent.children.length) {
      parent.remove();
    }
    summary.append(icon);
  }

  const title = document.createElement('span');
  title.className = 'accordion-item-title';
  // Unwrap paragraphs so the title is inline phrasing content inside <summary>.
  [...labelCell.childNodes].forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'P') {
      title.append(...node.childNodes);
    } else {
      title.append(node);
    }
  });
  summary.append(title);
  return summary;
}

export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  [...block.children].forEach((row) => {
    const [labelCell, bodyCell] = row.children;
    if (!labelCell) {
      row.remove();
      return;
    }

    const summary = buildLabel(labelCell);

    const body = bodyCell || document.createElement('div');
    body.className = 'accordion-item-body';

    const details = document.createElement('details');
    moveInstrumentation(row, details);
    details.className = 'accordion-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
