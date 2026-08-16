// ============================================================
// EVENTS — événements aléatoires qui surprennent le joueur :
// client VIP, pluie de pièces à attraper, chien perdu à adopter.
// ============================================================

function scheduleNextEvent() {
  const c = CONFIG.events;
  const delayMs = (c.minDelaySec + Math.random() * (c.maxDelaySec - c.minDelaySec)) * 1000;
  setTimeout(fireRandomEvent, delayMs);
}

function fireRandomEvent() {
  // Rien ne se passe si le joueur est absent ou n'a pas encore de chien
  if (!document.hidden && state.dogs.length > 0) {
    const pool = ['vip', 'rain'];
    if (!barIsFull()) pool.push('stray');
    const pick = randomOf(pool);
    if (pick === 'vip') vipEvent();
    else if (pick === 'rain') coinRainEvent();
    else strayDogEvent();
  }
  scheduleNextEvent();
}

// Petit bandeau d'annonce au-dessus de la scène
let toastTimer = null;

function showToast(text) {
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3200);
}

// ---- 👑 Client VIP : paie 10x le prix normal ----

function vipEvent() {
  showToast('👑 Un client VIP arrive !');
  playSoundSafe('ding');
  spawnCustomer(customerSpend() * CONFIG.events.vipMult, { vip: true });
}

// ---- 🪙 Pluie de pièces : il faut les attraper avant qu'elles tombent ----

function coinRainEvent() {
  showToast('🪙 Pluie de pièces ! Attrape-les !');
  playSoundSafe('unlock');
  const scene = document.getElementById('scene');
  const c = CONFIG.events.rain;
  // Chaque pièce vaut ~1,5 s de revenu (minimum 3)
  const value = Math.max(3, Math.round(totalIncomePerSecond() * 1.5));
  const endAt = performance.now() + c.durationMs;
  const interval = setInterval(() => {
    if (performance.now() > endAt) { clearInterval(interval); return; }
    dropRainCoin(scene, value, c.fallMs);
  }, c.spawnEveryMs);
}

function dropRainCoin(scene, value, fallMs) {
  const coin = document.createElement('div');
  coin.className = 'rain-coin';
  coin.style.left = (5 + Math.random() * 85) + '%';
  coin.style.animationDuration = fallMs + 'ms';
  coin.addEventListener('pointerdown', (ev) => {
    ev.stopPropagation();
    earnCoins(value);
    playSoundSafe('coin');
    floatText(ev.clientX, ev.clientY - 10, '+' + formatNumber(value));
    coin.remove();
  });
  scene.appendChild(coin);
  setTimeout(() => coin.remove(), fallMs + 100); // ratée : elle disparaît
}

// ---- 🐶 Chien perdu : il frappe à la porte, adoption gratuite ----

let strayBreedId = null;

function strayDogEvent() {
  strayBreedId = randomOf(state.unlockedBreeds);
  el.strayThumb.innerHTML = dogThumb(strayBreedId, 62);
  el.strayModal.classList.remove('hidden');
  playSoundSafe('pet');
}
