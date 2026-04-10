// ── Navbar scroll behavior ─────────────────────────────────────
const navbar = document.getElementById('navbar');

function updateNavbarScrolled() {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}

window.addEventListener('scroll', updateNavbarScrolled, { passive: true });
updateNavbarScrolled();

// ── Mobile menu ────────────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

function setMobileNavOpen(isOpen) {
  navLinks.classList.toggle('open', isOpen);
  navToggle.classList.toggle('active', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

navToggle.addEventListener('click', () => {
  setMobileNavOpen(!navLinks.classList.contains('open'));
});

// Close menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    setMobileNavOpen(false);
  });
});
