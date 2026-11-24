
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppAudio } from '../../context/AudioContext';

interface FooterProps {
  currentRoute?: string;
  onNavigate: (route: string) => void;
}

const COLORS = {
  background: '#11131A',
  panel: '#191B24',
  panelLight: '#22232C',
  panelDark: '#14151C',
  cream: '#F4E8CF',
  muted: '#A9A5A0',
  copper: '#E38A42',
  copperLight: '#F2A65E',
  copperDark: '#76513B',
  teal: '#24D7D1',
  border: '#39343A',
};

const NAVIGATION = [
  {
    route: '/',
    label: 'Inicio',
    icon: 'home-outline' as const,
    activeIcon: 'home' as const,
  },
  {
    route: '/history',
    label: 'Historia',
    icon: 'book-outline' as const,
    activeIcon: 'book' as const,
  },
  {
    route: '/characters',
    label: 'Personajes',
    icon: 'people-outline' as const,
    activeIcon: 'people' as const,
  },
  {
    route: 'Logout',
    label: 'Salir',
    icon: 'log-out-outline' as const,
    activeIcon: 'log-out' as const,
  },
];

export default function CustomFooter({
  currentRoute,
  onNavigate,
}: FooterProps) {
  const { playButtonSound } = useAppAudio();
  const { width } = useWindowDimensions();

  const compact = width < 360;
  const mobile = width < 600;
  const tablet = width >= 600 && width < 1024;
  const desktop = width >= 1024;

  const nativeDriver = Platform.OS !== 'web';

  const iconSize = compact ? 19 : desktop ? 24 : 22;
  const labelSize = compact ? 9 : desktop ? 11 : 10;

  const activeAnimations = useRef(
    NAVIGATION.map(() => new Animated.Value(0))
  ).current;

  const entrance = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const entranceAnimation = Animated.timing(entrance, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: nativeDriver,
    });

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: nativeDriver,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 1800,
          useNativeDriver: nativeDriver,
        }),
      ])
    );

    entranceAnimation.start();
    pulseAnimation.start();

    return () => {
      entranceAnimation.stop();
      pulseAnimation.stop();
    };
  }, [entrance, pulse, nativeDriver]);

  useEffect(() => {
    activeAnimations.forEach((animation, index) => {
      Animated.timing(animation, {
        toValue: currentRoute === NAVIGATION[index].route ? 1 : 0,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: nativeDriver,
      }).start();
    });
  }, [currentRoute, nativeDriver, activeAnimations]);

  const handlePress = (route: string) => {
    playButtonSound();
    onNavigate(route);
  };

  const translateY = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  return (
    <Animated.View
      style={[
        styles.footerContainer,
        {
          opacity: entrance,
          transform: [{ translateY }],
        },
      ]}
    >
      {/* BORDE SUPERIOR */}

      <View style={styles.topBorder}>
        <View style={styles.borderLine} />

        <View style={styles.centerEmblem}>
          <View style={styles.emblemDiamond}>
            <View style={styles.emblemCore} />
          </View>
        </View>

        <View style={styles.borderLine} />
      </View>

      {/* NAVEGACIÓN */}

      <View
        style={[
          styles.navBar,
          {
            paddingHorizontal: compact ? 3 : tablet || desktop ? 30 : 8,
            maxWidth: desktop ? 1000 : undefined,
          },
        ]}
      >
        {NAVIGATION.map((item, index) => {
          const active = currentRoute === item.route;
          const animation = activeAnimations[index];

          const activeScale = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.92, 1],
          });

          const activeOpacity = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });

          const activeIconColor = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [COLORS.muted, COLORS.copperLight],
          });

          return (
            <React.Fragment key={item.route}>
              <TouchableOpacity
                style={[
                  styles.navItem,
                  mobile && styles.navItemMobile,
                  tablet && styles.navItemTablet,
                  desktop && styles.navItemDesktop,
                ]}
                onPress={() => handlePress(item.route)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: active }}
              >
                {/* PLACA DEL ICONO */}

                <View
                  style={[
                    styles.iconPlate,
                    compact && styles.iconPlateCompact,
                  ]}
                >
                  <Animated.View
                    style={{
                      transform: [{ scale: activeScale }],
                    }}
                  >
                    <Ionicons
                      name={active ? item.activeIcon : item.icon}
                      size={iconSize}
                      color={active ? COLORS.copperLight : COLORS.muted}
                    />
                  </Animated.View>

                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.iconActiveOverlay,
                      { opacity: activeOpacity },
                    ]}
                  />
                </View>

                {/* ETIQUETA */}

                <Text
                  style={[
                    styles.navText,
                    {
                      fontSize: labelSize,
                    },
                    active && styles.navTextActive,
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {item.label}
                </Text>

                {/* INDICADOR ACTIVO */}

                <Animated.View
                  style={[
                    styles.activeIndicator,
                    {
                      opacity: activeOpacity,
                      transform: [{ scaleX: activeScale }],
                    },
                  ]}
                >
                  <View style={styles.activeLine} />
                  <View style={styles.activeDiamond} />
                  <View style={styles.activeLine} />
                </Animated.View>
              </TouchableOpacity>

              {/* SEPARADOR */}

              {index < NAVIGATION.length - 1 && (
                <View style={styles.separator}>
                  <View style={styles.separatorLine} />
                  <View style={styles.separatorDot} />
                  <View style={styles.separatorLine} />
                </View>
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* BORDE INFERIOR */}

      <View style={styles.bottomDecoration}>
        <View style={styles.bottomLine} />

        <View style={styles.bottomMark}>
          <Animated.View
            style={[
              styles.bottomStatus,
              { opacity: pulse },
            ]}
          />
        </View>

        <View style={styles.bottomLine} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // CONTENEDOR

  footerContainer: {
    width: '100%',
    flexShrink: 0,
    backgroundColor: COLORS.panelDark,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.copperDark,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },

  // BORDE SUPERIOR

  topBorder: {
    width: '100%',
    height: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  borderLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.copperDark,
  },

  centerEmblem: {
    width: 20,
    height: 20,
    marginHorizontal: 12,
    marginTop: -5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emblemDiamond: {
    width: 13,
    height: 13,
    backgroundColor: COLORS.panel,
    borderWidth: 1.5,
    borderColor: COLORS.copper,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },

  emblemCore: {
    width: 4,
    height: 4,
    backgroundColor: COLORS.teal,
  },

  // BARRA DE NAVEGACIÓN

  navBar: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 3,
    paddingBottom: 5,
  },

  navItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 57,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    borderRadius: 4,
  },

  navItemMobile: {
    minHeight: 58,
  },

  navItemTablet: {
    minHeight: 66,
    maxWidth: 170,
  },

  navItemDesktop: {
    minHeight: 70,
    maxWidth: 190,
  },

  // PLACA DE ICONOS

  iconPlate: {
    width: 36,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },

  iconPlateCompact: {
    width: 32,
    height: 31,
  },

  iconActiveOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(227,138,66,0.10)',
    borderWidth: 1,
    borderColor: COLORS.copper,
  },

  // TEXTOS

  navText: {
    color: COLORS.muted,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.2,
    textAlign: 'center',
    includeFontPadding: false,
  },

  navTextActive: {
    color: COLORS.copperLight,
    fontWeight: '900',
  },

  // INDICADOR ACTIVO

  activeIndicator: {
    width: '55%',
    height: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },

  activeLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.copperDark,
  },

  activeDiamond: {
    width: 5,
    height: 5,
    backgroundColor: COLORS.teal,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: 4,
  },

  // SEPARADORES

  separator: {
    width: 7,
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },

  separatorLine: {
    width: 1,
    flex: 1,
    backgroundColor: COLORS.border,
  },

  separatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.copperDark,
  },

  // BORDE INFERIOR

  bottomDecoration: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 17,
    paddingBottom: 6,
  },

  bottomLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },

  bottomMark: {
    width: 14,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },

  bottomStatus: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.teal,
  },
});
