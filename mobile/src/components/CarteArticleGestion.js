import { enregistrerStyles } from '../theme/registre';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { couleurs, espaces, rayon } from '../theme';
import { formatPrix, libelleType } from '../utils/format';

// Une ligne du catalogue vue par le commerçant (éléments désactivés inclus)
export default function CarteArticleGestion({ article, onPress }) {
  const service = article.type === 'SERVICE';
  let info = '';
  let rouge = false;
  if (service) {
    info = article.dureeMinutes ? `${article.dureeMinutes} min` : '';
  } else if (article.quantiteDisponible > 0) {
    info = `Stock : ${article.quantiteDisponible}`;
  } else {
    info = 'Rupture de stock';
    rouge = true;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.carte, !article.actif && styles.inactif, pressed && styles.appuye]}
    >
      <View style={styles.haut}>
        <Text style={styles.nom} numberOfLines={1}>{article.nom}</Text>
        {!article.actif ? <Text style={styles.desactive}>Désactivé</Text> : null}
        <Text style={[styles.badge, service && styles.badgeService]}>{libelleType(article.type)}</Text>
      </View>
      <View style={styles.bas}>
        <Text style={styles.prix}>{formatPrix(article.prix)}</Text>
        <Text style={[styles.info, rouge && styles.rouge]}>{info}</Text>
      </View>
    </Pressable>
  );
}

const creerStyles = () => StyleSheet.create({
  carte: {
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espaces.m,
    marginBottom: espaces.s,
  },
  inactif: { opacity: 0.6 },
  appuye: { opacity: 0.85 },
  haut: { flexDirection: 'row', alignItems: 'center' },
  nom: { flex: 1, fontSize: 16, fontWeight: '700', color: couleurs.texte, marginRight: espaces.s },
  desactive: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: espaces.xs,
  },
  badge: {
    fontSize: 12,
    fontWeight: '600',
    color: couleurs.attention,
    backgroundColor: couleurs.avertFond,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  badgeService: { color: couleurs.primaire, backgroundColor: couleurs.primaireClair },
  bas: { flexDirection: 'row', justifyContent: 'space-between', marginTop: espaces.s },
  prix: { fontSize: 15, fontWeight: '700', color: couleurs.texte },
  info: { fontSize: 14, color: couleurs.texteSecondaire },
  rouge: { color: couleurs.erreur, fontWeight: '600' },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});