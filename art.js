// ============================================================
// ART — tous les dessins vectoriels (SVG) : chiens, clients, meubles.
// Chaque fonction renvoie du balisage SVG ; l'origine (0,0) est aux
// pieds du personnage / de l'objet, on dessine vers le haut (y négatif).
// ============================================================

// Apparence de chaque race : couleurs, oreilles, taille, détails
// (long = corps allongé, spots = taches, faceMask = masque clair sur le visage,
//  eyeColor = yeux colorés, barrel = tonneau de secours, sparkle = étoiles magiques)
const BREED_ART = {
  chiot:        { body: '#d9a066', belly: '#f6dcb4', ear: '#b57f45', ears: 'floppy', scale: 0.85 },
  beagle:       { body: '#f6ecdd', belly: '#fdf8ef', ear: '#7a4a21', ears: 'floppy', scale: 0.95, patch: '#a9743c' },
  teckel:       { body: '#a4682f', belly: '#d6a06b', ear: '#7a4a21', ears: 'floppy', scale: 0.92, long: true },
  labrador:     { body: '#e8c07a', belly: '#f9e6bd', ear: '#cda45e', ears: 'floppy', scale: 1.05 },
  corgi:        { body: '#f3a35c', belly: '#fff4e4', ear: '#e0854a', ears: 'pointy', scale: 0.9 },
  caniche:      { body: '#f2dce4', belly: '#fbf1f5', ear: '#e3bccb', ears: 'curly',  scale: 1.0 },
  dalmatien:    { body: '#fbfbf5', belly: '#ffffff', ear: '#2d2d2d', ears: 'floppy', scale: 1.05, spots: '#2d2d2d' },
  husky:        { body: '#9fb2c4', belly: '#f2f6f9', ear: '#7d92a6', ears: 'pointy', scale: 1.08, faceMask: true, eyeColor: '#4d9fe8' },
  berger:       { body: '#8a7258', belly: '#cdb798', ear: '#6d5942', ears: 'pointy', scale: 1.1, harness: '#e05252' },
  saintbernard: { body: '#b5743a', belly: '#f3e2c8', ear: '#8a5426', ears: 'floppy', scale: 1.22, faceMask: true, barrel: true },
  magique:      { body: '#cfe0ff', belly: '#f0f6ff', ear: '#f2c4ef', ears: 'pointy', scale: 1.05, sparkle: true, eyeColor: '#b06fe0' },
};

function dogEars(a) {
  if (a.ears === 'pointy') {
    return `<path d="M-15,-46 L-12,-64 L-3,-50 Z" fill="${a.ear}"/>
            <path d="M15,-46 L12,-64 L3,-50 Z" fill="${a.ear}"/>
            <path d="M-12.5,-48 L-11,-58 L-7,-51 Z" fill="#e8a7b0"/>
            <path d="M12.5,-48 L11,-58 L7,-51 Z" fill="#e8a7b0"/>`;
  }
  if (a.ears === 'curly') {
    return `<circle cx="-16" cy="-44" r="7.5" fill="${a.ear}"/>
            <circle cx="-17.5" cy="-36" r="6" fill="${a.ear}"/>
            <circle cx="16" cy="-44" r="7.5" fill="${a.ear}"/>
            <circle cx="17.5" cy="-36" r="6" fill="${a.ear}"/>
            <circle cx="-6" cy="-53" r="6.5" fill="${a.ear}"/>
            <circle cx="6" cy="-53" r="6.5" fill="${a.ear}"/>
            <circle cx="0" cy="-56" r="7" fill="${a.ear}"/>`;
  }
  // floppy (grandes oreilles tombantes)
  return `<path d="M-12,-52 Q-25,-50 -22,-27 Q-21,-21 -14,-26 Q-17,-40 -8,-49 Z" fill="${a.ear}"/>
          <path d="M12,-52 Q25,-50 22,-27 Q21,-21 14,-26 Q17,-40 8,-49 Z" fill="${a.ear}"/>`;
}

