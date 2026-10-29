import { enregistrerStyles } from '../theme/registre';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { couleurs, espaces, rayon, ombre } from '../theme';
import { initiale } from '../utils/format';
import Etoiles from './Etoiles';

export default function CarteBoutique({ boutique, onPress }) {
  const aLogo = boutique.logo && String(boutique.logo).startsWith('http');
  const lieu = [boutique.adresse, boutique.ville].filter(Boolean).join(', ');
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.carte, pressed && styles.appuye]}>
      {aLogo ? (
        <Image source={{ uri: boutique.logo }} style={styles.logo} />
      ) : (
        <View style={[styles.logo, styles.initiale]}>
          <Text style={styles.lettre}>{initiale(boutique.nom)}</Text>
        </View>
      )}
      <View style={styles.infos}>
        <Text style={styles.nom} numberOfLines={1}>{boutique.nom}</Text>
        {boutique.categorie ? (
          <View style={styles.categorie}>
            <Text style={styles.categorieTexte}>{boutique.categorie.nom}</Text>
          </View>
        ) : null}
        <Etoiles note={boutique.noteMoyenne} nombre={boutique.nombreAvis} style={{ marginTop: 6 }} />
        {lieu ? <Text style={styles.lieu} numberOfLines={1}>{lieu}</Text> : null}
        {boutique.description ? (
          <Text style={styles.description} numberOfLines={2}>{boutique.description}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const creerStyles = () => StyleSheet.create({
  carte: {
    flexDirection: 'row',
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    padding: espaces.m,
    marginBottom: espaces.m,
    ...ombre,
  },
  appuye: { opacity: 0.9 },
  logo: { width: 60, height: 60, borderRadius: 18, marginRight: espaces.m },
  initiale: { backgroundColor: couleurs.primaireClair, alignItems: 'center', justifyContent: 'center' },
  lettre: { fontSize: 24, fontWeight: '700', color: couleurs.primaire },
  infos: { flex: 1 },
  nom: { fontSize: 17, fontWeight: '700', color: couleurs.texte },
  categorie: {
    alignSelf: 'flex-start',
    backgroundColor: couleurs.primaireClair,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 4,
  },
  categorieTexte: { fontSize: 12, color: couleurs.primaire, fontWeight: '700' },
  lieu: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: 6 },
  description: { fontSize: 14, color: couleurs.texte, marginTop: espaces.xs },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});