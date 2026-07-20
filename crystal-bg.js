// Fondo de fragmentos de cristal para las páginas de sección.
// Genera una composición aleatoria de placas rectangulares irregulares
// (esquinas con ligero jitter, no puntiagudas), con el mismo degradado
// diagonal oscuro/verdoso y contorno luminoso fino que los cristales
// de la página principal, flotando muy lento y sutil detrás del
// contenido. Cada página que incluye este script obtiene su propia
// composición aleatoria (no se fija ninguna semilla), así que el
// patrón varía de una página a otra de forma natural.
(function () {
  const container = document.getElementById('crystalBg');
  if (!container) return;

  const SHARD_COUNT = window.innerWidth < 640 ? 5 : 8;
  let gradIdCounter = 0;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  // Genera un cuadrilátero irregular (esquinas con jitter suave sobre
  // un rectángulo base) en un viewBox de 100x100, para simular una
  // placa de cristal recortada a mano en vez de un rectángulo perfecto.
  function buildQuadPoints() {
    const j = 10; // jitter máximo por esquina, en unidades del viewBox
    const corners = [
      [4, 4], [96, 4], [96, 96], [4, 96]
    ];
    return corners
      .map(([x, y]) => (x + rand(-j, j)).toFixed(1) + ',' + (y + rand(-j, j)).toFixed(1))
      .join(' ');
  }

  function buildShard() {
    const gid = 'bgcg' + (gradIdCounter++);
    const w = rand(110, 260);
    const h = w * rand(0.85, 1.35);

    const wrap = document.createElement('div');
    wrap.className = 'bg-shard';
    wrap.style.left = rand(-6, 92) + '%';
    wrap.style.top = rand(-6, 88) + '%';
    wrap.style.width = w + 'px';
    wrap.style.height = h + 'px';

    const baseRot = rand(-30, 30);
    wrap.style.setProperty('--base-rot', baseRot + 'deg');
    wrap.style.setProperty('--float-x', rand(-18, 18) + 'px');
    wrap.style.setProperty('--float-y', rand(-22, 22) + 'px');
    wrap.style.setProperty('--float-rot', rand(-6, 6) + 'deg');
    wrap.style.setProperty('--float-dur', rand(11, 19).toFixed(1) + 's');
    wrap.style.setProperty('--in-delay', rand(0, 1.2).toFixed(2) + 's');
    wrap.style.setProperty('--target-opacity', rand(0.16, 0.34).toFixed(2));
    wrap.style.transform = 'rotate(' + baseRot + 'deg)';

    const points = buildQuadPoints();

    wrap.innerHTML =
      '<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#3ECFB2" stop-opacity="0.5"/>' +
      '<stop offset="55%" stop-color="#12212B" stop-opacity="0.85"/>' +
      '<stop offset="100%" stop-color="#080D1A" stop-opacity="0.95"/>' +
      '</linearGradient></defs>' +
      '<polygon points="' + points + '" fill="url(#' + gid + ')" ' +
      'stroke="rgba(232,236,244,0.5)" stroke-width="0.8"/>' +
      '</svg>';

    return wrap;
  }

  for (let i = 0; i < SHARD_COUNT; i++) {
    container.appendChild(buildShard());
  }
})();
