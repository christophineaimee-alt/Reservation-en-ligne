import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { initiale } from '../utils/format';
import { couleurs, degrade, espaces, ombre } from '../theme';

export default function EnTetePage({ titre, sousTitre, onNotifications, nonLues = 0, onAccueil }) {
  const { utilisateur } = useAuth();
  const nom = utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}`.trim() : '';
  return (
    <View style={styles.zone}>
      <View style={styles.haut}>
        {onAccueil ? (
          <Pressable onPress={onAccueil} style={styles.pastille}>
            <Ionicons name="home" size={18} color={couleurs.primaire} />
          </Pressable>
        ) : null}
        {onNotifications ? (
          <Pressable onPress={onNotifications} style={styles.pastille}>
            <Ionicons name="notifications" size={18} color={couleurs.primaire} />
            {nonLues > 0 ? <View style={styles.point} /> : null}
          </Pressable>
        ) : null}
        <View style={styles.utilisateur}>
          <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
            <Text style={styles.lettre}>{initiale(nom)}</Text>
          </LinearGradient>
          <Text style={styles.nom} numberOfLines={1}>{nom}</Text>
          <Ionicons name="caret-down" size={12} color={couleurs.texte} />
        </View>
      </View>
      <Text style={styles.titre}>{titre}</Text>
      {sousTitre ? <Text style={styles.sousTitre}>{sousTitre}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  zone: { marginBottom: espaces.m },
  haut: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: espaces.s, marginBottom: espaces.m },
  pastille: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: couleurs.carte,
    alignItems: 'center',
    justifyContent: 'center',
    ...ombre,
  },
  point: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: couleurs.erreur,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  utilisateur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 190,
    height: 40,
    paddingLeft: 4,
    paddingRight: 12,
    borderRadius: 20,
    backgroundColor: couleurs.carte,
    ...ombre,
  },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  lettre: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  nom: { flexShrink: 1, fontSize: 13, fontWeight: '600', color: couleurs.texte },
  titre: { fontSize: 30, fontWeight: '500', color: couleurs.texte },
  sousTitre: { fontSize: 14, color: couleurs.texte, marginTop: 4 },
});