import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { couleurs, espaces, rayon } from '../theme';

// Message d'information : type = 'erreur' ou 'succes'
export default function Bandeau({ type = 'erreur', message }) {
  if (!message) return null;
  const succes = type === 'succes';
  return (
    <View style={[styles.bandeau, succes ? styles.succes : styles.erreur]}>
      <Text style={{ color: succes ? couleurs.succes : couleurs.erreur, fontSize: 14 }}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bandeau: { padding: 12, borderRadius: rayon, marginBottom: espaces.m },
  erreur: { backgroundColor: couleurs.erreurFond },
  succes: { backgroundColor: couleurs.succesFond },
});