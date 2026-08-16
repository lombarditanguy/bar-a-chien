// ============================================================
// GAME — logique pure du jeu (aucun accès au DOM).
// ============================================================

// ---- Revenus ----

function incomePerDog() {
  return CONFIG.dog.baseIncome +
    state.upgrades.kibbleLevel * CONFIG.upgrades.kibble.incomePerLevel;
}

function totalIncomePerSecond() {
  return state.dogs.length * incomePerDog() * state.boosts.incomeMultiplier;
}

// ---- Coûts (croissance exponentielle classique des idle games) ----

function scaledCost(base, growth, count) {
  return Math.round(base * Math.pow(growth, count));
}

function adoptCost() {
  return scaledCost(CONFIG.dog.baseCost, CONFIG.dog.costGrowth, state.dogs.length);
}

function kibbleCost() {
  return scaledCost(CONFIG.upgrades.kibble.baseCost, CONFIG.upgrades.kibble.costGrowth, state.upgrades.kibbleLevel);
}

function expandCost() {
  return scaledCost(CONFIG.upgrades.expand.baseCost, CONFIG.upgrades.expand.costGrowth, state.upgrades.expandBought);
}

function barIsFull() {
  return state.dogs.length >= state.slots;
}

function barIsMaxed() {
  return state.slots >= CONFIG.upgrades.expand.maxSlots;
}

// ---- Actions du joueur (renvoient true si l'achat a réussi) ----

function adoptDog() {
  const cost = adoptCost();
  if (barIsFull() || state.coins < cost) return null;
  state.coins -= cost;
  const dog = {
    id: state.nextDogId++,
    name: CONFIG.defaultNames[Math.floor(Math.random() * CONFIG.defaultNames.length)],
    breed: Math.floor(Math.random() * CONFIG.breeds.length),
  };
  state.dogs.push(dog);
  saveState();
  return dog;
}

function buyKibble() {
  const cost = kibbleCost();
  if (state.coins < cost) return false;
  state.coins -= cost;
  state.upgrades.kibbleLevel++;
  saveState();
  return true;
}

function buyExpand() {
  const cost = expandCost();
  if (barIsMaxed() || state.coins < cost) return false;
  state.coins -= cost;
  state.upgrades.expandBought++;
  state.slots = Math.min(
    state.slots + CONFIG.upgrades.expand.slotsPerBuy,
    CONFIG.upgrades.expand.maxSlots
  );
  saveState();
  return true;
}

function petDog() {
  state.coins += CONFIG.petReward;
}

function renameDog(dogId, newName) {
  const dog = state.dogs.find(d => d.id === dogId);
  if (dog && newName.trim()) {
    dog.name = newName.trim().slice(0, 14);
    saveState();
  }
}

// ---- Boucle de jeu ----

// dt en secondes
function tick(dt) {
  state.coins += totalIncomePerSecond() * dt;
}

// Gains accumulés pendant l'absence du joueur (calculés au chargement).
// Renvoie le montant gagné (0 si rien).
function computeOfflineGains() {
  const elapsedSec = Math.min(
    (Date.now() - state.lastSeen) / 1000,
    CONFIG.offline.maxSeconds
  );
  if (elapsedSec < 30 || state.dogs.length === 0) return 0; // absence trop courte : on ignore
  const gained = Math.floor(
    state.dogs.length * incomePerDog() * elapsedSec * CONFIG.offline.rate
  );
  state.coins += gained;
  return gained;
}
