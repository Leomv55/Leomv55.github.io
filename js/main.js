/**
 * main.js — Portfolio baseline JS
 * Mobile nav toggle. No framework, no build step.
 */

document.addEventListener('DOMContentLoaded', function () {

  // ── Mobile nav toggle ──────────────────────────────────────────────────
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks  = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close nav when a link is clicked (mobile)
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── Project card expand/collapse ────────────────────────────────────────
  document.querySelectorAll('.project-card__expand').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const card   = btn.closest('.project-card');
      const detail = card.querySelector('.project-card__detail');
      if (!detail) return;

      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isExpanded));
      btn.textContent = isExpanded ? 'View case study' : 'Close';

      if (isExpanded) {
        detail.hidden = true;
      } else {
        detail.hidden = false;
      }
    });
  });

  // ── Terminal skip button ────────────────────────────────────────────────
  const skipBtn = document.getElementById('terminal-skip');
  if (skipBtn) {
    skipBtn.addEventListener('click', function () {
      const projects = document.getElementById('projects');
      if (projects) {
        projects.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ── Chat toggle placeholder ─────────────────────────────────────────────
  // llm.js will override this handler when loaded
  const chatToggle = document.getElementById('chat-toggle');
  if (chatToggle && !window.__llmLoaded) {
    chatToggle.addEventListener('click', function () {
      // Placeholder — llm.js replaces this
      console.log('[chat] llm.js not yet loaded');
    });
  }

});
