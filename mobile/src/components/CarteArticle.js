import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { couleurs, espaces, rayon, ombre } from '../theme';
import { formatPrix, libelleType } from '../utils/format';
import PrixPromo from './PrixPromo';

export default function CarteArticle({ article, onPress }) {
  const service = article.type === 'SERVICE';
  const aPhoto = article.photo && String(article.photo).startsWith('http');
  let info = '';
  let rouge = false;
  if (service) {
    info = article.dureeMinutes ? `${article.dureeMinutes} min` : '';
  } else if (article.disponible) {
    info = 'En stock';
  } else {
    info = 'Épuisé';
    rouge = true;
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.carte, pressed && styles.appuye]}>
      <View style={styles.haut}>
        {aPhoto ? (
          <Image source={{ uri: article.photo }} style={styles.photo} />
        ) : (
          <View style={styles.pastille}>
            <Ionicons name={service ? 'sparkles' : 'cube'} size={22} color={couleurs.primaire} />
          </View>
        )}
        <View style={styles.infos}>
          <View style={styles.ligneNom}>
            <Text style={styles.nom} numberOfLines={1}>{article.nom}</Text>
            <Text style={[styles.badge, service && styles.badgeService]}>{libelleType(article.type)}</Text>
          </View>
          {article.description ? (
            <Text style={styles.description} numberOfLines={2}>{article.description}</Text>
          ) : null}
          {info ? <Text style={[styles.info, rouge && styles.rouge]}>{info}</Text> : null}
        </View>
      </View>

      <View style={styles.bas}>
        <PrixPromo prix={article.prix} promotion={article.promotion} style={styles.prix} />
        <View style={styles.pilule}>
          <Text style={styles.pouleTexte}>Détail</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  carte: {
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    padding: espaces.m,
    marginBottom: espaces.m,
    ...ombre,
  },
  appuye: { opacity: 0.9 },
  haut: { flexDirection: 'row', alignItems: 'flex-start' },
  pastille: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: couleurs.primaireClair,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: espaces.m,
  },
  photo: { width: 52, height: 52, borderRadius: 16, marginRight: espaces.m },
  infos: { flex: 1 },
  ligneNom: { flexDirection: 'row', alignItems: 'center', gap: espaces.s },
  nom: { flexShrink: 1, fontSize: 16, fontWeight: '700', color: couleurs.texte },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    color: couleurs.attention,
    backgroundColor: '#FFF4DB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    overflow: 'hidden',
  },
  badgeService: { color: couleurs.primaire, backgroundColor: couleurs.primaireClair },
  description: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: 4 },
  info: { fontSize: 12, color: couleurs.primaire, marginTop: 6, fontWeight: '600' },
  rouge: { color: couleurs.erreur },
  bas: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: espaces.m },
  prix: { fontSize: 18, fontWeight: '700', color: couleurs.primaire },
  pilule: {
    minWidth: 84,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: couleurs.bordure,
  },
  pouleTexte: { fontSize: 13, fontWeight: '700', color: couleurs.primaire },
});