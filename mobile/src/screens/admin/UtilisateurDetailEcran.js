import { enregistrerStyles, useThemeVersion } from '../../theme/registre';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api, { messageErreur } from '../../api/client';
import Panneau from '../../components/Panneau';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Chargement from '../../components/Chargement';
import Badge from '../../components/Badge';
import LigneInfo from '../../components/LigneInfo';
import { useAuth } from '../../context/AuthContext';
import { couleurs, degrade, espaces, rayon, ombre } from '../../theme';
import { formatDateHeure, initiale } from '../../utils/format';
import { infoRole, infoStatutCompte } from '../../utils/statuts';

// UC22 : fiche d'un compte, suspendre / réactiver / supprimer
export default function UtilisateurDetailEcran({ route, navigation }) {
  useThemeVersion();
  const { idUser } = route.params;
  const { utilisateur: moi } = useAuth();
  const { width } = useWindowDimensions();

  const [compte, setCompte] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [confirmation, setConfirmation] = useState(null); // null, 'SUSPENDRE' ou 'SUPPRIMER'
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(async () => {
    try {
      const { data } = await api.get(`/admin/utilisateurs/${idUser}`);
      setCompte(data.utilisateur);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setChargement(false);
    }
  }, [idUser]);

  useEffect(() => {
    charger();
  }, [charger]);

  async function agir(actionDemandee) {
    setErreur('');
    setSucces('');
    setEnvoi(true);
    try {
      const { data } = await api.patch(`/admin/utilisateurs/${idUser}/action`, { action: actionDemandee });
      if (actionDemandee === 'SUPPRIMER') {
        navigation.goBack();
        return;
      }
      setSucces(data.message);
      setConfirmation(null);
      await charger();
    } catch (e) {
      setErreur(messageErreur(e));
      setConfirmation(null);
    }
    setEnvoi(false);
  }

  if (chargement) return <Chargement />;

  if (!compte) {
    return (
      <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
        <View style={{ padding: espaces.m }}>
          <Bandeau type="erreur" message={erreur || 'Utilisateur introuvable'} />
        </View>
      </SafeAreaView>
    );
  }

  const estMoi = moi && moi.idUser === compte.idUser;
  const estAdmin = compte.role === 'ADMIN';

  return (
    <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={[styles.contenu, { maxWidth: width >= 900 ? 760 : 600 }]}>
        <Bandeau type="succes" message={succes} />
        <Bandeau type="erreur" message={erreur} />

        <View style={styles.heroZone}>
          <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.avatar}>
              <Text style={styles.lettre}>{initiale(compte.prenom)}</Text>
            </View>
            <Text style={styles.nom}>{compte.prenom} {compte.nom}</Text>
            <View style={styles.badges}>
              <Badge info={infoRole(compte.role)} />
              <Badge info={infoStatutCompte(compte.statutCompte)} />
            </View>
          </LinearGradient>
        </View>

        <Panneau titre="Informations" style={styles.espace}>
          <LigneInfo icone="mail" titre="E-mail" valeur={compte.email} />
          <LigneInfo icone="call" titre="Téléphone" valeur={compte.telephone} />
          <LigneInfo icone="warning" titre="Échecs de connexion" valeur={String(compte.nbEchecs)} />
          <LigneInfo icone="calendar" titre="Inscrit le" valeur={formatDateHeure(compte.createdAt)} />
        </Panneau>

        {estMoi ? (
          <Text style={styles.note}>C'est votre compte : vous ne pouvez pas le suspendre ni le supprimer.</Text>
        ) : (
          <Panneau titre="Actions" style={styles.espace}>
            {compte.statutCompte !== 'ACTIF' ? (
              <Bouton titre="Réactiver le compte" onPress={() => agir('REACTIVER')} chargement={envoi} />
            ) : null}

            {compte.statutCompte !== 'SUSPENDU' && confirmation !== 'SUSPENDRE' ? (
              <Bouton
                titre="Suspendre le compte"
                variante="danger"
                onPress={() => setConfirmation('SUSPENDRE')}
                style={compte.statutCompte !== 'ACTIF' ? styles.espaceBouton : null}
              />
            ) : null}

            {confirmation === 'SUSPENDRE' ? (
              <View>
                <Text style={styles.aide}>
                  Suspendre ce compte ? L'utilisateur ne pourra plus se connecter et sera prévenu.
                </Text>
                <Bouton titre="Oui, suspendre" variante="danger" onPress={() => agir('SUSPENDRE')} chargement={envoi} />
                <Bouton titre="Retour" variante="texte" onPress={() => setConfirmation(null)} />
              </View>
            ) : null}

            {!estAdmin && confirmation !== 'SUPPRIMER' ? (
              <Bouton
                titre="Supprimer le compte"
                variante="texte"
                onPress={() => setConfirmation('SUPPRIMER')}
                style={styles.espaceBouton}
              />
            ) : null}

            {confirmation === 'SUPPRIMER' ? (
              <View style={styles.espaceBouton}>
                <Text style={styles.aide}>
                  Supprimer définitivement ce compte ? C'est impossible s'il a des réservations : suspendez-le alors.
                </Text>
                <Bouton titre="Oui, supprimer" variante="danger" onPress={() => agir('SUPPRIMER')} chargement={envoi} />
                <Bouton titre="Retour" variante="texte" onPress={() => setConfirmation(null)} />
              </View>
            ) : null}
          </Panneau>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const creerStyles = () => StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  espace: { marginTop: espaces.m },
  espaceBouton: { marginTop: espaces.s },
  heroZone: { backgroundColor: couleurs.carte, borderRadius: rayon, ...ombre },
  hero: { borderRadius: rayon, paddingVertical: espaces.xl, alignItems: 'center' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lettre: { fontSize: 34, fontWeight: '700', color: '#FFFFFF' },
  nom: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginTop: espaces.m },
  badges: { flexDirection: 'row', gap: espaces.s, marginTop: espaces.s },
  note: { fontSize: 14, color: couleurs.texteSecondaire, marginTop: espaces.m },
  aide: { fontSize: 14, color: couleurs.texteSecondaire, marginVertical: espaces.m, lineHeight: 20 },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});