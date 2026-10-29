import { enregistrerStyles } from '../theme/registre';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { couleurs, espaces } from '../theme';

export default function Chargement({ message }) {
  return (
    <View style={styles.conteneur}>
      <ActivityIndicator size="large" color={couleurs.primaire} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const creerStyles = () => StyleSheet.create({
  conteneur: { padding: espaces.xl, alignItems: 'center', justifyContent: 'center' },
  message: { marginTop: espaces.s, color: couleurs.texteSecondaire },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});