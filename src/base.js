'use strict';

// ── GA4 Analytics ──────────────────────────────────────────────
function gaEvent(name, params) {
  if (typeof gtag === 'function') {
    gtag('event', name, params);
  }
}

// Section view tracking (fires once per section per page load)
const sectionViewed = new Set();
const sectionViewObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting || sectionViewed.has(entry.target.id)) return;
    sectionViewed.add(entry.target.id);
    gaEvent('view_section', { section_name: entry.target.id });
  });
}, { threshold: 0.4 });

document.querySelectorAll('section[id]').forEach((s) => sectionViewObserver.observe(s));

// Project card view tracking
document.querySelectorAll('.project-card').forEach((card) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const name = entry.target.querySelector('.project-name');
      gaEvent('view_project', { project_name: name ? name.textContent.trim() : 'unknown' });
      observer.disconnect();
    });
  }, { threshold: 0.3 });
  observer.observe(card);
});

// Link click tracking: external, mailto, tel, downloads
document.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a || !a.href) return;
  const href = a.getAttribute('href') || '';
  const text = (a.textContent || '').trim().slice(0, 100);

  if (a.hasAttribute('download') || /\.(pdf|docx?)$/i.test(href)) {
    const file = (a.getAttribute('download') || href.split('/').pop() || 'file').split('?')[0];
    gaEvent('file_download', { file_name: file, link_text: text });
    return;
  }
  if (href.startsWith('mailto:')) {
    gaEvent('contact_click', { method: 'email', link_text: text });
    return;
  }
  if (href.startsWith('tel:')) {
    gaEvent('contact_click', { method: 'phone', link_text: text });
    return;
  }
  if (href.startsWith('http') && !href.includes(window.location.hostname)) {
    const platform = href.includes('linkedin') ? 'linkedin' : href.includes('github') ? 'github' : href.includes('stackoverflow') ? 'stackoverflow' : 'external';
    gaEvent('outbound_click', { link_url: href, link_text: text, platform });
  }
});

// CTA clicks (Hire Me, View Work, nav CTAs)
document.querySelectorAll('a[href="#contact"]:not(.nav-cta), .nav-cta, a[href="#projects"].btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const label = btn.classList.contains('nav-cta') ? 'Hire Me (nav)' : btn.getAttribute('href') === '#contact' ? 'Hire Me' : 'View Work';
    gaEvent('cta_click', { cta_label: label });
  });
});

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
  /* Trigger while still approaching viewport; negative bottom was delaying reveal */
  threshold: 0,
  rootMargin: '0px 0px 12% 0px',
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
  threshold: 0,
  rootMargin: '0px 0px 10% 0px',
});

const reduceMotion = typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) {
  [...skillCards, ...projectCards].forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    const delay = Math.min(i * 0.022, 0.2);
    card.style.transition = `opacity 0.32s ease ${delay}s, transform 0.32s ease ${delay}s`;
    cardObserver.observe(card);
  });
}

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
        if (a.getAttribute('href') === `#${id}`) a.style.color = 'var(--color-accent)';
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

