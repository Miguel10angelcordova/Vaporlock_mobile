
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title?: string;
}

const COLORS = {
  background: '#11131A',
  panel: '#22232C',
  panelDark: '#191B24',
  plate: '#351B17',
  plateLight: '#512719',
  copper: '#E38A42',
  copperLight: '#F2A65E',
  yellow: '#FFD43B',
  cream: '#F4E8CF',
  teal: '#24D7D1',
  border: '#76513B',
  muted: '#A9A5A0',
};

export function Header({ title = 'Menu' }: HeaderProps) {
  const { width } = useWindowDimensions();

  const compact = width < 380;
  const tablet = width >= 600 && width < 1024;
  const desktop = width >= 1024;

  const plateWidth = Math.min(width * 0.92, 560);

  const plateHeight = compact
    ? 58
    : tablet
      ? 76
      : desktop
        ? 88
        : 70;

  const titleSize = compact
    ? 23
    : tablet
      ? 34
      : desktop
        ? 43
        : 30;

  const nativeDriver = Platform.OS !== 'web';

  const entrance = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const leftGear = useRef(new Animated.Value(0)).current;
  const rightGear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entranceAnimation = Animated.parallel([
      Animated.timing(entrance, {
        toValue: 1,
        duration: 750,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: nativeDriver,
      }),

      Animated.timing(leftGear, {
        toValue: 1,
        duration: 950,
        easing: Easing.out(Easing.back(1.3)),
        useNativeDriver: nativeDriver,
      }),

      Animated.timing(rightGear, {
        toValue: 1,
        duration: 950,
        delay: 150,
        easing: Easing.out(Easing.back(1.3)),
        useNativeDriver: nativeDriver,
      }),
    ]);

    entranceAnimation.start();

    let shimmerAnimation: Animated.CompositeAnimation | undefined;

    // El reflejo periódico se mantiene en plataformas nativas.
    // En Web se evita una animación continua basada en JS.
    if (Platform.OS !== 'web') {
      shimmerAnimation = Animated.loop(
        Animated.sequence([
          Animated.delay(3500),

          Animated.timing(shimmer, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: nativeDriver,
          }),

          Animated.timing(shimmer, {
            toValue: 0,
            duration: 0,
            useNativeDriver: nativeDriver,
          }),
        ])
      );

      shimmerAnimation.start();
    }

    return () => {
      entranceAnimation.stop();
      shimmerAnimation?.stop();
    };
  }, [entrance, shimmer, leftGear, rightGear, nativeDriver]);

  const translateY = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });

  const scale = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });

  const leftRotation = leftGear.interpolate({
    inputRange: [0, 1],
    outputRange: ['-100deg', '0deg'],
  });

  const rightRotation = rightGear.interpolate({
    inputRange: [0, 1],
    outputRange: ['100deg', '0deg'],
  });

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-plateWidth, plateWidth],
  });

  const shimmerOpacity = shimmer.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.4, 0],
  });

  return (
    <View style={styles.container}>
      {/* PLACA PRINCIPAL */}

      <Animated.View
        style={[
          styles.outerFrame,
          {
            width: plateWidth,
            height: plateHeight,
            opacity: entrance,
            transform: [
              { translateY },
              { scale },
            ],
          },
        ]}
      >
        <View style={styles.borderOuter}>
          <View style={styles.borderInner}>
            <View style={styles.plate}>

              {/* REFLEJO SUPERIOR */}

              <View style={styles.topHighlight} />
              <View style={styles.topLine} />
              <View style={styles.bottomLine} />

              {/* REMACHES */}

              <View style={[styles.rivet, styles.topLeft]} />
              <View style={[styles.rivet, styles.topRight]} />
              <View style={[styles.rivet, styles.bottomLeft]} />
              <View style={[styles.rivet, styles.bottomRight]} />

              {/* ENGRANAJE IZQUIERDO */}

              <Animated.View
                style={[
                  styles.leftGear,
                  {
                    transform: [{ rotate: leftRotation }],
                  },
                ]}
              >
                <Ionicons
                  name="settings"
                  size={compact ? 13 : 17}
                  color={COLORS.copper}
                />
              </Animated.View>

              {/* TITULO */}

              <View style={styles.titleRow}>
                <View style={styles.ornament}>
                  <View style={styles.dot} />
                  <View style={styles.line} />
                </View>

                <Text
                  style={[
                    styles.title,
                    { fontSize: titleSize },
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {title}
                </Text>

                <View style={styles.ornament}>
                  <View style={styles.line} />
                  <View style={styles.dot} />
                </View>
              </View>

              {/* ENGRANAJE DERECHO */}

              <Animated.View
                style={[
                  styles.rightGear,
                  {
                    transform: [{ rotate: rightRotation }],
                  },
                ]}
              >
                <Ionicons
                  name="settings"
                  size={compact ? 13 : 17}
                  color={COLORS.copper}
                />
              </Animated.View>

              {/* REFLEJO METALICO */}

              {Platform.OS !== 'web' && (
                <View
                  pointerEvents="none"
                  style={styles.shimmerContainer}
                >
                  <Animated.View
                    style={[
                      styles.shimmer,
                      {
                        opacity: shimmerOpacity,
                        transform: [
                          { translateX: shimmerTranslate },
                          { rotate: '20deg' },
                        ],
                      },
                    ]}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </Animated.View>

      {/* ORNAMENTO INFERIOR */}

      <View
        style={[
          styles.bottomOrnament,
          { width: plateWidth * 0.68 },
        ]}
      >
        <View style={styles.ornamentLine} />

        <View style={styles.centerDiamond}>
          <View style={styles.centerDot} />
        </View>

        <View style={styles.ornamentLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 12,
    overflow: 'visible',
  },

  // ESTRUCTURA METALICA

  outerFrame: {
    maxWidth: 560,
    backgroundColor: COLORS.panelDark,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 3,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 7,
  },

  borderOuter: {
    flex: 1,
    backgroundColor: COLORS.copper,
    padding: 2,
  },

  borderInner: {
    flex: 1,
    backgroundColor: COLORS.panel,
    padding: 2,
  },

  plate: {
    flex: 1,
    backgroundColor: COLORS.plate,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#9C5933',
  },

  // DETALLES DE LA PLACA

  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: COLORS.plateLight,
    opacity: 0.5,
  },

  topLine: {
    position: 'absolute',
    top: 5,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: COLORS.copperLight,
    opacity: 0.45,
  },

  bottomLine: {
    position: 'absolute',
    bottom: 5,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: COLORS.copper,
    opacity: 0.35,
  },

  // TITULO

  titleRow: {
    width: '78%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: COLORS.copperLight,
    fontFamily: 'serif',
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
    textShadowColor: '#140903',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
    paddingHorizontal: 5,
  },

  ornament: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  dot: {
    width: 3,
    height: 3,
    backgroundColor: COLORS.yellow,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 5,
  },

  // REMACHES

  rivet: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: COLORS.yellow,
    borderWidth: 1,
    borderColor: COLORS.copper,
    transform: [{ rotate: '45deg' }],
    zIndex: 3,
  },

  topLeft: {
    top: 6,
    left: 7,
  },

  topRight: {
    top: 6,
    right: 7,
  },

  bottomLeft: {
    bottom: 6,
    left: 7,
  },

  bottomRight: {
    bottom: 6,
    right: 7,
  },

  // ENGRANAJES

  leftGear: {
    position: 'absolute',
    left: 22,
    bottom: 7,
    opacity: 0.85,
  },

  rightGear: {
    position: 'absolute',
    right: 22,
    bottom: 7,
    opacity: 0.85,
  },

  // REFLEJO

  shimmerContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },

  shimmer: {
    position: 'absolute',
    top: -30,
    bottom: -30,
    width: 25,
    backgroundColor: COLORS.cream,
  },

  // ORNAMENTO INFERIOR

  bottomOrnament: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
  },

  ornamentLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },

  centerDiamond: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: COLORS.copper,
    backgroundColor: COLORS.panel,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 9,
  },

  centerDot: {
    width: 3,
    height: 3,
    backgroundColor: COLORS.teal,
  },
});
