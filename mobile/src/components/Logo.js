import { enregistrerStyles } from '../theme/registre';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { couleurs, degrade } from '../theme';

export default function Logo({ taille = 56 }) {
  return (
    <View style={styles.ligne}>
      <LinearGradient
        colors={degrade}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: taille, height: taille, borderRadius: taille / 2, alignItems: 'center', justifyContent: 'center' }}
      >
        <Ionicons name="storefront" size={taille * 0.48} color="#FFFFFF" />
      </LinearGradient>
      <Text style={styles.nom}>Marketplace</Text>
    </View>
  );
}

const creerStyles = () => StyleSheet.create({
  ligne: { alignItems: 'center' },
  nom: { fontSize: 22, fontWeight: '800', color: couleurs.texte, marginTop: 10 },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});