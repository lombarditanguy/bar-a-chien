// ============================================================
// STATE — état de la partie + sauvegarde localStorage.
// ============================================================

function defaultState() {
  return {
    coins: CONFIG.startCoins,
    slots: CONFIG.startSlots,
    // Chaque chien : { id, name, breed (index dans CONFIG.breeds) }
    dogs: [],
    upgrades: {
      kibbleLevel: 0,
      expandBought: 0,
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
    state = Object.assign(defaultState(), saved);
    state.upgrades = Object.assign(defaultState().upgrades, saved.upgrades);
    state.boosts = Object.assign(defaultState().boosts, saved.boosts);
    return true;
  } catch (e) {
    return false;
  }
}

function resetState() {
  state = defaultState();
  saveState();
}
