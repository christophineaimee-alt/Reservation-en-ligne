import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import RacineNavigation from './src/navigation/RacineNavigation';
import EcranSecurise from './src/components/EcranSecurise';
import { couleurs, modeSombre } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <View style={{ flex: 1, backgroundColor: couleurs.fond }}>
          <StatusBar style={modeSombre ? 'light' : 'dark'} />
          <EcranSecurise>
            <RacineNavigation />
          </EcranSecurise>
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}