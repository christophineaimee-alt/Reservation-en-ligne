import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccueilVisiteurEcran from '../screens/visiteur/AccueilVisiteurEcran';
import BoutiquesVisiteurEcran from '../screens/visiteur/BoutiquesVisiteurEcran';
import FicheBoutiqueVisiteurEcran from '../screens/visiteur/FicheBoutiqueVisiteurEcran';
import ContactEcran from '../screens/visiteur/ContactEcran';
import ConnexionRequiseEcran from '../screens/visiteur/ConnexionRequiseEcran';
import BoutiqueEcran from '../screens/client/BoutiqueEcran';
import ArticleEcran from '../screens/client/ArticleEcran';
import AvisBoutiqueEcran from '../screens/client/AvisBoutiqueEcran';
import ConnexionEcran from '../screens/auth/ConnexionEcran';
import InscriptionEcran from '../screens/auth/InscriptionEcran';
import { couleurs } from '../theme';

const Stack = createNativeStackNavigator();

const titreDe = (defaut) => ({ route }) => ({ title: (route.params && route.params.nom) || defaut });

export default function NavigationAuth() {
  return (
    <Stack.Navigator initialRouteName="Visiteur" screenOptions={{ headerTintColor: couleurs.primaire }}>
      <Stack.Screen name="Visiteur" component={AccueilVisiteurEcran} options={{ headerShown: false }} />
      <Stack.Screen name="Boutiques" component={BoutiquesVisiteurEcran} options={{ title: 'Boutiques' }} />
      <Stack.Screen name="FicheBoutique" component={FicheBoutiqueVisiteurEcran} options={titreDe('Boutique')} />
      <Stack.Screen name="Boutique" component={BoutiqueEcran} options={titreDe('Catalogue')} />
      <Stack.Screen name="Article" component={ArticleEcran} options={{ title: 'Détail' }} />
      <Stack.Screen name="AvisBoutique" component={AvisBoutiqueEcran} options={{ title: 'Avis des clients' }} />
      <Stack.Screen name="NouvelleReservation" component={ConnexionRequiseEcran} options={{ title: 'Réserver' }} />
      <Stack.Screen name="Contact" component={ContactEcran} options={{ title: 'Nous contacter' }} />
      <Stack.Screen name="Connexion" component={ConnexionEcran} options={{ headerShown: false }} />
      <Stack.Screen name="Inscription" component={InscriptionEcran} options={{ title: 'Créer un compte' }} />
    </Stack.Navigator>
  );
}