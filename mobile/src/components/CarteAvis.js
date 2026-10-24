import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Etoiles from './Etoiles';
import { couleurs, degrade, espaces } from '../theme';
import { formatDateHeure, initiale } from '../utils/format';

// children : actions supplémentaires (par exemple le bouton « Répondre » du commerçant)
export default function CarteAvis({ avis, children }) {
  return (
    <View style={styles.carte}>
      <View style={styles.haut}>
        <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
          <Text style={styles.lettre}>{initiale(avis.client || '?')}</Text>
        </LinearGradient>
        <View style={styles.identite}>
          <Text style={styles.nom} numberOfLines={1}>{avis.client}</Text>
          <Text style={styles.date}>{formatDateHeure(avis.createdAt)}</Text>
        </View>
        <Etoiles note={avis.note} taille={14} />
      </View>
      {avis.nomElement ? <Text style={styles.element}>{avis.nomElement}</Text> : null}
      {avis.commentaire ? (
        <Text style={styles.commentaire}>{avis.commentaire}</Text>
      ) : (
        <Text style={styles.sansCommentaire}>Aucun commentaire</Text>
      )}
      {avis.reponse ? (
        <View style={styles.reponse}>
          <Text style={styles.reponseTitre}>Réponse de la boutique</Text>
          <Text style={styles.reponseTexte}>{avis.reponse}</Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  carte: { backgroundColor: '#F7F7FC', borderRadius: 16, padding: espaces.m, marginBottom: espaces.s + 2 },
  haut: { flexDirection: 'row', alignItems: 'center', gap: espaces.s + 4 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  lettre: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  identite: { flex: 1 },
  nom: { fontSize: 14, fontWeight: '700', color: couleurs.texte },
  date: { fontSize: 11, color: couleurs.texteSecondaire, marginTop: 1 },
  element: { fontSize: 12, color: couleurs.primaire, fontWeight: '600', marginTop: espaces.s },
  commentaire: { fontSize: 14, color: couleurs.texte, marginTop: espaces.s },
  sansCommentaire: { fontSize: 13, color: couleurs.texteSecondaire, fontStyle: 'italic', marginTop: espaces.s },
  reponse: { backgroundColor: couleurs.primaireClair, borderRadius: 12, padding: espaces.s + 4, marginTop: espaces.s + 2 },
  reponseTitre: { fontSize: 12, fontWeight: '700', color: couleurs.primaire },
  reponseTexte: { fontSize: 13, color: couleurs.texte, marginTop: 2 },
});