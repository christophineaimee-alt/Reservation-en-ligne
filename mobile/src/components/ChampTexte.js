import { enregistrerStyles } from '../theme/registre';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { couleurs, espaces } from '../theme';

export default function ChampTexte({ label, erreur, onFocus, onBlur, ...props }) {
  const [actif, setActif] = useState(false);
  return (
    <View style={styles.groupe}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.champ, actif && styles.champActif, erreur ? styles.champErreur : null]}
        placeholderTextColor={couleurs.texteSecondaire}
        autoCapitalize="none"
        onFocus={(e) => { setActif(true); if (onFocus) onFocus(e); }}
        onBlur={(e) => { setActif(false); if (onBlur) onBlur(e); }}
        {...props}
      />
      {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}
    </View>
  );
}

const creerStyles = () => StyleSheet.create({
  groupe: { marginBottom: espaces.m },
  label: { fontSize: 14, fontWeight: '600', color: couleurs.texte, marginBottom: espaces.xs },
  champ: {
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: 16,
    backgroundColor: couleurs.carte,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: couleurs.texte,
  },
  champActif: { borderColor: couleurs.primaire },
  champErreur: { borderColor: couleurs.erreur },
  erreur: { color: couleurs.erreur, fontSize: 13, marginTop: espaces.xs },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});