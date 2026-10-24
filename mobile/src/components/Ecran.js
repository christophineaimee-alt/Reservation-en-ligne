import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { couleurs, espaces, ombre, rayon } from '../theme';

// Conteneur de base d'un écran. carte : place le contenu dans une carte blanche arrondie.
export default function Ecran({ children, defilement = true, centre = true, carte = false }) {
  const corps = carte ? <View style={styles.carte}>{children}</View> : children;

  return (
    <SafeAreaView style={styles.zone}>
      {defilement ? (
        <ScrollView
          contentContainerStyle={[styles.defilement, centre && styles.centre]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contenu}>{corps}</View>
        </ScrollView>
      ) : (
        <View style={[styles.contenu, styles.fixe]}>{corps}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  defilement: { flexGrow: 1 },
  centre: { justifyContent: 'center' },
  contenu: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: espaces.m },
  fixe: { flex: 1 },
  carte: { backgroundColor: couleurs.carte, borderRadius: rayon, padding: espaces.m + 4, ...ombre },
});