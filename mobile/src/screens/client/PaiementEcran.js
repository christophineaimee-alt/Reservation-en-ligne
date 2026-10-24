import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api, { messageErreur } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Ecran from '../../components/Ecran';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import ChampTexte from '../../components/ChampTexte';
import Chargement from '../../components/Chargement';
import { couleurs, degrade, espaces, rayon, ombre } from '../../theme';
import { formatPrix } from '../../utils/format';
import { OPERATEURS, nomOperateur } from '../../utils/paiement';


// Payer une réservation acceptée : saisie, attente de confirmation, résultat
export default function PaiementEcran({ route, navigation }) {
  const { idReservation, idPaiement: idInitial } = route.params;
  const { utilisateur } = useAuth();
  const [reservation, setReservation] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [phase, setPhase] = useState(idInitial ? 'attente' : 'saisie'); // saisie | attente | fin
  const [operateur, setOperateur] = useState('MVOLA');
  const [telephone, setTelephone] = useState((utilisateur && utilisateur.telephone) || '');
  const [idPaiement, setIdPaiement] = useState(idInitial || null);
  const [paiement, setPaiement] = useState(null);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    let actif = true;
    api
      .get(`/reservations/${idReservation}`)
      .then(({ data }) => {
        if (actif) setReservation(data.reservation);
      })
      .catch((e) => {
        if (actif) setErreur(messageErreur(e));
      })
      .finally(() => {
        if (actif) setChargement(false);
      });
    return () => {
      actif = false;
    };
  }, [idReservation]);

  // Pendant l'attente : on interroge le serveur toutes les 3 secondes
  useEffect(() => {
    if (phase !== 'attente' || !idPaiement) return undefined;
    let actif = true;
    async function verifier() {
      try {
        const { data } = await api.get(`/paiements/${idPaiement}`);
        if (!actif) return;
        setPaiement(data.paiement);
        if (data.termine) setPhase('fin');
      } catch (e) {
        // erreur réseau passagère : on réessaiera au prochain passage
      }
    }
    verifier();
    const minuteur = setInterval(verifier, 3000);
    return () => {
      actif = false;
      clearInterval(minuteur);
    };
  }, [phase, idPaiement]);

  async function payer() {
    setEnvoi(true);
    setErreur('');
    try {
      const { data } = await api.post(`/reservations/${idReservation}/paiement`, { operateur, telephone });
      setIdPaiement(data.paiement.idPaiement);
      setPaiement(data.paiement);
      setPhase('attente');
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setEnvoi(false);
    }
  }

  function reessayer() {
    setErreur('');
    setPaiement(null);
    setIdPaiement(null);
    setPhase('saisie');
  }

  if (chargement && phase === 'saisie') return <Chargement />;

  const element = reservation ? reservation.produitService : null;
  const montant = reservation
    ? reservation.montantTotal !== null && reservation.montantTotal !== undefined
      ? reservation.montantTotal
      : element
        ? element.prix * reservation.quantite
        : 0
    : paiement
      ? paiement.montant
      : 0;
  const choisi = OPERATEURS.find((o) => o.code === operateur);

  // 1. Saisie
  if (phase === 'saisie') {
    return (
      <Ecran centre={false}>
        <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.montantCarte}>
          <Text style={styles.montantLabel}>Montant à payer</Text>
          <Text style={styles.montant}>{formatPrix(montant)}</Text>
          {element ? (
            <Text style={styles.montantDetail} numberOfLines={1}>
              {element.boutique ? `${element.boutique.nom} · ` : ''}
              {element.nom}
            </Text>
          ) : null}
        </LinearGradient>

        <Text style={styles.section}>Choisissez votre opérateur</Text>
        <View style={styles.operateurs}>
          {OPERATEURS.map((o) => {
            const actif = o.code === operateur;
            return (
              <Pressable
                key={o.code}
                onPress={() => setOperateur(o.code)}
                style={[styles.operateur, actif && styles.operateurActif]}
              >
                <View style={[styles.pastille, { backgroundColor: o.couleur }]}>
                  <Text style={styles.lettre}>{o.lettre}</Text>
                </View>
                <Text style={[styles.operateurNom, actif && { color: couleurs.primaire }]} numberOfLines={1}>
                  {o.nom}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ChampTexte
          label={`Numéro ${choisi.nom}`}
          placeholder="034 12 345 67"
          keyboardType="phone-pad"
          value={telephone}
          onChangeText={setTelephone}
        />
        <Text style={styles.indice}>Numéros {choisi.nom} : {choisi.indice}</Text>

        <View style={styles.demo}>
          <Ionicons name="information-circle" size={18} color={couleurs.primaire} />
          <Text style={styles.demoTexte}>
            Mode démonstration : aucun argent réel n'est prélevé. Un numéro terminant par 00 simule un solde
            insuffisant, 99 un refus, 77 une confirmation qui n'arrive pas.
          </Text>
        </View>

        <Bandeau type="erreur" message={erreur} />
        <Bouton titre={`Payer ${formatPrix(montant)}`} onPress={payer} chargement={envoi} />
      </Ecran>
    );
  }

  // 2. Attente de la confirmation sur le téléphone
  if (phase === 'attente') {
    return (
      <Ecran centre={false}>
        <View style={styles.centre}>
          <View style={styles.cercleAttente}>
            <ActivityIndicator size="large" color={couleurs.primaire} />
          </View>
          <Text style={styles.titreEtat}>Confirmez sur votre téléphone</Text>
          <Text style={styles.texteEtat}>
            {paiement
              ? `Une demande de ${formatPrix(paiement.montant)} a été envoyée à ${paiement.operateurLibelle} (${paiement.telephone}).`
              : 'Nous vérifions votre paiement.'}
          </Text>
          <Text style={styles.petit}>Cette page se met à jour toute seule, toutes les 3 secondes.</Text>
        </View>
        <Bouton titre="Fermer (le paiement continue)" variante="texte" onPress={() => navigation.goBack()} />
      </Ecran>
    );
  }

  // 3. Résultat
  const reussi = paiement && paiement.statut === 'REUSSI';
  const expire = paiement && paiement.statut === 'EXPIRE';
  return (
    <Ecran centre={false}>
      <View style={styles.centre}>
        {reussi ? (
          <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cercle}>
            <Ionicons name="checkmark" size={46} color="#FFFFFF" />
          </LinearGradient>
        ) : (
          <View style={[styles.cercle, { backgroundColor: couleurs.erreur }]}>
            <Ionicons name="close" size={46} color="#FFFFFF" />
          </View>
        )}
        <Text style={styles.titreEtat}>
          {reussi ? 'Paiement confirmé' : expire ? 'Paiement expiré' : 'Paiement échoué'}
        </Text>
        {reussi ? (
          <Text style={styles.texteEtat}>
            {formatPrix(paiement.montant)} payés avec {paiement.operateurLibelle}.
          </Text>
        ) : (
          <Text style={styles.texteEtat}>{(paiement && paiement.messageErreur) || 'Le paiement n\'a pas abouti.'}</Text>
        )}
        {paiement ? (
          <Text style={styles.petit}>
            {nomOperateur(paiement.operateur)} · {paiement.telephone}
          </Text>
        ) : null}
      </View>
            {reussi ? (
        <View>
          <Bouton titre="Voir le reçu" onPress={() => navigation.navigate('Recu', { idPaiement: paiement.idPaiement })} />
          <Bouton titre="Terminer" variante="texte" onPress={() => navigation.goBack()} style={{ marginTop: espaces.s }} />
        </View>
      ) : (
        <View>
          <Bouton titre="Réessayer" onPress={reessayer} />
          <Bouton titre="Retour" variante="texte" onPress={() => navigation.goBack()} style={{ marginTop: espaces.s }} />
        </View>
      )}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  montantCarte: { borderRadius: rayon, padding: espaces.l, marginBottom: espaces.l, ...ombre },
  montantLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  montant: { fontSize: 34, fontWeight: '800', color: '#FFFFFF', marginTop: 4 },
  montantDetail: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: espaces.s },
  section: { fontSize: 16, fontWeight: '700', color: couleurs.texte, marginBottom: espaces.s },
  operateurs: { flexDirection: 'row', gap: espaces.s, marginBottom: espaces.m },
  operateur: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: couleurs.carte,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingVertical: espaces.m,
    paddingHorizontal: 4,
    ...ombre,
  },
  operateurActif: { borderColor: couleurs.primaire, backgroundColor: couleurs.primaireClair },
  pastille: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  lettre: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  operateurNom: { fontSize: 12, fontWeight: '700', color: couleurs.texte, textAlign: 'center' },
  indice: { fontSize: 12, color: couleurs.texteSecondaire, marginTop: -espaces.s, marginBottom: espaces.m },
  demo: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: couleurs.primaireClair,
    borderRadius: 14,
    padding: espaces.s + 4,
    marginBottom: espaces.m,
  },
  demoTexte: { flex: 1, fontSize: 12, color: couleurs.texte },
  centre: { alignItems: 'center', paddingVertical: espaces.xl },
  cercle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: espaces.l },
  cercleAttente: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: couleurs.primaireClair,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaces.l,
  },
  titreEtat: { fontSize: 22, fontWeight: '700', color: couleurs.texte, textAlign: 'center' },
  texteEtat: { fontSize: 15, color: couleurs.texte, textAlign: 'center', marginTop: espaces.s, paddingHorizontal: espaces.m },
  petit: { fontSize: 12, color: couleurs.texteSecondaire, textAlign: 'center', marginTop: espaces.s },
});