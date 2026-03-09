'use strict';

// ── Scroll-reveal animations ───────────────────────────────────
const animatedEls = document.querySelectorAll('[data-animate]');
const skillCards = document.querySelectorAll('.skill-card');
const projectCards = document.querySelectorAll('.project-card');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -60px 0px'
});

animatedEls.forEach(el => revealObserver.observe(el));

// Skill and project cards — staggered reveal
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

[...skillCards, ...projectCards].forEach((card, i) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(24px)';
  card.style.transition = `opacity 0.5s ease ${i * 0.04}s, transform 0.5s ease ${i * 0.04}s`;
  cardObserver.observe(card);
});

// ── Lazy load skill images ─────────────────────────────────────
if ('loading' in HTMLImageElement.prototype) {
  document.querySelectorAll('.skill-card img').forEach(img => {
    img.loading = 'lazy';
  });
}

// ── Active nav link on scroll ──────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-links a:not(.nav-cta)');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinkEls.forEach(a => {
        a.style.color = '';
        if (a.getAttribute('href') === `#${id}`) a.style.color = '#fff';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ── Smooth scroll for anchor links ────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Dropdown (reusable) ───────────────────────────────────────
function initDropdown(container) {
  const root = typeof container === 'string' ? document.querySelector(container) : container;
  if (!root) return;
  root.querySelectorAll('.btn-dropdown').forEach((dropdown) => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const menu = dropdown.querySelector('.dropdown-menu');
    if (!trigger || !menu) return;
    const close = () => {
      dropdown.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    };
    const toggle = () => {
      const isOpen = dropdown.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', isOpen);
    };
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) close();
    });
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => close());
    });
  });
}
