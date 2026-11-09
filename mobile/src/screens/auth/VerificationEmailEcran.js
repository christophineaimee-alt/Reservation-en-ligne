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

const PAUSE = 60;

// Saisie du code à 6 chiffres reçu par e-mail
export default function VerificationEmailEcran({ route, navigation }) {
  useThemeVersion();
  const email = route.params?.email || '';
  const [code, setCode] = useState('');
  const [erreur, setErreur] = useState('');
  const [info, setInfo] = useState(route.params?.envoye === false ? "L'e-mail n'a pas pu partir. Appuyez sur « Renvoyer le code »." : '');
  const [charge, setCharge] = useState(false);
  const [attente, setAttente] = useState(PAUSE);

  useEffect(() => {
    if (attente <= 0) return undefined;
    const t = setTimeout(() => setAttente((a) => a - 1), 1000);
    return () => clearTimeout(t);
  }, [attente]);

  async function valider() {
    setErreur('');
    if (!/^\d{6}$/.test(code.trim())) {
      setErreur('Saisissez les 6 chiffres du code');
      return;
    }
    setCharge(true);
    try {
      await api.post('/auth/verifier-code', { email, code: code.trim() });
      navigation.navigate('Connexion', { message: 'E-mail vérifié. Vous pouvez maintenant vous connecter.' });
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setCharge(false);
    }
  }

  async function renvoyer() {
    setErreur('');
    setInfo('');
    try {
      await api.post('/auth/renvoyer-code', { email });
      setInfo("Un nouveau code vient d'être envoyé.");
      setAttente(PAUSE);
    } catch (e) {
      setErreur(messageErreur(e));
    }
  }

  return (
    <Ecran centre={false}>
      <Text style={styles.titre}>Vérifiez votre e-mail</Text>
      <Text style={styles.sousTitre}>Nous avons envoyé un code à 6 chiffres à {email}. Il est valable 10 minutes.</Text>
      <Bandeau type="succes" message={info} />
      <Bandeau type="erreur" message={erreur} />
      <Panneau>
        <ChampTexte label="Code de vérification" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} placeholder="123456" />
        <Bouton titre="Valider" onPress={valider} chargement={charge} />
        <Bouton
          titre={attente > 0 ? `Renvoyer le code (${attente} s)` : 'Renvoyer le code'}
          variante="contour"
          onPress={renvoyer}
          disabled={attente > 0}
        />
      </Panneau>
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