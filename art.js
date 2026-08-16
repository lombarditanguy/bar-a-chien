// ============================================================
// ART — tous les dessins vectoriels (SVG) : chiens, clients, meubles.
// Chaque fonction renvoie du balisage SVG ; l'origine (0,0) est aux
// pieds du personnage / de l'objet, on dessine vers le haut (y négatif).
// ============================================================

// Apparence de chaque race : couleurs, oreilles, taille, détails
const BREED_ART = {
  chiot:    { body: '#d9a066', belly: '#f3cf9e', ear: '#b57f45', ears: 'floppy', scale: 0.82 },
  beagle:   { body: '#f6ecdd', belly: '#fdf8ef', ear: '#7a4a21', ears: 'floppy', scale: 0.95, patch: '#a9743c' },
  labrador: { body: '#e8c07a', belly: '#f7e0b2', ear: '#cda45e', ears: 'floppy', scale: 1.05 },
  caniche:  { body: '#f2dce4', belly: '#faf0f4', ear: '#e3bccb', ears: 'curly',  scale: 1.0 },
  berger:   { body: '#8a7258', belly: '#c9b294', ear: '#6d5942', ears: 'pointy', scale: 1.12, harness: '#e05252' },
};

function dogEars(a) {
  if (a.ears === 'pointy') {
    return `<path d="M-13,-38 L-9,-52 L-3,-42 Z" fill="${a.ear}"/>
            <path d="M13,-38 L9,-52 L3,-42 Z" fill="${a.ear}"/>
            <path d="M-11,-40 L-9,-48 L-6,-42 Z" fill="#d8a0a8"/>
            <path d="M11,-40 L9,-48 L6,-42 Z" fill="#d8a0a8"/>`;
  }
  if (a.ears === 'curly') {
    return `<circle cx="-14" cy="-34" r="6" fill="${a.ear}"/>
            <circle cx="-15" cy="-28" r="5" fill="${a.ear}"/>
            <circle cx="14" cy="-34" r="6" fill="${a.ear}"/>
            <circle cx="15" cy="-28" r="5" fill="${a.ear}"/>
            <circle cx="0" cy="-46" r="6.5" fill="${a.ear}"/>`;
  }
  // floppy (tombantes)
  return `<path d="M-10,-42 Q-19,-40 -17,-24 Q-16,-20 -12,-22 Q-14,-34 -8,-40 Z" fill="${a.ear}"/>
          <path d="M10,-42 Q19,-40 17,-24 Q16,-20 12,-22 Q14,-34 8,-40 Z" fill="${a.ear}"/>`;
}

// Accessoires dessinés autour / sur le chien
function dogAccessories(accessories) {
  let out = '';
  if (accessories.includes('balle')) {
    out += `<g class="acc acc-balle"><circle cx="17" cy="-4" r="5" fill="#8ecf4d"/>
            <path d="M12.5,-5.5 Q17,-1 21.5,-5.5" stroke="#fff" stroke-width="1.4" fill="none"/></g>`;
  }
  if (accessories.includes('gamelle')) {
    out += `<g class="acc acc-gamelle"><path d="M-24,-6 L-12,-6 L-14,0 L-22,0 Z" fill="#e05252"/>
            <ellipse cx="-18" cy="-6" rx="6" ry="2.2" fill="#f3a35c"/></g>`;
  }
  if (accessories.includes('noeud')) {
    out += `<g class="acc acc-noeud"><path d="M8,-46 L15,-50 L15,-42 Z" fill="#ff5f8f"/>
            <path d="M8,-46 L1,-50 L1,-42 Z" fill="#ff5f8f"/>
            <circle cx="8" cy="-46" r="2.2" fill="#d8336b"/></g>`;
  }
  return out;
}

// Un chien cartoon assis, face au joueur. Gros yeux, langue, queue qui remue.
function dogSVG(breedId, accessories) {
  const a = BREED_ART[breedId] || BREED_ART.chiot;
  const acc = accessories || [];
  const collar = acc.includes('noeud') ? '' :
    `<rect x="-9" y="-22" width="18" height="3.4" rx="1.7" fill="#e05252"/>
     <circle cx="0" cy="-18" r="2.2" fill="#ffd23f"/>`;
  const harness = a.harness ?
    `<path d="M-14,-12 Q0,-6 14,-12" stroke="${a.harness}" stroke-width="3.5" fill="none"/>` : '';
  const patch = a.patch ? `<circle cx="6" cy="-33" r="5.5" fill="${a.patch}" opacity="0.85"/>` : '';
  return `<g class="dog-body" transform="scale(${a.scale})">
    <ellipse class="dog-shadow" cx="0" cy="1" rx="17" ry="4" fill="rgba(0,0,0,0.15)"/>
    <path class="tail" d="M14,-10 Q24,-14 22,-24" stroke="${a.body}" stroke-width="5" stroke-linecap="round" fill="none"/>
    <ellipse cx="0" cy="-11" rx="16" ry="11" fill="${a.body}"/>
    <ellipse cx="0" cy="-8" rx="9" ry="6.5" fill="${a.belly}"/>
    ${harness}
    <ellipse cx="-7" cy="-2" rx="5" ry="3" fill="${a.body}"/>
    <ellipse cx="7" cy="-2" rx="5" ry="3" fill="${a.body}"/>
    ${dogEars(a)}
    <circle cx="0" cy="-32" r="14" fill="${a.body}"/>
    ${patch}
    <ellipse cx="0" cy="-27" rx="7.5" ry="5.5" fill="${a.belly}"/>
    <ellipse cx="0" cy="-30.5" rx="3" ry="2.4" fill="#3b2b20"/>
    <path d="M0,-28 L0,-26 M0,-26 Q-2.5,-24 -4,-25.5 M0,-26 Q2.5,-24 4,-25.5" stroke="#3b2b20" stroke-width="1.1" fill="none"/>
    <path class="tongue" d="M-1.5,-25 Q0,-21 1.5,-25 Z" fill="#ff8fab"/>
    <ellipse cx="-6" cy="-35" rx="3.6" ry="4.2" fill="#fff"/>
    <ellipse cx="6" cy="-35" rx="3.6" ry="4.2" fill="#fff"/>
    <circle cx="-5.4" cy="-34.4" r="2" fill="#3b2b20"/>
    <circle cx="6.6" cy="-34.4" r="2" fill="#3b2b20"/>
    <circle cx="-4.8" cy="-35.2" r="0.7" fill="#fff"/>
    <circle cx="7.2" cy="-35.2" r="0.7" fill="#fff"/>
    ${collar}
    ${dogAccessories(acc)}
  </g>`;
}

// Vignette d'un chien pour les popups (adoption, fiche)
function dogThumb(breedId, size, accessories) {
  return `<svg viewBox="-26 -56 52 60" width="${size}" height="${size * 1.15}">` +
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

// Un petit personnage debout, jambes animables (classe .leg)
function personSVG() {
  const skin = randomOf(PEOPLE_ART.skins);
  const hair = randomOf(PEOPLE_ART.hairs);
  const shirt = randomOf(PEOPLE_ART.shirts);
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
