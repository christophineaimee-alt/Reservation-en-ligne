import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { couleurs, degrade, ombre } from '../theme';

// variante : 'plein' (par défaut), 'contour', 'danger' ou 'texte'
export default function Bouton({ titre, onPress, chargement = false, desactive = false, variante = 'plein', style }) {
  const inactif = desactive || chargement;
  const plein = variante === 'plein';
  const danger = variante === 'danger';
  const couleurTexte = plein ? '#FFFFFF' : danger ? couleurs.erreur : couleurs.primaire;
  const contenu = chargement ? (
    <ActivityIndicator color={couleurTexte} />
  ) : (
    <Text style={[styles.titre, { color: couleurTexte }]}>{titre}</Text>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={inactif}
      style={({ pressed }) => [
        styles.zone,
        plein && ombre,
        inactif && styles.inactif,
        pressed && !inactif && styles.appuye,
        style,
      ]}
    >
      {plein ? (
        <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bouton}>
          {contenu}
        </LinearGradient>
      ) : (
        <View style={[styles.bouton, variante === 'contour' && styles.contour, danger && styles.danger]}>
          {contenu}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  zone: { borderRadius: 26 },
  bouton: {
    minHeight: 52,
    borderRadius: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contour: { backgroundColor: couleurs.carte, borderWidth: 1, borderColor: couleurs.bordure },
  danger: { backgroundColor: couleurs.erreurFond, borderWidth: 1, borderColor: '#F0B4AC' },
  inactif: { opacity: 0.5 },
  appuye: { opacity: 0.88 },
  titre: { fontSize: 16, fontWeight: '700' },
});