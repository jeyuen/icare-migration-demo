/*
 * Accordion Block
 * Each row is one collapsible item: [label cell (optional icon + title), body cell].
 * Renders as native <details>/<summary> for built-in keyboard and screen reader support.
 */

import { createOptimizedPicture, decorateIcons } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// Authored options. "explainer" is styling-only (grey highlighted panel, see accordion.css).
const OPTION_CLASSES = ['explainer'];

function buildLabel(labelCell) {
  const summary = document.createElement('summary');
  summary.className = 'accordion-item-label';

  // The summary is a plain-text field, so an icon may also be authored as a leading
  // ":icon-name:" token (e.g. ":location: Need a mailing address?").
  const token = labelCell.querySelector('span.icon, img, picture') ? null : labelCell.textContent.match(/^\s*:([a-z0-9-]+):\s*/);
  if (token) {
    const walker = document.createTreeWalker(labelCell, NodeFilter.SHOW_TEXT);
    const first = walker.nextNode();
    if (first) first.textContent = first.textContent.replace(/^\s*:[a-z0-9-]+:\s*/, '');
    const span = document.createElement('span');
    span.className = `icon icon-${token[1]}`;
    labelCell.prepend(span);
    decorateIcons(labelCell);
  }

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
