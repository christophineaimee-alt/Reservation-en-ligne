import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { couleurs, espaces, rayon, ombre } from '../theme';

// Les trois couleurs du kit : indigo (primaire), orange (accent) et turquoise
function palette(ton) {
  if (ton === 'accent') return { couleur: couleurs.accent || '#F0763A', fond: couleurs.accentFond || '#FDEBE2' };
  if (ton === 'turquoise') return { couleur: couleurs.turquoise || '#2BA9B0', fond: couleurs.turquoiseFond || '#DDF4F5' };
  return { couleur: couleurs.primaire, fond: couleurs.primaireClair };
}

// pourcentage : 0 à 100 (barre de progression) ; note : petite phrase sous le chiffre
export default function CarteProgression({ icone, ton = 'primaire', titre, valeur, note, pourcentage, onPress, style }) {
  const { couleur, fond } = palette(ton);
  const p = Math.max(0, Math.min(100, Math.round(Number(pourcentage) || 0)));
  const contenu = (
    <>
      <View style={styles.haut}>
        <View style={[styles.icone, { backgroundColor: fond }]}>
          <Ionicons name={icone} size={22} color={couleur} />
        </View>
        {pourcentage !== undefined ? <Text style={[styles.pourcent, { color: couleur }]}>{p} %</Text> : null}
      </View>
      <Text style={styles.valeur} numberOfLines={1}>{valeur}</Text>
      <Text style={styles.titre} numberOfLines={1}>{titre}</Text>
      {pourcentage !== undefined ? (
        <View style={[styles.piste, { backgroundColor: fond }]}>
          <View style={[styles.barre, { width: `${p}%`, backgroundColor: couleur }]} />
        </View>
      ) : null}
      {note ? <Text style={styles.note} numberOfLines={1}>{note}</Text> : null}
    </>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.carte, style, pressed && { opacity: 0.92 }]}>
        {contenu}
      </Pressable>
    );
  }
  return <View style={[styles.carte, style]}>{contenu}</View>;
}

const styles = StyleSheet.create({
  carte: { backgroundColor: couleurs.carte, borderRadius: rayon, padding: espaces.m + 2, ...ombre },
  haut: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  icone: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  pourcent: { fontSize: 13, fontWeight: '700' },
  valeur: { fontSize: 28, fontWeight: '700', color: couleurs.texte, marginTop: espaces.m },
  titre: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: 2 },
  piste: { height: 6, borderRadius: 3, marginTop: espaces.m, overflow: 'hidden' },
  barre: { height: 6, borderRadius: 3 },
  note: { fontSize: 11, color: couleurs.texteSecondaire, marginTop: espaces.s },
});