import { enregistrerStyles } from '../theme/registre';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { initiale } from '../utils/format';
import { couleurs } from '../theme';
import BoutonTheme from './BoutonTheme';

const ROLES = { CLIENT: 'Client', COMMERCANT: 'Commerçant', ADMIN: 'Administrateur' };
const BLANC_DOUX = 'rgba(255,255,255,0.80)';

// Barre latérale des grands écrans : remplace la barre d'onglets du bas
// support : noms des onglets à ranger en bas du menu (au-dessus de l'utilisateur)
export default function BarreLaterale({ state, descriptors, navigation, support = [] }) {
  const { utilisateur, deconnexion } = useAuth();
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
  const general = elements.filter((e) => !e.aide);
  const aide = elements.filter((e) => e.aide);

  function ouvrir(e) {
    const evenement = navigation.emit({ type: 'tabPress', target: e.route.key, canPreventDefault: true });
    if (!e.actif && !evenement.defaultPrevented) {
      navigation.navigate(e.route.name, e.route.params);
    }
  }

  function rendreLigne(e) {
    const couleur = e.actif ? couleurs.menuPastilleTexte : BLANC_DOUX;
    return (
      <Pressable key={e.route.key} onPress={() => ouvrir(e)} style={[styles.ligne, e.actif && styles.ligneActive]}>
        {e.icone ? e.icone({ color: couleur, size: 20, focused: e.actif }) : null}
        <Text style={[styles.libelle, { color: couleur }, e.actif && styles.libelleActif]} numberOfLines={1}>
          {e.libelle}
        </Text>
      </Pressable>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.zone}>
      <View style={styles.logo}>
        <View style={styles.logoRond}>
          <Ionicons name="storefront" size={18} color={couleurs.primaire} />
        </View>
        <Text style={styles.logoNom}>marketplace</Text>
      </View>

      <View style={styles.menu}>{general.map(rendreLigne)}</View>

      <View style={styles.espace} />

      {aide.length > 0 ? <View style={styles.menu}>{aide.map(rendreLigne)}</View> : null}

      <View style={styles.utilisateur}>
        <View style={styles.avatar}>
          <Text style={styles.lettre}>{initiale(nom)}</Text>
        </View>
        <View style={styles.identite}>
          <Text style={styles.nom} numberOfLines={1}>{nom}</Text>
          <Text style={styles.role} numberOfLines={1}>{role}</Text>
        </View>
        <BoutonTheme surFond petit />
        <Pressable onPress={() => deconnexion()} hitSlop={8} style={styles.sortie}>
          <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const creerStyles = () => StyleSheet.create({
  zone: { width: 260, backgroundColor: couleurs.menuFond, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 6, paddingVertical: 10, marginBottom: 26 },
  logoRond: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  logoNom: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },
  menu: { gap: 6 },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 14, height: 48, borderRadius: 14, paddingHorizontal: 16 },
  ligneActive: {
    backgroundColor: couleurs.menuPastille,
    shadowColor: '#2A2370',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  libelle: { flex: 1, fontSize: 14, fontWeight: '500' },
  libelleActif: { fontWeight: '700' },
  espace: { flex: 1, minHeight: 24 },
  utilisateur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  lettre: { color: couleurs.primaire, fontWeight: '800', fontSize: 16 },
  identite: { flex: 1 },
  nom: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  role: { fontSize: 11, color: 'rgba(255,255,255,0.72)', marginTop: 2 },
  sortie: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});