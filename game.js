// ============================================================
// GAME — logique pure du jeu (aucun accès au DOM).
// ============================================================

function getBreed(id) {
  return CONFIG.breeds.find(b => b.id === id) || CONFIG.breeds[0];
}

function getAccessory(id) {
  return CONFIG.accessories.find(a => a.id === id);
}

function breedIsUnlocked(id) {
  return state.unlockedBreeds.includes(id);
}

// ---- Revenus ----

// Revenu de base par chien (avant race et accessoires)
function baseIncomePerDog() {
  return CONFIG.dog.baseIncome +
    state.upgrades.kibbleLevel * CONFIG.upgrades.kibble.incomePerLevel;
}

function accBonus(dog) {
  return dog.accessories.reduce((sum, id) => {
    const acc = getAccessory(id);
    return sum + (acc ? acc.incomeBonus : 0);
  }, 0);
}

// "Charme" d'un chien : race × accessoires. C'est ce qui attire les clients.
function dogCharm(dog) {
  return getBreed(dog.breed).mult * (1 + accBonus(dog));
}

// Charme total du bar
function attraction() {
  return state.dogs.reduce((sum, dog) => sum + dogCharm(dog), 0);
}

// Revenu moyen généré par un chien : base × son charme
function dogIncome(dog) {
  return baseIncomePerDog() * dogCharm(dog);
}

function totalIncomePerSecond() {
  return state.dogs.reduce((sum, dog) => sum + dogIncome(dog), 0) *
    state.boosts.incomeMultiplier;
}

// ---- Coûts (croissance exponentielle classique des idle games) ----

function scaledCost(base, growth, count) {
  return Math.round(base * Math.pow(growth, count));
}

// Adopter coûte plus cher à chaque chien, et les grandes races coûtent plus cher
function adoptCost(breedId) {
  const base = scaledCost(CONFIG.dog.baseCost, CONFIG.dog.costGrowth, state.dogs.length);
  return base * getBreed(breedId).mult;
}

function cheapestAdoptCost() {
  return adoptCost(state.unlockedBreeds[0] || 'chiot');
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

// ---- Actions du joueur ----

function unlockBreed(breedId) {
  const breed = getBreed(breedId);
  if (breedIsUnlocked(breedId) || state.coins < breed.unlockCost) return false;
  state.coins -= breed.unlockCost;
  state.unlockedBreeds.push(breedId);
  saveState();
  return true;
}

// Renvoie le chien adopté, ou null si impossible
function adoptDog(breedId) {
  const cost = adoptCost(breedId);
  if (barIsFull() || !breedIsUnlocked(breedId) || state.coins < cost) return null;
  state.coins -= cost;
  const dog = {
    id: state.nextDogId++,
    name: CONFIG.defaultNames[Math.floor(Math.random() * CONFIG.defaultNames.length)],
    breed: breedId,
    accessories: [],
  };
  state.dogs.push(dog);
  saveState();
  return dog;
}

function buyAccessory(dogId, accId) {
  const dog = state.dogs.find(d => d.id === dogId);
  const acc = getAccessory(accId);
  if (!dog || !acc) return false;
  if (dog.accessories.includes(accId) || state.coins < acc.cost) return false;
  state.coins -= acc.cost;
  dog.accessories.push(accId);
  saveState();
  return true;
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

// ---- Clients ----
// L'argent vient des clients : ils arrivent d'autant plus vite que le bar
// est attirant, et chaque client paie (revenu moyen × intervalle), pour que
// le revenu moyen corresponde exactement à l'affichage "+N /s".

function customerInterval() {
  const c = CONFIG.customers;
  return Math.max(c.minIntervalSec, Math.min(c.maxIntervalSec, 10 / (0.6 + 0.4 * attraction())));
}

// Ce que paie un client qui arrive maintenant
function customerSpend() {
  return totalIncomePerSecond() * customerInterval();
}

let customerTimer = 0;

// Avance le temps ; renvoie le montant payé par le client qui entre, ou 0.
// (le crédit des pièces est fait par l'UI au moment où le client paie)
function advanceCustomers(dt) {
  if (state.dogs.length === 0) { customerTimer = 0; return 0; }
  customerTimer += dt;
  if (customerTimer < customerInterval()) return 0;
  customerTimer = 0;
  return customerSpend();
}

function payCustomer(amount) {
  state.coins += amount;
}

// Gains accumulés pendant l'absence du joueur (calculés au chargement).
// Renvoie le montant gagné (0 si rien).
function computeOfflineGains() {
  const elapsedSec = Math.min(
    (Date.now() - state.lastSeen) / 1000,
    CONFIG.offline.maxSeconds
  );
  if (elapsedSec < 30 || state.dogs.length === 0) return 0; // absence trop courte : on ignore
  const perSecond = state.dogs.reduce((sum, dog) => sum + dogIncome(dog), 0);
  const gained = Math.floor(perSecond * elapsedSec * CONFIG.offline.rate);
  state.coins += gained;
  return gained;
}
