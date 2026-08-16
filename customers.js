// ============================================================
// CUSTOMERS — les clients qui entrent, commandent et paient.
// Partie visuelle ; le rythme et les montants viennent de game.js.
// ============================================================

const sceneEl = document.getElementById('scene');
const doorEl = document.getElementById('door');

// Position (en %) d'un élément dans la scène
function scenePos(elem) {
  const s = sceneEl.getBoundingClientRect();
  const r = elem.getBoundingClientRect();
  return {
    x: ((r.left + r.width / 2 - s.left) / s.width) * 100,
    y: ((r.top + r.height / 2 - s.top) / s.height) * 100,
  };
}

function randomOf(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Appelé à chaque frame par main.js
function updateCustomers(dt) {
  const spend = advanceCustomers(dt);
  if (spend > 0) spawnCustomer(spend);
}

function spawnCustomer(spend) {
  const c = CONFIG.customers;
  const dogSpots = sceneEl.querySelectorAll('.spot.has-dog');
  if (dogSpots.length === 0) return;

  // Le client vise une place à côté d'un chien au hasard
  const spot = dogSpots[Math.floor(Math.random() * dogSpots.length)];
  const target = scenePos(spot);
  const side = target.x > 50 ? -9 : 9; // il s'assied à gauche ou à droite du chien
  const doorPos = scenePos(doorEl);

  const cust = document.createElement('div');
  cust.className = 'customer';
  cust.innerHTML =
    '<span class="person">' + randomOf(c.emojis) + '</span>' +
    '<span class="bubble hidden"></span>';
  cust.style.left = doorPos.x + '%';
  cust.style.top = doorPos.y + '%';
  sceneEl.appendChild(cust);

  // Entre dans le bar (la transition CSS fait la marche)
  requestAnimationFrame(() => requestAnimationFrame(() => {
    cust.style.left = (target.x + side) + '%';
    cust.style.top = (target.y + (Math.random() * 6 - 3)) + '%';
  }));

  // Arrivé : commande une boisson
  setTimeout(() => {
    const bubble = cust.querySelector('.bubble');
    bubble.textContent = randomOf(c.drinks);
    bubble.classList.remove('hidden');
  }, c.walkMs);

  // A fini son verre : paie (pièce qui vole vers le compteur) et caresse le chien
  setTimeout(() => {
    payCustomer(spend);
    playSound('coin');
    const from = cust.getBoundingClientRect();
    flyCoin(from.left + from.width / 2, from.top, spend);
    const dogRect = spot.getBoundingClientRect();
    floatText(dogRect.left + dogRect.width / 2, dogRect.top, '❤️');
  }, c.walkMs + c.drinkMs);

  // Repart vers la porte, puis disparaît
  setTimeout(() => {
    cust.querySelector('.bubble').classList.add('hidden');
    cust.style.left = doorPos.x + '%';
    cust.style.top = doorPos.y + '%';
    setTimeout(() => cust.remove(), c.walkMs);
  }, c.walkMs + c.drinkMs + 400);
}

// Pièce qui vole du client jusqu'au compteur en haut
function flyCoin(x, y, amount) {
  const coin = document.createElement('div');
  coin.className = 'coin-fly';
  coin.textContent = '🪙';
  coin.style.left = x + 'px';
  coin.style.top = y + 'px';
  document.body.appendChild(coin);

  const box = document.querySelector('.coin-box').getBoundingClientRect();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    coin.style.left = (box.left + box.width / 2) + 'px';
    coin.style.top = (box.top + box.height / 2) + 'px';
    coin.style.transform = 'scale(0.6)';
  }));
  setTimeout(() => {
    coin.remove();
    floatText(box.left + box.width / 2, box.top + 30, '+' + formatNumber(amount));
  }, 800);
}
