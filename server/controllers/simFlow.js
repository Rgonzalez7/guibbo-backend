// server/controllers/simFlow.js
const { WebSocketServer, WebSocket } = require('ws');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const OpenAI = require('openai');

ffmpeg.setFfmpegPath(ffmpegPath);

const DG_KEY = process.env.DEEPGRAM_API_KEY || '';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function safeSend(ws, obj) { try { ws.send(JSON.stringify(obj)); } catch {} }
function log(...a) { console.log('🤖 [SIM]', ...a); }

function buildPrompt(hello, transcript) {
  const { edad, genero, problema } = hello || {};
  return `Contexto del paciente simulado:
- Edad: ${edad ?? 'N/D'}
- Género: ${genero ?? 'N/D'}
- Motivo principal: ${problema ?? 'N/D'}

Terapeuta dijo: "${transcript}"

Responde como el paciente, en una o dos frases, tono natural y breve, en español.`;
}

function selectInputFormat(mime) {
  if (!mime) return 'webm';
  const m = mime.toLowerCase();
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

function createSimWSS() {
  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws) => {
    log('Cliente conectado a /ws/sim');

    let hello = null;
    let dg = null;     // WS a Deepgram
    let ff = null;     // ffmpeg proc
    let dgReady = false;
    let pcmBuffer = [];

    function cleanup() {
      try { if (ff?.stdin) ff.stdin.end(); } catch {}
      try { if (ff) ff.kill('SIGKILL'); } catch {}
      try { dg?.close(); } catch {}
      dg = null; ff = null; dgReady = false; hello = null; pcmBuffer = [];
      log('/ws/sim cerrado');
    }

    ws.on('close', cleanup);
    ws.on('error', cleanup);

    ws.on('message', async (message, isBinary) => {
      try {
        if (!hello) {
          if (isBinary) return;
          const parsed = JSON.parse(message.toString('utf8'));
          if (parsed?.type !== 'hello') {
            return safeSend(ws, { type: 'error', message: 'Primer mensaje debe ser type="hello"' });
          }
          hello = parsed;

          if (!DG_KEY) {
            safeSend(ws, { type: 'error', message: 'DEEPGRAM_API_KEY no configurada' });
            ws.close(); return;
          }

          const sr = Number(hello.sampleRate) || 16000;

          // 1) Conectar a Deepgram
          dg = createDGClientWS({ sampleRate: sr });

          dg.on('open', () => {
            dgReady = true;
          });

          dg.on('message', async (data) => {
            try {
              const payload = JSON.parse(data.toString('utf8'));
              const alt = payload?.channel?.alternatives?.[0];
              const transcript = alt?.transcript || '';
              if (payload.is_final && transcript.trim()) {
                const prompt = buildPrompt(hello, transcript);
                const completion = await openai.chat.completions.create({
                  model: 'gpt-4o-mini',
                  messages: [
                    { role: 'system', content: 'Eres un paciente simulado. Responde natural y breve en español.' },
                    { role: 'user', content: prompt }
                  ],
                  temperature: 0.7
                });
                const text = completion.choices?.[0]?.message?.content?.trim() || '...';
                safeSend(ws, { type: 'assistant_text', text });

                // TTS
                safeSend(ws, { type: 'tts_start' });
                const tts = await openai.audio.speech.create({
                  model: 'gpt-4o-mini-tts',
                  voice: 'alloy',
                  input: text,
                  format: 'mp3'
                });
                const arrayBuffer = await tts.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString('base64');
                safeSend(ws, { type: 'tts_audio', audio_b64: base64, mime: 'audio/mpeg' });
                safeSend(ws, { type: 'tts_end' });
              }
            } catch {}
          });

          dg.on('error', (e) => {
            safeSend(ws, { type: 'error', message: `Deepgram WS error: ${e?.message || ''}` });
          });

          dg.on('close', () => { /* noop */ });

          // 2) Pipeline de audio: si el cliente manda PCM s16le → PASSTHROUGH (sin ffmpeg)
          const inFmt = selectInputFormat(hello?.mimeType);
          const isPCM = (hello?.mimeType || '').toLowerCase().includes('audio/pcm');

          if (isPCM) {
            safeSend(ws, { type: 'ready' });
            return;
          }

          // Caso contenedor (webm/ogg/mp4): armar ffmpeg
          const ar = Number(hello?.sampleRate) || 16000;

          ff = ffmpeg()
            .input('pipe:0')
            .inputOptions([`-f ${inFmt}`, '-vn'])
            .audioCodec('pcm_s16le')
            .audioChannels(1)
            .audioFrequency(ar)
            .format('s16le')
            .on('start', (cmd) => log('ffmpeg START:', cmd))
            .on('error', (err) => {
              safeSend(ws, { type: 'error', message: `ffmpeg error: ${err?.message || ''}` });
              try { dg?.close(); } catch {}
            })
            .on('end', () => {
              try { dg?.close(); } catch {}
            });

          const ffOut = ff.pipe();

          // ✅ Mandar ready inmediatamente para que el cliente arranque
          safeSend(ws, { type: 'ready' });

          ffOut.on('data', (chunk) => {
            if (!dgReady) { pcmBuffer.push(Buffer.from(chunk)); return; }
            try { dg.send(chunk); } catch {}
          });

          ffOut.on('end', () => { try { dg?.close(); } catch {} });

          return;
        }

        // Control (JSON)
        if (!isBinary) {
          const evt = JSON.parse(message.toString('utf8'));
          if (evt?.type === 'done') { cleanup(); try { ws.close(); } catch {} }
          return;
        }

        // Audio binario:
        const isPCM = (hello?.mimeType || '').toLowerCase().includes('audio/pcm');
        if (isPCM) {
          if (!dgReady) { pcmBuffer.push(Buffer.from(message)); return; }
          try { dg.send(message); } catch {}
        } else {
          if (ff && ff.stdin?.writable) ff.stdin.write(Buffer.from(message));
        }

      } catch (err) {
        safeSend(ws, { type: 'error', message: 'Mensaje inválido' });
      }
    });
  });

  console.log('✅ WS de simulación listo (noServer). Enrútalo a /ws/sim desde index.js');
  return wss;
}

module.exports = { createSimWSS };