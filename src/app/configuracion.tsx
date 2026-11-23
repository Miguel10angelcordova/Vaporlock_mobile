// src/app/configuracion.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppAudio } from '../context/AudioContext';
import CustomFooter from './components/CustomFooter';
import CustomHeader from './components/CustomHeader';

const CONFIG_URL = 'https://configuracion-six.vercel.app/';
const STEP = 0.1;

const INJECTED_CONFIG_SCRIPT = `
  (function() {
    function hideUnwantedControls() {
      var hiddenLabels = ['lenguaje', 'idioma', 'creditos', 'créditos', 'soporte'];
      var els = document.querySelectorAll('button, a, select, label, span, p');

      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (!el || el.tagName === 'BODY' || el.tagName === 'HTML') continue;

        var txt = (el.innerText || el.textContent || '').trim().toLowerCase();
        var matchesHidden = false;
        for (var j = 0; j < hiddenLabels.length; j++) {
          if (txt === hiddenLabels[j]) {
            matchesHidden = true;
            break;
          }
        }

        if (matchesHidden) {
          var target = (el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'SELECT')
            ? el
            : (el.closest('button, a, select') || el);
          if (target && target.tagName !== 'BODY' && target.tagName !== 'HTML') {
            target.style.setProperty('display', 'none', 'important');
          }
        }
      }
    }

    hideUnwantedControls();
    setTimeout(hideUnwantedControls, 700);
    true;
  })();
`;

export default function ConfigScreen() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const {
    musicVolume,
    sfxVolume,
    setMusicVolume,
    setSfxVolume,
    playButtonSound,
  } = useAppAudio();

  const WebView =
    Platform.OS !== 'web' ? require('react-native-webview').WebView : null;

  const handleNavigation = (route: string) => {
    switch (route) {
      case '/':
        router.replace('/');
        break;
      case '/history':
        router.replace('/history' as any);
        break;
      case '/characters':
        router.replace('/characters' as any);
        break;
      case 'Logout':
      case '/logout':
        router.replace('/');
        break;
      default:
        break;
    }
  };

  const adjustMusic = async (delta: number) => {
    const next = Math.max(
      0,
      Math.min(1, Number((musicVolume + delta).toFixed(2)))
    );
    await setMusicVolume(next);
    playButtonSound();
  };

  const toggleMusicMute = async () => {
    const next = musicVolume > 0 ? 0 : 0.5;
    await setMusicVolume(next);
    playButtonSound();
  };

  const adjustSfx = async (delta: number) => {
    const next = Math.max(
      0,
      Math.min(1, Number((sfxVolume + delta).toFixed(2)))
    );
    await setSfxVolume(next);
    if (next > 0) {
      playButtonSound();
    }
  };

  const toggleSfxMute = async () => {
    const next = sfxVolume > 0 ? 0 : 0.7;
    await setSfxVolume(next);
    if (next > 0) {
      playButtonSound();
    }
  };

  const renderVolumeCard = (params: {
    title: string;
    iconName: 'volume-high' | 'musical-notes';
    volume: number;
    onMinus: () => void;
    onPlus: () => void;
    onToggleMute: () => void;
  }) => {
    const { title, iconName, volume, onMinus, onPlus, onToggleMute } = params;
    const pct = Math.round(volume * 100);
    const isMuted = volume === 0;

    return (
      <View style={styles.settingCard}>
        <View style={styles.cardTopRow}>
          <View style={styles.titleRow}>
            <View style={styles.badgeIcon}>
              <Ionicons name={iconName} size={20} color="#F3E5AB" />
            </View>
            <Text style={styles.cardTitle}>{title}</Text>
          </View>
          <Text style={styles.percentText}>{pct}%</Text>
        </View>

        <View style={styles.meterTrack}>
          <View style={[styles.meterFill, { width: `${pct}%` }]} />
        </View>

        <View style={styles.cardActionsRow}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={onMinus}
            activeOpacity={0.75}
          >
            <Ionicons name="remove" size={20} color="#F3E5AB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.stepBtn}
            onPress={onPlus}
            activeOpacity={0.75}
          >
            <Ionicons name="add" size={20} color="#F3E5AB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, isMuted && styles.toggleBtnMuted]}
            onPress={onToggleMute}
            activeOpacity={0.75}
          >
            <Ionicons
              name={isMuted ? 'volume-mute' : 'checkmark-circle'}
              size={18}
              color={isMuted ? '#FFF8DC' : '#2A1810'}
            />
            <Text
              style={[styles.toggleBtnText, isMuted && styles.toggleBtnTextMuted]}
            >
              {isMuted ? 'Silenciado' : 'Activo'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader />

      <View style={styles.contentContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            src={CONFIG_URL}
            style={{ border: 'none', width: '100%', height: '100%' }}
            title="Configuración"
          />
        ) : (
          <WebView
            source={{ uri: CONFIG_URL }}
            style={styles.webview}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            injectedJavaScript={INJECTED_CONFIG_SCRIPT}
            javaScriptEnabled
            domStorageEnabled
          />
        )}

        <View style={styles.cardsOverlay} pointerEvents="box-none">
          {renderVolumeCard({
            title: 'Sonido',
            iconName: 'volume-high',
            volume: sfxVolume,
            onMinus: () => adjustSfx(-STEP),
            onPlus: () => adjustSfx(STEP),
            onToggleMute: toggleSfxMute,
          })}

          {renderVolumeCard({
            title: 'Música',
            iconName: 'musical-notes',
            volume: musicVolume,
            onMinus: () => adjustMusic(-STEP),
            onPlus: () => adjustMusic(STEP),
            onToggleMute: toggleMusicMute,
          })}
        </View>

        {loading && Platform.OS !== 'web' && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#D4AF37" />
          </View>
        )}
      </View>

      <CustomFooter currentRoute="/configuracion" onNavigate={handleNavigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#160D08' },
  contentContainer: { flex: 1, position: 'relative' },
  webview: { flex: 1, backgroundColor: '#F3E5AB' },
  cardsOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingTop: 48,
    gap: 16,
  },
  settingCard: {
    backgroundColor: '#F3DC9E',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#C59B38',
    padding: 16,
    gap: 12,
    shadowColor: '#2A1810',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#3A1E12',
    borderWidth: 1.5,
    borderColor: '#C59B38',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#2A1810',
    fontSize: 20,
    fontWeight: 'bold',
  },
  percentText: {
    color: '#3A1E12',
    fontSize: 17,
    fontWeight: '700',
  },
  meterTrack: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#C9AE74',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#9E7B3B',
  },
  meterFill: {
    height: '100%',
    backgroundColor: '#5C3018',
    borderRadius: 6,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 2,
  },
  stepBtn: {
    width: 46,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#3A1E12',
    borderWidth: 1.5,
    borderColor: '#C59B38',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#D4B24C',
    borderWidth: 1.5,
    borderColor: '#8C5228',
  },
  toggleBtnMuted: {
    backgroundColor: '#7A2E2E',
    borderColor: '#C59B38',
  },
  toggleBtnText: {
    color: '#2A1810',
    fontSize: 14,
    fontWeight: 'bold',
  },
  toggleBtnTextMuted: {
    color: '#FFF8DC',
  },
  loader: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 13, 8, 0.7)',
  },
});