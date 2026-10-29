import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { couleurs, espaces } from '../theme';
import { formatPrix } from '../utils/format';
import { calculerRemise } from '../utils/promotion';

// Sous-total et remise estimée avant de valider la réservation
export default function RecapPrix({ article, total }) {
  const promotion = article.promotion;
  const remise = calculerRemise(promotion, total);
  if (!promotion || remise <= 0) return null;
  return (
    <View style={styles.zone}>
      <View style={styles.ligne}>
        <Text style={styles.titre}>Sous-total</Text>
        <Text style={styles.valeur}>{formatPrix(total)}</Text>
      </View>
      <View style={styles.ligne}>
        <Text style={styles.titre} numberOfLines={1}>Promotion « {promotion.titre} »</Text>
        <Text style={[styles.valeur, { color: couleurs.succes }]}>− {formatPrix(remise)}</Text>
      </View>
      <Text style={styles.note}>Le montant exact est confirmé à la réservation.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  zone: { marginTop: espaces.m },
  ligne: { flexDirection: 'row', justifyContent: 'space-between', gap: espaces.m, paddingVertical: 3 },
  titre: { flex: 1, fontSize: 14, color: couleurs.texteSecondaire },
  valeur: { fontSize: 14, fontWeight: '700', color: couleurs.texte },
  note: { fontSize: 11, color: couleurs.texteSecondaire, marginTop: 2 },
});