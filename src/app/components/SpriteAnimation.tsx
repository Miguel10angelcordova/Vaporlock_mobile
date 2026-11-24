import { useEffect, useMemo, useState } from "react";
import {
  Image,
  type ImageSourcePropType,
  StyleSheet,
  View,
} from "react-native";

/**
 * Carga los fotogramas de cada carpeta dentro de ../personajes.
 * Estructura esperada:
 * personajes/
 *   NombrePersonaje/
 *     frame_1.png
 *     frame_2.png
 *     frame_10.png
 */
const spriteContext = require.context(
  "../personajes",
  true,
  /^\.\/[^/]+\/frame_\d+\.png$/i
);

type SpriteCatalog = Record<string, ImageSourcePropType[]>;

function createSpriteCatalog(): SpriteCatalog {
  const catalog: SpriteCatalog = {};
  const filesByCharacter: Record<string, string[]> = {};

  for (const file of spriteContext.keys()) {
    const match = file.match(/^\.\/([^/]+)\/frame_(\d+)\.png$/i);

    if (!match) continue;

    const character = match[1];
    filesByCharacter[character] ??= [];
    filesByCharacter[character].push(file);
  }

  for (const [character, files] of Object.entries(filesByCharacter)) {
    files.sort((a, b) => {
      const frameA = Number(a.match(/frame_(\d+)\.png$/i)?.[1] ?? 0);
      const frameB = Number(b.match(/frame_(\d+)\.png$/i)?.[1] ?? 0);
      return frameA - frameB;
    });

    catalog[character] = files.map((file) => spriteContext(file));
  }

  return catalog;
}

const animations = createSpriteCatalog();

interface SpriteAnimationProps {
  character: string;
  size?: number;
  fps?: number;
  playing?: boolean;
}

export default function SpriteAnimation({
  character,
  size = 128,
  fps = 8,
  playing = true,
}: SpriteAnimationProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [loadedFrameIndexes, setLoadedFrameIndexes] = useState<number[]>([]);

  const frames = useMemo(
    () => animations[character] ?? [],
    [character]
  );

  // Reinicia la animación cuando cambia el personaje.
  useEffect(() => {
    setCurrentFrame(0);
    setLoadedFrameIndexes([]);
  }, [character]);

  const allFramesLoaded = frames.length > 0 && loadedFrameIndexes.length === frames.length;

  // Avanza únicamente cuando todos los PNG están cargados.
  useEffect(() => {
    if (!playing || !allFramesLoaded || frames.length <= 1 || fps <= 0) {
      return;
    }

    const safeFps = Math.min(Math.max(fps, 1), 60);
    const intervalId = setInterval(() => {
      setCurrentFrame((previousFrame) => (previousFrame + 1) % frames.length);
    }, 1000 / safeFps);

    return () => clearInterval(intervalId);
  }, [fps, frames.length, playing, character, allFramesLoaded]);

  if (frames.length === 0) {
    console.warn(`No se encontraron fotogramas para: ${character}`);
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
        },
      ]}
      pointerEvents="none"
    >
      {frames.map((source, index) => (
        <Image
          key={`${character}-${index}`}
          source={source}
          resizeMode="contain"
          fadeDuration={0}
          style={[
            styles.frame,
            {
              width: size,
              height: size,
              opacity: allFramesLoaded && currentFrame === index ? 1 : 0,
            },
          ]}
          onLoad={() => {
            setLoadedFrameIndexes((previous) =>
              previous.includes(index) ? previous : [...previous, index]
            );
          }}
        />
      ))}
    </View>
  );
}

export function getAvailableAnimations(): string[] {
  return Object.keys(animations).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  );
}

export function getAnimationFrameCount(character: string): number {
  return animations[character]?.length ?? 0;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "visible",
    backgroundColor: "transparent",
  },
  frame: {
    position: "absolute",
    top: 0,
    left: 0,
    resizeMode: "contain",
    backgroundColor: "transparent",
  },
});
