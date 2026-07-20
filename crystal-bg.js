// Fondo de fragmentos de cristal para las páginas de sección.
// Si la persona llegó aquí a través de la transición "salir del
// cristal" de fragmentos-cristal.html, este fondo reconstruye
// EXACTAMENTE la disposición final en la que quedaron los fragmentos
// al terminar esa animación (guardada en sessionStorage justo antes
// de navegar) — no una composición aleatoria nueva. Si se entra
// directamente a la página (sin pasar por la transición), se genera
// una composición aleatoria de respaldo con el mismo estilo visual.
// El fondo es completamente estático, sin ningún movimiento.
(function () {
  const container = document.getElementById('crystalBg');
  if (!container) return;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function makeShardEl(xPct, yPct, w, h, rot) {
    const wrap = document.createElement('div');
    wrap.className = 'bg-shard';
    wrap.style.left = xPct + '%';
    wrap.style.top = yPct + '%';
    wrap.style.setProperty('--sw', w + 'px');
    wrap.style.setProperty('--sh', h + 'px');
    wrap.style.setProperty('--base-rot', rot + 'deg');
    wrap.style.setProperty('--target-opacity', rand(0.18, 0.32).toFixed(2));
    return wrap;
  }

  function renderFromLayout(layout) {
    layout.forEach(s => container.appendChild(makeShardEl(s.xPct, s.yPct, s.w, s.h, s.rot)));
  }

  function renderRandomFallback() {
    const isMobile = window.innerWidth < 640;
    const shardCount = isMobile ? 5 : 8;
    const maxW = isMobile ? 200 : 320;
    for (let i = 0; i < shardCount; i++) {
      const w = rand(100, maxW);
      const h = rand(100, maxW);
      container.appendChild(makeShardEl(rand(-6, 92), rand(-6, 88), w, h, rand(-30, 30)));
    }
  }

  let layout = null;
  try {
    const raw = sessionStorage.getItem('crystalLayout');
    if (raw) {
      layout = JSON.parse(raw);
      sessionStorage.removeItem('crystalLayout');
    }
  } catch (e) { /* sessionStorage no disponible o dato corrupto */ }

  if (layout && Array.isArray(layout) && layout.length) {
    renderFromLayout(layout);
  } else {
    renderRandomFallback();
  }
})();
