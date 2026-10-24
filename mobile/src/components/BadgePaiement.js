import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { couleurs } from '../theme';

export default function BadgePaiement({ reservation }) {
  let texte = null;
  let fond = null;
  let couleur = null;
  if (reservation.paye) {
    texte = 'Payé';
    fond = couleurs.succesFond;
    couleur = couleurs.succes;
  } else if (reservation.paiement && reservation.paiement.statut === 'EN_ATTENTE') {
    texte = 'Paiement en cours';
    fond = couleurs.primaireClair;
    couleur = couleurs.primaire;
  } else if (reservation.statut === 'ACCEPTEE') {
    texte = 'À payer';
    fond = '#FFF4DB';
    couleur = couleurs.attention;
  }
  if (!texte) return null;
  return (
    <View style={[styles.badge, { backgroundColor: fond }]}>
      <Text style={[styles.texte, { color: couleur }]}>{texte}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-end' },
  texte: { fontSize: 12, fontWeight: '700' },
});