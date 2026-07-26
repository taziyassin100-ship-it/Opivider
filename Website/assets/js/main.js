// Video config for the "Who we are" section. Swap this object to drop in a
// real video — no other markup needs to change.
//   YouTube:   { type: 'youtube', id: 'VIDEO_ID' }
//   Vimeo:     { type: 'vimeo', id: 'VIDEO_ID' }
//   Local mp4: { type: 'mp4', src: 'assets/video/explainer.mp4' }
const VIDEO = { type: 'placeholder' };

document.addEventListener('DOMContentLoaded', () => {
  // mobile nav
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navlinks');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }));
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  // hero mark fade-in — plays once on load
  const heroArt = document.getElementById('heroArt');
  if (heroArt) {
    if (reduceMotion) {
      heroArt.classList.add('in');
    } else {
      requestAnimationFrame(() => requestAnimationFrame(() => heroArt.classList.add('in')));
    }
  }

  // video placeholder -> real embed swap, driven by the VIDEO config above
  const playBtn = document.getElementById('videoPlayBtn');
  const frame = document.getElementById('videoFrame');
  if (playBtn && frame) {
    playBtn.addEventListener('click', () => {
      let el;
      if (VIDEO.type === 'youtube') {
        el = document.createElement('iframe');
        el.src = `https://www.youtube.com/embed/${VIDEO.id}?autoplay=1`;
        el.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
        el.allowFullscreen = true;
      } else if (VIDEO.type === 'vimeo') {
        el = document.createElement('iframe');
        el.src = `https://player.vimeo.com/video/${VIDEO.id}?autoplay=1`;
        el.allow = 'autoplay; fullscreen; picture-in-picture';
        el.allowFullscreen = true;
      } else if (VIDEO.type === 'mp4') {
        el = document.createElement('video');
        el.src = VIDEO.src;
        el.controls = true;
        el.autoplay = true;
      } else {
        return; // no real video configured yet
      }
      frame.innerHTML = '';
      frame.appendChild(el);
    });
  }
});
