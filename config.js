// ============================================================
// CONFIG — toutes les données et réglages d'équilibrage du jeu.
// Pour itérer (nouvelles races, accessoires...), c'est ici qu'on ajoute.
// ============================================================

const CONFIG = {
  saveKey: 'dogbar-save-v1',

  startCoins: 15,
  startSlots: 4,

  // Races de chiens (dessins dans art.js / BREED_ART).
  // mult = multiplicateur de revenu ; unlockCost = prix de déblocage (0 = dispo dès le début)
  breeds: [
    { id: 'chiot',        name: 'Chiot',         mult: 1,    unlockCost: 0 },
    { id: 'beagle',       name: 'Beagle',        mult: 2,    unlockCost: 150 },
    { id: 'teckel',       name: 'Teckel',        mult: 4,    unlockCost: 800 },
    { id: 'labrador',     name: 'Labrador',      mult: 8,    unlockCost: 3500 },
    { id: 'corgi',        name: 'Corgi',         mult: 16,   unlockCost: 15000 },
    { id: 'caniche',      name: 'Caniche',       mult: 32,   unlockCost: 60000 },
    { id: 'dalmatien',    name: 'Dalmatien',     mult: 64,   unlockCost: 250000 },
    { id: 'husky',        name: 'Husky',         mult: 128,  unlockCost: 1000000 },
    { id: 'berger',       name: 'Berger',        mult: 256,  unlockCost: 4000000 },
    { id: 'saintbernard', name: 'Saint-Bernard', mult: 512,  unlockCost: 15000000 },
    { id: 'magique',      name: 'Chien magique', mult: 1024, unlockCost: 60000000 },
  ],

  // Accessoires achetables pour chaque chien.
  // incomeBonus = bonus de revenu en % pour CE chien (0 = purement cosmétique)
  accessories: [
    { id: 'balle',    emoji: '🎾', name: 'Balle',    cost: 100,  incomeBonus: 0.25 },
    { id: 'gamelle',  emoji: '🥣', name: 'Gamelle',  cost: 250,  incomeBonus: 0.25 },
    { id: 'noeud',    emoji: '🎀', name: 'Nœud',     cost: 300,  incomeBonus: 0 },
    { id: 'chapeau',  emoji: '🎉', name: 'Chapeau',  cost: 450,  incomeBonus: 0 },
    { id: 'panier',   emoji: '🛏️', name: 'Panier',   cost: 600,  incomeBonus: 0.5 },
    { id: 'lunettes', emoji: '🕶️', name: 'Lunettes', cost: 900,  incomeBonus: 0.25 },
    { id: 'os',       emoji: '🦴', name: 'Os doré',  cost: 2000, incomeBonus: 0.75 },
  ],

  // Missions successives : toujours un prochain objectif + une récompense.
  // type : dogs (nb de chiens), pets (caresses), served (clients servis),
  // accessories (accessoires achetés), breeds (races débloquées),
  // expand (agrandissements), kibble (niveau croquettes)
  quests: [
    { type: 'dogs',        n: 1,   text: 'Adopte ton premier chien',    reward: 25 },
    { type: 'pets',        n: 5,   text: 'Caresse les chiens 5 fois',   reward: 40 },
    { type: 'served',      n: 5,   text: 'Sers 5 clients',              reward: 60 },
    { type: 'accessories', n: 1,   text: 'Achète un accessoire',        reward: 120 },
    { type: 'dogs',        n: 3,   text: 'Aie 3 chiens',                reward: 250 },
    { type: 'breeds',      n: 2,   text: 'Débloque une nouvelle race',  reward: 400 },
    { type: 'expand',      n: 1,   text: 'Agrandis le bar',             reward: 600 },
    { type: 'served',      n: 25,  text: 'Sers 25 clients',             reward: 1200 },
    { type: 'dogs',        n: 6,   text: 'Aie 6 chiens',                reward: 3000 },
    { type: 'breeds',      n: 4,   text: 'Débloque 4 races',            reward: 8000 },
    { type: 'kibble',      n: 5,   text: 'Croquettes niveau 5',         reward: 15000 },
    { type: 'served',      n: 100, text: 'Sers 100 clients',            reward: 40000 },
    { type: 'dogs',        n: 12,  text: 'Aie 12 chiens',               reward: 100000 },
    { type: 'breeds',      n: 7,   text: 'Débloque 7 races',            reward: 500000 },
    { type: 'accessories', n: 15,  text: 'Achète 15 accessoires',       reward: 1000000 },
    { type: 'dogs',        n: 20,  text: 'Remplis le bar (20 chiens)',  reward: 5000000 },
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

  // Clients : plus les chiens sont nombreux/mignons (attraction), plus
  // ils arrivent vite. Intervalle entre deux clients, en secondes.
  // Parcours d'un client : porte → comptoir (commande) → coussin d'un chien
  // (boit, caresse le chien) → paie → porte.
  customers: {
    maxIntervalSec: 8,    // avec 1 petit chien
    minIntervalSec: 2.2,  // rythme maxi, ensuite chaque client paie plus
    emojis: ['🧒', '👧', '👦', '👩', '🧔', '👨‍🦰', '👱‍♀️', '👵', '👴', '👩‍🦱'],
    drinks: ['🥤', '🧃', '🧋', '🍹', '☕', '🍫'],
    orderMs: 1100,  // pause au comptoir pour commander
    drinkMs: 2400,  // temps assis à boire
    petMs: 1500,    // temps passé à caresser le chien
    walkMsPerUnit: 9, // vitesse de marche (ms par unité SVG parcourue)
  },

  // Événements aléatoires (client VIP, pluie de pièces, chien perdu)
  events: {
    minDelaySec: 45,
    maxDelaySec: 100,
    vipMult: 10,          // un VIP paie 10x un client normal
    rain: {
      durationMs: 6000,   // durée de la pluie de pièces
      spawnEveryMs: 320,  // une pièce toutes les X ms
      fallMs: 2600,       // temps de chute d'une pièce
    },
  },

  // Prestige : déménager remet à zéro mais donne des médailles permanentes.
  // médailles totales = racine carrée (pièces gagnées en tout / earnedPerMedal)
  prestige: {
    earnedPerMedal: 50000,
    bonusPerMedal: 0.1,   // +10% de revenus par médaille, pour toujours
  },

  // Gains hors-ligne : 50% du revenu normal, plafonnés à 8h
  offline: { rate: 0.5, maxSeconds: 8 * 3600 },

  autosaveIntervalMs: 5000,
};
