// ============================================================
// DOGPLAY — les comportements des chiens : rapporter la balle,
// petits bonds de joie. Purement visuel, aucun effet sur l'économie.
// ============================================================

const DOG_PLAY = {
  tickMs: 3000,      // toutes les X ms, un chien au hasard tente une action
  chance: 0.55,      // probabilité qu'il se passe quelque chose à chaque tick
  rollMs: 700,       // temps de roulade de la balle
  runMsPerUnit: 10,  // vitesse de course du chien
  chewMs: 700,       // pause quand il attrape la balle
};

const busyDogs = new Set();

function dogPlayTick() {
  if (document.hidden || state.dogs.length === 0) return;
  if (Math.random() > DOG_PLAY.chance) return;
  const dog = state.dogs[Math.floor(Math.random() * state.dogs.length)];
  if (busyDogs.has(dog.id)) return;
  if (dog.accessories.includes('balle')) {
    fetchBall(dog);
  } else {
    joyJump(dog);
  }
}

// Petit bond de joie sur place
function joyJump(dog) {
  const spot = getSpotByDogId(dog.id);
  const wrap = spot && spot.querySelector('.dog-wrap');
  if (!wrap) return;
  wrap.classList.remove('joy');
  void wrap.getBoundingClientRect();
  wrap.classList.add('joy');
  setTimeout(() => wrap.classList.remove('joy'), 1000);
}

// La balle roule dans le bar, le chien court la chercher et la rapporte
async function fetchBall(dog) {
  busyDogs.add(dog.id);
  try {
    const spot = getSpotByDogId(dog.id);
    if (!spot) return;
    const move = spot.querySelector('.dog-move');
    const ballMove = spot.querySelector('.play-ball-move');
    if (!move || !ballMove) return;

    // Point d'atterrissage de la balle : vers le centre du bar, dans les limites
    const idx = state.dogs.indexOf(dog);
    const pos = spotPosition(idx);
    const dx = Math.max(30 - pos.x, Math.min(330 - pos.x, (180 - pos.x) * (0.4 + Math.random() * 0.5) + (Math.random() * 60 - 30)));
    const dy = Math.max(240 - pos.y, Math.min(520 - pos.y, 40 + Math.random() * 60));

    // 1. La balle roule
    ballMove.classList.add('rolling');
    ballMove.style.transitionDuration = DOG_PLAY.rollMs + 'ms';
    ballMove.style.transform = `translate(${dx}px, ${dy}px)`;
    await wait(DOG_PLAY.rollMs + 60);
    ballMove.classList.remove('rolling');

    // 2. Le chien court la chercher
    const runMs = Math.max(400, Math.hypot(dx, dy) * DOG_PLAY.runMsPerUnit);
    move.classList.add('running');
    move.style.transitionDuration = runMs + 'ms';
    move.style.transform = `translate(${dx}px, ${dy}px)`;
    await wait(runMs + 60);

    // 3. Il l'attrape (petite pause fière)
    playSoundSafe('pet');
    await wait(DOG_PLAY.chewMs);

    // 4. Il revient avec la balle
    const back = Math.max(400, Math.hypot(dx, dy) * DOG_PLAY.runMsPerUnit);
    move.style.transitionDuration = back + 'ms';
    move.style.transform = 'translate(0px, 0px)';
    ballMove.style.transitionDuration = back + 'ms';
    ballMove.style.transform = 'translate(0px, 0px)';
    await wait(back + 60);
    move.classList.remove('running');

    // 5. Content ! (le spot a pu être reconstruit entre-temps : on re-cherche)
    const freshSpot = getSpotByDogId(dog.id);
    if (freshSpot) {
      wiggleDog(freshSpot);
      const p = svgToScreen(pos.x, pos.y - 40);
      floatText(p.x, p.y, '❤️');
    }
  } finally {
    busyDogs.delete(dog.id);
  }
}
