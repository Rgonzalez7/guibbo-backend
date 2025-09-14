// server/controllers/deepgramLiveProxy.js
const { WebSocketServer, WebSocket } = require('ws');
const ffmpeg = require('fluent-ffmpeg');
const resolveFfmpegPath = require('../utils/resolveFfmpegPath');

ffmpeg.setFfmpegPath(resolveFfmpegPath());

const DG_KEY = process.env.DEEPGRAM_API_KEY || '';

function safeSend(ws, obj) { try { ws.send(JSON.stringify(obj)); } catch {} }
function log(...a) { console.log('🎧 [DG]', ...a); }

function selectInputFormat(mime) {
  if (!mime) return 'webm';
  const m = String(mime).toLowerCase();
  if (m.includes('pcm')) return 's16le';               // 👈 soporte PCM
  if (m.includes('ogg')) return 'ogg';
  if (m.includes('mp4') || m.includes('mpeg')) return 'mp4';
  return 'webm';
}

function createDGClientWS({ sampleRate = 16000 }) {
  const qs = new URLSearchParams({
    model: 'nova-2',
    language: 'es',
    punctuate: 'true',
    smart_format: 'true',
    encoding: 'linear16',
    sample_rate: String(sampleRate),
    diarize: 'false'
  });
  const url = `wss://api.deepgram.com/v1/listen?${qs.toString()}`;
  const headers = { Authorization: `Token ${DG_KEY}` };
  return new WebSocket(url, { headers });
}

function createDeepgramProxy() {
  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws, req) => {
    log('Cliente conectado desde', req?.socket?.remoteAddress);

    if (!DG_KEY) {
      safeSend(ws, { type: 'error', message: 'DEEPGRAM_API_KEY no configurada en el servidor' });
      ws.close();
      return;
    }

    let hello = null;
    let dg = null;      // WS → Deepgram
    let ff = null;      // proceso ffmpeg (si hace falta)
    let dgReady = false;
    let pcmBuffer = [];
    let passThroughPCM = false;  // 👈 nuevo

    function cleanup() {
      log('Limpieza proxy DG');
      try { if (ff?.stdin) ff.stdin.end(); } catch {}
      try { if (ff) ff.kill('SIGKILL'); } catch {}
      try { dg?.close(); } catch {}
      dg = null; ff = null; dgReady = false; hello = null; pcmBuffer = []; passThroughPCM = false;
    }

    ws.on('close', cleanup);
    ws.on('error', cleanup);

    ws.on('message', async (message, isBinary) => {
      try {
        // Espera HELLO
        if (!hello) {
          if (isBinary) return;
          const parsed = JSON.parse(message.toString('utf8'));
          log('HELLO recibido:', parsed);
          if (parsed?.type !== 'hello') {
            safeSend(ws, { type: 'error', message: 'Primer mensaje debe ser type="hello"' });
            return;
          }
          hello = parsed;

          // Conecta a Deepgram
          try {
            dg = createDGClientWS({ sampleRate: Number(hello.sampleRate) || 16000 });
          } catch (e) {
            log('❌ creando WS hacia Deepgram:', e?.message || e);
            safeSend(ws, { type: 'error', message: 'No se pudo crear WS hacia Deepgram' });
            ws.close();
            return;
          }

          dg.on('open', () => {
            log('Deepgram WS abierto → enviando ready');
            dgReady = true;
            safeSend(ws, { type: 'ready' });
            if (pcmBuffer.length) {
              try { pcmBuffer.forEach((c) => dg.send(c)); } catch {}
              pcmBuffer = [];
            }
          });

          dg.on('message', (data) => {
            try {
              const msg = JSON.parse(data.toString('utf8'));
              const alt = msg?.channel?.alternatives?.[0];
              if (!alt) return;
              const text = alt.transcript || '';
              if (!text) return;
              if (msg.is_final) safeSend(ws, { type: 'final', text });
              else safeSend(ws, { type: 'partial', text });
            } catch {}
          });

          dg.on('error', (e) => {
            log('❌ Deepgram WS error:', e?.message || e);
            safeSend(ws, { type: 'error', message: 'Deepgram WS error' });
          });
          dg.on('close', () => log('Deepgram WS cerrado'));

          // ¿PCM crudo o contenedor?
          const inFmt = selectInputFormat(hello?.mimeType);
          const ar = Number(hello?.sampleRate) || 16000;

          if (inFmt === 's16le') {
            // 🎯 PCM pass-through: ¡sin ffmpeg!
            passThroughPCM = true;
            log('Usando pass-through PCM (s16le), sampleRate=', ar);
          } else {
            // 🎬 Transcodificar con ffmpeg → PCM s16le 16k mono
            try {
              ff = ffmpeg()
                .input('pipe:0')
                .inputOptions([`-f ${inFmt}`, '-vn'])
                .audioCodec('pcm_s16le')
                .audioChannels(1)
                .audioFrequency(ar)
                .format('s16le')
                .on('start', (cmd) => log('ffmpeg START:', cmd))
                .on('error', (err) => {
                  log('❌ ffmpeg error:', err?.message || err);
                  safeSend(ws, { type: 'error', message: `ffmpeg error: ${err?.message || ''}` });
                  try { dg?.close(); } catch {}
                })
                .on('end', () => {
                  log('ffmpeg END');
                  try { dg?.close(); } catch {}
                });

              const ffOut = ff.pipe();

              ffOut.on('data', (chunk) => {
                if (!dgReady) { pcmBuffer.push(Buffer.from(chunk)); return; }
                try { dg.send(chunk); } catch {}
              });

              ffOut.on('end', () => { try { dg?.close(); } catch {} });
            } catch (e) {
              log('❌ creando pipeline ffmpeg:', e?.message || e);
              safeSend(ws, { type: 'error', message: 'No se pudo crear pipeline ffmpeg' });
              ws.close();
            }
          }
          return;
        }

        // Control JSON
        if (!isBinary) {
          const evt = JSON.parse(message.toString('utf8'));
          if (evt?.type === 'done') { cleanup(); try { ws.close(); } catch {} }
          return;
        }

        // Audio binario
        if (passThroughPCM) {
          // 👇 directo a Deepgram
          if (!dgReady) { pcmBuffer.push(Buffer.from(message)); return; }
          try { dg.send(Buffer.from(message)); } catch {}
        } else if (ff && ff.stdin?.writable) {
          // 👇 al stdin de ffmpeg
          ff.stdin.write(Buffer.from(message));
        }
      } catch (err) {
        log('❌ mensaje inválido:', err?.message || err);
        safeSend(ws, { type: 'error', message: 'Mensaje inválido' });
      }
    });
  });

  log('WS Deepgram listo (noServer). Enrútalo a /ws/deepgram desde index.js');
  return wss;
}

module.exports = { createDeepgramProxy };