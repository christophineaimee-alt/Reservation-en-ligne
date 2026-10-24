import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { couleurs, espaces, rayon, ombre } from '../theme';

const TONS = {
  hausse: { fond: couleurs.succesFond, couleur: couleurs.succes, fleche: '▲ ' },
  baisse: { fond: couleurs.erreurFond, couleur: couleurs.erreur, fleche: '▼ ' },
  neutre: { fond: couleurs.primaireClair, couleur: couleurs.primaire, fleche: '' },
};

// items : [{ titre, valeur, note?, ton? ('hausse' | 'baisse' | 'neutre') }]
export default function BandeauChiffres({ items }) {
  return (
    <View style={styles.carte}>
      {items.map((item, i) => {
        const ton = TONS[item.ton] || TONS.neutre;
        return (
          <View key={item.titre} style={[styles.colonne, i > 0 && styles.separe]}>
            <Text style={styles.titre} numberOfLines={1}>{item.titre}</Text>
            <Text style={styles.valeur} numberOfLines={1}>{item.valeur}</Text>
            {item.note ? (
              <View style={[styles.pastille, { backgroundColor: ton.fond }]}>
                <Text style={[styles.note, { color: ton.couleur }]} numberOfLines={1}>
                  {ton.fleche}{item.note}
                </Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  carte: {
    flexDirection: 'row',
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    paddingVertical: espaces.m,
    marginBottom: espaces.m,
    ...ombre,
  },
  colonne: { flex: 1, paddingHorizontal: espaces.m },
  separe: { borderLeftWidth: 1, borderLeftColor: couleurs.bordure },
  titre: { fontSize: 12, color: couleurs.texteSecondaire },
  valeur: { fontSize: 22, fontWeight: '600', color: couleurs.texte, marginTop: 4 },
  pastille: { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginTop: 8 },
  note: { fontSize: 10, fontWeight: '600' },
});