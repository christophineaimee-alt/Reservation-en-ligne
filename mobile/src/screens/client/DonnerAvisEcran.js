import { enregistrerStyles, useThemeVersion } from '../../theme/registre';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import api, { messageErreur } from '../../api/client';
import Ecran from '../../components/Ecran';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import SelecteurEtoiles from '../../components/SelecteurEtoiles';
import { couleurs, espaces, rayon, ombre } from '../../theme';

const LIBELLES = ['Touchez une étoile', 'Très décevant', 'Décevant', 'Correct', 'Très bien', 'Excellent'];

// Donner son avis (POST) ou le modifier (PUT si "avis" est fourni)
export default function DonnerAvisEcran({ route, navigation }) {
  useThemeVersion();
  const { idReservation, avis, nomElement } = route.params;
  const [note, setNote] = useState(avis ? avis.note : 0);
  const [commentaire, setCommentaire] = useState(avis && avis.commentaire ? avis.commentaire : '');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  async function envoyer() {
    if (note < 1) {
      setErreur('Choisissez une note de 1 à 5 étoiles');
      return;
    }
    setEnvoi(true);
    setErreur('');
    try {
      const corps = { note, commentaire: commentaire.trim() || undefined };
      if (avis) {
        await api.put(`/avis/${avis.idAvis}`, corps);
      } else {
        await api.post('/avis', { idReservation, ...corps });
      }
      navigation.goBack();
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Ecran centre={false}>
      <View style={styles.carte}>
        <Text style={styles.question}>
          {nomElement ? `Que pensez-vous de « ${nomElement} » ?` : 'Que pensez-vous de votre rendez-vous ?'}
        </Text>
        <SelecteurEtoiles valeur={note} onChange={setNote} />
        <Text style={[styles.libelle, note > 0 && styles.libelleActif]}>{LIBELLES[note]}</Text>
      </View>

      <Text style={styles.label}>Votre commentaire (facultatif)</Text>
      <TextInput
        style={styles.champ}
        multiline
        maxLength={500}
        value={commentaire}
        onChangeText={setCommentaire}
        placeholder="Accueil, qualité, délai… dites-nous tout"
        placeholderTextColor={couleurs.texteSecondaire}
      />
      <Text style={styles.compteur}>{commentaire.length} / 500</Text>

      <Bandeau type="erreur" message={erreur} />
      <Bouton titre={avis ? 'Enregistrer les modifications' : 'Publier mon avis'} onPress={envoyer} chargement={envoi} />
      <Bouton titre="Annuler" variante="texte" onPress={() => navigation.goBack()} style={{ marginTop: espaces.s }} />
    </Ecran>
  );
}

const creerStyles = () => StyleSheet.create({
  carte: {
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    padding: espaces.l,
    alignItems: 'center',
    marginBottom: espaces.l,
    ...ombre,
  },
  question: { fontSize: 17, fontWeight: '700', color: couleurs.texte, textAlign: 'center', marginBottom: espaces.m },
  libelle: { fontSize: 14, color: couleurs.texteSecondaire, marginTop: espaces.m },
  libelleActif: { color: couleurs.primaire, fontWeight: '700' },
  label: { fontSize: 14, fontWeight: '600', color: couleurs.texte, marginBottom: espaces.xs },
  champ: {
    minHeight: 120,
    backgroundColor: couleurs.carte,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    color: couleurs.texte,
    textAlignVertical: 'top',
  },
  compteur: { fontSize: 12, color: couleurs.texteSecondaire, textAlign: 'right', marginTop: 4, marginBottom: espaces.m },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});