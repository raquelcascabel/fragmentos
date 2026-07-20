// Fondo de fragmentos de cristal para las páginas de sección.
// Si la persona llegó aquí a través de la transición "salir del
// cristal" de fragmentos-cristal.html, este fondo reconstruye
// EXACTAMENTE la disposición final en la que quedaron los fragmentos
// al terminar esa animación (guardada en sessionStorage justo antes
// de navegar) — no una composición aleatoria nueva. Si se entra
// directamente a la página (sin pasar por la transición), se genera
// una composición aleatoria de respaldo con el mismo estilo visual.
(function () {
  const container = document.getElementById('crystalBg');
  if (!container) return;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function makeShardEl(xPct, yPct, w, h, rot, delay) {
    const wrap = document.createElement('div');
    wrap.className = 'bg-shard';
    wrap.style.left = xPct + '%';
    wrap.style.top = yPct + '%';
    wrap.style.setProperty('--sw', w + 'px');
    wrap.style.setProperty('--sh', h + 'px');
    wrap.style.setProperty('--base-rot', rot + 'deg');
    wrap.style.setProperty('--float-x', rand(-18, 18) + 'px');
    wrap.style.setProperty('--float-y', rand(-22, 22) + 'px');
    wrap.style.setProperty('--float-rot', rand(-6, 6) + 'deg');
    wrap.style.setProperty('--float-dur', rand(11, 19).toFixed(1) + 's');
    wrap.style.setProperty('--in-delay', delay + 's');
    wrap.style.setProperty('--target-opacity', rand(0.55, 0.9).toFixed(2));
    wrap.style.transform = 'rotate(' + rot + 'deg)';
    return wrap;
  }

  function renderFromLayout(layout) {
    layout.forEach((s, i) => {
      container.appendChild(makeShardEl(s.xPct, s.yPct, s.w, s.h, s.rot, (i * 0.03).toFixed(2)));
    });
  }

  function renderRandomFallback() {
    const SHARD_COUNT = window.innerWidth < 640 ? 5 : 8;
    for (let i = 0; i < SHARD_COUNT; i++) {
      const w = rand(140, 320);
      const h = rand(140, 320);
      container.appendChild(makeShardEl(rand(-6, 92), rand(-6, 88), w, h, rand(-30, 30), rand(0, 1.2).toFixed(2)));
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
