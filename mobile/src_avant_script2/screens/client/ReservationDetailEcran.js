import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api, { messageErreur } from '../../api/client';
import Ecran from '../../components/Ecran';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Chargement from '../../components/Chargement';
import BadgeStatut from '../../components/BadgeStatut';
import BadgePaiement from '../../components/BadgePaiement';
import { couleurs, espaces, rayon, ombre } from '../../theme';
import { formatDateHeure, formatPrix, libelleQuand } from '../../utils/format';
import { STATUTS_ACTIFS } from '../../utils/statuts';
import { nomOperateur } from '../../utils/paiement';
import BlocAvis from '../../components/BlocAvis';

// UC09 : détail d'une réservation / UC08 : annuler / paiement
export default function ReservationDetailEcran({ route, navigation }) {
  const { idReservation } = route.params;
  const [reservation, setReservation] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState((route.params && route.params.message) || '');
  const [confirmer, setConfirmer] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(async () => {
    try {
      const { data } = await api.get(`/reservations/${idReservation}`);
      setReservation(data.reservation);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setChargement(false);
    }
  }, [idReservation]);

  // Recharge à chaque retour sur l'écran (par exemple après un paiement)
  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger])
  );

  async function annuler() {
    setEnvoi(true);
    setErreur('');
    setSucces('');
    try {
      const { data } = await api.patch(`/reservations/${idReservation}/annulation`);
      setSucces(data.message);
      setConfirmer(false);
      await charger();
    } catch (e) {
      setErreur(messageErreur(e));
      setConfirmer(false);
    } finally {
      setEnvoi(false);
    }
  }

  if (chargement) return <Chargement />;
  if (!reservation) {
    return (
      <Ecran centre={false}>
        <Bandeau type="erreur" message={erreur || 'Réservation introuvable'} />
      </Ecran>
    );
  }

  const element = reservation.produitService;
  const produit = element && element.type === 'PRODUIT';
  const montant =
    reservation.montantTotal !== null && reservation.montantTotal !== undefined
      ? reservation.montantTotal
      : element
        ? element.prix * reservation.quantite
        : 0;
  const paiement = reservation.paiement;
  const enCours = paiement && paiement.statut === 'EN_ATTENTE';
  const rendezVousPasse = new Date(reservation.dateHeure) < new Date();
  const peutPayer = reservation.statut === 'ACCEPTEE' && !reservation.paye && !enCours && !rendezVousPasse;
  const dernierEchec = paiement && (paiement.statut === 'ECHOUE' || paiement.statut === 'EXPIRE');
  const annulable = STATUTS_ACTIFS.includes(reservation.statut) && !reservation.paye;

  return (
    <Ecran centre={false}>
      <Bandeau type="succes" message={succes} />
      <Bandeau type="erreur" message={erreur} />

      <View style={styles.entete}>
        <Text style={styles.numero}>Réservation n° {reservation.idReservation}</Text>
        <View style={styles.badges}>
          <BadgeStatut statut={reservation.statut} />
          <BadgePaiement reservation={reservation} />
        </View>
      </View>
      <Text style={styles.nom}>{element ? element.nom : 'Élément supprimé'}</Text>
      {element && element.boutique ? (
        <Text style={styles.boutique}>
          {element.boutique.nom}
          {element.boutique.ville ? ` · ${element.boutique.ville}` : ''}
        </Text>
      ) : null}

      <View style={styles.bloc}>
        <Ligne titre={produit ? 'Retrait' : 'Rendez-vous'} valeur={libelleQuand(reservation)} />
        {produit ? <Ligne titre="Quantité" valeur={String(reservation.quantite)} /> : null}
        {reservation.remise > 0 && reservation.montantInitial !== null ? (
          <Ligne titre="Prix initial" valeur={formatPrix(reservation.montantInitial)} />
        ) : null}
        {reservation.remise > 0 ? (
          <Ligne
            titre={reservation.promotionTitre ? `Promotion « ${reservation.promotionTitre} »` : 'Remise'}
            valeur={`− ${formatPrix(reservation.remise)}`}
          />
        ) : null}
        <Ligne titre="Total" valeur={formatPrix(montant)} />
        {reservation.remarque ? <Ligne titre="Remarque" valeur={reservation.remarque} /> : null}
        <Ligne titre="Demandée le" valeur={formatDateHeure(reservation.createdAt)} />
      </View>

      {reservation.statut === 'EN_ATTENTE' ? (
        <Text style={styles.note}>
          Réponse du commerçant attendue avant le {formatDateHeure(reservation.dateExpiration)}. Vous pourrez payer
          après son acceptation.
        </Text>
      ) : null}
      {reservation.statut === 'REFUSEE' ? (
        <View style={styles.refus}>
          <Text style={styles.refusTitre}>Motif du refus</Text>
          <Text style={styles.refusTexte}>{reservation.motifRefus || 'Aucun motif précisé'}</Text>
        </View>
      ) : null}
      {reservation.statut === 'EXPIREE' ? (
        <Text style={styles.note}>Le commerçant n'a pas répondu à temps : la demande a expiré.</Text>
      ) : null}

      {reservation.paye && paiement ? (
        <View style={styles.paye}>
          <Ionicons name="checkmark-circle" size={28} color={couleurs.succes} />
          <View style={styles.payeTextes}>
            <Text style={styles.payeTitre}>Payé : {formatPrix(paiement.montant)}</Text>
            <Text style={styles.payeDetail}>
              {nomOperateur(paiement.operateur)}
              {paiement.datePaiement ? ` · ${formatDateHeure(paiement.datePaiement)}` : ''}
            </Text>
          </View>
        </View>
      ) : null}
      {reservation.paye && paiement ? (
        <Bouton
          titre="Voir le reçu"
          variante="contour"
          onPress={() => navigation.navigate('Recu', { idPaiement: paiement.idPaiement })}
          style={styles.espace}
        />
      ) : null}
      {reservation.paye ? (
        <Text style={styles.note}>
          Cette réservation est payée : pour l'annuler, contactez la boutique.
        </Text>
      ) : null}

      {enCours ? (
        <Bouton
          titre="Suivre le paiement en cours"
          onPress={() => navigation.navigate('Paiement', { idReservation, idPaiement: paiement.idPaiement })}
          style={styles.espace}
        />
      ) : null}
      {peutPayer ? (
        <View style={styles.espace}>
          {dernierEchec ? (
            <Text style={styles.echec}>
              Dernier essai {paiement.statut === 'EXPIRE' ? 'expiré' : 'échoué'}
              {paiement.messageErreur ? ` : ${paiement.messageErreur}` : ''}
            </Text>
          ) : null}
          <Bouton titre={`Payer ${formatPrix(montant)}`} onPress={() => navigation.navigate('Paiement', { idReservation })} />
        </View>
      ) : null}
      <BlocAvis
        reservation={reservation}
        onDonner={() => navigation.navigate('DonnerAvis', { idReservation, nomElement: element ? element.nom : '' })}
        onModifier={() =>
          navigation.navigate('DonnerAvis', { idReservation, avis: reservation.avis, nomElement: element ? element.nom : '' })
        }
      />

      {annulable && !confirmer ? (
        <Bouton titre="Annuler la réservation" variante="contour" onPress={() => setConfirmer(true)} style={styles.espace} />
      ) : null}
      {annulable && confirmer ? (
        <View style={styles.confirmation}>
          <Text style={styles.confirmationTexte}>Voulez-vous vraiment annuler cette réservation ?</Text>
          <Bouton titre="Oui, annuler" onPress={annuler} chargement={envoi} />
          <Bouton titre="Non, la garder" variante="texte" onPress={() => setConfirmer(false)} />
        </View>
      ) : null}
    </Ecran>
  );
}

