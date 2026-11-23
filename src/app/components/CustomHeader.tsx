// src/app/components/CustomHeader.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CustomHeader() {
  const router = useRouter();

  return (
    <View style={styles.headerContainer} pointerEvents="box-none">
      <TouchableOpacity 
        style={styles.gearButton} 
        onPress={() => router.push('/components/Menu' as any)} 
        activeOpacity={0.8}
      >
        <Ionicons name="menu-outline" size={24} color="#F3E5AB" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 110, 
    right: 320,
    zIndex: 999,
    elevation: 10,
  },
  gearButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2A1810', 
    borderWidth: 1.5,
    borderColor: '#D4AF37',     
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
});