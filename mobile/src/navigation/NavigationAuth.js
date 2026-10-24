import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConnexionEcran from '../screens/auth/ConnexionEcran';
import InscriptionEcran from '../screens/auth/InscriptionEcran';
import { couleurs } from '../theme';

const Stack = createNativeStackNavigator();

export default function NavigationAuth() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: couleurs.primaire }}>
      <Stack.Screen name="Connexion" component={ConnexionEcran} options={{ headerShown: false }} />
      <Stack.Screen name="Inscription" component={InscriptionEcran} options={{ title: 'Créer un compte' }} />
    </Stack.Navigator>
  );
}