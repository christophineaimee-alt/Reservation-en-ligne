import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import BandeauChiffres from './BandeauChiffres';
import Panneau from './Panneau';
import GraphiqueCourbe from './GraphiqueCourbe';
import { couleurs, espaces } from '../theme';
import { formatDateHeure } from '../utils/format';
import { OPERATEURS, STATUTS_PAIEMENT } from '../utils/paiement';

// 125000 devient « 125 000 »
function milliers(n) {
  return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function compact(v) {
  return v >= 1000 ? `${Math.round(v / 1000)}k` : String(v);
}

// Évaluation des paiements reçus (tableau de bord commerçant)
export default function EvaluationPaiements({ donnees, libellePeriode }) {
  const { width } = useWindowDimensions();
  const large = width >= 900;
  const taux = donnees.tauxReussite;
  const simulation = donnees.mode === 'simulation';

  return (
    <View>
      <View style={styles.entete}>
        <Text style={styles.titre}>Évaluation des paiements</Text>
        <View style={styles.etiquettes}>
          {libellePeriode ? (
            <View style={styles.etiquette}>
              <Text style={styles.etiquetteTexte}>{libellePeriode}</Text>
            </View>
          ) : null}
          {simulation ? (
            <View style={[styles.etiquette, styles.demo]}>
              <Text style={styles.etiquetteTexte}>Démonstration</Text>
            </View>
          ) : null}
        </View>
      </View>

      <BandeauChiffres
        items={[
          { titre: 'Total encaissé', valeur: milliers(donnees.totalEncaisse), note: 'Ar', ton: 'hausse' },
          { titre: 'Paiements reçus', valeur: donnees.nombrePayes, note: 'réussis', ton: 'neutre' },
          {
            titre: 'Taux de réussite',
            valeur: taux === null ? '—' : `${taux} %`,
            note: taux === null ? undefined : taux >= 70 ? 'bon taux' : 'à surveiller',
            ton: taux !== null && taux < 70 ? 'baisse' : 'hausse',
          },
        ]}
      />

      <View style={[styles.deuxColonnes, large && styles.enLigne]}>
        <Panneau titre="Paiements reçus" lien="7 derniers jours" style={large ? { flex: 2 } : null}>
          <GraphiqueCourbe
            donnees={donnees.serie}
            formatAxe={compact}
            formatInfo={(v) => `${milliers(v)} Ar`}
          />
        </Panneau>

        <Panneau titre="À encaisser" style={large ? { flex: 1 } : null}>
          <Text style={styles.grand}>{milliers(donnees.aEncaisser.montant)} Ar</Text>
          <Text style={styles.sous}>
            {donnees.aEncaisser.nombre} réservation{donnees.aEncaisser.nombre > 1 ? 's' : ''} acceptée
            {donnees.aEncaisser.nombre > 1 ? 's' : ''} pas encore payée{donnees.aEncaisser.nombre > 1 ? 's' : ''}
          </Text>

          <Text style={styles.section}>Par opérateur</Text>
          {donnees.parOperateur.length === 0 ? (
            <Text style={styles.vide}>Aucun paiement réussi sur la période.</Text>
          ) : (
            donnees.parOperateur.map((o) => {
              const op = OPERATEURS.find((x) => x.code === o.operateur);
              const part = donnees.totalEncaisse > 0 ? Math.round((o.montant * 100) / donnees.totalEncaisse) : 0;
              return (
                <View key={o.operateur} style={styles.operateur}>
                  <View style={styles.operateurLigne}>
                    <View style={[styles.pastille, { backgroundColor: op ? op.couleur : couleurs.primaire }]}>
                      <Text style={styles.lettre}>{op ? op.lettre : '?'}</Text>
                    </View>
                    <Text style={styles.operateurNom} numberOfLines={1}>{op ? op.nom : o.operateur}</Text>
                    <Text style={styles.operateurMontant}>{milliers(o.montant)} Ar</Text>
                  </View>
                  <View style={styles.piste}>
                    <View style={[styles.barre, { width: `${part}%`, backgroundColor: op ? op.couleur : couleurs.primaire }]} />
                  </View>
                </View>
              );
            })
          )}
        </Panneau>
      </View>

      <Panneau titre="Derniers paiements" style={styles.espace}>
        {donnees.recents.length === 0 ? (
          <Text style={styles.vide}>Aucun paiement pour le moment.</Text>
        ) : (
          donnees.recents.map((p) => {
            const op = OPERATEURS.find((x) => x.code === p.operateur);
            const statut = STATUTS_PAIEMENT[p.statut];
            return (
              <View key={p.idPaiement} style={styles.ligne}>
                <View style={[styles.pastille, { backgroundColor: op ? op.couleur : couleurs.primaire }]}>
                  <Text style={styles.lettre}>{op ? op.lettre : '?'}</Text>
                </View>
                <View style={styles.textes}>
                  <Text style={styles.ligneTitre} numberOfLines={1}>
                    <Text style={styles.gras}>{p.client}</Text> · {p.nomElement}
                  </Text>
                  <Text style={styles.sous} numberOfLines={1}>
                    {p.operateurLibelle} · {formatDateHeure(p.datePaiement || p.createdAt)}
                  </Text>
                </View>
                <View style={styles.droite}>
                  <Text style={styles.montant}>{milliers(p.montant)} Ar</Text>
                  {statut ? (
                    <View style={[styles.etat, { backgroundColor: statut.fond }]}>
                      <Text style={[styles.etatTexte, { color: statut.couleur }]}>{statut.texte}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </Panneau>
    </View>
  );
}

const styles = StyleSheet.create({
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: espaces.m },
  titre: { fontSize: 18, fontWeight: '600', color: couleurs.texte },
  etiquettes: { flexDirection: 'row', gap: 6 },
  etiquette: { backgroundColor: couleurs.primaireClair, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  demo: { backgroundColor: '#FFF4DB' },
  etiquetteTexte: { fontSize: 11, fontWeight: '700', color: couleurs.primaire },
  deuxColonnes: { gap: espaces.m },
  enLigne: { flexDirection: 'row', alignItems: 'flex-start' },
  espace: { marginTop: espaces.m },
  grand: { fontSize: 26, fontWeight: '700', color: couleurs.primaire },
  sous: { fontSize: 12, color: couleurs.texteSecondaire, marginTop: 2 },
  section: { fontSize: 13, fontWeight: '700', color: couleurs.texte, marginTop: espaces.m, marginBottom: espaces.s },
  vide: { fontSize: 13, color: couleurs.texteSecondaire },
  operateur: { marginBottom: espaces.s + 2 },
  operateurLigne: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  operateurNom: { flex: 1, fontSize: 13, fontWeight: '600', color: couleurs.texte },
  operateurMontant: { fontSize: 13, fontWeight: '700', color: couleurs.texte },
  piste: { height: 6, borderRadius: 3, backgroundColor: '#F1F2FA', marginTop: 6, overflow: 'hidden' },
  barre: { height: 6, borderRadius: 3 },
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaces.s + 4,
    backgroundColor: '#F7F7FC',
    borderRadius: 16,
    padding: espaces.s + 4,
    marginBottom: espaces.s,
  },
  pastille: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  lettre: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  textes: { flex: 1 },
  ligneTitre: { fontSize: 14, color: couleurs.texte },
  gras: { fontWeight: '700' },
  droite: { alignItems: 'flex-end', gap: 4 },
  montant: { fontSize: 14, fontWeight: '700', color: couleurs.texte },
  etat: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  etatTexte: { fontSize: 11, fontWeight: '700' },
});