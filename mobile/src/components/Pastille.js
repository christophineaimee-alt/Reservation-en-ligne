import { enregistrerStyles } from '../theme/registre';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { couleurs } from '../theme';

const creerTONS = () => ({
  succes: { fond: couleurs.succesFond, couleur: couleurs.succes },
  attention: { fond: couleurs.attentionFond || couleurs.avertFond, couleur: couleurs.attention },
  erreur: { fond: couleurs.erreurFond, couleur: couleurs.erreur },
  primaire: { fond: couleurs.primaireClair, couleur: couleurs.primaire },
  neutre: { fond: couleurs.neutreFond, couleur: couleurs.texteSecondaire },
});
const TONS = creerTONS();
enregistrerStyles(() => {
  Object.assign(TONS, creerTONS());
});

// Statut en pastille avec petit point, comme « Paid / Pending / Unpaid » du kit
export default function Pastille({ texte, ton = 'neutre' }) {
  const t = TONS[ton] || TONS.neutre;
  return (
    <View style={[styles.pastille, { backgroundColor: t.fond }]}>
      <View style={[styles.point, { backgroundColor: t.couleur }]} />
      <Text style={[styles.texte, { color: t.couleur }]} numberOfLines={1}>{texte}</Text>
    </View>
  );
}

const creerStyles = () => StyleSheet.create({
  pastille: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  point: { width: 6, height: 6, borderRadius: 3 },
  texte: { fontSize: 12, fontWeight: '700' },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});