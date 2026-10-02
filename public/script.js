(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.header');

  const setMotion = (pause) => {
    window.dispatchEvent(new CustomEvent('msf-motion', { detail: { paused: pause } }));
    root.classList.toggle('motion-paused', pause);
  };
  setMotion(reducedMotion.matches);
  reducedMotion.addEventListener('change', (event) => setMotion(event.matches));

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
    root.classList.add('js-motion');
  }

  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 15);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  document.querySelectorAll('.values details').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      document.querySelectorAll('.values details').forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
})();
