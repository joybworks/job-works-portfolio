// ── Contact form (mailto fallback) ────────────────────────────
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    showFormFeedback('Please fill in all required fields.', 'error');
    return;
  }

  const mailtoSubject = encodeURIComponent(subject || `Portfolio Enquiry from ${name}`);
  const mailtoBody = encodeURIComponent(
    `Hi Joy,\n\nMy name is ${name} and I'd like to get in touch.\n\n${message}\n\nBest regards,\n${name}\n${email}`
  );
  window.location.href = `mailto:me@joyb.works?subject=${mailtoSubject}&body=${mailtoBody}`;

  showFormFeedback('Opening your email client...', 'success');
  contactForm.reset();
});

function showFormFeedback(msg, type) {
  const existing = contactForm.querySelector('.form-feedback');
  if (existing) existing.remove();

  const el = document.createElement('p');
  el.className = `form-feedback form-feedback--${type}`;
  el.textContent = msg;
  el.style.cssText = `
    margin-top: 12px;
    font-size: 0.88rem;
    text-align: center;
    color: ${type === 'success' ? '#1DCE64' : '#EF4040'};
    padding: 10px;
    border-radius: 8px;
    background: ${type === 'success' ? '#1dce6414' : '#ef404014'};
    border: 1px solid ${type === 'success' ? '#1dce6440' : '#ef404040'};
  `;
  contactForm.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}
