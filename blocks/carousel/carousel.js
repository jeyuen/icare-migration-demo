/*
 * Carousel Block
 * Each row is one slide: [optional image cell, content cell].
 * A single-row carousel renders as a static slide with no controls.
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// No authored options yet; branch on these tokens when variations are added.
const OPTION_CLASSES = [];

const LABELS = {
  carousel: 'Carousel',
  controls: 'Carousel Slide Controls',
  prev: 'Previous Slide',
  next: 'Next Slide',
  show: 'Show Slide',
  of: 'of',
};

let carouselId = 0;

function updateActiveSlide(block, slide) {
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  block.querySelectorAll('.carousel-slide').forEach((aSlide, idx) => {
    const hidden = idx !== slideIndex;
    aSlide.setAttribute('aria-hidden', hidden);
    aSlide.querySelectorAll('a, button').forEach((el) => {
      if (hidden) el.setAttribute('tabindex', '-1');
      else el.removeAttribute('tabindex');
    });
  });

  block.querySelectorAll('.carousel-slide-indicator button').forEach((button, idx) => {
    if (idx === slideIndex) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
}

export function showSlide(block, slideIndex = 0, behavior = 'smooth') {
  const slides = block.querySelectorAll('.carousel-slide');
  if (!slides.length) return;
  let realIndex = slideIndex;
  if (slideIndex < 0) realIndex = slides.length - 1;
  if (slideIndex >= slides.length) realIndex = 0;
  const activeSlide = slides[realIndex];
  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior,
  });
}

function bindEvents(block) {
  block.querySelectorAll('.carousel-slide-indicator button').forEach((button) => {
    button.addEventListener('click', () => {
      showSlide(block, parseInt(button.parentElement.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide || 0, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide || 0, 10) + 1);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(block, entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-slide').forEach((slide) => observer.observe(slide));
}

function createSlide(row, slideIndex, id) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.id = `carousel-${id}-slide-${slideIndex}`;
  slide.classList.add('carousel-slide');

  // Identify cells by content, not position, so authors may omit the image cell.
  [...row.children].forEach((cell) => {
    const pic = cell.querySelector('picture');
    const isImageOnly = pic && !cell.textContent.trim();
    if (isImageOnly) {
      cell.classList.add('carousel-slide-image');
      const img = pic.querySelector('img');
      if (img) {
        const optimized = createOptimizedPicture(img.src, img.alt, slideIndex === 0, [{ width: '2000' }]);
        moveInstrumentation(img, optimized.querySelector('img'));
        pic.replaceWith(optimized);
      }
      slide.classList.add('has-image');
    } else {
      cell.classList.add('carousel-slide-content');
    }
    if (cell.children.length || cell.textContent.trim()) slide.append(cell);
  });

  const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading && heading.id) slide.setAttribute('aria-labelledby', heading.id);

  return slide;
}

export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  carouselId += 1;
  const id = carouselId;
  block.id = `carousel-${id}`;
  const rows = [...block.querySelectorAll(':scope > div')];
  const isSingleSlide = rows.length < 2;
  if (isSingleSlide) block.classList.add('carousel-single');

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', LABELS.carousel);

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');

  let indicators;
  if (!isSingleSlide) {
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', LABELS.controls);
    indicators = document.createElement('ol');
    indicators.classList.add('carousel-slide-indicators');
    nav.append(indicators);
    block.append(nav);

    const navButtons = document.createElement('div');
    navButtons.classList.add('carousel-navigation-buttons');
    navButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="${LABELS.prev}"></button>
      <button type="button" class="slide-next" aria-label="${LABELS.next}"></button>
    `;
    container.append(navButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, id);
    moveInstrumentation(row, slide);
    slidesWrapper.append(slide);

    if (indicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${LABELS.show} ${idx + 1} ${LABELS.of} ${rows.length}"></button>`;
      indicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    updateActiveSlide(block, slidesWrapper.firstElementChild);
    bindEvents(block);
  }
}
