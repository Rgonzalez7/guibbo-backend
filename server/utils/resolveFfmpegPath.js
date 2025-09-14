// server/utils/resolveFfmpegPath.js
module.exports = function resolveFfmpegPath() {
    // 1) FFMPEG_PATH (si lo definiste manualmente)
    if (process.env.FFMPEG_PATH) {
      return process.env.FFMPEG_PATH;
    }
  
    // 2) ffmpeg-static
    try {
      const ffmpegStatic = require('ffmpeg-static'); // devuelve ruta o null
      if (ffmpegStatic) return ffmpegStatic;
    } catch (_) {}
  
    // 3) @ffmpeg-installer/ffmpeg
    try {
      const { path } = require('@ffmpeg-installer/ffmpeg');
      if (path) return path;
    } catch (_) {}
  
    // 4) fallback: usa "ffmpeg" del PATH del sistema (brew/apt/choco)
    // fluent-ffmpeg intentará invocarlo por nombre
    return 'ffmpeg';
  };