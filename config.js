// ============================================================
// CONFIG — toutes les données et réglages d'équilibrage du jeu.
// Pour itérer (nouvelles races, accessoires...), c'est ici qu'on ajoute.
// ============================================================

const CONFIG = {
  saveKey: 'dogbar-save-v1',

  startCoins: 15,
  startSlots: 4,

  // Races de chiens (placeholder emoji). Plus tard : coût de déblocage,
  // revenu propre par race, sprite dédié...
  breeds: [
    { emoji: '🐶', name: 'Chiot' },
    { emoji: '🐕', name: 'Beagle' },
    { emoji: '🦮', name: 'Labrador' },
    { emoji: '🐩', name: 'Caniche' },
    { emoji: '🐕‍🦺', name: 'Berger' },
  ],

  // Noms proposés par défaut quand on adopte
  defaultNames: [
    'Biscuit', 'Nouille', 'Caramel', 'Pixel', 'Réglisse',
    'Tornade', 'Mochi', 'Fripouille', 'Cannelle', 'Vanille',
    'Peluche', 'Filou', 'Praline', 'Ouragan', 'Chaussette',
  ],

  // Adoption : coût croissant à chaque chien
  dog: {
    baseCost: 10,
    costGrowth: 1.6,   // coût multiplié à chaque adoption
    baseIncome: 1,     // pièces/seconde par chien, niveau 0
  },

  upgrades: {
    // "Croquettes améliorées" : +1 pièce/s par chien à chaque niveau
    kibble: { baseCost: 50, costGrowth: 1.8, incomePerLevel: 1 },
    // "Agrandir le bar" : +2 places à chaque achat
    expand: { baseCost: 100, costGrowth: 2.2, slotsPerBuy: 2, maxSlots: 20 },
  },

  // Caresser un chien (tap) donne un petit bonus immédiat
  petReward: 1,

  // Gains hors-ligne : 50% du revenu normal, plafonnés à 8h
  offline: { rate: 0.5, maxSeconds: 8 * 3600 },

  autosaveIntervalMs: 5000,
};
