// screens/HomeScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomFooter from '../components/CustomFooter';
import CustomHeader from '../components/CustomHeader';

export default function HomeScreen({ navigation }: any) {
  
  const handleNavigation = (route: string) => {
    switch (route) {
      case '/':
        break;
      case '/History':
        break;
      case 'Characters':
        break;
      case 'Logout':
        break;
    }
  };

  return (
    <View style={styles.container}>
      {/* Contenido de tu pantalla principal */}
      
      {/* Footer reutilizable */}
      <CustomFooter onNavigate={handleNavigation} />
      <CustomHeader />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E120B',
  },
});