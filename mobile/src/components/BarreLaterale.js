import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { initiale } from '../utils/format';
import { couleurs, degrade, ombre } from '../theme';

const ROLES = { CLIENT: 'Client', COMMERCANT: 'Commerçant', ADMIN: 'Administrateur' };
const GRIS = '#7B8196';

// Barre latérale des grands écrans : remplace la barre d'onglets du bas
// support : noms des onglets à ranger dans la section SUPPORT
export default function BarreLaterale({ state, descriptors, navigation, support = [] }) {
  const { utilisateur, deconnexion } = useAuth();
  const [recherche, setRecherche] = useState('');
  const nom = utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}`.trim() : '';
  const role = utilisateur ? ROLES[utilisateur.role] || '' : '';

  const elements = state.routes.map((route, index) => {
    const { options } = descriptors[route.key];
    return {
      route,
      libelle: options.title || route.name,
      icone: options.tabBarIcon,
      actif: state.index === index,
      aide: support.includes(route.name),
    };
  });
  const filtre = recherche.trim().toLowerCase();
  const visibles = filtre ? elements.filter((e) => e.libelle.toLowerCase().includes(filtre)) : elements;
  const general = visibles.filter((e) => !e.aide);
  const aide = visibles.filter((e) => e.aide);

  function ouvrir(e) {
    const evenement = navigation.emit({ type: 'tabPress', target: e.route.key, canPreventDefault: true });
    if (!e.actif && !evenement.defaultPrevented) {
      navigation.navigate(e.route.name, e.route.params);
    }
  }

  function rendreLigne(e) {
    const couleur = e.actif ? '#FFFFFF' : GRIS;
    const contenu = (
      <>
        {e.icone ? e.icone({ color: couleur, size: 20, focused: e.actif }) : null}
        <Text style={[styles.libelle, { color: couleur }, e.actif && styles.libelleActif]} numberOfLines={1}>
          {e.libelle}
        </Text>
      </>
    );
    return (
      <Pressable key={e.route.key} onPress={() => ouvrir(e)} style={[styles.zoneLigne, e.actif && ombre]}>
        {e.actif ? (
          <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ligne}>
            {contenu}
          </LinearGradient>
        ) : (
          <View style={styles.ligne}>{contenu}</View>
        )}
      </Pressable>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.zone}>
      <View style={styles.panneau}>
        <View style={styles.logo}>
          <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoRond}>
            <Ionicons name="storefront" size={18} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.logoNom}>Marketplace</Text>
        </View>

        <View style={styles.utilisateur}>
          <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
            <Text style={styles.lettre}>{initiale(nom)}</Text>
          </LinearGradient>
          <View style={styles.identite}>
            <Text style={styles.nom} numberOfLines={1}>{nom}</Text>
            <Text style={styles.role} numberOfLines={1}>{role}</Text>
          </View>
          <Pressable onPress={() => deconnexion()} hitSlop={8} style={styles.sortie}>
            <Ionicons name="log-out-outline" size={18} color={GRIS} />
          </Pressable>
        </View>

        <View style={styles.recherche}>
          <Ionicons name="search" size={16} color={GRIS} />
          <TextInput
            value={recherche}
            onChangeText={setRecherche}
            placeholder="Rechercher"
            placeholderTextColor={GRIS}
            style={styles.champ}
          />
        </View>

        <Text style={styles.section}>GÉNÉRAL</Text>
        {general.map(rendreLigne)}
        {visibles.length === 0 ? <Text style={styles.vide}>Aucun résultat</Text> : null}

        <View style={styles.espace} />

        {aide.length > 0 ? (
          <>
            <Text style={styles.section}>SUPPORT</Text>
            {aide.map(rendreLigne)}
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  zone: { width: 288, backgroundColor: couleurs.fond, padding: 16 },
  panneau: {
    flex: 1,
    backgroundColor: couleurs.carte,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 22,
    ...ombre,
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 26 },
  logoRond: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  logoNom: { fontSize: 20, fontWeight: '800', color: couleurs.texte },
  utilisateur: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 22 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  lettre: { color: '#FFFFFF', fontWeight: '700', fontSize: 17 },
  identite: { flex: 1 },
  nom: { fontSize: 15, fontWeight: '600', color: couleurs.texte },
  role: { fontSize: 11, color: GRIS, marginTop: 2 },
  sortie: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#F1F2FA', alignItems: 'center', justifyContent: 'center' },
  recherche: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F2FA',
    paddingHorizontal: 14,
    marginBottom: 26,
  },
  champ: {
    flex: 1,
    fontSize: 13,
    color: couleurs.texte,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  section: { fontSize: 10, letterSpacing: 0.6, color: GRIS, marginBottom: 10, marginLeft: 4 },
  zoneLigne: { borderRadius: 16, marginBottom: 6 },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 14, height: 48, borderRadius: 16, paddingHorizontal: 16 },
  libelle: { flex: 1, fontSize: 14, fontWeight: '500' },
  libelleActif: { fontWeight: '700' },
  vide: { fontSize: 13, color: GRIS, marginLeft: 4 },
  espace: { flex: 1, minHeight: 24 },
});