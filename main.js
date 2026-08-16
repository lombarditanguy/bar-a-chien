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

  // Boucle de jeu : le temps réel écoulé (dt) fait avancer les clients,
  // donc le rythme reste juste même si le navigateur ralentit les frames.
  let lastTime = performance.now();
  function loop(now) {
    const dt = Math.min((now - lastTime) / 1000, 5); // borne anti-saut
    lastTime = now;
    updateCustomers(dt);
    render();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Sauvegarde automatique
  setInterval(saveState, CONFIG.autosaveIntervalMs);
  window.addEventListener('beforeunload', saveState);

  // Onglet caché (ou appli en arrière-plan sur mobile) : on sauvegarde en
  // partant, et au retour on crédite le temps passé caché — popup "bon
  // retour" pour une vraie absence, crédit silencieux pour un aller-retour.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveState();
    } else {
      const gained = computeOfflineGains();
      if (gained > 0) showWelcomeBack(gained);
      lastTime = performance.now();
    }
  });
})();
