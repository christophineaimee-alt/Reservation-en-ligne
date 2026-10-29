import { enregistrerStyles } from '../theme/registre';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { couleurs, espaces } from '../theme';

// Affiché quand une liste est vide
export default function EtatVide({ titre, message }) {
  return (
    <View style={styles.conteneur}>
      <Text style={styles.titre}>{titre}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const creerStyles = () => StyleSheet.create({
  conteneur: { padding: espaces.xl, alignItems: 'center' },
  titre: { fontSize: 17, fontWeight: '600', color: couleurs.texte, textAlign: 'center' },
  message: { marginTop: espaces.xs, color: couleurs.texteSecondaire, textAlign: 'center' },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});