
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const crypto = require("crypto");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

if (!ffmpegPath) {
  throw new Error("No se encontró FFmpeg. Revisa ffmpeg-static.");
}

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const ROOT_DIR = __dirname;
const SPRITES_DIR = path.join(ROOT_DIR, "sprites");
const TEMP_DIR = path.join(ROOT_DIR, "temp");

fs.mkdirSync(TEMP_DIR, { recursive: true });

app.use(cors());
app.use(express.json({ limit: "150mb" }));

// ======================================================
// CONFIGURACIÓN DE ANIMACIONES
// ======================================================

const DEFAULT_POSITION = {
  x: "(main_w-overlay_w)/2",
  y: "main_h-overlay_h-40",
};

const ANIMATIONS = {
  Beta32: {
    folder: "Beta32",
    frameDurationsMs: [],
    defaultFrameDurationMs: 120,
    loops: 0,
    scale: 0.32,
    position: { ...DEFAULT_POSITION },
  },

  Beta64: {
    folder: "Beta64",
    frameDurationsMs: [],
    defaultFrameDurationMs: 120,
    loops: 0,
    scale: 0.32,
    position: { ...DEFAULT_POSITION },
  },

  Doctor: {
    folder: "Doctor",
    frameDurationsMs: [],
    defaultFrameDurationMs: 120,
    loops: 0,
    scale: 0.32,
    position: { ...DEFAULT_POSITION },
  },

  Epsilon21: {
    folder: "Epsilon21",
    frameDurationsMs: [],
    defaultFrameDurationMs: 120,
    loops: 0,
    scale: 0.32,
    position: { ...DEFAULT_POSITION },
  },

  Gamma128_Martillo: {
    folder: "Gamma128_Martillo",
    frameDurationsMs: [],
    defaultFrameDurationMs: 120,
    loops: 0,
    scale: 0.32,
    position: { ...DEFAULT_POSITION },
  },

  Jack_Veil_RayPunch: {
    folder: "Jack_Veil_RayPunch",
    frameDurationsMs: [],
    defaultFrameDurationMs: 100,
    loops: 0,
    scale: 0.32,
    position: { ...DEFAULT_POSITION },
  },

  Jack_Veil_Running: {
    folder: "Jack_Veil_Running",
    frameDurationsMs: [],
    defaultFrameDurationMs: 100,
    loops: 0,
    scale: 0.32,
    position: { ...DEFAULT_POSITION },
  },

  KAR_Walk: {
    folder: "KAR_Walk",
    frameDurationsMs: [],
    defaultFrameDurationMs: 120,
    loops: 0,
    scale: 0.32,
    position: { ...DEFAULT_POSITION },
  },

  Lucius_Ataque: {
    folder: "Lucius_Ataque",
    frameDurationsMs: [],
    defaultFrameDurationMs: 120,
    loops: 0,
    scale: 0.32,
    position: { ...DEFAULT_POSITION },
  },

  Lucius_Flotar: {
    folder: "Lucius_Flotar",
    frameDurationsMs: [],
    defaultFrameDurationMs: 120,
    loops: 0,
    scale: 0.32,
    position: { ...DEFAULT_POSITION },
  },

  Lucius_Invocar: {
    folder: "Lucius_Invocar",
    frameDurationsMs: [],
    defaultFrameDurationMs: 120,
    loops: 0,
    scale: 0.32,
    position: { ...DEFAULT_POSITION },
  },

  Omega06_Attack: {
    folder: "Omega06_Attack",
    frameDurationsMs: [],
    defaultFrameDurationMs: 120,
    loops: 0,
    scale: 0.32,
    position: { ...DEFAULT_POSITION },
  },

  SentinelaAlpha16_attack: {
    folder: "SentinelaAlpha16_attack",
    frameDurationsMs: [],
    defaultFrameDurationMs: 120,
    loops: 0,
    scale: 0.32,
    position: { ...DEFAULT_POSITION },
  },

  SirBielas_Estocada: {
    folder: "SirBielas_Estocada",
    frameDurationsMs: [],
    defaultFrameDurationMs: 120,
    loops: 0,
    scale: 0.32,
    position: { ...DEFAULT_POSITION },
  },

  Tecnocrata: {
    folder: "Tecnocrata",
    frameDurationsMs: [],
    defaultFrameDurationMs: 120,
    loops: 0,
    scale: 0.32,
    position: { ...DEFAULT_POSITION },
  },
};

// ======================================================
// UTILIDADES
// ======================================================

