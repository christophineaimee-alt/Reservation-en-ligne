import { useThemeVersion } from '../theme/registre';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import BoutiquesAValiderEcran from '../screens/admin/BoutiquesAValiderEcran';
import BoutiqueAdminDetailEcran from '../screens/admin/BoutiqueAdminDetailEcran';
import UtilisateursEcran from '../screens/admin/UtilisateursEcran';
import UtilisateurDetailEcran from '../screens/admin/UtilisateurDetailEcran';
import CategoriesEcran from '../screens/admin/CategoriesEcran';
import CategorieFormEcran from '../screens/admin/CategorieFormEcran';
import NotificationsEcran from '../screens/commun/NotificationsEcran';
import NotificationDetailEcran from '../screens/commun/NotificationDetailEcran';
import ProfilEcran from '../screens/commun/ProfilEcran';
import { couleurs } from '../theme';
import { optionsOnglets, optionsPile } from '../theme/navigation';
import { useWindowDimensions } from 'react-native';
import BarreLaterale from '../components/BarreLaterale';
import MessagesAdminEcran from '../screens/admin/MessagesAdminEcran';
import AdministrateurFormEcran from '../screens/admin/AdministrateurFormEcran';
import ModifierProfilEcran from '../screens/commun/ModifierProfilEcran';



const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function icone(nom) {
  return ({ color, size }) => <Ionicons name={nom} size={size} color={color} />;
}
function Onglets() {
  useThemeVersion();
  const { width } = useWindowDimensions();
  const large = width >= 900;
  return (
    <Tab.Navigator
      tabBar={large ? (props) => <BarreLaterale {...props} support={['Profil']} /> : undefined}
      screenOptions={{ ...optionsOnglets, tabBarPosition: large ? 'left' : 'bottom' }}
    >
      <Tab.Screen name="Boutiques" component={BoutiquesAValiderEcran} options={{ title: 'Boutiques', tabBarIcon: icone('storefront-outline') }} />
      <Tab.Screen name="Utilisateurs" component={UtilisateursEcran} options={{ title: 'Utilisateurs', tabBarIcon: icone('people-outline') }} />
      <Tab.Screen name="Categories" component={CategoriesEcran} options={{ title: 'Catégories', tabBarIcon: icone('albums-outline') }} />
      <Tab.Screen name="Messages" component={MessagesAdminEcran} options={{ title: 'Messages', tabBarIcon: icone('mail-outline') }} />
      <Tab.Screen name="Notifications" component={NotificationsEcran} options={{ title: 'Notifications', tabBarIcon: icone('notifications-outline') }} />
      <Tab.Screen name="Profil" component={ProfilEcran} options={{ title: 'Profil', tabBarIcon: icone('person-outline') }} />
    </Tab.Navigator>
  );
}

export default function NavigationAdmin() {
  return (
        <Stack.Navigator screenOptions={optionsPile}>
      <Stack.Screen name="Onglets" component={Onglets} options={{ headerShown: false }} />
      <Stack.Screen name="NotificationDetail" component={NotificationDetailEcran} options={{ title: 'Notification' }} />
      <Stack.Screen name="BoutiqueAdminDetail" component={BoutiqueAdminDetailEcran} options={{ title: 'Boutique' }} />
      <Stack.Screen name="UtilisateurDetail" component={UtilisateurDetailEcran} options={{ title: 'Utilisateur' }} />
      <Stack.Screen name="AdministrateurForm" component={AdministrateurFormEcran} options={{ title: 'Nouvel administrateur' }} />
      <Stack.Screen
        name="CategorieForm"
        component={CategorieFormEcran}
        options={({ route }) => ({
          title: route.params && route.params.categorie ? route.params.categorie.nom : 'Nouvelle catégorie',
        })}
      />
      <Stack.Screen name="ModifierProfil" component={ModifierProfilEcran} options={{ title: 'Modifier mon profil' }} />
    </Stack.Navigator>
  );
}