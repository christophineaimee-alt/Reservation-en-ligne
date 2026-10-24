import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { couleurs, espaces, ombre } from '../theme';

export default function Puce({ titre, actif, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.puce, actif && styles.actif]}>
      <Text style={[styles.texte, actif && styles.texteActif]}>{titre}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  puce: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: couleurs.carte,
    marginRight: espaces.s,
  },
  actif: { backgroundColor: couleurs.primaire, ...ombre },
  texte: { fontSize: 14, color: couleurs.texteSecondaire, fontWeight: '600' },
  texteActif: { color: '#FFFFFF' },
});