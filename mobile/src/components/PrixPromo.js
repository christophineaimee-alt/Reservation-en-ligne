import { enregistrerStyles } from '../theme/registre';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { couleurs } from '../theme';
import { formatPrix } from '../utils/format';
import { jourMois, libelleRemise } from '../utils/promotion';

// style : le style du prix habituel de l'écran ; fin : affiche « Jusqu'au 30/10 »
export default function PrixPromo({ prix, promotion, style, fin = false }) {
  if (!promotion) return <Text style={style}>{formatPrix(prix)}</Text>;
  return (
    <View style={styles.zone}>
      <Text style={style}>{formatPrix(promotion.prixPromo)}</Text>
      <Text style={styles.ancien}>{formatPrix(prix)}</Text>
      <View style={styles.pastille}>
        <Text style={styles.pastilleTexte}>{libelleRemise(promotion)}</Text>
      </View>
      {fin && promotion.dateFin ? <Text style={styles.fin}>Jusqu'au {jourMois(promotion.dateFin)}</Text> : null}
    </View>
  );
}

const creerStyles = () => StyleSheet.create({
  zone: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  ancien: { fontSize: 13, color: couleurs.texteSecondaire, textDecorationLine: 'line-through' },
  pastille: { backgroundColor: couleurs.erreur, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  pastilleTexte: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  fin: { fontSize: 12, color: couleurs.erreur, fontWeight: '600' },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});