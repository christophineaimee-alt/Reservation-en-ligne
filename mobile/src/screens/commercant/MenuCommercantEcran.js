import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useBoutique } from '../../context/BoutiqueContext';
import EnTetePage from '../../components/EnTetePage';
import { couleurs, espaces, rayon, ombre } from '../../theme';

const ENTREES = [
  { titre: "Horaires d'ouverture", description: "Jours et heures d'ouverture", icone: 'time-outline', route: 'Horaires' },
  { titre: 'Créneaux de réservation', description: 'Générer, ajouter, bloquer', icone: 'calendar-outline', route: 'Disponibilites' },
  { titre: 'Promotions', description: 'Offres spéciales et remises', icone: 'pricetag-outline', route: 'Promotions' },
  { titre: 'Mes clients', description: 'Historique des clients de la boutique', icone: 'people-outline', route: 'Clients' },
  { titre: 'Ma boutique', description: 'Informations et statut de validation', icone: 'storefront-outline', route: 'MaBoutique' },
  { titre: 'Mon profil', description: 'Compte et déconnexion', icone: 'person-outline', route: 'Profil' },
];

// Onglet « Plus » : horaires, créneaux, promotions, clients, boutique et profil
export default function MenuCommercantEcran({ navigation }) {
  const { boutique } = useBoutique();
  return (
    <SafeAreaView style={styles.zone}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <EnTetePage
          titre="Plus"
          sousTitre={boutique ? boutique.nom : 'Réglages de votre boutique'}
          onNotifications={() => navigation.navigate('Notifications')}
        />
        {ENTREES.map((e) => (
          <Pressable
            key={e.route}
            onPress={() => navigation.navigate(e.route)}
            style={({ pressed }) => [styles.ligne, pressed && { opacity: 0.9 }]}
          >
            <View style={styles.pastille}>
              <Ionicons name={e.icone} size={22} color={couleurs.primaire} />
            </View>
            <View style={styles.textes}>
              <Text style={styles.titre}>{e.titre}</Text>
              <Text style={styles.description}>{e.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={couleurs.texteSecondaire} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', maxWidth: 600, alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaces.s + 4,
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    padding: espaces.m,
    marginBottom: espaces.s + 2,
    ...ombre,
  },
  pastille: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: couleurs.primaireClair,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textes: { flex: 1 },
  titre: { fontSize: 15, fontWeight: '700', color: couleurs.texte },
  description: { fontSize: 12, color: couleurs.texteSecondaire, marginTop: 2 },
});