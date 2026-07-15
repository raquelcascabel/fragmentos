/*
  adaptive-video.js
  ------------------
  Sirve los vídeos de Cloudinary en la mejor calidad automática (q_auto,
  f_auto) y los muestra como miniatura + botón de play: el vídeo real solo
  se carga cuando alguien hace clic.

  Nota: la versión anterior usaba streaming adaptativo (HLS) vía hls.js,
  pero requiere una función de Cloudinary (streaming profiles) que no
  está disponible en todos los planes, y por eso los vídeos no cargaban.
  Esta versión usa entrega directa optimizada, mucho más fiable.

  Uso:
  attachAdaptiveVideo(miElementoVideo, 'https://res.cloudinary.com/CLOUD/video/upload/v123/nombre.mov');
  createClickToPlayVideo('https://res.cloudinary.com/CLOUD/video/upload/v123/nombre.mov', { height: 300 });
*/
(function (global) {
  function parseCloudinaryUrl(url) {
    // https://res.cloudinary.com/<cloud>/video/upload/[transform/]v<version>/<public_id>.<ext>
    const m = url.match(/^https:\/\/res\.cloudinary\.com\/([^/]+)\/video\/upload\/(?:([^/]+)\/)?(v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
    if (!m) return null;
    return { cloud: m[1], version: m[3] || '', publicIdPath: m[4] };
  }

  function buildMp4Url(originalUrl) {
    const parsed = parseCloudinaryUrl(originalUrl);
    if (!parsed) return originalUrl;
    return 'https://res.cloudinary.com/' + parsed.cloud + '/video/upload/q_auto,f_auto/' + parsed.version + parsed.publicIdPath + '.mp4';
  }

  function buildThumbnailUrl(originalUrl) {
    const parsed = parseCloudinaryUrl(originalUrl);
    if (!parsed) return null;
    const base = 'https://res.cloudinary.com/' + parsed.cloud + '/video/upload';
    // fotograma tomado al segundo 1 (evita fotogramas negros de arranque)
    return base + '/so_1,q_auto,f_auto/' + parsed.version + parsed.publicIdPath + '.jpg';
  }

  // Para vídeos a pantalla completa (como la intro): en pantallas estrechas
  // pide a Cloudinary un recorte 9:16 con encuadre automático (mantiene el
  // sujeto centrado, no lo aplasta ni lo corta a lo tonto) y en menor
  // resolución — mucho más rápido de cargar en móvil que servir el máster
  // panorámico completo y recortarlo a lo bruto con CSS.
  function buildResponsiveFullscreenUrl(originalUrl) {
    const parsed = parseCloudinaryUrl(originalUrl);
    if (!parsed) return originalUrl;
    const base = 'https://res.cloudinary.com/' + parsed.cloud + '/video/upload';
    const isNarrow = window.innerWidth < window.innerHeight;
    const transform = isNarrow
      ? 'c_fill,ar_9:16,g_auto,w_780,q_auto,f_auto'
      : 'q_auto,f_auto';
    return base + '/' + transform + '/' + parsed.version + parsed.publicIdPath + '.mp4';
  }

  global.buildResponsiveFullscreenUrl = buildResponsiveFullscreenUrl;

  function attachAdaptiveVideo(videoEl, originalUrl) {
    videoEl.src = buildMp4Url(originalUrl);
  }

  global.attachAdaptiveVideo = attachAdaptiveVideo;

  // ---------- miniatura + botón de play ----------
  function injectClickToPlayStyles() {
    if (document.getElementById('ctp-video-styles')) return;
    const style = document.createElement('style');
    style.id = 'ctp-video-styles';
    style.textContent = `
      .ctp-video {
        position: relative;
        display: inline-block;
        vertical-align: top;
        background: #000;
        overflow: hidden;
        cursor: pointer;
        transition: width 0.3s ease, height 0.3s ease;
        max-width: 100%;
      }
      .ctp-video .ctp-thumb {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .ctp-video video {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        background: #000;
      }
      .ctp-play-btn {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 57px;
        height: 57px;
        border-radius: 50%;
        background: rgba(8, 13, 26, 0.55);
        border: 1px solid rgba(255, 255, 255, 0.55);
        color: #fff;
        font-size: 1.16rem;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(2px);
        transition: transform 0.25s ease, background 0.25s ease;
        pointer-events: none;
      }
      .ctp-video:hover .ctp-play-btn {
        transform: translate(-50%, -50%) scale(1.1);
        background: rgba(62, 207, 178, 0.85);
      }
    `;
    document.head.appendChild(style);
  }

  // options.height: si se indica (en px), el contenedor usa esa altura fija
  // y ajusta el ancho automáticamente a la orientación real del vídeo
  // (vertical u horizontal), sin recortar ni forzar un único formato.
  function createClickToPlayVideo(originalUrl, options) {
    options = options || {};
    injectClickToPlayStyles();

    const wrap = document.createElement('div');
    wrap.className = 'ctp-video';
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('aria-label', 'Reproducir vídeo');

    if (options.height) {
      wrap.style.height = options.height + 'px';
      // ancho de partida (asumiendo vertical) hasta que sepamos la relación real
      wrap.style.width = Math.round(options.height * 9 / 16) + 'px';
    } else {
      wrap.style.width = '100%';
      wrap.style.height = '100%';
    }

    function applyRatio(w, h) {
      if (!options.height || !w || !h) return;
      // límite de ancho disponible (para que un vídeo horizontal no se
      // salga de la pantalla en móvil): el menor entre el ancho ideal y
      // el ancho de ventana disponible, con un margen de seguridad
      const maxWidth = Math.min(window.innerWidth - 32, 640);
      let width = options.height * (w / h);
      let height = options.height;
      if (width > maxWidth) {
        width = maxWidth;
        height = maxWidth * (h / w);
      }
      wrap.style.width = Math.round(width) + 'px';
      wrap.style.height = Math.round(height) + 'px';
    }

    const thumbUrl = buildThumbnailUrl(originalUrl);
    if (thumbUrl) {
      const img = document.createElement('img');
      img.className = 'ctp-thumb';
      img.alt = '';
      img.src = thumbUrl;
      img.addEventListener('load', () => applyRatio(img.naturalWidth, img.naturalHeight));
      wrap.appendChild(img);
    }

    const btn = document.createElement('div');
    btn.className = 'ctp-play-btn';
    btn.setAttribute('aria-hidden', 'true');
    btn.textContent = '▶';
    wrap.appendChild(btn);

    wrap.addEventListener('click', function start() {
      if (options.lightbox) {
        openVideoLightbox(originalUrl);
        return;
      }
      wrap.removeEventListener('click', start);
      wrap.innerHTML = '';
      wrap.style.cursor = 'default';

      const v = document.createElement('video');
      v.controls = true;
      v.playsInline = true;
      v.autoplay = true;
      wrap.appendChild(v);
      attachAdaptiveVideo(v, originalUrl);
      v.addEventListener('loadedmetadata', () => applyRatio(v.videoWidth, v.videoHeight));
      v.play().catch(function () {});
    });

    return wrap;
  }

  global.createClickToPlayVideo = createClickToPlayVideo;

  // ---------- lightbox (vídeo grande, semicompleto, con fondo oscuro) ----------
  function injectLightboxStyles() {
    if (document.getElementById('ctp-lightbox-styles')) return;
    const style = document.createElement('style');
    style.id = 'ctp-lightbox-styles';
    style.textContent = `
      .ctp-lightbox {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(5, 8, 16, 0.88);
        backdrop-filter: blur(8px);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      .ctp-lightbox.is-open { opacity: 1; pointer-events: auto; }
      .ctp-lightbox video {
        max-width: 90vw;
        max-height: 85vh;
        width: auto;
        height: auto;
        background: #000;
        box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      }
      .ctp-lightbox-close {
        position: absolute;
        top: 1.4rem;
        right: 1.6rem;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        border: 1px solid rgba(255,255,255,0.4);
        background: rgba(0,0,0,0.4);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1.1rem;
      }
    `;
    document.head.appendChild(style);
  }

  function openVideoLightbox(originalUrl) {
    injectLightboxStyles();
    let overlay = document.getElementById('ctp-lightbox-global');

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ctp-lightbox-global';
      overlay.className = 'ctp-lightbox';

      const closeBtn = document.createElement('div');
      closeBtn.className = 'ctp-lightbox-close';
      closeBtn.textContent = '✕';
      overlay.appendChild(closeBtn);

      function close() {
        overlay.classList.remove('is-open');
        const v = overlay.querySelector('video');
        if (v) v.pause();
      }
      closeBtn.addEventListener('click', close);
      overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') close();
      });

      document.body.appendChild(overlay);
    }

    const oldVideo = overlay.querySelector('video');
    if (oldVideo) oldVideo.remove();

    const v = document.createElement('video');
    v.controls = true;
    v.playsInline = true;
    v.autoplay = true;
    overlay.appendChild(v);
    attachAdaptiveVideo(v, originalUrl);
    v.play().catch(function () {});

    overlay.classList.add('is-open');
  }

  global.openVideoLightbox = openVideoLightbox;
})(window);
