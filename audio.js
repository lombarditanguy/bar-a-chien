// ============================================================
// AUDIO — petits sons synthétisés (WebAudio), aucun fichier audio.
// Placeholder en attendant de vrais sons ; coupables avec le bouton 🔊.
// ============================================================

let audioCtx = null;

function playSound(name) {
  if (!state.settings.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch (e) {
    return; // pas d'audio disponible : le jeu reste silencieux
  }

  const t0 = audioCtx.currentTime;
  // Petite note : freq en Hz, start/dur en secondes
  function note(freq, start, dur, type, vol) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.06, t0 + start);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + start + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t0 + start);
    osc.stop(t0 + start + dur);
  }

  switch (name) {
    case 'coin': // petit "bling"
      note(880, 0, 0.08);
      note(1320, 0.06, 0.15);
      break;
    case 'pet': // petit "wouf" grave
      note(220, 0, 0.05, 'triangle', 0.12);
      note(160, 0.05, 0.1, 'triangle', 0.12);
      break;
    case 'buy': // achat validé
      note(523, 0, 0.09);
      note(659, 0.09, 0.09);
      note(784, 0.18, 0.18);
      break;
    case 'unlock': // fanfare de déblocage
      note(523, 0, 0.1);
      note(659, 0.1, 0.1);
      note(784, 0.2, 0.1);
      note(1047, 0.3, 0.3);
      break;
  }
}
