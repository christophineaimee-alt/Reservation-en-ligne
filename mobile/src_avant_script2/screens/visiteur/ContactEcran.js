import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api, { messageErreur } from '../../api/client';
import Ecran from '../../components/Ecran';
import ChampTexte from '../../components/ChampTexte';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import { couleurs, degradeHero, espaces, rayon, ombre } from '../../theme';

// Formulaire de contact, accessible sans compte
export default function ContactEcran({ navigation }) {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState('');

  async function envoyer() {
    setEnvoi(true);
    setErreur('');
    try {
      await api.post('/visiteur/contact', {
        nom: nom.trim(),
        email: email.trim(),
        sujet: sujet.trim(),
        message: message.trim(),
      });
      setEnvoye(true);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setEnvoi(false);
    }
  }

  if (envoye) {
    return (
      <Ecran centre>
        <View style={styles.centre}>
          <LinearGradient colors={degradeHero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cercle}>
            <Ionicons name="checkmark" size={46} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.titre}>Message envoyé</Text>
          <Text style={styles.texte}>Merci {nom.trim()} ! Nous vous répondrons très vite par e-mail.</Text>
        </View>
        <Bouton titre="Retour à l'accueil" onPress={() => navigation.navigate('Visiteur')} />
      </Ecran>
    );
  }

  return (
    <Ecran centre={false}>
      <LinearGradient colors={degradeHero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.entete}>
        <Ionicons name="mail-outline" size={28} color="#FFFFFF" />
        <Text style={styles.enteteTitre}>Une question ? Écrivez-nous</Text>
        <Text style={styles.enteteTexte}>Nous répondons généralement sous 24 heures.</Text>
      </LinearGradient>

      <ChampTexte label="Votre nom" placeholder="Rakoto Jean" value={nom} onChangeText={setNom} autoCapitalize="words" />
      <ChampTexte
        label="Adresse e-mail"
        placeholder="vous@exemple.mg"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <ChampTexte label="Sujet" placeholder="Par exemple : paiement MVola" value={sujet} onChangeText={setSujet} autoCapitalize="sentences" />

      <Text style={styles.label}>Votre message</Text>
      <TextInput
        style={styles.champ}
        multiline
        maxLength={1000}
        value={message}
        onChangeText={setMessage}
        placeholder="Décrivez votre demande…"
        placeholderTextColor={couleurs.texteSecondaire}
      />
      <Text style={styles.compteur}>{message.length} / 1000</Text>

      <Bandeau type="erreur" message={erreur} />
      <Bouton titre="Envoyer le message" onPress={envoyer} chargement={envoi} />
      <Bouton titre="Retour" variante="texte" onPress={() => navigation.goBack()} style={{ marginTop: espaces.s }} />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  entete: { borderRadius: rayon, padding: espaces.l, alignItems: 'center', marginBottom: espaces.l, ...ombre },
  enteteTitre: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginTop: espaces.s },
  enteteTexte: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  label: { fontSize: 14, fontWeight: '600', color: couleurs.texte, marginBottom: espaces.xs },
  champ: {
    minHeight: 130,
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
  centre: { alignItems: 'center', marginBottom: espaces.l },
  cercle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: espaces.l },
  titre: { fontSize: 22, fontWeight: '800', color: couleurs.texte, textAlign: 'center' },
  texte: { fontSize: 14, color: couleurs.texteSecondaire, textAlign: 'center', marginTop: espaces.s + 4, lineHeight: 21 },
});