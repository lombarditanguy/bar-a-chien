// ============================================================
// STATE — état de la partie + sauvegarde localStorage.
// ============================================================

function defaultState() {
  return {
    coins: CONFIG.startCoins,
    slots: CONFIG.startSlots,
    // Chaque chien : { id, name, breed (id de race), accessories: [ids] }
    dogs: [],
    unlockedBreeds: ['chiot'],
    upgrades: {
      kibbleLevel: 0,
      expandBought: 0,
    },
    // Compteurs pour les missions
    stats: {
      pets: 0,
      served: 0,
    },
    questIndex: 0,
    settings: {
      sound: true,
    },
    // Prévu pour la monétisation future (pub récompensée = multiplicateur
    // temporaire, crédits premium...). Rien n'est branché pour l'instant.
    boosts: {
      incomeMultiplier: 1,
      boostEndsAt: 0,
    },
    premiumCredits: 0,
    nextDogId: 1,
    lastSeen: Date.now(),
  };
}

let state = defaultState();

function saveState() {
  state.lastSeen = Date.now();
  try {
    localStorage.setItem(CONFIG.saveKey, JSON.stringify(state));
  } catch (e) {
    // localStorage indisponible (navigation privée...) : on joue sans sauvegarde
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.saveKey);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    // Fusion avec l'état par défaut : les vieilles sauvegardes restent
    // compatibles quand on ajoute de nouveaux champs.
    const def = defaultState();
    state = Object.assign(def, saved);
    state.upgrades = Object.assign(def.upgrades, saved.upgrades);
    state.stats = Object.assign(def.stats, saved.stats);
    state.settings = Object.assign(def.settings, saved.settings);
    state.boosts = Object.assign(def.boosts, saved.boosts);
    migrateSave();
    return true;
  } catch (e) {
    return false;
  }
}

// Compatibilité avec les sauvegardes du premier prototype
function migrateSave() {
  if (!Array.isArray(state.unlockedBreeds) || state.unlockedBreeds.length === 0) {
    state.unlockedBreeds = ['chiot'];
  }
  state.dogs.forEach(dog => {
    // Avant, breed était un index numérique ; maintenant c'est un id
    if (typeof dog.breed === 'number') {
      const breed = CONFIG.breeds[dog.breed] || CONFIG.breeds[0];
      dog.breed = breed.id;
      if (!state.unlockedBreeds.includes(breed.id)) state.unlockedBreeds.push(breed.id);
    }
    if (!CONFIG.breeds.some(b => b.id === dog.breed)) dog.breed = 'chiot';
    if (!Array.isArray(dog.accessories)) dog.accessories = [];
  });
}

function resetState() {
  state = defaultState();
  saveState();
}
