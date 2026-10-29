import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import NavigationAuth from './NavigationAuth';
import NavigationClient from './NavigationClient';
import NavigationCommercant from './NavigationCommercant';
import NavigationAdmin from './NavigationAdmin';
import { couleurs } from '../theme';
import { themeNavigation } from '../theme/navigation';
import { useThemeVersion } from '../theme/registre';

// Choisit ce qu'on affiche : chargement, connexion, ou l'application selon le rôle
export default function RacineNavigation() {
  useThemeVersion();
  const { utilisateur, chargement } = useAuth();

  if (chargement) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: couleurs.fond }}>
        <ActivityIndicator size="large" color={couleurs.primaire} />
      </View>
    );
  }

  let ecran = <NavigationAuth />;
  if (utilisateur) {
    if (utilisateur.role === 'CLIENT') ecran = <NavigationClient />;
    else if (utilisateur.role === 'COMMERCANT') ecran = <NavigationCommercant />;
    else ecran = <NavigationAdmin />;
  }
  return <NavigationContainer theme={themeNavigation()}>{ecran}</NavigationContainer>;
}