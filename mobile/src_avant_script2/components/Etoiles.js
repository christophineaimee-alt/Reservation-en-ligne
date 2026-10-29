import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { couleurs } from '../theme';

export const COULEUR_ETOILE = '#F5A524';

// note : 0 à 5 (demi-étoiles) ; nombre : si 0, affiche « Pas encore d'avis »
export default function Etoiles({ note = 0, taille = 14, nombre, style }) {
  if (nombre === 0) {
    return <Text style={[styles.vide, style]}>Pas encore d'avis</Text>;
  }
  const valeur = Number(note) || 0;
  const icones = [1, 2, 3, 4, 5].map((i) => (valeur >= i ? 'star' : valeur >= i - 0.5 ? 'star-half' : 'star-outline'));
  return (
    <View style={[styles.ligne, style]}>
      {icones.map((nom, i) => (
        <Ionicons key={i} name={nom} size={taille} color={COULEUR_ETOILE} />
      ))}
      {nombre !== undefined ? (
        <Text style={[styles.texte, { fontSize: taille - 1 }]}>
          {String(valeur).replace('.', ',')} ({nombre})
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  texte: { color: couleurs.texteSecondaire, fontWeight: '600', marginLeft: 6 },
  vide: { fontSize: 12, color: couleurs.texteSecondaire },
});