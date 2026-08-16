// ============================================================
// CUSTOMERS — les clients dessinés : ils entrent par la porte,
// commandent au comptoir, s'assoient à une table près d'un chien,
// boivent, caressent le chien, paient et repartent.
// Partie visuelle ; le rythme et les montants viennent de game.js.
// ============================================================

const customersLayer = document.getElementById('customers-layer');
const doorGroup = document.getElementById('door');
const barmanGroup = document.getElementById('barman');

// Points de repère de la scène (coordonnées SVG du viewBox 360x560)
const DOOR_SPOT = { x: 324, y: 200 };
const COUNTER_SPOT = { x: 96, y: 204 };

// Tabourets occupés ("indexTable:côté" -> true)
const busySeats = {};

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Appelé à chaque frame par main.js
function updateCustomers(dt) {
  const spend = advanceCustomers(dt);
  if (spend > 0) spawnCustomer(spend);
}

function setPos(g, x, y, instant) {
  if (instant) g.style.transitionDuration = '0s';
  g.style.transform = `translate(${x}px, ${y}px)`;
  g.dataset.x = x;
  g.dataset.y = y;
}

// Marche : la durée dépend de la distance, les jambes s'animent en CSS
function walkTo(g, x, y) {
  const dist = Math.hypot(x - g.dataset.x, y - g.dataset.y);
  const ms = Math.max(400, dist * CONFIG.customers.walkMsPerUnit);
  g.classList.add('walking');
  g.style.transitionDuration = ms + 'ms';
  setPos(g, x, y);
  return wait(ms + 60).then(() => g.classList.remove('walking'));
}

function openDoor() {
  doorGroup.classList.add('open');
  playSoundSafe('ding');
  setTimeout(() => doorGroup.classList.remove('open'), 900);
}

function playSoundSafe(name) {
  try { playSound(name); } catch (e) { /* audio indisponible */ }
}

function getSpotByDogId(dogId) {
  return el.cushions.querySelector(`.spot[data-dog-id="${dogId}"]`);
}

// Choisit un tabouret libre à la table la plus proche du chien visé
function pickSeat(target) {
  const count = visibleTables();
  const order = TABLE_POS.slice(0, count)
    .map((p, i) => ({ i, p, d: Math.hypot(p.x - target.x, p.y - target.y) }))
    .sort((a, b) => a.d - b.d);
  for (const t of order) {
    for (const side of [-1, 1]) {
      const key = t.i + ':' + side;
      if (!busySeats[key]) {
        busySeats[key] = true;
        return { key, x: t.p.x + side * 33, y: t.p.y + 8, tableIndex: t.i };
      }
    }
  }
  // Tout est pris : il restera debout près du chien
  return { key: null, x: target.x + 34, y: target.y + 8, tableIndex: -1 };
}

function freeSeat(seat) {
  if (seat.key) delete busySeats[seat.key];
}

function tableDrinkSlot(tableIndex) {
  const table = el.tables.querySelector(`.table[data-index="${tableIndex}"]`);
  return table && table.querySelector('.drink-slot');
}

async function spawnCustomer(spend) {
  const c = CONFIG.customers;
  const dog = state.dogs[Math.floor(Math.random() * state.dogs.length)];
  if (!dog) return;

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'customer');
  g.innerHTML = personSVG() + '<g class="bubble hidden" transform="translate(0,-52)"></g>';
  setPos(g, DOOR_SPOT.x, DOOR_SPOT.y, true);
  customersLayer.appendChild(g);
  void g.getBoundingClientRect(); // fige la position de départ avant la marche

  // 1. Entre et va au comptoir
  openDoor();
  await walkTo(g, COUNTER_SPOT.x + 30, COUNTER_SPOT.y);

  // 2. Commande : bulle avec la boisson + clochette, le serveur s'active
  const drinkColor = randomOf(DRINK_COLORS);
  const bubble = g.querySelector('.bubble');
  bubble.innerHTML = bubbleSVG(drinkColor);
  bubble.classList.remove('hidden');
  playSoundSafe('ding');
  barmanGroup.classList.add('serving');
  await wait(c.orderMs);
  bubble.classList.add('hidden');
  barmanGroup.classList.remove('serving');

  // 3. Prend son verre et va s'asseoir près du chien choisi
  const hand = g.querySelector('.hand-drink');
  hand.innerHTML = `<g transform="translate(13,-22) scale(0.8)">${drinkSVG(drinkColor)}</g>`;
  let spotEl = getSpotByDogId(dog.id);
  const dogPos = spotEl ? spotPosition(state.dogs.indexOf(dog)) : DOOR_SPOT;
  const seat = pickSeat(dogPos);
  await walkTo(g, seat.x, seat.y);

  // 4. S'assoit et boit (le verre est posé sur la table)
  g.classList.add('sitting');
  hand.innerHTML = '';
  const slot = tableDrinkSlot(seat.tableIndex);
  if (slot) slot.innerHTML = drinkSVG(drinkColor);
  await wait(c.drinkMs);
  if (slot) slot.innerHTML = '';
  g.classList.remove('sitting');
  freeSeat(seat);

  // 5. Va caresser le chien : pluie de cœurs, le chien frétille
  spotEl = getSpotByDogId(dog.id);
  if (spotEl) {
    await walkTo(g, dogPos.x - 30, dogPos.y + 6);
    playSoundSafe('pet');
    wiggleDog(spotEl);
    const p = svgToScreen(dogPos.x, dogPos.y - 30);
    for (let h = 0; h < 3; h++) {
      setTimeout(() => floatText(p.x + (h - 1) * 14, p.y, '❤️'), h * 260);
    }
    await wait(c.petMs);
  }

  // 6. Paie : la pièce vole jusqu'au compteur
  payCustomer(spend);
  playSoundSafe('coin');
  const from = g.getBoundingClientRect();
  flyCoin(from.left + from.width / 2, from.top, spend);

  // 7. Ressort par la porte
  await walkTo(g, DOOR_SPOT.x, DOOR_SPOT.y);
  openDoor();
  g.remove();
}

// Pièce (dessinée en CSS) qui vole du client jusqu'au compteur en haut
function flyCoin(x, y, amount) {
  const coin = document.createElement('div');
  coin.className = 'coin-fly';
  coin.style.left = x + 'px';
  coin.style.top = y + 'px';
  document.body.appendChild(coin);

  const box = document.querySelector('.coin-box').getBoundingClientRect();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    coin.style.left = (box.left + box.width / 2) + 'px';
    coin.style.top = (box.top + box.height / 2) + 'px';
    coin.style.transform = 'scale(0.5)';
  }));
  setTimeout(() => {
    coin.remove();
    floatText(box.left + box.width / 2, box.top + 30, '+' + formatNumber(amount));
  }, 800);
}
