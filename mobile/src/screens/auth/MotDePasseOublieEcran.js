import { enregistrerStyles, useThemeVersion } from '../../theme/registre';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Ecran from '../../components/Ecran';
import Panneau from '../../components/Panneau';
import ChampTexte from '../../components/ChampTexte';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import api, { messageErreur } from '../../api/client';
import { couleurs, espaces } from '../../theme';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAUSE = 60;

// Mot de passe oublié : 1) saisir l'e-mail  2) saisir le code reçu et le nouveau mot de passe
export default function MotDePasseOublieEcran({ navigation }) {
  useThemeVersion();
  const [etape, setEtape] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [erreur, setErreur] = useState('');
  const [info, setInfo] = useState('');
  const [charge, setCharge] = useState(false);
  const [attente, setAttente] = useState(0);

  useEffect(() => {
    if (attente <= 0) return undefined;
    const t = setTimeout(() => setAttente((a) => a - 1), 1000);
    return () => clearTimeout(t);
  }, [attente]);

  async function envoyerCode() {
    setErreur('');
    setInfo('');
    const adresse = email.trim().toLowerCase();
    if (!EMAIL.test(adresse)) {
      setErreur('E-mail invalide');
      return;
    }
    setCharge(true);
    try {
      await api.post('/auth/mot-de-passe-oublie', { email: adresse });
      setEmail(adresse);
      setEtape(2);
      setAttente(PAUSE);
      setInfo('Si un compte existe avec cet e-mail, un code vient de lui être envoyé.');
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setCharge(false);
    }
  }

  async function changer() {
    setErreur('');
    setInfo('');
    if (!/^\d{6}$/.test(code.trim())) {
      setErreur('Saisissez les 6 chiffres du code');
      return;
    }
    if (motDePasse.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (motDePasse !== confirmation) {
      setErreur('Les mots de passe ne correspondent pas');
      return;
    }
    setCharge(true);
    try {
      await api.post('/auth/reinitialiser-mot-de-passe', { email, code: code.trim(), motDePasse });
      navigation.navigate('Connexion', { message: 'Mot de passe modifié. Vous pouvez maintenant vous connecter.' });
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setCharge(false);
    }
  }

  return (
    <Ecran centre={false}>
      <Text style={styles.titre}>Mot de passe oublié</Text>
      <Text style={styles.sousTitre}>
        {etape === 1
          ? 'Saisissez votre e-mail : nous vous enverrons un code à 6 chiffres.'
          : `Saisissez le code reçu à ${email} et choisissez un nouveau mot de passe.`}
      </Text>
      <Bandeau type="succes" message={info} />
      <Bandeau type="erreur" message={erreur} />

      <Panneau>
        {etape === 1 ? (
          <>
            <ChampTexte label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="exemple@mail.com" />
            <Bouton titre="Envoyer le code" onPress={envoyerCode} chargement={charge} />
          </>
        ) : (
          <>
            <ChampTexte label="Code reçu par e-mail" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} placeholder="123456" />
            <ChampTexte label="Nouveau mot de passe" value={motDePasse} onChangeText={setMotDePasse} secureTextEntry placeholder="8 caractères minimum" />
            <ChampTexte label="Confirmer le mot de passe" value={confirmation} onChangeText={setConfirmation} secureTextEntry />
            <Bouton titre="Changer mon mot de passe" onPress={changer} chargement={charge} />
            <Bouton
              titre={attente > 0 ? `Renvoyer le code (${attente} s)` : 'Renvoyer le code'}
              variante="contour"
              onPress={envoyerCode}
              disabled={attente > 0}
            />
          </>
        )}
      </Panneau>

      <Bouton
        titre="Retour à la connexion"
        variante="texte"
        onPress={() => navigation.navigate('Connexion')}
        style={{ marginTop: espaces.m }}
      />
    </Ecran>
  );
}

const creerStyles = () => StyleSheet.create({
  titre: { fontSize: 26, fontWeight: '700', color: couleurs.texte },
  sousTitre: { fontSize: 14, color: couleurs.texteSecondaire, marginTop: espaces.xs, marginBottom: espaces.m },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});