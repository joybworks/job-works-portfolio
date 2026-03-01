// ── Year in footer copyright ───────────────────────────────────
const footerCopy = document.querySelector('.footer-bottom span');
if (footerCopy) {
  const year = new Date().getFullYear();
  footerCopy.textContent = footerCopy.textContent.replace('2025', year);
}
