import { enregistrerStyles } from '../theme/registre';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { couleurs, espaces } from '../theme';

// Champ de mot de passe avec l'œil pour afficher ou masquer
export default function ChampMotDePasse({ label, valeur, onChange, erreur, placeholder }) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.groupe}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.champ, erreur ? styles.champErreur : null]}>
        <TextInput
          style={styles.saisie}
          value={valeur}
          onChangeText={onChange}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={placeholder}
          placeholderTextColor={couleurs.texteSecondaire}
        />
        <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8}>
          <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={couleurs.texteSecondaire} />
        </Pressable>
      </View>
      {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}
    </View>
  );
}

const creerStyles = () => StyleSheet.create({
  groupe: { marginBottom: espaces.m },
  label: { fontSize: 14, fontWeight: '600', color: couleurs.texte, marginBottom: espaces.xs },
  champ: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: 16,
    backgroundColor: couleurs.carte,
    paddingHorizontal: 16,
  },
  champErreur: { borderColor: couleurs.erreur },
  saisie: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: couleurs.texte,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  erreur: { color: couleurs.erreur, fontSize: 13, marginTop: espaces.xs },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});