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
  adoptModal: document.getElementById('adopt-modal'),
  breedList: document.getElementById('breed-list'),
  btnAdoptClose: document.getElementById('btn-adopt-close'),
  dogModal: document.getElementById('dog-modal'),
  dogModalEmoji: document.getElementById('dog-modal-emoji'),
  dogModalIncome: document.getElementById('dog-modal-income'),
  nameInput: document.getElementById('name-input'),
  accList: document.getElementById('acc-list'),
  btnDogOk: document.getElementById('btn-dog-ok'),
  btnSound: document.getElementById('btn-sound'),
  btnReset: document.getElementById('btn-reset'),
};

// Format lisible pour les enfants : 1234 -> "1,2 k"
function formatNumber(n) {
  n = Math.floor(n);
  if (n < 1000) return String(n);
  if (n < 1000000) return (n / 1000).toFixed(1).replace('.', ',') + ' k';
  return (n / 1000000).toFixed(1).replace('.', ',') + ' M';
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

// ---- Rendu des emplacements / chiens ----
// On ne reconstruit la grille que quand sa composition change (perf + les
// animations CSS ne sont pas réinitialisées à chaque frame).

let lastSlotsSignature = '';

function renderSlots() {
  const signature = state.slots + '|' +
    state.dogs.map(d => d.id + ':' + d.name + ':' + d.accessories.join('+')).join(',');
  if (signature === lastSlotsSignature) return;
  lastSlotsSignature = signature;

  el.slots.innerHTML = '';
  for (let i = 0; i < state.slots; i++) {
    const dog = state.dogs[i];
    const slot = document.createElement('div');
    slot.className = 'slot' + (dog ? ' filled' : ' empty');
    if (dog) {
      const accEmojis = dog.accessories.map(id => (getAccessory(id) || {}).emoji || '').join('');
      slot.innerHTML =
        '<div class="dog-emoji">' + getBreed(dog.breed).emoji + '</div>' +
        (accEmojis ? '<div class="dog-accs">' + accEmojis + '</div>' : '') +
        '<div class="dog-name">' + escapeHtml(dog.name) + ' <span class="pencil">✏️</span></div>';
      slot.addEventListener('click', (ev) => onDogClick(ev, dog));
    } else {
      slot.innerHTML = '<div class="bone">🦴</div>';
    }
    el.slots.appendChild(slot);
  }
}

// ---- Rafraîchissement des compteurs et boutons (à chaque frame) ----

function renderHud() {
  el.coinCount.textContent = formatNumber(state.coins);
  el.incomeRate.textContent = '+' + formatNumber(totalIncomePerSecond()) + ' /s';

  el.costAdopt.textContent = barIsFull() ? 'Bar plein !' : '🪙 ' + formatNumber(cheapestAdoptCost());
  el.btnAdopt.disabled = barIsFull();

  el.lvlKibble.textContent = state.upgrades.kibbleLevel > 0 ? 'niv. ' + state.upgrades.kibbleLevel : '';
  el.costKibble.textContent = '🪙 ' + formatNumber(kibbleCost());
  el.btnKibble.disabled = state.coins < kibbleCost();

  el.costExpand.textContent = barIsMaxed() ? 'Maxi !' : '🪙 ' + formatNumber(expandCost());
  el.btnExpand.disabled = barIsMaxed() || state.coins < expandCost();

  // Les popups affichent des prix : on met à jour leur état "achetable" en continu
  if (!el.adoptModal.classList.contains('hidden')) updateBreedButtons();
  if (!el.dogModal.classList.contains('hidden')) updateDogModalLive();
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

// Pièce décorative qui s'envole d'un chien au hasard (appelé par main.js)
function ambientCoin() {
  const filled = el.slots.querySelectorAll('.slot.filled');
  if (filled.length === 0 || document.hidden) return;
  const slot = filled[Math.floor(Math.random() * filled.length)];
  const rect = slot.getBoundingClientRect();
  floatText(rect.left + rect.width / 2, rect.top, '🪙');
}

// ---- Popup d'adoption (choix de race) ----

function openAdoptModal() {
  el.breedList.innerHTML = '';
  CONFIG.breeds.forEach(breed => {
    const unlocked = breedIsUnlocked(breed.id);
    const btn = document.createElement('button');
    btn.className = 'breed-btn' + (unlocked ? '' : ' locked');
    btn.dataset.breedId = breed.id;
    btn.innerHTML =
      '<span class="breed-emoji">' + breed.emoji + '</span>' +
      '<span class="breed-info"><b>' + breed.name + '</b>' +
      '<small>🪙 ' + formatNumber(baseIncomePerDog() * breed.mult) + ' /s</small></span>' +
      '<span class="breed-price">' +
      (unlocked ? '🪙 ' + formatNumber(adoptCost(breed.id)) : '🔒 ' + formatNumber(breed.unlockCost)) +
      '</span>';
    btn.addEventListener('click', (ev) => onBreedClick(ev, breed.id));
    el.breedList.appendChild(btn);
  });
  updateBreedButtons();
  el.adoptModal.classList.remove('hidden');
}

// Active/désactive les boutons selon les pièces disponibles (appelé en continu)
function updateBreedButtons() {
  el.breedList.querySelectorAll('.breed-btn').forEach(btn => {
    const breed = getBreed(btn.dataset.breedId);
    const cost = breedIsUnlocked(breed.id) ? adoptCost(breed.id) : breed.unlockCost;
    btn.disabled = state.coins < cost || (breedIsUnlocked(breed.id) && barIsFull());
  });
}

function onBreedClick(ev, breedId) {
  if (breedIsUnlocked(breedId)) {
    const dog = adoptDog(breedId);
    if (dog) {
      playSound('buy');
      el.adoptModal.classList.add('hidden');
      render();
      openDogModal(dog, true);
    }
  } else if (unlockBreed(breedId)) {
    playSound('unlock');
    floatText(ev.clientX, ev.clientY - 20, '🎉 Débloqué !');
    openAdoptModal(); // re-rendu de la liste avec la race débloquée
  }
}

// ---- Popup d'un chien : nom + accessoires ----

let openDogId = null;

function openDogModal(dog, selectName) {
  openDogId = dog.id;
  el.dogModalEmoji.textContent = getBreed(dog.breed).emoji;
  el.nameInput.value = dog.name;
  renderAccList(dog);
  el.dogModal.classList.remove('hidden');
  if (selectName) {
    el.nameInput.focus();
    el.nameInput.select();
  }
}

function renderAccList(dog) {
  el.accList.innerHTML = '';
  CONFIG.accessories.forEach(acc => {
    const owned = dog.accessories.includes(acc.id);
    const btn = document.createElement('button');
    btn.className = 'acc-btn' + (owned ? ' owned' : '');
    btn.dataset.accId = acc.id;
    btn.innerHTML =
      '<span class="acc-emoji">' + acc.emoji + '</span>' +
      '<span class="acc-info"><b>' + acc.name + '</b>' +
      '<small>' + (acc.incomeBonus > 0 ? '+' + Math.round(acc.incomeBonus * 100) + '%' : 'pour le style !') + '</small></span>' +
      '<span class="acc-price">' + (owned ? '✓' : '🪙 ' + formatNumber(acc.cost)) + '</span>';
    if (!owned) {
      btn.addEventListener('click', (ev) => {
        if (buyAccessory(dog.id, acc.id)) {
          playSound('buy');
          floatText(ev.clientX, ev.clientY - 20, acc.emoji);
          renderAccList(dog);
        }
      });
    }
    el.accList.appendChild(btn);
  });
}

// Prix/revenu mis à jour en continu tant que la popup est ouverte
function updateDogModalLive() {
  const dog = state.dogs.find(d => d.id === openDogId);
  if (!dog) return;
  el.dogModalIncome.textContent = formatNumber(dogIncome(dog));
  el.accList.querySelectorAll('.acc-btn:not(.owned)').forEach(btn => {
    btn.disabled = state.coins < getAccessory(btn.dataset.accId).cost;
  });
}

function closeDogModal() {
  if (openDogId !== null) {
    renameDog(openDogId, el.nameInput.value);
    openDogId = null;
  }
  el.dogModal.classList.add('hidden');
}

// ---- Interactions ----

function onDogClick(ev, dog) {
  // Clic sur le nom (ou le crayon) = ouvrir la fiche ; ailleurs = caresser
  if (ev.target.closest('.dog-name')) {
    openDogModal(dog, false);
    return;
  }
  petDog();
  playSound('pet');
  floatText(ev.clientX, ev.clientY - 20, '❤️ +' + CONFIG.petReward);
  const emoji = ev.currentTarget.querySelector('.dog-emoji');
  emoji.classList.remove('happy');
  void emoji.offsetWidth; // force le redémarrage de l'animation
  emoji.classList.add('happy');
}

function showWelcomeBack(amount) {
  el.offlineCoins.textContent = formatNumber(amount);
  el.welcomeBack.classList.remove('hidden');
}

function renderSoundButton() {
  el.btnSound.textContent = state.settings.sound ? '🔊' : '🔇';
}

function bindUi() {
  el.btnAdopt.addEventListener('click', openAdoptModal);
  el.btnAdoptClose.addEventListener('click', () => el.adoptModal.classList.add('hidden'));

  el.btnKibble.addEventListener('click', (ev) => {
    if (buyKibble()) {
      playSound('buy');
      floatText(ev.clientX, ev.clientY - 20, '🍖 Miam !');
    }
  });

  el.btnExpand.addEventListener('click', (ev) => {
    if (buyExpand()) {
      playSound('buy');
      floatText(ev.clientX, ev.clientY - 20, '🏠 Plus grand !');
    }
  });

  el.btnCollect.addEventListener('click', () => {
    playSound('coin');
    el.welcomeBack.classList.add('hidden');
  });

  el.btnDogOk.addEventListener('click', closeDogModal);
  el.nameInput.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') closeDogModal();
  });

  el.btnSound.addEventListener('click', () => {
    state.settings.sound = !state.settings.sound;
    renderSoundButton();
    playSound('coin'); // petit retour sonore quand on réactive
    saveState();
  });
  renderSoundButton();

  el.btnReset.addEventListener('click', () => {
    if (confirm('Tout recommencer à zéro ?')) {
      resetState();
      lastSlotsSignature = '';
      renderSoundButton();
      render();
    }
  });
}