function getAnimationConfig(name) {
  if (
    typeof name !== "string" ||
    !Object.prototype.hasOwnProperty.call(ANIMATIONS, name)
  ) {
    throw new Error(`Animación no registrada: ${name}`);
  }

  return ANIMATIONS[name];
}

function getAnimationFrames(config) {
  const directory = path.join(SPRITES_DIR, config.folder);

  if (!fs.existsSync(directory)) {
    throw new Error(`No existe la carpeta: ${config.folder}`);
  }

  const frames = fs
    .readdirSync(directory)
    .filter((file) => /^frame_\d+\.png$/i.test(file))
    .map((file) => ({
      file,
      number: Number(file.match(/\d+/)[0]),
    }))
    .sort((a, b) => a.number - b.number)
    .map((item) => path.join(directory, item.file));

  if (frames.length === 0) {
    throw new Error(`No hay fotogramas PNG en ${config.folder}.`);
  }

  if (path.basename(frames[0]).toLowerCase() !== "frame_00.png") {
    throw new Error(`${config.folder} debe contener frame_00.png.`);
  }

  return frames;
}

function getFrameDurations(config, frameCount) {
  if (
    !Number.isFinite(config.defaultFrameDurationMs) ||
    config.defaultFrameDurationMs <= 0
  ) {
    throw new Error("defaultFrameDurationMs debe ser mayor que cero.");
  }

  if (!Array.isArray(config.frameDurationsMs)) {
    throw new Error("frameDurationsMs debe ser un arreglo.");
  }

  return Array.from({ length: frameCount }, (_, index) => {
    const configured = config.frameDurationsMs[index];

    const duration =
      configured === undefined
        ? config.defaultFrameDurationMs
        : configured;

    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error(`Duración inválida en el fotograma ${index}.`);
    }

    return duration;
  });
}

function validateConfig(config) {
  if (!Number.isInteger(config.loops) || config.loops < 0) {
    throw new Error("loops debe ser 0 o un entero positivo.");
  }

  if (!Number.isFinite(config.scale) || config.scale <= 0) {
    throw new Error("scale debe ser mayor que cero.");
  }

  if (
    typeof config.position?.x !== "string" ||
    typeof config.position?.y !== "string"
  ) {
    throw new Error("La posición de la animación no está configurada.");
  }
}

function parseBase64(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("No se recibió videoBase64.");
  }

  const base64 = value.includes(",")
    ? value.slice(value.indexOf(",") + 1)
    : value;

  const normalized = base64.replace(/\s/g, "");

  if (
    normalized.length === 0 ||
    normalized.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)
  ) {
    throw new Error("El contenido Base64 no tiene un formato válido.");
  }

  const buffer = Buffer.from(normalized, "base64");

  if (buffer.length === 0) {
    throw new Error("El video recibido está vacío.");
  }

  return buffer;
}

function escapeConcatPath(filePath) {
  return filePath
    .replace(/\\/g, "/")
    .replace(/'/g, "'\\''");
}

function createConcatManifest(frames, durations, loops) {
  // loops = 0: una secuencia que FFmpeg repetirá indefinidamente.
  // loops = 1, 5, etc.: secuencia repetida esa cantidad de veces.
  const repetitions = loops === 0 ? 1 : loops;
  const lines = [];

  for (let repetition = 0; repetition < repetitions; repetition++) {
    frames.forEach((frame, index) => {
      lines.push(`file '${escapeConcatPath(frame)}'`);
      lines.push(`duration ${(durations[index] / 1000).toFixed(6)}`);
    });
  }

  // FFmpeg necesita repetir el último archivo para aplicar su duración.
  lines.push(
    `file '${escapeConcatPath(frames[frames.length - 1])}'`
  );

  return lines.join("\n");
}

function runFfmpeg(command) {
  return new Promise((resolve, reject) => {
    command
      .on("start", (commandLine) => {
        console.log("[FFmpeg] Iniciado:", commandLine);
      })
      .on("progress", (progress) => {
        if (Number.isFinite(progress.percent)) {
          console.log(
            `[FFmpeg] ${progress.percent.toFixed(1)}%`
          );
        }
      })
      .on("error", reject)
      .on("end", resolve)
      .run();
  });
}

async function removeFiles(files) {
  await Promise.all(
    files.map(async (file) => {
      try {
        await fsp.rm(file, { force: true });
      } catch (error) {
        console.error("[Limpieza]", error.message);
      }
    })
  );
}

function sendTemporaryFile(res, filePath, contentType, temporaryFiles) {
  res.setHeader("Content-Type", contentType);

  res.sendFile(filePath, async (error) => {
    await removeFiles(temporaryFiles);

    if (error) {
      console.error("[Respuesta]", error.message);

      if (!res.headersSent) {
        res.status(500).end();
      }
    }
  });
}

// ======================================================
// ESTADO DEL SERVIDOR
// ======================================================

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "vaporlock-video-overlay",
    animations: Object.keys(ANIMATIONS).length,
  });
});

