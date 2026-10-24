import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AccueilClientEcran from '../screens/client/AccueilClientEcran';
import BoutiqueEcran from '../screens/client/BoutiqueEcran';
import ArticleEcran from '../screens/client/ArticleEcran';
import NouvelleReservationEcran from '../screens/client/NouvelleReservationEcran';
import MesReservationsEcran from '../screens/client/MesReservationsEcran';
import ReservationDetailEcran from '../screens/client/ReservationDetailEcran';
import NotificationsEcran from '../screens/commun/NotificationsEcran';
import ProfilEcran from '../screens/commun/ProfilEcran';
import { couleurs } from '../theme';
import { optionsOnglets, optionsPile } from '../theme/navigation';
import { useWindowDimensions } from 'react-native';
import BarreLaterale from '../components/BarreLaterale';
import PaiementEcran from '../screens/client/PaiementEcran';
import PaiementsEcran from '../screens/client/PaiementsEcran';
import RecuEcran from '../screens/client/RecuEcran';
import AvisBoutiqueEcran from '../screens/client/AvisBoutiqueEcran';
import DonnerAvisEcran from '../screens/client/DonnerAvisEcran';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function icone(nom) {
  return ({ color, size }) => <Ionicons name={nom} size={size} color={color} />;
}

function Onglets() {
  const { width } = useWindowDimensions();
  const large = width >= 900;
  return (
    <Tab.Navigator
      tabBar={large ? (props) => <BarreLaterale {...props} support={['Profil']} /> : undefined}
      screenOptions={{ ...optionsOnglets, tabBarPosition: large ? 'left' : 'bottom' }}
    >
    
      <Tab.Screen
        name="Accueil"
        component={AccueilClientEcran}
        options={{ title: 'Boutiques', tabBarIcon: icone('storefront-outline') }}
      />
      <Tab.Screen
        name="Reservations"
        component={MesReservationsEcran}
        options={{ title: 'Réservations', tabBarIcon: icone('calendar-outline') }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsEcran}
        options={{ title: 'Notifications', tabBarIcon: icone('notifications-outline') }}
      />
      <Tab.Screen
        name="Paiements"
        component={PaiementsEcran}
        options={{ title: 'Paiement', tabBarIcon: icone('card-outline') }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfilEcran}
        options={{ title: 'Profil', tabBarIcon: icone('person-outline') }}
      />
    </Tab.Navigator>
  );
}

export default function NavigationClient() {
  return (
        <Stack.Navigator screenOptions={optionsPile}>
      <Stack.Screen name="Onglets" component={Onglets} options={{ headerShown: false }} />
      <Stack.Screen
        name="Boutique"
        component={BoutiqueEcran}
        options={({ route }) => ({ title: route.params.nom || 'Boutique' })}
      />
      <Stack.Screen
        name="Article"
        component={ArticleEcran}
        options={({ route }) => ({ title: route.params.nom || 'Détail' })}
      />
      <Stack.Screen name="NouvelleReservation" component={NouvelleReservationEcran} options={{ title: 'Réserver' }} />
      <Stack.Screen name="ReservationDetail" component={ReservationDetailEcran} options={{ title: 'Réservation' }} />
      <Stack.Screen name="Paiement" component={PaiementEcran} options={{ title: 'Paiement' }} />
      <Stack.Screen name="Recu" component={RecuEcran} options={{ title: 'Reçu de paiement' }} />
      <Stack.Screen name="AvisBoutique" component={AvisBoutiqueEcran} options={{ title: 'Avis des clients' }} />
      <Stack.Screen name="DonnerAvis" component={DonnerAvisEcran} options={{ title: 'Votre avis' }} />
    </Stack.Navigator>
  );
}