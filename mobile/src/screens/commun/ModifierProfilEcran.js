import { enregistrerStyles, useThemeVersion } from '../../theme/registre';
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api, { messageErreur } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Panneau from '../../components/Panneau';
import ChampTexte from '../../components/ChampTexte';
import ChampMotDePasse from '../../components/ChampMotDePasse';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import { couleurs, espaces } from '../../theme';
import { formaterTelephone, normaliserTelephoneMG } from '../../utils/telephone';

const sansEspaces = (t) => (t || '').replace(/\s+/g, '');
const memeNumero = (a, b) => (normaliserTelephoneMG(a) || sansEspaces(a)) === (normaliserTelephoneMG(b) || sansEspaces(b));

// Modifier son nom, son prénom, son numéro et son mot de passe (client, commerçant, administrateur)
export default function ModifierProfilEcran({ route }) {
  useThemeVersion();
  const { utilisateur, mettreAJour } = useAuth();
  const { width } = useWindowDimensions();
  const defilement = useRef(null);
  const section = route.params ? route.params.section : null;

  // Informations personnelles
  const [prenom, setPrenom] = useState(utilisateur.prenom);
  const [nom, setNom] = useState(utilisateur.nom);
  const [telephone, setTelephone] = useState(formaterTelephone(utilisateur.telephone));
  const [erreursProfil, setErreursProfil] = useState({});
  const [erreurProfil, setErreurProfil] = useState('');
  const [succesProfil, setSuccesProfil] = useState('');
  const [envoiProfil, setEnvoiProfil] = useState(false);

  // Mot de passe
  const [actuel, setActuel] = useState('');
  const [nouveau, setNouveau] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [erreursMot, setErreursMot] = useState({});
  const [erreurMot, setErreurMot] = useState('');
  const [succesMot, setSuccesMot] = useState('');
  const [envoiMot, setEnvoiMot] = useState(false);

  function validerProfil() {
    const e = {};
    if (!prenom.trim()) e.prenom = 'Le prénom est obligatoire';
    else if (/\d/.test(prenom)) e.prenom = 'Le prénom ne doit pas contenir de chiffres';
    if (!nom.trim()) e.nom = 'Le nom est obligatoire';
    else if (/\d/.test(nom)) e.nom = 'Le nom ne doit pas contenir de chiffres';
    if (!memeNumero(telephone, utilisateur.telephone) && !normaliserTelephoneMG(telephone)) {
      e.telephone = 'Numéro invalide : 10 chiffres commençant par 032, 033, 034, 037 ou 038';
    }
    setErreursProfil(e);
    return Object.keys(e).length === 0;
  }

  async function enregistrerProfil() {
    setSuccesProfil('');
    setErreurProfil('');
    if (!validerProfil()) return;
    const corps = {};
    if (prenom.trim() !== utilisateur.prenom) corps.prenom = prenom.trim();
    if (nom.trim() !== utilisateur.nom) corps.nom = nom.trim();
    if (!memeNumero(telephone, utilisateur.telephone)) corps.telephone = telephone;
    if (Object.keys(corps).length === 0) {
      setSuccesProfil('Aucune modification à enregistrer');
      return;
    }
    setEnvoiProfil(true);
    try {
      const { data } = await api.patch('/auth/moi', corps);
      mettreAJour(data.utilisateur);
      setTelephone(formaterTelephone(data.utilisateur.telephone));
      setSuccesProfil(data.message);
    } catch (e) {
      setErreurProfil(messageErreur(e));
    } finally {
      setEnvoiProfil(false);
    }
  }

  const regles = [
    { ok: nouveau.length >= 8, texte: 'Au moins 8 caractères' },
    { ok: /[A-Za-z]/.test(nouveau), texte: 'Une lettre' },
    { ok: /\d/.test(nouveau), texte: 'Un chiffre' },
    { ok: nouveau.length > 0 && nouveau !== actuel, texte: "Différent de l'actuel" },
  ];
  const force = regles.filter((r) => r.ok).length;
  const couleurForce = force <= 1 ? couleurs.erreur : force === 2 ? couleurs.attention : force === 3 ? couleurs.turquoise || couleurs.primaire : couleurs.succes;

  async function changerMotDePasse() {
    setSuccesMot('');
    setErreurMot('');
    const e = {};
    if (!actuel) e.actuel = 'Saisissez votre mot de passe actuel';
    if (force < 4) e.nouveau = 'Le nouveau mot de passe ne respecte pas toutes les règles';
    if (confirmation !== nouveau) e.confirmation = 'La confirmation ne correspond pas';
    setErreursMot(e);
    if (Object.keys(e).length > 0) return;
    setEnvoiMot(true);
    try {
      const { data } = await api.put('/auth/mot-de-passe', {
        motDePasseActuel: actuel,
        nouveauMotDePasse: nouveau,
        confirmation,
      });
      setSuccesMot(data.message);
      setActuel('');
      setNouveau('');
      setConfirmation('');
    } catch (err) {
      setErreurMot(messageErreur(err));
    } finally {
      setEnvoiMot(false);
    }
  }

  return (
    <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
      <ScrollView
        ref={defilement}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.contenu, { maxWidth: width >= 900 ? 760 : 600 }]}
      >
        <Panneau titre="Informations personnelles">
          <Bandeau type="succes" message={succesProfil} />
          <Bandeau type="erreur" message={erreurProfil} />

          <View style={styles.email}>
            <Ionicons name="mail-outline" size={16} color={couleurs.texteSecondaire} />
            <Text style={styles.emailTexte} numberOfLines={1}>
              {utilisateur.email} · non modifiable
            </Text>
          </View>

          <ChampTexte label="Prénom" value={prenom} onChangeText={setPrenom} autoCapitalize="words" erreur={erreursProfil.prenom} />
          <ChampTexte label="Nom" value={nom} onChangeText={setNom} autoCapitalize="words" erreur={erreursProfil.nom} />
          <ChampTexte
            label="Numéro de téléphone"
            value={telephone}
            onChangeText={setTelephone}
            keyboardType="phone-pad"
            placeholder="034 12 345 67"
            erreur={erreursProfil.telephone}
          />
          <Text style={styles.indice}>Numéro malgache à 10 chiffres : 032, 033, 034, 037 ou 038. Il sert aussi pour vos paiements mobiles.</Text>

          <Bouton titre="Enregistrer les modifications" onPress={enregistrerProfil} chargement={envoiProfil} />
        </Panneau>

        <View
          onLayout={(e) => {
            if (section === 'motdepasse' && defilement.current) {
              defilement.current.scrollTo({ y: e.nativeEvent.layout.y, animated: true });
            }
          }}
          style={styles.espace}
        >
          <Panneau titre="Changer mon mot de passe">
            <Bandeau type="succes" message={succesMot} />
            <Bandeau type="erreur" message={erreurMot} />

            <ChampMotDePasse label="Mot de passe actuel" valeur={actuel} onChange={setActuel} erreur={erreursMot.actuel} />
            <ChampMotDePasse label="Nouveau mot de passe" valeur={nouveau} onChange={setNouveau} erreur={erreursMot.nouveau} />

            {nouveau.length > 0 ? (
              <View style={styles.force}>
                <View style={styles.barres}>
                  {[1, 2, 3, 4].map((i) => (
                    <View key={i} style={[styles.barre, { backgroundColor: i <= force ? couleurForce : couleurs.bordure }]} />
                  ))}
                </View>
                {regles.map((r) => (
                  <View key={r.texte} style={styles.regle}>
                    <Ionicons
                      name={r.ok ? 'checkmark-circle' : 'ellipse-outline'}
                      size={16}
                      color={r.ok ? couleurs.succes : couleurs.texteSecondaire}
                    />
                    <Text style={[styles.regleTexte, r.ok && { color: couleurs.succes }]}>{r.texte}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <ChampMotDePasse
              label="Confirmer le nouveau mot de passe"
              valeur={confirmation}
              onChange={setConfirmation}
              erreur={erreursMot.confirmation}
            />
            <Bouton titre="Changer le mot de passe" onPress={changerMotDePasse} chargement={envoiMot} />
          </Panneau>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const creerStyles = () => StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  espace: { marginTop: espaces.m },
  email: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: couleurs.surface2 || couleurs.primaireClair,
    borderRadius: 14,
    padding: espaces.s + 4,
    marginBottom: espaces.m,
  },
  emailTexte: { flex: 1, fontSize: 13, color: couleurs.texteSecondaire },
  indice: { fontSize: 12, color: couleurs.texteSecondaire, marginTop: -espaces.s, marginBottom: espaces.m },
  force: { marginTop: -espaces.xs, marginBottom: espaces.m, gap: 6 },
  barres: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  barre: { flex: 1, height: 5, borderRadius: 3 },
  regle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  regleTexte: { fontSize: 12, color: couleurs.texteSecondaire },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});