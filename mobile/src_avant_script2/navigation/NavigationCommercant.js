import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BoutiqueProvider, useBoutique } from '../context/BoutiqueContext';
import Ecran from '../components/Ecran';
import Bandeau from '../components/Bandeau';
import Bouton from '../components/Bouton';
import Chargement from '../components/Chargement';
import CreerBoutiqueEcran from '../screens/commercant/CreerBoutiqueEcran';
import TableauBordEcran from '../screens/commercant/TableauBordEcran';
import ReservationsEcran from '../screens/commercant/ReservationsEcran';
import ReservationCommercantDetailEcran from '../screens/commercant/ReservationCommercantDetailEcran';
import CatalogueEcran from '../screens/commercant/CatalogueEcran';
import ArticleFormEcran from '../screens/commercant/ArticleFormEcran';
import HorairesEcran from '../screens/commercant/HorairesEcran';
import DisponibilitesEcran from '../screens/commercant/DisponibilitesEcran';
import ClientsEcran from '../screens/commercant/ClientsEcran';
import ClientDetailEcran from '../screens/commercant/ClientDetailEcran';
import MenuCommercantEcran from '../screens/commercant/MenuCommercantEcran';
import NotificationsEcran from '../screens/commun/NotificationsEcran';
import ProfilEcran from '../screens/commun/ProfilEcran';
import { couleurs } from '../theme';
import { optionsOnglets, optionsPile } from '../theme/navigation';
import { useWindowDimensions } from 'react-native';
import BarreLaterale from '../components/BarreLaterale';
import AvisCommercantEcran from '../screens/commercant/AvisCommercantEcran';
import PromotionsEcran from '../screens/commercant/PromotionsEcran';
import PromotionFormEcran from '../screens/commercant/PromotionFormEcran';
import ModifierProfilEcran from '../screens/commun/ModifierProfilEcran';

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
      tabBar={large ? (props) => <BarreLaterale {...props} support={['Plus']} /> : undefined}
      screenOptions={{ ...optionsOnglets, tabBarPosition: large ? 'left' : 'bottom' }}
    >
      <Tab.Screen name="Tableau" component={TableauBordEcran} options={{ title: 'Accueil', tabBarIcon: icone('speedometer-outline') }} />
      <Tab.Screen name="Reservations" component={ReservationsEcran} options={{ title: 'Réservations', tabBarIcon: icone('calendar-outline') }} />
      <Tab.Screen name="Catalogue" component={CatalogueEcran} options={{ title: 'Catalogue', tabBarIcon: icone('pricetags-outline') }} />
      <Tab.Screen name="Notifications" component={NotificationsEcran} options={{ title: 'Notifications', tabBarIcon: icone('notifications-outline') }} />
      <Tab.Screen
        name="Avis"
        component={AvisCommercantEcran}
        options={{ title: 'Avis', tabBarIcon: icone('star-outline') }}
      />
      <Tab.Screen
        name="Promotions"
        component={PromotionsEcran}
        options={{
          title: 'Promotions',
          tabBarIcon: icone('pricetag-outline'),
          // Dans la barre latérale (grand écran) ; sur téléphone, accessible via « Plus »
          tabBarButton: large ? undefined : () => null,
        }}
      />
      <Tab.Screen name="Plus" component={MenuCommercantEcran} options={{ title: 'Plus', tabBarIcon: icone('menu-outline') }} />
    </Tab.Navigator>
  );
}

function Pile() {
  return (
        <Stack.Navigator screenOptions={optionsPile}>
      <Stack.Screen name="Onglets" component={Onglets} options={{ headerShown: false }} />
      <Stack.Screen name="ReservationCommercantDetail" component={ReservationCommercantDetailEcran} options={{ title: 'Demande de réservation' }} />
      <Stack.Screen
        name="ArticleForm"
        component={ArticleFormEcran}
        options={({ route }) => ({
          title: route.params && route.params.article ? route.params.article.nom : 'Nouvel élément',
        })}
      />
      <Stack.Screen name="Horaires" component={HorairesEcran} options={{ title: "Horaires d'ouverture" }} />
      <Stack.Screen name="Disponibilites" component={DisponibilitesEcran} options={{ title: 'Créneaux de réservation' }} />
      <Stack.Screen name="Clients" component={ClientsEcran} options={{ title: 'Mes clients' }} />
      <Stack.Screen name="PromotionForm" component={PromotionFormEcran} options={{ title: 'Promotion' }} />
      <Stack.Screen name="ClientDetail" component={ClientDetailEcran} options={{ title: 'Fiche client' }} />
      <Stack.Screen name="MaBoutique" component={CreerBoutiqueEcran} options={{ title: 'Ma boutique' }} />
      <Stack.Screen name="Profil" component={ProfilEcran} options={{ title: 'Mon profil' }} />
      <Stack.Screen name="ModifierProfil" component={ModifierProfilEcran} options={{ title: 'Modifier mon profil' }} />
    </Stack.Navigator>
  );
}

// Sans boutique : formulaire de création. Avec boutique : l'application complète.
function Contenu() {
  const { boutique, chargement, erreur, recharger } = useBoutique();

  if (chargement) return <Chargement message="Chargement de votre boutique..." />;

  if (!boutique && erreur) {
    return (
      <Ecran>
        <Bandeau type="erreur" message={erreur} />
        <Bouton titre="Réessayer" onPress={recharger} />
      </Ecran>
    );
  }

  if (!boutique) return <CreerBoutiqueEcran />;

  return <Pile />;
}

export default function NavigationCommercant() {
  return (
    <BoutiqueProvider>
      <Contenu />
    </BoutiqueProvider>
  );
}