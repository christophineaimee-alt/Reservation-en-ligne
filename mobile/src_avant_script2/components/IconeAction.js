import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { couleurs } from '../theme';

// Petit bouton rond d'un tableau : voir, modifier, supprimer…
export default function IconeAction({ icone, onPress, couleur = couleurs.primaire, fond = couleurs.primaireClair }) {
  return (
    <Pressable onPress={onPress} hitSlop={6} style={({ pressed }) => [styles.bouton, { backgroundColor: fond }, pressed && { opacity: 0.8 }]}>
      <Ionicons name={icone} size={16} color={couleur} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bouton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});