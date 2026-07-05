import './style.css';
import { GenerativeEngine } from './generative.js';
import { ChaosScene } from './chaos3d.js';
import { ConstellationScene } from './constellation.js';

// One page, two faces: the chaos pane (black veil + particle text + Blender
// 3D backdrop) is always alive, clipped to the right of a boundary line that
// follows the cursor. No mode switching — order and disorder coexist.
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const header = document.querySelector('.grid-header');
  const hero = document.querySelector('.hero-section');

  // --- engines (always on) ---
  const engine = new GenerativeEngine(document.getElementById('art-canvas'));
  document.fonts.ready.then(() => engine.start());

  const chaosScene = new ChaosScene(document.getElementById('chaos3d'));
  chaosScene.start();

  // ink-on-white constellation behind the sections below the hero
  const constellation = new ConstellationScene(
    document.getElementById('constellation')
  );
  constellation.start();

  // --- cursor-driven boundary between 静 and 沌 ---
  let targetSplit = 62;
  let split = 62;

  window.addEventListener('pointermove', (e) => {
    const pct = (e.clientX / window.innerWidth) * 100;
    targetSplit = Math.min(82, Math.max(22, pct));
  });

  const tick = () => {
    split += (targetSplit - split) * 0.05;
    root.style.setProperty('--split', `${split}%`);
    chaosScene.setSplit(split);
    requestAnimationFrame(tick);
  };
  tick();

  // keep the zen header above the chaos pane; fade the pane out
  // once the hero has scrolled away so the lower sections read clean
  const onScrollOrResize = () => {
    const headerBottom = Math.max(0, header.getBoundingClientRect().bottom);
    root.style.setProperty('--veil-top', `${headerBottom}px`);
    const heroRect = hero.getBoundingClientRect();
    document.body.classList.toggle(
      'past-hero',
      heroRect.bottom < window.innerHeight * 0.35
    );
  };
  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize);
  onScrollOrResize();

  // smooth scroll for navigation links
  document.querySelectorAll('.nav-link').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetElement = document.querySelector(this.getAttribute('href'));
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
