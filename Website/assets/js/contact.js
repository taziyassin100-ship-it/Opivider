// Point this at your form backend (Formspree, a serverless function, etc).
// Leave empty to simulate a successful submission so the flow can be
// demoed end-to-end before a backend exists.
const FORM_ENDPOINT = '';

document.addEventListener('DOMContentLoaded', () => {
  // custom country dropdown — always opens downward (a native <select>
  // popup can flip upward when there isn't room below it)
  const countryShell = document.getElementById('countryShell');
  const countryTrigger = document.getElementById('countryTrigger');
  const countryList = document.getElementById('countryList');
  const countryValueEl = document.getElementById('countryValue');
  const countryInput = document.getElementById('country');

  if (countryShell && countryTrigger && countryList && countryInput) {
    const options = Array.from(countryList.querySelectorAll('li'));

    const closeList = () => {
      countryList.hidden = true;
      countryShell.dataset.open = 'false';
      countryTrigger.setAttribute('aria-expanded', 'false');
    };

    const openList = () => {
      countryList.hidden = false;
      countryShell.dataset.open = 'true';
      countryTrigger.setAttribute('aria-expanded', 'true');
      const active = countryList.querySelector('li[aria-selected="true"]') || options[0];
      if (active) active.focus();
    };

    const selectCountry = (li) => {
      options.forEach((o) => o.removeAttribute('aria-selected'));
      li.setAttribute('aria-selected', 'true');
      countryValueEl.textContent = li.textContent;
      countryValueEl.removeAttribute('data-empty');
      countryInput.value = li.dataset.value;
      countryInput.dispatchEvent(new Event('input', { bubbles: true }));
      closeList();
      countryTrigger.focus();
    };

    countryTrigger.addEventListener('click', () => {
      if (countryList.hidden) openList(); else closeList();
    });

    options.forEach((li, idx) => {
      li.addEventListener('click', () => selectCountry(li));
      li.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectCountry(li);
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          (options[idx + 1] || options[0]).focus();
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          (options[idx - 1] || options[options.length - 1]).focus();
        } else if (event.key === 'Escape') {
          closeList();
          countryTrigger.focus();
        } else if (event.key === 'Tab') {
          closeList();
        }
      });
    });

    document.addEventListener('click', (event) => {
      if (!countryShell.contains(event.target)) closeList();
    });
    countryTrigger.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeList();
    });
  }

  const form = document.getElementById('contactForm');
  if (!form) return;

  const successPanel = document.getElementById('successPanel');
  const formHead = document.querySelector('.contact-card > .head');
  const formError = document.getElementById('formError');
  const submitBtn = document.getElementById('submitBtn');

  const fields = {
    fullName: {
      input: document.getElementById('fullName'),
      wrap: document.getElementById('fieldFullName'),
      validate: (v) => v.trim().length > 0,
    },
    country: {
      input: document.getElementById('country'),
      wrap: document.getElementById('fieldCountry'),
      validate: (v) => v.trim().length > 0,
    },
    socialLinks: {
      input: document.getElementById('socialLinks'),
      wrap: document.getElementById('fieldSocial'),
      validate: (v) => splitLinks(v).length > 0,
    },
    audience: {
      input: document.getElementById('audience'),
      wrap: document.getElementById('fieldAudience'),
      validate: (v) => v.trim().length >= 10,
    },
    email: {
      input: document.getElementById('email'),
      wrap: document.getElementById('fieldEmail'),
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    },
  };

  function splitLinks(value) {
    return value.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  }

  function validateField(key) {
    const field = fields[key];
    const ok = field.validate(field.input.value);
    field.wrap.classList.toggle('has-error', !ok);
    return ok;
  }

  Object.keys(fields).forEach((key) => {
    const { input, wrap } = fields[key];
    input.addEventListener('blur', () => validateField(key));
    input.addEventListener('input', () => {
      if (wrap.classList.contains('has-error')) validateField(key);
    });
  });

  function showSuccess() {
    form.classList.add('hide');
    if (formHead) formHead.classList.add('hide');
    successPanel.classList.add('show');
  }

  function submitApplication(payload) {
    if (!FORM_ENDPOINT) {
      return new Promise((resolve) => setTimeout(resolve, 600));
    }
    return fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((res) => {
      if (!res.ok) throw new Error('Request failed');
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    formError.classList.remove('show');

    const allValid = Object.keys(fields)
      .map(validateField)
      .every(Boolean);

    if (!allValid) {
      const firstInvalidKey = Object.keys(fields).find((key) => fields[key].wrap.classList.contains('has-error'));
      if (firstInvalidKey) fields[firstInvalidKey].input.focus();
      return;
    }

    // Honeypot: real visitors never fill this hidden field. If it's
    // populated, treat it as spam — accept silently without submitting.
    const honeypot = document.getElementById('company');
    if (honeypot && honeypot.value.trim() !== '') {
      showSuccess();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    const payload = {
      fullName: fields.fullName.input.value.trim(),
      country: fields.country.input.value.trim(),
      socialLinks: splitLinks(fields.socialLinks.input.value),
      audience: fields.audience.input.value.trim(),
      email: fields.email.input.value.trim(),
    };

    try {
      await submitApplication(payload);
      showSuccess();
    } catch (err) {
      formError.classList.add('show');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit application';
    }
  });
});
