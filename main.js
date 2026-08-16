// ============================================================
// MAIN — démarrage et boucle de jeu.
// ============================================================

(function init() {
  const hadSave = loadState();

  // Gains hors-ligne au retour du joueur
  if (hadSave) {
    const gained = computeOfflineGains();
    if (gained > 0) showWelcomeBack(gained);
  }

  bindUi();
  render();

  // Boucle de jeu : revenus calculés avec le temps réel écoulé (dt),
  // donc le rythme reste juste même si le navigateur ralentit les frames.
  let lastTime = performance.now();
  function loop(now) {
    const dt = Math.min((now - lastTime) / 1000, 5); // borne anti-saut
    lastTime = now;
    tick(dt);
    render();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Pièce décorative qui s'envole d'un chien de temps en temps
  setInterval(ambientCoin, CONFIG.ambientCoinIntervalMs);

  // Sauvegarde automatique
  setInterval(saveState, CONFIG.autosaveIntervalMs);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveState();
  });
  window.addEventListener('beforeunload', saveState);
})();
