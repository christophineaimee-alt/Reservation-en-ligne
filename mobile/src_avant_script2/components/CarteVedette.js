import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Anneau from './Anneau';
import { couleurs, degrade, espaces, rayon, ombre } from '../theme';

// vedette = carte à dégradé violet ; sinon carte blanche au titre violet
export default function CarteVedette({ icone, petitTitre, titre, pourcentage, vedette = false, onPress, largeur = 200 }) {
  const contenu = (
    <>
      <View style={styles.haut}>
        <View style={[styles.pastille, vedette ? styles.pastilleBlanche : styles.pastilleViolette]}>
          <Ionicons name={icone} size={20} color={vedette ? couleurs.primaire : '#FFFFFF'} />
        </View>
        <Ionicons
          name="ellipsis-vertical"
          size={16}
          color={vedette ? 'rgba(255,255,255,0.8)' : couleurs.texteSecondaire}
        />
      </View>
      <View style={styles.bas}>
        <View style={styles.textes}>
          <Text style={[styles.petit, vedette && styles.petitBlanc]}>{petitTitre}</Text>
          <Text style={[styles.titre, { color: vedette ? '#FFFFFF' : couleurs.primaire }]} numberOfLines={1}>
            {titre}
          </Text>
        </View>
        {pourcentage !== undefined ? (
          <Anneau
            pourcentage={pourcentage}
            taille={40}
            couleur={vedette ? '#FFFFFF' : couleurs.primaire}
            fond={vedette ? 'rgba(255,255,255,0.3)' : couleurs.primaireClair}
          />
        ) : null}
      </View>
    </>
  );
  const interieur = vedette ? (
    <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.interieur}>
      {contenu}
    </LinearGradient>
  ) : (
    <View style={styles.interieur}>{contenu}</View>
  );
  const style = [styles.carte, { width: largeur }];
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [style, pressed && { opacity: 0.9 }]}>
        {interieur}
      </Pressable>
    );
  }
  return <View style={style}>{interieur}</View>;
}

const styles = StyleSheet.create({
  carte: { backgroundColor: couleurs.carte, borderRadius: rayon, ...ombre },
  interieur: { padding: espaces.m, borderRadius: rayon, minHeight: 124, justifyContent: 'space-between' },
  haut: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pastille: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pastilleBlanche: { backgroundColor: couleurs.carte },
  pastilleViolette: { backgroundColor: couleurs.primaire },
  bas: { flexDirection: 'row', alignItems: 'flex-end', marginTop: espaces.m },
  textes: { flex: 1 },
  petit: { fontSize: 11, color: couleurs.texteSecondaire },
  petitBlanc: { color: 'rgba(255,255,255,0.8)' },
  titre: { fontSize: 18, fontWeight: '700', marginTop: 2 },
});