// ============================================================
// UI — tout le rendu (scène SVG + popups HTML) et les interactions.
// ============================================================

const el = {
  coinCount: document.getElementById('coin-count'),
  incomeRate: document.getElementById('income-rate'),
  sceneSvg: document.getElementById('scene-svg'),
  cushions: document.getElementById('cushions'),
  tables: document.getElementById('tables'),
  decor: document.getElementById('decor'),
  hint: document.getElementById('hint'),
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
  questText: document.getElementById('quest-text'),
  questClaim: document.getElementById('quest-claim'),
  questReward: document.getElementById('quest-reward'),
};

// Format lisible pour les enfants : 1234 -> "1,2 k"
function formatNumber(n) {
  n = Math.floor(n);
  if (n < 1000) return String(n);
  if (n < 1000000) return (n / 1000).toFixed(1).replace('.', ',') + ' k';
  if (n < 1000000000) return (n / 1000000).toFixed(1).replace('.', ',') + ' M';
  return (n / 1000000000).toFixed(1).replace('.', ',') + ' Md';
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

// Convertit un point de la scène SVG en coordonnées écran (pour les effets)
function svgToScreen(x, y) {
  const pt = el.sceneSvg.createSVGPoint();
  pt.x = x; pt.y = y;
  const p = pt.matrixTransform(el.sceneSvg.getScreenCTM());
  return { x: p.x, y: p.y };
}

// ---- Placement dans la scène (coordonnées SVG, viewBox 360x560) ----

// Coussin n° i : rangées de 4, légèrement décalées
function spotPosition(i) {
  const col = i % 4;
  const row = Math.floor(i / 4);
  return {
    x: 46 + col * 86 + (row % 2 === 1 ? 14 : 0),
    y: 232 + row * 68,
  };
}

// Tables rondes (2 au départ, +1 par agrandissement, max 4)
const TABLE_POS = [
  { x: 96, y: 268 }, { x: 268, y: 268 },
  { x: 96, y: 420 }, { x: 268, y: 420 },
];

function visibleTables() {
  return Math.min(2 + state.upgrades.expandBought, TABLE_POS.length);
}

// Plantes décoratives gagnées à chaque agrandissement
const PLANT_POS = [
  { x: 274, y: 166 }, { x: 140, y: 166 }, { x: 20, y: 530 }, { x: 340, y: 530 },
];

// ---- Rendu de la scène ----
// On ne reconstruit que quand la composition change (perf + les
// animations CSS ne sont pas réinitialisées à chaque frame).

let lastSlotsSignature = '';

function renderSlots() {
  const signature = state.slots + '|' + state.upgrades.expandBought + '|' +
    state.dogs.map(d => d.id + ':' + d.name + ':' + d.accessories.join('+')).join(',');
  if (signature === lastSlotsSignature) return;
  lastSlotsSignature = signature;

  // Tables et chaises
  el.tables.innerHTML = '';
  for (let t = 0; t < visibleTables(); t++) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'table');
    g.dataset.index = t;
    g.setAttribute('transform', `translate(${TABLE_POS[t].x},${TABLE_POS[t].y})`);
    g.innerHTML = tableSVG();
    el.tables.appendChild(g);
  }

  // Coussins et chiens
  el.cushions.innerHTML = '';
  for (let i = 0; i < state.slots; i++) {
    const dog = state.dogs[i];
    const pos = spotPosition(i);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'spot' + (dog ? ' has-dog' : ' empty'));
    g.setAttribute('transform', `translate(${pos.x},${pos.y})`);
    if (dog) {
      g.dataset.dogId = dog.id; // les clients retrouvent le chien par son id
      const nameWidth = dog.name.length * 6 + 26;
      const ball = dog.accessories.includes('balle') ?
        `<g transform="translate(19,-3)"><g class="play-ball-move">${playBallSVG()}</g></g>` : '';
      g.innerHTML =
        cushionSVG(dog.accessories.includes('panier')) +
        ball +
        `<g class="dog-move"><g class="dog-wrap">${dogSVG(dog.breed, dog.accessories)}</g></g>` +
        `<g class="dog-name" transform="translate(0,10)">
          <rect x="${-nameWidth / 2}" y="-8" width="${nameWidth}" height="14" rx="7" fill="rgba(255,255,255,0.9)"/>
          <text x="-4" y="3" text-anchor="middle" font-size="9" font-weight="bold" fill="#4a3728">${escapeHtml(dog.name)}</text>
          <g transform="translate(${nameWidth / 2 - 10},-2) rotate(40)">
            <rect x="-1.5" y="-5" width="3" height="8" rx="1" fill="#f3a35c"/>
            <path d="M-1.5,3 L0,6.5 L1.5,3 Z" fill="#4a3728"/>
          </g>
        </g>`;
      g.addEventListener('click', (ev) => onDogClick(ev, dog));
    } else {
      g.innerHTML = cushionSVG(false) +
        `<g class="bone-art" opacity="0.45">
          <rect x="-7" y="-12" width="14" height="4.5" rx="2.2" fill="#fff"/>
          <circle cx="-7" cy="-11.5" r="2.8" fill="#fff"/><circle cx="-7" cy="-8" r="2.8" fill="#fff"/>
          <circle cx="7" cy="-11.5" r="2.8" fill="#fff"/><circle cx="7" cy="-8" r="2.8" fill="#fff"/>
        </g>`;
    }
    el.cushions.appendChild(g);
  }

  // Une plante par agrandissement : le bar s'embellit
  el.decor.innerHTML = '';
  for (let p = 0; p < Math.min(state.upgrades.expandBought, PLANT_POS.length); p++) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${PLANT_POS[p].x},${PLANT_POS[p].y})`);
    g.innerHTML = plantSVG();
    el.decor.appendChild(g);
  }

  // Indice de démarrage quand le bar est vide
  el.hint.classList.toggle('hidden', state.dogs.length > 0);
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

  // Mission en cours
  const quest = currentQuest();
  if (quest) {
    const progress = Math.min(questProgress(quest), quest.n);
    el.questText.textContent = '🎯 ' + quest.text + (quest.n > 1 ? ` (${progress}/${quest.n})` : '');
    el.questReward.textContent = formatNumber(quest.reward);
    el.questClaim.classList.toggle('hidden', !questDone(quest));
    el.questText.classList.toggle('quest-done', questDone(quest));
  } else {
    el.questText.textContent = '🏆 Toutes les missions accomplies !';
    el.questClaim.classList.add('hidden');
  }

  // Les popups affichent des prix : on met à jour leur état "achetable" en continu
  if (!el.adoptModal.classList.contains('hidden')) updateBreedButtons();
  if (!el.dogModal.classList.contains('hidden')) updateDogModalLive();
}

function render() {
  renderSlots();
  renderHud();
}

// ---- Petits effets visuels (calque HTML au-dessus de la scène) ----

// Texte flottant ("+10", "❤️"...) qui monte et disparaît. x/y en pixels écran.
function floatText(x, y, text) {
  const f = document.createElement('div');
  f.className = 'float-text';
  f.textContent = text;
  f.style.left = x + 'px';
  f.style.top = y + 'px';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 900);
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
      '<span class="breed-thumb">' + dogThumb(breed.id, 34) + '</span>' +
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
  el.dogModalEmoji.innerHTML = dogThumb(dog.breed, 62, dog.accessories);
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
          el.dogModalEmoji.innerHTML = dogThumb(dog.breed, 62, dog.accessories);
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
  // Clic sur l'étiquette du nom = ouvrir la fiche ; ailleurs = caresser
  if (ev.target.closest('.dog-name')) {
    openDogModal(dog, false);
    return;
  }
  petDog();
  playSound('pet');
  floatText(ev.clientX, ev.clientY - 20, '❤️ +' + CONFIG.petReward);
  wiggleDog(ev.currentTarget);
}

// Fait frétiller un chien (caresse du joueur ou d'un client)
function wiggleDog(spotEl) {
  const body = spotEl && spotEl.querySelector('.dog-wrap');
  if (!body) return;
  body.classList.remove('happy');
  // force le redémarrage de l'animation
  void body.getBoundingClientRect();
  body.classList.add('happy');
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

  el.questClaim.addEventListener('click', (ev) => {
    const q = claimQuest();
    if (q) {
      playSound('unlock');
      floatText(ev.clientX, ev.clientY - 20, '🎉 +' + formatNumber(q.reward));
    }
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
