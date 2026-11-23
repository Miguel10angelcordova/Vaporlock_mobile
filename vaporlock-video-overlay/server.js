const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
app.use(cors());
app.use(express.json({ limit: '150mb' }));

const tempDir = path.join(__dirname, 'temp');
fs.mkdirSync(tempDir, { recursive: true });

const SPRITES = {
  jack: path.join(__dirname, 'sprites', 'jack-veil.gif'),
  lucius: path.join(__dirname, 'sprites', 'lucius-core.gif'),
};

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'vaporlock-video-overlay' });
});

app.post('/api/compose-video', (req, res) => {
  const { videoBase64, character } = req.body || {};
  console.log('Petición recibida en /api/compose-video para:', character);

  if (!videoBase64) {
    return res.status(400).json({ error: 'No se recibió videoBase64.' });
  }

  const characterKey = character === 'lucius' ? 'lucius' : 'jack';
  const spritePath = SPRITES[characterKey];

  if (!fs.existsSync(spritePath)) {
    return res
      .status(500)
      .json({ error: `No se encontró el sprite para ${characterKey}` });
  }

  const id = `${characterKey}_${Date.now()}`;
  const outputFilename = `vaporlock_${id}.mp4`;
  const inputPath = path.join(tempDir, `in_${id}.mp4`);
  const outputPath = path.join(tempDir, outputFilename);

  fs.writeFileSync(inputPath, Buffer.from(videoBase64, 'base64'));

  ffmpeg()
    .input(inputPath)
    .input(spritePath)
    .inputOptions(['-stream_loop', '-1'])
    .complexFilter([
      '[1:v]scale=trunc(iw*0.32/2)*2:-2[gif]',
      '[0:v][gif]overlay=(main_w-overlay_w)/2:main_h-overlay_h-40:shortest=1[outv]',
    ])
    .outputOptions([
      '-map', '[outv]',
      '-map', '0:a?',
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '26',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
    ])
    .on('end', () => {
      try {
        console.log('Video compuesto correctamente:', outputFilename);
        const outBase64 = fs.readFileSync(outputPath).toString('base64');
        fs.unlink(inputPath, () => {});
        fs.unlink(outputPath, () => {});
        res.json({ ok: true, videoBase64: outBase64 });
      } catch (readErr) {
        console.error('Error leyendo video procesado:', readErr);
        fs.unlink(inputPath, () => {});
        fs.unlink(outputPath, () => {});
        res.status(500).json({ error: 'Error al leer el video procesado' });
      }
    })
    .on('error', (err) => {
      console.error('Error FFmpeg:', err.message || err);
      fs.unlink(inputPath, () => {});
      fs.unlink(outputPath, () => {});
      res.status(500).json({ error: 'Error al procesar el video con FFmpeg' });
    })
    .save(outputPath);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de video Vaporlock escuchando en http://0.0.0.0:${PORT}`);
});