// ======================================================
// CATÁLOGO DE ANIMACIONES
// ======================================================

app.get("/api/animations", (_req, res) => {
  const result = Object.entries(ANIMATIONS).map(([name, config]) => {
    let frameCount = 0;
    let available = false;

    try {
      frameCount = getAnimationFrames(config).length;
      available = true;
    } catch {
      available = false;
    }

    return {
      name,
      available,
      frameCount,
      defaultFrameDurationMs: config.defaultFrameDurationMs,
      frameDurationsMs: config.frameDurationsMs,
      loops: config.loops,
      scale: config.scale,
      position: config.position,
    };
  });

  res.json(result);
});

// ======================================================
// COMPOSICIÓN DE VIDEOS
// ======================================================

app.post("/api/compose-video", async (req, res) => {
  const temporaryFiles = [];

  try {
    const { videoBase64, character } = req.body || {};

    if (!videoBase64) {
      return res.status(400).json({
        error: "Se necesita videoBase64.",
      });
    }

    const config = getAnimationConfig(character);
    validateConfig(config);

    const frames = getAnimationFrames(config);
    const durations = getFrameDurations(config, frames.length);

    const id = crypto.randomUUID();

    const inputPath = path.join(
      TEMP_DIR,
      `video_input_${id}.mp4`
    );

    const manifestPath = path.join(
      TEMP_DIR,
      `video_animation_${id}.txt`
    );

    const outputPath = path.join(
      TEMP_DIR,
      `video_output_${id}.mp4`
    );

    temporaryFiles.push(inputPath, manifestPath, outputPath);

    await fsp.writeFile(inputPath, parseBase64(videoBase64));

    const manifest = createConcatManifest(
      frames,
      durations,
      config.loops
    );

    await fsp.writeFile(manifestPath, manifest, "utf8");

    const inputOptions = ["-f concat", "-safe 0"];

    // Repetición indefinida mientras dure el video.
    if (config.loops === 0) {
      inputOptions.push("-stream_loop -1");
    }

    const filter =
      `[1:v]scale=trunc(iw*${config.scale}/2)*2:-2:flags=neighbor[character];` +
      `[0:v][character]overlay=` +
      `${config.position.x}:${config.position.y}:` +
      `eof_action=pass:repeatlast=0:shortest=0[out]`;

    await runFfmpeg(
      ffmpeg()
        .input(inputPath)
        .input(manifestPath)
        .inputOptions(inputOptions)
        .complexFilter(filter)
        .outputOptions([
          "-map [out]",
          "-map 0:a?",
          "-c:v libx264",
          "-preset medium",
          "-crf 18",
          "-pix_fmt yuv420p",
          "-c:a aac",
          "-b:a 192k",
          "-movflags +faststart",
        ])
        .output(outputPath)
    );

    if (!fs.existsSync(outputPath)) {
      throw new Error("No se generó el video de salida.");
    }

    sendTemporaryFile(
      res,
      outputPath,
      "video/mp4",
      temporaryFiles
    );
  } catch (error) {
    console.error("[Video] Error:", error);

    await removeFiles(temporaryFiles);

    if (!res.headersSent) {
      res.status(500).json({
        error: "No se pudo procesar el video.",
        details: error.message,
      });
    }
  }
});

// ======================================================
// MANEJO DE ERRORES
// ======================================================

app.use((error, _req, res, _next) => {
  console.error("[Servidor]", error);

  if (res.headersSent) return;

  res.status(error.status || 500).json({
    error:
      error.type === "entity.too.large"
        ? "El video supera el límite permitido de 150 MB."
        : "Error interno del servidor.",
  });
});

// ======================================================
// INICIO
// ======================================================

app.listen(PORT, () => {
  console.log("------------------------------------");
  console.log("Vaporlock Video Overlay");
  console.log(`Puerto: ${PORT}`);
  console.log(
    `Animaciones registradas: ${Object.keys(ANIMATIONS).length}`
  );
  console.log("Procesamiento habilitado: videos");
  console.log("Fotografías y GIF de interfaz: gestionados localmente por Expo");
  console.log("------------------------------------");
});
