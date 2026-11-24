
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

const CENTER_IMAGE = require('../app/personajes/jack-veil.gif');

export default function Index() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const isSmallScreen = width < 600;
  const imageSize = Math.min(width * 0.75, height * 0.58, 440);

  const handlePress = () => {
    router.push('/components/Menu');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Fondo industrial */}
      <View style={styles.background}>
        <View style={styles.backgroundGrid} />

        <View style={styles.backgroundGlow} />

        <View style={styles.leftStructure}>
          <View style={styles.structurePipe} />
          <View style={styles.structureJoint} />
          <View style={styles.structureLine} />
        </View>

        <View style={styles.rightStructure}>
          <View style={styles.structurePipe} />
          <View style={styles.structureJoint} />
          <View style={styles.structureLine} />
        </View>

        <View style={styles.topDecoration}>
          <View style={styles.topLine} />
          <Text style={styles.topLabel}>VAPORLOCK // SYSTEM ONLINE</Text>
          <View style={styles.topLine} />
        </View>

        {/* Elemento visual central */}
        <View
          style={[
            styles.characterContainer,
            {
              width: imageSize,
              height: imageSize,
            },
          ]}
        >
          <View style={styles.outerRing} />
          <View style={styles.innerRing} />

          <Image
            source={CENTER_IMAGE}
            style={styles.characterImage}
            contentFit="contain"
            autoplay
          />

          <View style={styles.characterShadow} />
        </View>

        {/* Detalles ambientales */}
        <View style={styles.leftDecoration}>
          <View style={styles.smallLight} />
          <View style={styles.decorationLine} />
          <View style={styles.smallLight} />
        </View>

        <View style={styles.rightDecoration}>
          <View style={styles.smallLight} />
          <View style={styles.decorationLine} />
          <View style={styles.smallLight} />
        </View>

        {/* Oscurecimiento para mantener el contraste */}
        <View style={styles.overlayShade} />
      </View>

      {/* Interfaz */}
      <View style={styles.content}>
        <View style={styles.brand}>
          <Text style={styles.brandTitle}>VAPORLOCK</Text>
          <View style={styles.brandDivider} />
          <Text style={styles.brandSubtitle}>THE WORLD IS WAITING</Text>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              {
                width: isSmallScreen ? '82%' : 300,
              },
            ]}
            onPress={handlePress}
            activeOpacity={0.8}
          >
            <View style={styles.buttonInner}>
              <Text style={styles.buttonText}>CONTINUAR</Text>
              <Text style={styles.buttonArrow}>↗</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.buttonHint}>
            PRESIONA PARA INICIAR
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>
            AN INDUSTRIAL ADVENTURE
          </Text>
          <Text style={styles.footerVersion}>V.01</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101416',
    overflow: 'hidden',
  },

  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#111719',
    overflow: 'hidden',
  },

  backgroundGrid: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.13,
    backgroundColor: '#172124',
    borderWidth: 1,
    borderColor: '#344044',
  },

  backgroundGlow: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: '#27342f',
    opacity: 0.35,
    alignSelf: 'center',
    top: '15%',
  },

  leftStructure: {
    position: 'absolute',
    left: 15,
    top: '12%',
    bottom: '12%',
    width: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rightStructure: {
    position: 'absolute',
    right: 15,
    top: '12%',
    bottom: '12%',
    width: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  structurePipe: {
    width: 5,
    flex: 1,
    backgroundColor: '#58402d',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#9c7044',
  },

  structureJoint: {
    position: 'absolute',
    top: '45%',
    width: 24,
    height: 24,
    backgroundColor: '#272b2c',
    borderWidth: 2,
    borderColor: '#a16c3d',
    transform: [{ rotate: '45deg' }],
  },

  structureLine: {
    position: 'absolute',
    top: '46%',
    width: 24,
    height: 2,
    backgroundColor: '#d18b4b',
  },

  topDecoration: {
    position: 'absolute',
    top: 35,
    left: 35,
    right: 35,
    flexDirection: 'row',
    alignItems: 'center',
  },

  topLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#8b603d',
    opacity: 0.65,
  },

  topLabel: {
    color: '#b68c60',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 2,
    fontFamily: 'monospace',
    marginHorizontal: 12,
  },

  characterContainer: {
    position: 'absolute',
    alignSelf: 'center',
    top: '17%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  outerRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 300,
    borderWidth: 1,
    borderColor: '#8b603d',
    opacity: 0.65,
  },

  innerRing: {
    position: 'absolute',
    width: '85%',
    height: '85%',
    borderRadius: 300,
    borderWidth: 1,
    borderColor: '#00a99d',
    opacity: 0.45,
  },

  characterImage: {
    width: '100%',
    height: '100%',
    zIndex: 2,
  },

  characterShadow: {
    position: 'absolute',
    bottom: '8%',
    width: '65%',
    height: 15,
    borderRadius: 100,
    backgroundColor: '#000000',
    opacity: 0.5,
  },

  leftDecoration: {
    position: 'absolute',
    left: 38,
    top: '50%',
    alignItems: 'center',
  },

  rightDecoration: {
    position: 'absolute',
    right: 38,
    top: '50%',
    alignItems: 'center',
  },

  smallLight: {
    width: 7,
    height: 7,
    backgroundColor: '#00c7b7',
    borderRadius: 1,
  },

  decorationLine: {
    width: 1,
    height: 65,
    backgroundColor: '#8b603d',
    marginVertical: 8,
  },

  overlayShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(5, 9, 10, 0.24)',
  },

  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 75,
    paddingBottom: 28,
  },

  brand: {
    alignItems: 'center',
  },

  brandTitle: {
    color: '#f0d6ad',
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: 5,
    fontFamily: 'monospace',
    textShadowColor: '#a66b37',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },

  brandDivider: {
    width: 100,
    height: 2,
    backgroundColor: '#b77942',
    marginTop: 12,
    marginBottom: 8,
  },

  brandSubtitle: {
    color: '#a7aaa2',
    fontSize: 9,
    letterSpacing: 3,
    fontFamily: 'monospace',
  },

  actionContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
  },

  button: {
    height: 64,
    maxWidth: 340,
    backgroundColor: '#182426',
    borderWidth: 1,
    borderColor: '#00c7b7',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 8,
  },

  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  buttonText: {
    color: '#e9d4b2',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
    fontFamily: 'monospace',
  },

  buttonArrow: {
    color: '#00e5d0',
    fontSize: 25,
    fontWeight: 'bold',
    marginLeft: 18,
  },

  buttonHint: {
    color: '#929b96',
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 13,
    fontFamily: 'monospace',
  },

  footer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
  },

  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#765337',
    opacity: 0.7,
  },

  footerText: {
    color: '#9b8b76',
    fontSize: 8,
    letterSpacing: 2,
    marginHorizontal: 12,
    fontFamily: 'monospace',
  },

  footerVersion: {
    color: '#00b9aa',
    fontSize: 9,
    fontFamily: 'monospace',
  },
});
