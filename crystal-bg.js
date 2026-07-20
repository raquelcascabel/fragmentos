// Fondo de fragmentos de cristal para las páginas de sección.
// Reutiliza el estilo visual exacto de los fragmentos del efecto de
// transición "salir del cristal" de fragmentos-cristal.html (rectángulos
// planos con degradado diagonal + borde luminoso fino + halo verde),
// convertido en una composición de fondo estática con flotación muy
// lenta y sutil. Cada página que incluye este script obtiene su propia
// composición aleatoria (no se fija ninguna semilla), así que el
// patrón varía de una página a otra de forma natural.
(function () {
  const container = document.getElementById('crystalBg');
  if (!container) return;

  const SHARD_COUNT = window.innerWidth < 640 ? 5 : 8;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function buildShard() {
    const w = rand(140, 320);
    const h = rand(140, 320);

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
    wrap.style.setProperty('--target-opacity', rand(0.55, 0.9).toFixed(2));
    wrap.style.transform = 'rotate(' + baseRot + 'deg)';

    return wrap;
  }

  for (let i = 0; i < SHARD_COUNT; i++) {
    container.appendChild(buildShard());
  }
})();
