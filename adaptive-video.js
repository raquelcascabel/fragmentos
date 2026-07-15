/*
  adaptive-video.js
  ------------------
  Sirve los vídeos de Cloudinary con streaming adaptativo (HLS): el
  navegador va pidiendo la calidad más alta que su conexión aguanta en
  cada momento, en vez de una calidad fija.

  Requiere que la página incluya antes hls.js:
  <script src="https://cdn.jsdelivr.net/npm/hls.js@1"></script>

  Uso:
  attachAdaptiveVideo(miElementoVideo, 'https://res.cloudinary.com/CLOUD/video/upload/v123/nombre.mov');
*/
(function (global) {
  function parseCloudinaryUrl(url) {
    // https://res.cloudinary.com/<cloud>/video/upload/[transform/]v<version>/<public_id>.<ext>
    const m = url.match(/^https:\/\/res\.cloudinary\.com\/([^/]+)\/video\/upload\/(?:([^/]+)\/)?(v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
    if (!m) return null;
    return { cloud: m[1], version: m[3] || '', publicIdPath: m[4] };
  }

  function buildUrls(originalUrl) {
    const parsed = parseCloudinaryUrl(originalUrl);
    if (!parsed) return { hls: null, mp4: originalUrl };
    const base = 'https://res.cloudinary.com/' + parsed.cloud + '/video/upload';
    return {
      // streaming adaptativo: varias calidades, el navegador elige sobre la marcha
      hls: base + '/sp_full_hd/' + parsed.version + parsed.publicIdPath + '.m3u8',
      // calidad automática de máxima calidad posible en un solo archivo,
      // para navegadores sin soporte de streaming adaptativo
      mp4: base + '/q_auto:best,f_auto/' + parsed.version + parsed.publicIdPath + '.mp4'
    };
  }

  function attachAdaptiveVideo(videoEl, originalUrl) {
    const urls = buildUrls(originalUrl);
    if (!urls.hls) {
      videoEl.src = originalUrl;
      return;
    }

    const supportsNativeHls = videoEl.canPlayType('application/vnd.apple.mpegurl');

    if (supportsNativeHls) {
      // Safari / iOS: soporte nativo de HLS, no hace falta hls.js
      videoEl.src = urls.hls;
      return;
    }

    if (global.Hls && global.Hls.isSupported()) {
      // Chrome / Firefox / Edge / Android: hls.js gestiona el streaming
      // adaptativo sobre Media Source Extensions
      const hls = new global.Hls();
      hls.loadSource(urls.hls);
      hls.attachMedia(videoEl);
      videoEl._hlsInstance = hls;
      return;
    }

    // último recurso: un solo archivo en la mejor calidad automática posible
    videoEl.src = urls.mp4;
  }

  global.attachAdaptiveVideo = attachAdaptiveVideo;
})(window);
