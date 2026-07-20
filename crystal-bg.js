// Fondo de fragmentos de cristal para las páginas de sección.
// Genera una composición aleatoria de "esquirlas" facetadas —misma
// silueta bipiramidal irregular que los cristales 3D de la página
// principal— flotando muy lento y sutil detrás del contenido.
// Cada página que incluye este script obtiene su propia composición
// aleatoria (no se fija ninguna semilla), así que el patrón varía de
// una página a otra de forma natural.
(function () {
  const container = document.getElementById('crystalBg');
  if (!container) return;

  const SHARD_COUNT = window.innerWidth < 640 ? 5 : 8;
  let gradIdCounter = 0;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function buildShard() {
    const gid = 'bgcg' + (gradIdCounter++);
    const w = rand(90, 260);
    const h = w * rand(1.3, 1.7);

    const wrap = document.createElement('div');
    wrap.className = 'bg-shard';
    wrap.style.left = rand(-6, 92) + '%';
    wrap.style.top = rand(-6, 88) + '%';
    wrap.style.width = w + 'px';
    wrap.style.height = h + 'px';

    const baseRot = rand(-35, 35);
    wrap.style.setProperty('--base-rot', baseRot + 'deg');
    wrap.style.setProperty('--float-x', rand(-18, 18) + 'px');
    wrap.style.setProperty('--float-y', rand(-22, 22) + 'px');
    wrap.style.setProperty('--float-rot', rand(-6, 6) + 'deg');
    wrap.style.setProperty('--float-dur', rand(11, 19).toFixed(1) + 's');
    wrap.style.setProperty('--in-delay', rand(0, 1.2).toFixed(2) + 's');
    wrap.style.setProperty('--target-opacity', rand(0.16, 0.34).toFixed(2));
    wrap.style.transform = 'rotate(' + baseRot + 'deg)';

    // Misma silueta bipiramidal irregular que el mini-cristal de los
    // separadores: punta corta arriba, punta larga abajo, corona de
    // facetas en el ecuador.
    wrap.innerHTML =
      '<svg viewBox="0 0 22 34" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#8B7FF5"/>' +
      '<stop offset="45%" stop-color="#E8ECF4"/>' +
      '<stop offset="100%" stop-color="#3ECFB2"/>' +
      '</linearGradient></defs>' +
      '<polygon points="11,2 16,13 11,15 6,13" fill="url(#' + gid + ')" opacity="0.9"/>' +
      '<polygon points="6,13 11,15 8,32" fill="url(#' + gid + ')" opacity="0.78"/>' +
      '<polygon points="11,15 16,13 14,31 8,32" fill="url(#' + gid + ')" opacity="0.62"/>' +
      '<polygon points="14,31 16,13 19,15 11,15" fill="url(#' + gid + ')" opacity="0.46"/>' +
      '<path d="M11,2 L6,13 M11,2 L16,13 M6,13 L11,15 M16,13 L11,15 M6,13 L8,32 M11,15 L8,32 M11,15 L14,31 M16,13 L14,31" fill="none" stroke="rgba(232,236,244,0.4)" stroke-width="0.5"/>' +
      '</svg>';

    return wrap;
  }

  for (let i = 0; i < SHARD_COUNT; i++) {
    container.appendChild(buildShard());
  }
})();
