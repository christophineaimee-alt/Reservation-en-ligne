import React from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { initiale } from '../utils/format';
import { couleurs, degrade, espaces, ombre } from '../theme';
import BoutonTheme from './BoutonTheme';

export default function EnTetePage({
  titre,
  sousTitre,
  onNotifications,
  nonLues = 0,
  onAccueil,
  recherche = '',
  onChangeRecherche,
  placeholderRecherche = 'Rechercher…',
}) {
  const { utilisateur } = useAuth();
  const { width } = useWindowDimensions();
  const large = width >= 900;
  const nom = utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}`.trim() : '';

  const champ = onChangeRecherche ? (
    <View style={[styles.recherche, large && styles.rechercheLarge]}>
      <Ionicons name="search" size={16} color={couleurs.texteSecondaire} />
      <TextInput
        style={styles.champ}
        value={recherche}
        onChangeText={onChangeRecherche}
        placeholder={placeholderRecherche}
        placeholderTextColor={couleurs.texteSecondaire}
      />
      {recherche ? (
        <Pressable onPress={() => onChangeRecherche('')} hitSlop={8}>
          <Ionicons name="close-circle" size={16} color={couleurs.texteSecondaire} />
        </Pressable>
      ) : null}
    </View>
  ) : null;

  const boutons = (
    <View style={styles.boutons}>
      <BoutonTheme />
      {onAccueil ? (
        <Pressable onPress={onAccueil} style={styles.pastille}>
          <Ionicons name="home-outline" size={18} color={couleurs.primaire} />
        </Pressable>
      ) : null}
      {onNotifications ? (
        <Pressable onPress={onNotifications} style={styles.pastille}>
          <Ionicons name="notifications-outline" size={19} color={couleurs.primaire} />
          {nonLues > 0 ? <View style={styles.point} /> : null}
        </Pressable>
      ) : null}
      <View style={styles.utilisateur}>
        <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
          <Text style={styles.lettre}>{initiale(nom)}</Text>
        </LinearGradient>
        <Text style={styles.nom} numberOfLines={1}>{nom}</Text>
        <Ionicons name="chevron-down" size={14} color={couleurs.texteSecondaire} />
      </View>
    </View>
  );

  const textes = (
    <View style={{ flex: 1 }}>
      <Text style={styles.titre}>{titre}</Text>
      {sousTitre ? <Text style={styles.sousTitre}>{sousTitre}</Text> : null}
    </View>
  );

  if (large) {
    return (
      <View style={[styles.zone, styles.ligneLarge]}>
        {textes}
        {champ}
        {boutons}
      </View>
    );
  }
  return (
    <View style={styles.zone}>
      <View style={styles.hautMobile}>{boutons}</View>
      {textes}
      {champ ? <View style={{ marginTop: espaces.m }}>{champ}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  zone: { marginBottom: espaces.l },
  ligneLarge: { flexDirection: 'row', alignItems: 'center', gap: espaces.m },
  hautMobile: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: espaces.m },
  boutons: { flexDirection: 'row', alignItems: 'center', gap: espaces.s },
  titre: { fontSize: 28, fontWeight: '700', color: couleurs.texte },
  sousTitre: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: 4 },
  recherche: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    borderRadius: 22,
    backgroundColor: couleurs.carte,
    paddingHorizontal: 16,
    ...ombre,
  },
  rechercheLarge: { width: 300 },
  champ: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: couleurs.texte,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  pastille: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: couleurs.carte,
    alignItems: 'center',
    justifyContent: 'center',
    ...ombre,
  },
  point: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: couleurs.erreur,
    borderWidth: 1.5,
    borderColor: couleurs.carte,
  },
  utilisateur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 200,
    height: 42,
    paddingLeft: 5,
    paddingRight: 12,
    borderRadius: 21,
    backgroundColor: couleurs.carte,
    ...ombre,
  },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  lettre: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  nom: { flexShrink: 1, fontSize: 13, fontWeight: '600', color: couleurs.texte },
});