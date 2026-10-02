(() => {
  const banner = document.querySelector('[data-banner]');
  if (!banner) return;

  const slides = [...banner.querySelectorAll('[data-slide-index]')];
  const intervalMs = 2000;
  let currentIndex = 0;
  let timer;

  const showSlide = (nextIndex) => {
    currentIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      const active = index === currentIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
  };

  const start = () => {
    clearInterval(timer);
    timer = setInterval(() => showSlide(currentIndex + 1), intervalMs);
  };

  banner.addEventListener('mouseenter', () => clearInterval(timer));
  banner.addEventListener('mouseleave', start);
  banner.addEventListener('focusin', () => clearInterval(timer));
  banner.addEventListener('focusout', start);
  showSlide(0);
  start();
})();
