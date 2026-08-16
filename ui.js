// ============================================================
// UI — tout le rendu DOM et les interactions.
// ============================================================

const el = {
  coinCount: document.getElementById('coin-count'),
  incomeRate: document.getElementById('income-rate'),
  slots: document.getElementById('slots'),
  btnAdopt: document.getElementById('btn-adopt'),
  btnKibble: document.getElementById('btn-kibble'),
  btnExpand: document.getElementById('btn-expand'),
  costAdopt: document.getElementById('cost-adopt'),
  costKibble: document.getElementById('cost-kibble'),
  costExpand: document.getElementById('cost-expand'),
  lvlKibble: document.getElementById('lvl-kibble'),
  welcomeBack: document.getElementById('welcome-back'),
  offlineCoins: document.getElementById('offline-coins'),
  btnCollect: document.getElementById('btn-collect'),
  nameModal: document.getElementById('name-modal'),
  nameModalEmoji: document.getElementById('name-modal-emoji'),
  nameInput: document.getElementById('name-input'),
  btnNameOk: document.getElementById('btn-name-ok'),
  btnReset: document.getElementById('btn-reset'),
};

// Format lisible pour les enfants : 1234 -> "1,2 k"
function formatNumber(n) {
  n = Math.floor(n);
  if (n < 1000) return String(n);
  if (n < 1000000) return (n / 1000).toFixed(1).replace('.', ',') + ' k';
  return (n / 1000000).toFixed(1).replace('.', ',') + ' M';
}

// ---- Rendu des emplacements / chiens ----
// On ne reconstruit la grille que quand sa composition change (perf + les
// animations CSS ne sont pas réinitialisées à chaque frame).

let lastSlotsSignature = '';

function renderSlots() {
  const signature = state.slots + '|' + state.dogs.map(d => d.id + ':' + d.name).join(',');
  if (signature === lastSlotsSignature) return;
  lastSlotsSignature = signature;

  el.slots.innerHTML = '';
  for (let i = 0; i < state.slots; i++) {
    const dog = state.dogs[i];
    const slot = document.createElement('div');
    slot.className = 'slot' + (dog ? ' filled' : ' empty');
    if (dog) {
      const breed = CONFIG.breeds[dog.breed] || CONFIG.breeds[0];
      slot.innerHTML =
        '<div class="dog-emoji">' + breed.emoji + '</div>' +
        '<div class="dog-name">' + escapeHtml(dog.name) + ' <span class="pencil">✏️</span></div>';
      slot.addEventListener('click', (ev) => onDogClick(ev, dog));
    } else {
      slot.innerHTML = '<div class="bone">🦴</div>';
    }
    el.slots.appendChild(slot);
  }
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

// ---- Rafraîchissement des compteurs et boutons (à chaque frame) ----

function renderHud() {
  el.coinCount.textContent = formatNumber(state.coins);
  el.incomeRate.textContent = '+' + formatNumber(totalIncomePerSecond()) + ' /s';

  el.costAdopt.textContent = barIsFull() ? 'Bar plein !' : '🪙 ' + formatNumber(adoptCost());
  el.btnAdopt.disabled = barIsFull() || state.coins < adoptCost();

  el.lvlKibble.textContent = state.upgrades.kibbleLevel > 0 ? 'niv. ' + state.upgrades.kibbleLevel : '';
  el.costKibble.textContent = '🪙 ' + formatNumber(kibbleCost());
  el.btnKibble.disabled = state.coins < kibbleCost();

  el.costExpand.textContent = barIsMaxed() ? 'Maxi !' : '🪙 ' + formatNumber(expandCost());
  el.btnExpand.disabled = barIsMaxed() || state.coins < expandCost();
}

function render() {
  renderSlots();
  renderHud();
}

// ---- Petits effets visuels ----

// Texte flottant ("+1 🪙", "❤️"...) qui monte et disparaît
function floatText(x, y, text) {
  const f = document.createElement('div');
  f.className = 'float-text';
  f.textContent = text;
  f.style.left = x + 'px';
  f.style.top = y + 'px';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 900);
}

// ---- Interactions ----

function onDogClick(ev, dog) {
  // Clic sur le nom (ou le crayon) = renommer ; ailleurs = caresser
  if (ev.target.closest('.dog-name')) {
    openNameModal(dog);
    return;
  }
  petDog();
  floatText(ev.clientX, ev.clientY - 20, '❤️ +' + CONFIG.petReward);
  const emoji = ev.currentTarget.querySelector('.dog-emoji');
  emoji.classList.remove('happy');
  void emoji.offsetWidth; // force le redémarrage de l'animation
  emoji.classList.add('happy');
}

let namingDogId = null;

function openNameModal(dog) {
  namingDogId = dog.id;
  const breed = CONFIG.breeds[dog.breed] || CONFIG.breeds[0];
  el.nameModalEmoji.textContent = breed.emoji;
  el.nameInput.value = dog.name;
  el.nameModal.classList.remove('hidden');
  el.nameInput.focus();
  el.nameInput.select();
}

function closeNameModal() {
  if (namingDogId !== null) {
    renameDog(namingDogId, el.nameInput.value);
    namingDogId = null;
  }
  el.nameModal.classList.add('hidden');
}

function showWelcomeBack(amount) {
  el.offlineCoins.textContent = formatNumber(amount);
  el.welcomeBack.classList.remove('hidden');
}

function bindUi() {
  el.btnAdopt.addEventListener('click', (ev) => {
    const dog = adoptDog();
    if (dog) {
      render();
      floatText(ev.clientX, ev.clientY - 20, CONFIG.breeds[dog.breed].emoji + ' Bienvenue !');
      openNameModal(dog); // on propose tout de suite de le nommer
    }
  });

  el.btnKibble.addEventListener('click', (ev) => {
    if (buyKibble()) floatText(ev.clientX, ev.clientY - 20, '🍖 Miam !');
  });

  el.btnExpand.addEventListener('click', (ev) => {
    if (buyExpand()) floatText(ev.clientX, ev.clientY - 20, '🏠 Plus grand !');
  });

  el.btnCollect.addEventListener('click', () => {
    el.welcomeBack.classList.add('hidden');
  });

  el.btnNameOk.addEventListener('click', closeNameModal);
  el.nameInput.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') closeNameModal();
  });

  el.btnReset.addEventListener('click', () => {
    if (confirm('Tout recommencer à zéro ?')) {
      resetState();
      lastSlotsSignature = '';
      render();
    }
  });
}
