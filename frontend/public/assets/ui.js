(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setNavState() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 12);
  }

  function revealOnScroll() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
      observer.observe(item);
    });
  }

  function animateNumber(el, nextValue) {
    if (!el || prefersReducedMotion) {
      if (el) el.textContent = nextValue;
      return;
    }

    const target = Number(String(nextValue).replace(/[^\d]/g, ''));
    if (!Number.isFinite(target)) {
      el.textContent = nextValue;
      return;
    }

    const current = Number(String(el.textContent).replace(/[^\d]/g, '')) || 0;
    const start = performance.now();
    const duration = 700;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(current + (target - current) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function watchCounter(id) {
    const el = document.getElementById(id);
    if (!el) return;
    let lastValue = el.textContent;

    const observer = new MutationObserver(() => {
      const nextValue = el.textContent;
      if (nextValue === lastValue || nextValue === '—') return;
      lastValue = nextValue;
      animateNumber(el, nextValue);
    });

    observer.observe(el, { childList: true });
  }

  window.addEventListener('scroll', setNavState, { passive: true });
  window.addEventListener('DOMContentLoaded', () => {
    setNavState();
    revealOnScroll();
    ['stat-total', 'stat-downloads', 'stat-users', 'hero-total', 'hero-downloads', 'hero-users', 'a-total', 'a-pending', 'a-users'].forEach(watchCounter);
  });
})();
