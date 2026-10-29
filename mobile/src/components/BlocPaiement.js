import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Bouton from './Bouton';
import { couleurs, espaces, rayon, ombre } from '../theme';
import { formatDateHeure, formatPrix } from '../utils/format';
import { OPERATEURS } from '../utils/paiement';

// Couleurs lues à l'affichage : elles suivent le mode jour ou nuit
function palette(ton) {
  if (ton === 'succes') return { fond: couleurs.succesFond, couleur: couleurs.succes };
  if (ton === 'attention') return { fond: couleurs.attentionFond || couleurs.primaireClair, couleur: couleurs.attention };
  if (ton === 'erreur') return { fond: couleurs.erreurFond, couleur: couleurs.erreur };
  if (ton === 'primaire') return { fond: couleurs.primaireClair, couleur: couleurs.primaire };
  return { fond: couleurs.neutreFond || couleurs.primaireClair, couleur: couleurs.texteSecondaire };
}

function Pastille({ texte, ton }) {
  const p = palette(ton);
  return (
    <View style={[styles.pastille, { backgroundColor: p.fond }]}>
      <View style={[styles.point, { backgroundColor: p.couleur }]} />
      <Text style={[styles.pastilleTexte, { color: p.couleur }]}>{texte}</Text>
    </View>
  );
}

function Ligne({ titre, valeur, fort, vert }) {
  return (
    <View style={styles.ligne}>
      <Text style={[styles.ligneTitre, fort && styles.fort]}>{titre}</Text>
      <Text style={[styles.ligneValeur, fort && styles.fort, vert && { color: couleurs.succes }]}>{valeur}</Text>
    </View>
  );
}

const TON_STATUT = { REUSSI: 'succes', EN_ATTENTE: 'primaire', ECHOUE: 'erreur', EXPIRE: 'neutre' };
const TEXTE_STATUT = { REUSSI: 'Réussi', EN_ATTENTE: 'En cours', ECHOUE: 'Échoué', EXPIRE: 'Expiré' };