// Accessoires dessinés sur / autour du chien.
// (la balle n'est pas ici : c'est un élément à part, le chien va la chercher !)
function dogAccessories(accessories) {
  let out = '';
  if (accessories.includes('gamelle')) {
    out += `<g class="acc acc-gamelle"><path d="M-28,-7 L-14,-7 L-16,0 L-26,0 Z" fill="#e05252"/>
            <ellipse cx="-21" cy="-7" rx="7" ry="2.6" fill="#f3a35c"/></g>`;
  }
  if (accessories.includes('noeud')) {
    out += `<g class="acc acc-noeud"><path d="M9,-56 L18,-61 L18,-51 Z" fill="#ff5f8f"/>
            <path d="M9,-56 L0,-61 L0,-51 Z" fill="#ff5f8f"/>
            <circle cx="9" cy="-56" r="2.6" fill="#d8336b"/></g>`;
  }
  if (accessories.includes('chapeau')) {
    out += `<g class="acc acc-chapeau" transform="translate(-8,-51) rotate(-16)">
            <path d="M-6,0 L6,0 L0,-15 Z" fill="#6fb7e8"/>
            <path d="M-4.2,-4.5 L4.2,-4.5 L3,-7.5 L-3,-7.5 Z" fill="#ffd23f"/>
            <circle cx="0" cy="-15" r="2.4" fill="#ff5f8f"/></g>`;
  }
  if (accessories.includes('lunettes')) {
    out += `<g class="acc acc-lunettes">
            <rect x="-12.5" y="-44.5" width="10" height="7.5" rx="3.4" fill="#2d2d2d"/>
            <rect x="2.5" y="-44.5" width="10" height="7.5" rx="3.4" fill="#2d2d2d"/>
            <rect x="-3" y="-43" width="6" height="2" fill="#2d2d2d"/>
            <circle cx="-8" cy="-42.5" r="1.2" fill="#fff" opacity="0.6"/>
            <circle cx="7" cy="-42.5" r="1.2" fill="#fff" opacity="0.6"/></g>`;
  }
  if (accessories.includes('os')) {
    out += `<g class="acc acc-os" transform="translate(1,1) rotate(-10)">
            <rect x="-5" y="-1.8" width="10" height="3.6" rx="1.8" fill="#ffd23f" stroke="#c79400" stroke-width="0.7"/>
            <circle cx="-5" cy="-1.6" r="2.2" fill="#ffd23f" stroke="#c79400" stroke-width="0.7"/>
            <circle cx="-5" cy="1.6" r="2.2" fill="#ffd23f" stroke="#c79400" stroke-width="0.7"/>
            <circle cx="5" cy="-1.6" r="2.2" fill="#ffd23f" stroke="#c79400" stroke-width="0.7"/>
            <circle cx="5" cy="1.6" r="2.2" fill="#ffd23f" stroke="#c79400" stroke-width="0.7"/></g>`;
  }
  return out;
}