function Ligne({ titre, valeur }) {
  return (
    <View style={styles.ligne}>
      <Text style={styles.ligneTitre}>{titre}</Text>
      <Text style={styles.ligneValeur}>{valeur}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  badges: { alignItems: 'flex-end', gap: 4 },
  numero: { fontSize: 14, color: couleurs.texteSecondaire },
  nom: { fontSize: 24, fontWeight: '700', color: couleurs.texte, marginTop: espaces.s },
  boutique: { fontSize: 14, color: couleurs.primaire, fontWeight: '600', marginTop: 2 },
  bloc: {
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    padding: espaces.m,
    marginVertical: espaces.m,
    ...ombre,
  },
  ligne: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: espaces.xs },
  ligneTitre: { fontSize: 14, color: couleurs.texteSecondaire, marginRight: espaces.m },
  ligneValeur: { flex: 1, fontSize: 14, color: couleurs.texte, fontWeight: '600', textAlign: 'right' },
  note: { fontSize: 14, color: couleurs.texteSecondaire, marginBottom: espaces.m },
  refus: { backgroundColor: couleurs.erreurFond, borderRadius: rayon, padding: espaces.m, marginBottom: espaces.m },
  refusTitre: { fontSize: 14, fontWeight: '700', color: couleurs.erreur },
  refusTexte: { fontSize: 14, color: couleurs.texte, marginTop: espaces.xs },
  paye: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaces.s + 4,
    backgroundColor: couleurs.succesFond,
    borderRadius: rayon,
    padding: espaces.m,
    marginBottom: espaces.m,
  },
  payeTextes: { flex: 1 },
  payeTitre: { fontSize: 16, fontWeight: '700', color: couleurs.succes },
  payeDetail: { fontSize: 13, color: couleurs.texte, marginTop: 2 },
  echec: { fontSize: 13, color: couleurs.erreur, marginBottom: espaces.s },
  espace: { marginTop: espaces.s },
  confirmation: { backgroundColor: couleurs.carte, borderRadius: rayon, padding: espaces.m, ...ombre },
  confirmationTexte: { fontSize: 15, color: couleurs.texte, marginBottom: espaces.m },
});