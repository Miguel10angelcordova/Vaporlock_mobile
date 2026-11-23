// src/app/components/CustomFooter.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppAudio } from '../../context/AudioContext';

interface FooterProps {
  currentRoute?: string;
  onNavigate: (route: string) => void;
}

export default function CustomFooter({
  currentRoute,
  onNavigate,
}: FooterProps) {
  const { playButtonSound } = useAppAudio();

  const handlePress = (route: string) => {
    playButtonSound();
    onNavigate(route);
  };

  return (
    <View style={styles.footerContainer}>
      <View style={styles.decorContainer}>
        <View style={styles.diamond} />
      </View>

      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handlePress('/')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentRoute === '/' ? 'home' : 'home-outline'}
            size={26}
            color="#F3E5AB"
          />
          <Text style={styles.navText}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handlePress('/history')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentRoute === '/history' ? 'book' : 'book-outline'}
            size={26}
            color="#F3E5AB"
          />
          <Text style={styles.navText}>Historia</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handlePress('/characters')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentRoute === '/characters' ? 'person' : 'person-outline'}
            size={26}
            color="#F3E5AB"
          />
          <Text style={styles.navText}>Personajes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, styles.lastNavItem]}
          onPress={() => handlePress('Logout')}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={26} color="#F3E5AB" />
          <Text style={styles.navText}>Salir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    width: '100%',
    backgroundColor: '#2A1810',
    borderTopWidth: 2,
    borderColor: '#D4AF37',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 15,
    flexShrink: 0,
  },

  decorContainer: {
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 4,
  },

  diamond: {
    width: 14,
    height: 14,
    backgroundColor: '#3E2214',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    transform: [{ rotate: '45deg' }],
  },

  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: 'rgba(212, 175, 55, 0.2)',
  },

  lastNavItem: {
    borderRightWidth: 0,
  },

  navText: {
    color: '#F3E5AB',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});