// Paiement d'une réservation : résumé, bouton d'action et historique des tentatives
export default function BlocPaiement({ reservation, montant, historique = [], onPayer, onSuivre, onRecu }) {
  const paiement = reservation.paiement;
  const paye = !!reservation.paye;
  const enCours = !!paiement && paiement.statut === 'EN_ATTENTE';
  const accepte = reservation.statut === 'ACCEPTEE';
  const passe = new Date(reservation.dateHeure) < new Date();

  // Rien à dire tant que la demande n'est pas acceptée
  if (!accepte && !paye && !paiement && historique.length === 0) {
    if (reservation.statut !== 'EN_ATTENTE') return null;
    return (
      <View style={styles.carte}>
        <Text style={styles.titre}>Paiement</Text>
        <Text style={styles.info}>Le paiement sera disponible dès que le commerçant aura accepté votre demande.</Text>
      </View>
    );
  }

  const peutPayer = accepte && !paye && !enCours && !passe;
  let etat = { texte: 'Non payé', ton: 'erreur' };
  if (paye) etat = { texte: 'Payé', ton: 'succes' };
  else if (enCours) etat = { texte: 'En cours', ton: 'primaire' };
  else if (accepte && !passe) etat = { texte: 'À payer', ton: 'attention' };

  const remise = Number(reservation.remise) || 0;
  const dernierEchec = !paye && paiement && (paiement.statut === 'ECHOUE' || paiement.statut === 'EXPIRE');
  const operateur = paye && paiement ? OPERATEURS.find((o) => o.code === paiement.operateur) : null;

  return (
    <View style={styles.carte}>
      <View style={styles.entete}>
        <Text style={styles.titre}>Paiement</Text>
        <Pastille texte={etat.texte} ton={etat.ton} />
      </View>

      {remise > 0 && reservation.montantInitial !== null && reservation.montantInitial !== undefined ? (
        <Ligne titre="Prix initial" valeur={formatPrix(reservation.montantInitial)} />
      ) : null}
      {remise > 0 ? (
        <Ligne
          titre={reservation.promotionTitre ? `Promotion « ${reservation.promotionTitre} »` : 'Remise'}
          valeur={`− ${formatPrix(remise)}`}
          vert
        />
      ) : null}
      <Ligne titre={paye ? 'Montant payé' : 'Total à payer'} valeur={formatPrix(paye && paiement ? paiement.montant : montant)} fort />
      {paye && paiement ? (
        <Ligne
          titre="Payé avec"
          valeur={`${operateur ? operateur.nom : paiement.operateur}${paiement.datePaiement ? ` · ${formatDateHeure(paiement.datePaiement)}` : ''}`}
        />
      ) : null}

      {dernierEchec ? (
        <Text style={styles.echec}>
          Dernier essai {paiement.statut === 'EXPIRE' ? 'expiré' : 'échoué'}
          {paiement.messageErreur ? ` : ${paiement.messageErreur}` : ''}
        </Text>
      ) : null}
      {!paye && accepte && passe ? (
        <Text style={styles.info}>Le rendez-vous est passé : le paiement en ligne n'est plus possible.</Text>
      ) : null}
      {paye ? <Text style={styles.info}>Réservation payée : pour l'annuler, contactez la boutique.</Text> : null}

      {enCours ? <Bouton titre="Suivre le paiement en cours" onPress={onSuivre} style={styles.bouton} /> : null}
      {peutPayer ? <Bouton titre={`Payer ${formatPrix(montant)}`} onPress={onPayer} style={styles.bouton} /> : null}
      {paye && paiement ? <Bouton titre="Voir le reçu" variante="contour" onPress={onRecu} style={styles.bouton} /> : null}

      {historique.length > 0 ? (
        <View style={styles.historique}>
          <Text style={styles.sousTitre}>Historique des tentatives</Text>
          {historique.map((p) => {
            const op = OPERATEURS.find((o) => o.code === p.operateur);
            return (
              <View key={p.idPaiement} style={styles.tentative}>
                <View style={[styles.operateur, { backgroundColor: op ? op.couleur : couleurs.primaire }]}>
                  <Text style={styles.operateurLettre}>{op ? op.lettre : '?'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tentativeTitre} numberOfLines={1}>
                    {op ? op.nom : p.operateur} · {formatPrix(p.montant)}
                  </Text>
                  <Text style={styles.tentativeSous} numberOfLines={2}>
                    {formatDateHeure(p.datePaiement || p.createdAt)}
                    {p.messageErreur && p.statut !== 'REUSSI' ? ` · ${p.messageErreur}` : ''}
                  </Text>
                </View>
                <Pastille texte={TEXTE_STATUT[p.statut] || p.statut} ton={TON_STATUT[p.statut] || 'neutre'} />
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  carte: { backgroundColor: couleurs.carte, borderRadius: rayon, padding: espaces.m, marginVertical: espaces.s, ...ombre },
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: espaces.s },
  titre: { fontSize: 16, fontWeight: '700', color: couleurs.texte },
  info: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: espaces.s + 2, lineHeight: 19 },
  echec: { fontSize: 13, color: couleurs.erreur, marginTop: espaces.s + 2 },
  ligne: { flexDirection: 'row', justifyContent: 'space-between', gap: espaces.m, paddingVertical: espaces.xs },
  ligneTitre: { flex: 1, fontSize: 14, color: couleurs.texteSecondaire },
  ligneValeur: { fontSize: 14, fontWeight: '600', color: couleurs.texte, textAlign: 'right' },
  fort: { fontWeight: '800', color: couleurs.texte },
  bouton: { marginTop: espaces.m },
  pastille: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  point: { width: 6, height: 6, borderRadius: 3 },
  pastilleTexte: { fontSize: 12, fontWeight: '700' },
  historique: { marginTop: espaces.m, borderTopWidth: 1, borderTopColor: couleurs.bordure, paddingTop: espaces.m },
  sousTitre: { fontSize: 13, fontWeight: '700', color: couleurs.texte, marginBottom: espaces.s },
  tentative: { flexDirection: 'row', alignItems: 'center', gap: espaces.s + 2, paddingVertical: espaces.s },
  operateur: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  operateurLettre: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  tentativeTitre: { fontSize: 13, fontWeight: '700', color: couleurs.texte },
  tentativeSous: { fontSize: 11, color: couleurs.texteSecondaire, marginTop: 1 },
});