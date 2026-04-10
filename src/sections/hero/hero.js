// ── Hero: cursor glow ───────────────────────────────────────────
const hero = document.querySelector('.hero');
if (hero && window.matchMedia('(hover: hover)').matches) {
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
    hero.style.setProperty('--mx', `${x}%`);
    hero.style.setProperty('--my', `${y}%`);
  }, { passive: true });
}

// ── Hero: init download dropdown in context ─────────────────────
initDropdown('.hero');


function randomHexColor() {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
}

/** Sets --color-primary and --color-accent to two random hex colors (playground / dev). */
function randomThemeGenerator(mode) {
  const original = ['#ef4040', '#c21292'];
  const random = [randomHexColor(), randomHexColor()];
  const next = mode ? random : original;
  document.documentElement.style.setProperty('--color-primary', next[0]);
  document.documentElement.style.setProperty('--color-accent', next[1]);
}

let randomThemeInterval = null;
let randomThemeSelectedMode = false;
function runRandomThemeGenerator(mode) {
  if (!mode) {
    if (randomThemeInterval) {
      clearInterval(randomThemeInterval);
      randomThemeInterval = null;
    }
    if (!randomThemeSelectedMode) {
      randomThemeGenerator(false);
    }
    return;
  }
  if (randomThemeInterval) return;
  randomThemeInterval = setInterval(() => {
    randomThemeGenerator(true);
  }, 1000);
}

const badgeArch = document.querySelector('.hero .badge-arch .badge-icon');
if (badgeArch) {
  badgeArch.addEventListener('pointerenter', () => runRandomThemeGenerator(true));
  badgeArch.addEventListener('pointerleave', () => runRandomThemeGenerator(false));
  badgeArch.addEventListener('click', () => randomThemeSelectedMode = !randomThemeSelectedMode);
}
