import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { couleurs, degrade, espaces, rayon, ombre } from '../theme';

// Une case du tableau de bord : un chiffre et son titre
export default function CarteStat({ titre, valeur, accent, onPress, icone, vedette = false }) {
  const contenu = (
    <>
      {icone ? (
        <View style={[styles.pastille, vedette && styles.pastilleVedette]}>
          <Ionicons name={icone} size={18} color={vedette ? '#FFFFFF' : couleurs.primaire} />
        </View>
      ) : null}
      <Text style={[styles.valeur, vedette ? styles.blanc : accent ? { color: accent } : null]}>{valeur}</Text>
      <Text style={[styles.titre, vedette && styles.blancClair]}>{titre}</Text>
    </>
  );
  const interieur = vedette ? (
    <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.interieur}>
      {contenu}
    </LinearGradient>
  ) : (
    <View style={styles.interieur}>{contenu}</View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.carte, pressed && styles.appuye]}>
        {interieur}
      </Pressable>
    );
  }
  return <View style={styles.carte}>{interieur}</View>;
}

const styles = StyleSheet.create({
  carte: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    ...ombre,
  },
  interieur: { padding: espaces.m, borderRadius: rayon },
  appuye: { opacity: 0.9 },
  pastille: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: couleurs.primaireClair,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaces.s,
  },
  pastilleVedette: { backgroundColor: 'rgba(255,255,255,0.22)' },
  valeur: { fontSize: 28, fontWeight: '700', color: couleurs.texte },
  titre: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: espaces.xs },
  blanc: { color: '#FFFFFF' },
  blancClair: { color: 'rgba(255,255,255,0.85)' },
});