// Un chien cartoon "chibi" : grosse tête, yeux énormes qui clignent,
// joues roses, langue tirée qui halète, grosse queue qui remue.
function dogSVG(breedId, accessories) {
  const a = BREED_ART[breedId] || BREED_ART.chiot;
  const acc = accessories || [];
  const bodyRx = a.long ? 21 : 14;
  const collar = acc.includes('noeud') ? '' :
    a.sparkle ?
    `<rect x="-10" y="-24" width="20" height="4" rx="2" fill="url(#rainbow)"/>
     <circle cx="0" cy="-19" r="2.6" fill="#ffd23f"/>` :
    `<rect x="-10" y="-24" width="20" height="4" rx="2" fill="#e05252"/>
     <circle cx="0" cy="-19" r="2.6" fill="#ffd23f"/>`;
  const harness = a.harness ?
    `<path d="M-13,-13 Q0,-6 13,-13" stroke="${a.harness}" stroke-width="4" fill="none"/>` : '';
  const patch = a.patch ? `<circle cx="7.5" cy="-41" r="6.5" fill="${a.patch}" opacity="0.85"/>` : '';
  const faceMask = a.faceMask ? `<ellipse cx="0" cy="-33" rx="11" ry="10" fill="${a.belly}"/>` : '';
  const spots = a.spots ?
    `<circle cx="-8" cy="-12" r="2.6" fill="${a.spots}"/>
     <circle cx="5" cy="-8" r="3" fill="${a.spots}"/>
     <circle cx="9" cy="-43" r="2.6" fill="${a.spots}"/>
     <circle cx="-7" cy="-46" r="2" fill="${a.spots}"/>
     <circle cx="1" cy="-15" r="2" fill="${a.spots}"/>` : '';
  const barrel = a.barrel ?
    `<g transform="translate(0,-17)"><rect x="-5" y="-4" width="10" height="8" rx="2.5" fill="#8a5a2b"/>
     <rect x="-5" y="-1.2" width="10" height="2.4" fill="#ffd23f"/></g>` : '';
  const sparkles = a.sparkle ?
    `<g class="sparkles" fill="#ffd23f">
     <path class="spark" d="M-19,-55 L-18,-52.5 L-15.5,-51.5 L-18,-50.5 L-19,-48 L-20,-50.5 L-22.5,-51.5 L-20,-52.5 Z"/>
     <path class="spark spark-2" d="M17,-62 L18,-59.5 L20.5,-58.5 L18,-57.5 L17,-55 L16,-57.5 L13.5,-58.5 L16,-59.5 Z"/>
     </g>` : '';
  return `<g class="dog-body" transform="scale(${a.scale})">
    <ellipse class="dog-shadow" cx="0" cy="1" rx="${bodyRx + 4}" ry="4" fill="rgba(0,0,0,0.15)"/>
    <path class="tail" d="M${bodyRx - 3},-8 Q${bodyRx + 14},-10 ${bodyRx + 12},-28 Q${bodyRx + 11},-33 ${bodyRx + 5},-30 Q${bodyRx + 6},-17 ${bodyRx - 5},-13 Z" fill="${a.body}"/>
    <ellipse cx="0" cy="-10" rx="${bodyRx}" ry="10" fill="${a.body}"/>
    <ellipse cx="0" cy="-7" rx="${a.long ? 12 : 8}" ry="6" fill="${a.belly}"/>
    ${harness}
    <ellipse cx="-${a.long ? 12 : 6}" cy="-1.5" rx="4.5" ry="2.8" fill="${a.body}"/>
    <ellipse cx="${a.long ? 12 : 6}" cy="-1.5" rx="4.5" ry="2.8" fill="${a.body}"/>
    ${dogEars(a)}
    <circle cx="0" cy="-36" r="17" fill="${a.body}"/>
    ${faceMask}
    ${patch}
    ${spots}
    <ellipse cx="0" cy="-29" rx="8" ry="6" fill="${a.belly}"/>
    <ellipse cx="0" cy="-33.5" rx="3" ry="2.4" fill="#3b2b20"/>
    <path d="M0,-31.5 L0,-29.5 M0,-29.5 Q-3,-27.5 -5,-29.2 M0,-29.5 Q3,-27.5 5,-29.2" stroke="#3b2b20" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <path class="tongue" d="M-2.4,-28.5 Q-2.4,-22 0,-21 Q2.4,-22 2.4,-28.5 Z" fill="#ff7fa2"/>
    <ellipse cx="-12.5" cy="-31" rx="3.2" ry="2.2" fill="#ff9db4" opacity="0.55"/>
    <ellipse cx="12.5" cy="-31" rx="3.2" ry="2.2" fill="#ff9db4" opacity="0.55"/>
    <g class="eyes">
      <ellipse cx="-7.5" cy="-40" rx="4.6" ry="5.4" fill="#fff"/>
      <ellipse cx="7.5" cy="-40" rx="4.6" ry="5.4" fill="#fff"/>
      <circle cx="-6.8" cy="-39.2" r="2.8" fill="${a.eyeColor || '#2d2016'}"/>
      <circle cx="8.2" cy="-39.2" r="2.8" fill="${a.eyeColor || '#2d2016'}"/>
      <circle cx="-5.9" cy="-40.4" r="1.1" fill="#fff"/>
      <circle cx="9.1" cy="-40.4" r="1.1" fill="#fff"/>
      <circle cx="-7.6" cy="-38" r="0.55" fill="#fff"/>
      <circle cx="7.4" cy="-38" r="0.55" fill="#fff"/>
    </g>
    ${collar}
    ${barrel}
    ${sparkles}
    ${dogAccessories(acc)}
  </g>`;
}

