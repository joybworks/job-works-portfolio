// ── Contact form (Web3Forms) ───────────────────────────────────
const WEB3FORMS_ACCESS_KEY = 'f12ffb68-2b1a-44ba-aa8a-387160ff8ec5';
const WEB3FORMS_SUBMIT_URL = 'https://api.web3forms.com/submit';

const contactForm = document.getElementById('contactForm');
const submitBtn = contactForm.querySelector('button[type="submit"]');

contactForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    showFormFeedback('Please fill in all required fields.', 'error');
    return;
  }

  const btnText = submitBtn.querySelector('.btn-text');
  const originalText = btnText ? btnText.textContent : 'Send Message';
  submitBtn.classList.add('is-loading');
  if (btnText) btnText.textContent = 'Sending...';
  submitBtn.disabled = true;

  const combinedMessage = subject ? `${subject}\n\n${message}` : message;

  try {
    const formData = new FormData(contactForm);
    formData.set('message', combinedMessage);
    formData.append('access_key', WEB3FORMS_ACCESS_KEY);

    const response = await fetch(WEB3FORMS_SUBMIT_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showFormFeedback('Your message has been sent. I\'ll get back to you soon.', 'success');
      contactForm.reset();
    } else {
      fallbackToMailto(name, email, subject, message);
    }
  } catch (err) {
    fallbackToMailto(name, email, subject, message);
  } finally {
    submitBtn.classList.remove('is-loading');
    if (btnText) btnText.textContent = originalText;
    submitBtn.disabled = false;
  }
});

function fallbackToMailto(name, email, subject, message) {
  const mailtoSubject = encodeURIComponent(subject || `Enquiry from ${name}`);
  const mailtoBody = encodeURIComponent(
    `Hello JoyB Works,\n\nMy name is ${name} and I'd like to get in touch.\n\n${message}\n\nBest regards,\n${name}\n${email}`
  );
  window.location.href = `mailto:hello@joyb.works?subject=${mailtoSubject}&body=${mailtoBody}`;
  showFormFeedback('Opening your email client...', 'success');
}

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
  setTimeout(() => {
    try {
      el.remove();
    } catch (err) {
      console.error('Error removing form feedback:', err);
    }
  }, 5000);
}
