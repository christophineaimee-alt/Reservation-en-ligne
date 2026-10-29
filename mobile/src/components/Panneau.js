import { enregistrerStyles } from '../theme/registre';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { couleurs, espaces, rayon, ombre } from '../theme';

export default function Panneau({ titre, lien, onLien, children, style }) {
  return (
    <View style={[styles.panneau, style]}>
      {titre ? (
        <View style={styles.entete}>
          <Text style={styles.titre}>{titre}</Text>
          {lien ? (
            <Pressable onPress={onLien}>
              <Text style={styles.lien}>{lien}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const creerStyles = () => StyleSheet.create({
  panneau: { backgroundColor: couleurs.carte, borderRadius: rayon, padding: espaces.m, ...ombre },
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: espaces.m },
  titre: { fontSize: 18, fontWeight: '600', color: couleurs.texte },
  lien: { fontSize: 14, fontWeight: '500', color: couleurs.primaire },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});