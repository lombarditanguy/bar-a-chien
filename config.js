// ============================================================
// CONFIG — toutes les données et réglages d'équilibrage du jeu.
// Pour itérer (nouvelles races, accessoires...), c'est ici qu'on ajoute.
// ============================================================

const CONFIG = {
  saveKey: 'dogbar-save-v1',

  startCoins: 15,
  startSlots: 4,

  // Races de chiens (placeholder emoji).
  // mult = multiplicateur de revenu ; unlockCost = prix de déblocage (0 = dispo dès le début)
  breeds: [
    { id: 'chiot',    emoji: '🐶',    name: 'Chiot',    mult: 1,  unlockCost: 0 },
    { id: 'beagle',   emoji: '🐕',    name: 'Beagle',   mult: 2,  unlockCost: 150 },
    { id: 'labrador', emoji: '🦮',    name: 'Labrador', mult: 4,  unlockCost: 800 },
    { id: 'caniche',  emoji: '🐩',    name: 'Caniche',  mult: 8,  unlockCost: 4000 },
    { id: 'berger',   emoji: '🐕‍🦺', name: 'Berger',   mult: 16, unlockCost: 20000 },
  ],

  // Accessoires achetables pour chaque chien.
  // incomeBonus = bonus de revenu en % pour CE chien (0 = purement cosmétique)
  accessories: [
    { id: 'balle',   emoji: '🎾', name: 'Balle',   cost: 100, incomeBonus: 0.25 },
    { id: 'gamelle', emoji: '🥣', name: 'Gamelle', cost: 250, incomeBonus: 0.25 },
    { id: 'noeud',   emoji: '🎀', name: 'Nœud',    cost: 300, incomeBonus: 0 },
    { id: 'panier',  emoji: '🛏️', name: 'Panier',  cost: 600, incomeBonus: 0.5 },
  ],

  // Noms proposés par défaut quand on adopte
  defaultNames: [
    'Biscuit', 'Nouille', 'Caramel', 'Pixel', 'Réglisse',
    'Tornade', 'Mochi', 'Fripouille', 'Cannelle', 'Vanille',
    'Peluche', 'Filou', 'Praline', 'Ouragan', 'Chaussette',
  ],

  // Adoption : coût croissant à chaque chien, multiplié par la race choisie
  dog: {
    baseCost: 10,
    costGrowth: 1.6,   // coût multiplié à chaque adoption
    baseIncome: 1,     // pièces/seconde par chien, niveau 0, race x1
  },

  upgrades: {
    // "Croquettes améliorées" : +1 pièce/s de base par chien à chaque niveau
    // (multiplié ensuite par la race et les accessoires)
    kibble: { baseCost: 50, costGrowth: 1.8, incomePerLevel: 1 },
    // "Agrandir le bar" : +2 places à chaque achat
    expand: { baseCost: 100, costGrowth: 2.2, slotsPerBuy: 2, maxSlots: 20 },
  },

  // Caresser un chien (tap) donne un petit bonus immédiat
  petReward: 1,

  // Gains hors-ligne : 50% du revenu normal, plafonnés à 8h
  offline: { rate: 0.5, maxSeconds: 8 * 3600 },

  // Pièce décorative qui s'envole d'un chien au hasard toutes les X ms
  ambientCoinIntervalMs: 3500,

  autosaveIntervalMs: 5000,
};