// La balle de jeu (élément séparé : elle roule et le chien la rapporte)
function playBallSVG() {
  return `<circle r="6" fill="#8ecf4d"/>
    <path d="M-4.6,-2 Q0,2.5 4.6,-2" stroke="#fff" stroke-width="1.6" fill="none"/>
    <path d="M-4.6,2 Q0,-2.5 4.6,2" stroke="#fff" stroke-width="1.6" fill="none"/>`;
}

// Vignette d'un chien pour les popups (adoption, fiche)
function dogThumb(breedId, size, accessories) {
  return `<svg viewBox="-30 -68 60 72" width="${size}" height="${size * 1.2}">` +
    dogSVG(breedId, accessories || []) + '</svg>';
}

// ---- Clients ----

const PEOPLE_ART = {
  skins: ['#ffd9b3', '#f1c27d', '#c68642', '#8d5524'],
  hairs: ['#3b2b20', '#6b4423', '#e8b23a', '#1f1f1f', '#a34a2a', '#888'],
  shirts: ['#ff8fab', '#6fb7e8', '#8ecf4d', '#f3a35c', '#b58ae0', '#ffd23f'],
};

function randomOf(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Un petit personnage debout, jambes animables (classe .leg).
// opts.vip : couronne dorée + tenue dorée
function personSVG(opts) {
  const vip = opts && opts.vip;
  const skin = randomOf(PEOPLE_ART.skins);
  const hair = randomOf(PEOPLE_ART.hairs);
  const shirt = vip ? '#ffd23f' : randomOf(PEOPLE_ART.shirts);
  const crown = vip ?
    `<path d="M-7,-50 L-5.5,-56 L-2.5,-51.5 L0,-57 L2.5,-51.5 L5.5,-56 L7,-50 Z"
       fill="#ffd23f" stroke="#c79400" stroke-width="0.9"/>
     <circle cx="0" cy="-57.5" r="1.2" fill="#ff5f8f"/>` : '';
  return `<g class="walker">
    <ellipse class="person-shadow" cx="0" cy="1" rx="10" ry="2.6" fill="rgba(0,0,0,0.15)"/>
    <g class="legs">
      <g class="leg"><rect x="-6.5" y="-13" width="5" height="13" rx="2" fill="#4a5568"/><rect x="-7.5" y="-3" width="7" height="3.4" rx="1.6" fill="#2d3238"/></g>
      <g class="leg"><rect x="1.5" y="-13" width="5" height="13" rx="2" fill="#4a5568"/><rect x="0.5" y="-3" width="7" height="3.4" rx="1.6" fill="#2d3238"/></g>
    </g>
    <rect x="-13.5" y="-30" width="5" height="13" rx="2.4" fill="${shirt}" transform="rotate(8)"/>
    <rect x="8.5" y="-30" width="5" height="13" rx="2.4" fill="${shirt}" transform="rotate(-8)"/>
    <rect x="-10" y="-32" width="20" height="21" rx="7" fill="${shirt}"/>
    <circle cx="0" cy="-42" r="10" fill="${skin}"/>
    <path d="M-10,-44 A10,10 0 0 1 10,-44 L10,-42 Q0,-49 -10,-42 Z" fill="${hair}"/>
    <circle cx="-3.5" cy="-41" r="1.4" fill="#3b2b20"/>
    <circle cx="3.5" cy="-41" r="1.4" fill="#3b2b20"/>
    <path d="M-3,-37 Q0,-34.5 3,-37" stroke="#3b2b20" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    ${crown}
    <g class="hand-drink"></g>
  </g>`;
}

// ---- Boissons ----

const DRINK_COLORS = ['#f3a35c', '#8ecf4d', '#ff8fab', '#8a5a3b', '#6fb7e8', '#ffd23f'];

// Un verre avec paille (posé, origine au pied du verre)
function drinkSVG(color) {
  return `<g class="drink">
    <line x1="1" y1="-16" x2="5" y2="-7" stroke="#e05252" stroke-width="1.6"/>
    <path d="M-5.5,-12 L5.5,-12 L4,0 L-4,0 Z" fill="rgba(255,255,255,0.55)" stroke="#fff" stroke-width="0.8"/>
    <path d="M-4.9,-8.5 L4.9,-8.5 L4,0 L-4,0 Z" fill="${color}"/>
  </g>`;
}

// Bulle de commande au-dessus de la tête (avec le verre demandé dedans)
function bubbleSVG(color) {
  return `<rect x="-10" y="-24" width="20" height="20" rx="7" fill="#fff" stroke="#e8d9c5"/>
    <path d="M-3,-5 L0,0 L3,-5 Z" fill="#fff"/>
    <g transform="translate(0,-6.5) scale(0.85)">${drinkSVG(color)}</g>`;
}

// ---- Meubles ----

// Table ronde avec deux chaises (origine au sol, centre de la table)
function tableSVG() {
  const chair = (dir) => `<g transform="translate(${dir * 33},8) scale(${dir},1)">
      <rect x="6" y="-26" width="4" height="17" rx="2" fill="#a9743c"/>
      <rect x="-8" y="-11" width="16" height="5" rx="2.5" fill="#c8955c"/>
      <rect x="-7" y="-6" width="3" height="6" rx="1.4" fill="#8a5a2b"/>
      <rect x="4" y="-6" width="3" height="6" rx="1.4" fill="#8a5a2b"/>
    </g>`;
  return `${chair(-1)}${chair(1)}
    <rect x="-2.5" y="-16" width="5" height="16" fill="#8a5a2b"/>
    <path d="M-9,-2 L-2,-8 M9,-2 L2,-8" stroke="#8a5a2b" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="0" cy="-17" rx="24" ry="8" fill="#c8955c"/>
    <ellipse cx="0" cy="-19" rx="24" ry="8" fill="#e0b077"/>
    <g class="drink-slot" transform="translate(0,-19)"></g>`;
}

// Coussin douillet (origine au sol, centre)
function cushionSVG(fancy) {
  const c1 = fancy ? '#b58ae0' : '#ff8fab';
  const c2 = fancy ? '#9a6cc9' : '#e07092';
  const rim = fancy ? `<ellipse cx="0" cy="-3" rx="26" ry="9" fill="${c2}"/>` : '';
  return `<g class="cushion-art">
    ${rim}
    <ellipse cx="0" cy="-4" rx="${fancy ? 23 : 22}" ry="8" fill="${c1}"/>
    <ellipse cx="0" cy="-6" rx="${fancy ? 20 : 19}" ry="6.5" fill="${fancy ? '#c9a5ee' : '#ffa8c0'}"/>
    <circle cx="0" cy="-6" r="1.6" fill="${c2}"/>
  </g>`;
}

// Plante verte en pot (décoration des agrandissements)
function plantSVG() {
  return `<path d="M0,-14 Q-7,-22 -3,-30 M0,-14 Q0,-26 0,-32 M0,-14 Q7,-22 3,-30"
      stroke="#5da354" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M-7,-14 L7,-14 L5,0 L-5,0 Z" fill="#c96f3b"/>
    <rect x="-8" y="-16" width="16" height="4" rx="2" fill="#e0854a"/>`;
}
