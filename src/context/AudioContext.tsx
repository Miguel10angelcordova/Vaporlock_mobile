// src/context/AudioContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';

const STORAGE_KEY = '@vaporlock_audio_settings_v1';

const BGM_SOURCE = require('../../assets/audio/Menu.wav');
const BUTTON_SFX_SOURCE = require('../../assets/audio/tuerca11.wav');

interface AudioContextValue {
  musicVolume: number; // 0 a 1
  sfxVolume: number; // 0 a 1
  setMusicVolume: (value: number) => Promise<void>;
  setSfxVolume: (value: number) => Promise<void>;
  playButtonSound: () => void;
}

const AudioContext = createContext<AudioContextValue>({
  musicVolume: 0.5,
  sfxVolume: 0.7,
  setMusicVolume: async () => {},
  setSfxVolume: async () => {},
  playButtonSound: () => {},
});

const clampVolume = (val: number) => Math.max(0, Math.min(1, val));

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [musicVolume, setMusicVolumeState] = useState(0.5);
  const [sfxVolume, setSfxVolumeState] = useState(0.7);

  const bgmPlayerRef = useRef<any>(null);
  const sfxPlayerRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
        });
      } catch {
        // Ignorar en entornos sin soporte nativo de audio
      }

      let initialMusic = 0.5;
      let initialSfx = 0.7;

      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && mounted) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.musicVolume === 'number') {
            initialMusic = clampVolume(parsed.musicVolume);
            setMusicVolumeState(initialMusic);
          }
          if (typeof parsed.sfxVolume === 'number') {
            initialSfx = clampVolume(parsed.sfxVolume);
            setSfxVolumeState(initialSfx);
          }
        }
      } catch {
        // Usar valores por defecto
      }

      if (Platform.OS !== 'web' && BGM_SOURCE) {
        try {
          const player = createAudioPlayer(BGM_SOURCE);
          player.loop = true;
          player.volume = initialMusic;
          if (initialMusic > 0) {
            player.play();
          }
          bgmPlayerRef.current = player;
        } catch {
          // Si falla al cargar la pista de fondo, no rompe la app
        }
      }

      if (Platform.OS !== 'web' && BUTTON_SFX_SOURCE) {
        try {
          const sfx = createAudioPlayer(BUTTON_SFX_SOURCE);
          sfx.volume = initialSfx;
          sfxPlayerRef.current = sfx;
        } catch {
          // Ignorar
        }
      }
    })();

    return () => {
      mounted = false;
      try {
        bgmPlayerRef.current?.remove?.();
        sfxPlayerRef.current?.remove?.();
      } catch {
        // Ignorar
      }
    };
  }, []);

  useEffect(() => {
    if (bgmPlayerRef.current) {
      try {
        bgmPlayerRef.current.volume = musicVolume;
        if (musicVolume > 0 && !bgmPlayerRef.current.playing) {
          bgmPlayerRef.current.play();
        } else if (musicVolume === 0) {
          bgmPlayerRef.current.pause();
        }
      } catch {
        // Ignorar
      }
    }
  }, [musicVolume]);

  useEffect(() => {
    if (sfxPlayerRef.current) {
      try {
        sfxPlayerRef.current.volume = sfxVolume;
      } catch {
        // Ignorar
      }
    }
  }, [sfxVolume]);

  const persistVolumes = async (nextMusic: number, nextSfx: number) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ musicVolume: nextMusic, sfxVolume: nextSfx })
      );
    } catch {
      // Ignorar
    }
  };

  const setMusicVolume = useCallback(
    async (value: number) => {
      const clamped = clampVolume(value);
      setMusicVolumeState(clamped);
      await persistVolumes(clamped, sfxVolume);
    },
    [sfxVolume]
  );

  const setSfxVolume = useCallback(
    async (value: number) => {
      const clamped = clampVolume(value);
      setSfxVolumeState(clamped);
      await persistVolumes(musicVolume, clamped);
    },
    [musicVolume]
  );

  const playButtonSound = useCallback(() => {
    if (Platform.OS === 'web' || !sfxPlayerRef.current || sfxVolume <= 0) {
      return;
    }
    try {
      sfxPlayerRef.current.volume = sfxVolume;
      sfxPlayerRef.current.seekTo(0);
      sfxPlayerRef.current.play();
    } catch {
      // Ignorar
    }
  }, [sfxVolume]);

  return (
    <AudioContext.Provider
      value={{
        musicVolume,
        sfxVolume,
        setMusicVolume,
        setSfxVolume,
        playButtonSound,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export const useAppAudio = () => useContext(AudioContext);