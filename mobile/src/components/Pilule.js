import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { couleurs } from '../theme';

// variante : 'plein', 'contour' ou 'danger'
export default function Pilule({ titre, onPress, variante = 'contour', occupe = false, desactive = false }) {
  const inactif = occupe || desactive;
  const plein = variante === 'plein';
  const danger = variante === 'danger';
  const couleur = plein ? '#FFFFFF' : danger ? couleurs.erreur : couleurs.primaire;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactif}
      style={[
        styles.pilule,
        plein && styles.plein,
        variante === 'contour' && styles.contour,
        danger && styles.danger,
        inactif && styles.inactif,
      ]}
    >
      {occupe ? (
        <ActivityIndicator size="small" color={couleur} />
      ) : (
        <Text style={[styles.texte, { color: couleur }]}>{titre}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pilule: {
    minWidth: 84,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plein: { backgroundColor: couleurs.primaire },
  contour: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: couleurs.bordure },
  danger: { backgroundColor: couleurs.erreurFond, borderWidth: 1, borderColor: '#F0B4AC' },
  inactif: { opacity: 0.6 },
  texte: { fontSize: 13, fontWeight: '700' },
});