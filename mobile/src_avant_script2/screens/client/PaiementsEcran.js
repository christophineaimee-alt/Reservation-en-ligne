import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api, { messageErreur } from '../../api/client';
import EnTetePage from '../../components/EnTetePage';
import BandeauChiffres from '../../components/BandeauChiffres';
import Panneau from '../../components/Panneau';
import Puce from '../../components/Puce';
import Bandeau from '../../components/Bandeau';
import Chargement from '../../components/Chargement';
import { couleurs, espaces, rayon } from '../../theme';
import { formatDateHeure, formatPrix, libelleQuand } from '../../utils/format';
import { OPERATEURS } from '../../utils/paiement';

const FILTRES = [
  { titre: 'Tous', valeur: '' },
  { titre: 'Réussis', valeur: 'REUSSI' },
  { titre: 'En cours', valeur: 'EN_ATTENTE' },
  { titre: 'Échoués', valeur: 'ECHOUE' },
];

const STATUTS = {
  REUSSI: { texte: 'Réussi', fond: couleurs.succesFond, couleur: couleurs.succes },
  EN_ATTENTE: { texte: 'En cours', fond: couleurs.primaireClair, couleur: couleurs.primaire },
  ECHOUE: { texte: 'Échoué', fond: couleurs.erreurFond, couleur: couleurs.erreur },
  EXPIRE: { texte: 'Expiré', fond: couleurs.neutreFond, couleur: couleurs.texteSecondaire },
};

// Paiements du client : à payer, en cours et historique
export default function PaiementsEcran({ navigation }) {
  const { width } = useWindowDimensions();
  const large = width >= 900;
  const [filtre, setFiltre] = useState('');
  const [donnees, setDonnees] = useState(null);
  const [aPayer, setAPayer] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [rafraichit, setRafraichit] = useState(false);
  const [erreur, setErreur] = useState('');

  const charger = useCallback(async () => {
    try {
      setErreur('');
      const [paiements, acceptees] = await Promise.all([
        api.get('/paiements', { params: { statut: filtre || undefined, limite: 30 } }),
        api.get('/reservations', { params: { statut: 'ACCEPTEE', limite: 30 } }),
      ]);
      setDonnees(paiements.data);
      const maintenant = new Date();
      setAPayer(
        acceptees.data.reservations.filter(
          (r) => !r.paye && !(r.paiement && r.paiement.statut === 'EN_ATTENTE') && new Date(r.dateHeure) > maintenant
        )
      );
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setChargement(false);
      setRafraichit(false);
    }
  }, [filtre]);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger])
  );

  function choisirFiltre(valeur) {
    setChargement(true);
    setFiltre(valeur);
  }

  function ouvrir(p) {
    if (p.statut === 'EN_ATTENTE') {
      navigation.navigate('Paiement', { idReservation: p.idReservation, idPaiement: p.idPaiement });
    } else if (p.statut === 'REUSSI') {
      navigation.navigate('Recu', { idPaiement: p.idPaiement });
    } else {
      navigation.navigate('ReservationDetail', { idReservation: p.idReservation });
    }
  }
  return (
    <SafeAreaView style={styles.zone}>
      <ScrollView
        contentContainerStyle={[styles.contenu, { maxWidth: large ? 1100 : 600 }]}
        refreshControl={
          <RefreshControl
            refreshing={rafraichit}
            onRefresh={() => {
              setRafraichit(true);
              charger();
            }}
          />
        }
      >
        <EnTetePage
          titre="Paiements"
          sousTitre="Réglez vos réservations acceptées et retrouvez votre historique"
          onNotifications={() => navigation.navigate('Notifications')}
        />

        {donnees && donnees.mode === 'simulation' ? (
          <View style={styles.demo}>
            <Ionicons name="information-circle" size={20} color={couleurs.primaire} />
            <Text style={styles.demoTexte}>
              Mode démonstration : les paiements sont simulés, aucun argent réel n'est prélevé.
            </Text>
          </View>
        ) : null}
        <Bandeau type="erreur" message={erreur} />

        {chargement && !donnees ? (
          <Chargement />
        ) : donnees ? (
          <View>
            <BandeauChiffres
              items={[
                {
                  titre: 'Paiements réussis',
                  valeur: donnees.nombrePayes,
                  note: formatPrix(donnees.totalPaye),
                  ton: 'hausse',
                },
                { titre: 'À payer', valeur: aPayer.length, note: 'réservations', ton: aPayer.length > 0 ? 'baisse' : 'neutre' },
                { titre: 'En cours', valeur: donnees.nombreEnCours, note: 'paiements', ton: 'neutre' },
              ]}
            />

            <Panneau titre="À payer">
              {aPayer.length === 0 ? (
                <Text style={styles.vide}>Aucune réservation acceptée en attente de paiement.</Text>
              ) : (
                aPayer.map((r) => {
                  const element = r.produitService;
                  return (
                    <View key={r.idReservation} style={styles.ligne}>
                      <View style={styles.textes}>
                        <Text style={styles.titre} numberOfLines={1}>{element ? element.nom : 'Réservation'}</Text>
                        <Text style={styles.sous} numberOfLines={1}>
                          {element && element.boutique ? `${element.boutique.nom} · ` : ''}
                          {libelleQuand(r)}
                        </Text>
                      </View>
                      <View style={styles.droite}>
                        <Text style={styles.montant}>{formatPrix(r.montantTotal)}</Text>
                        <Pressable
                          onPress={() => navigation.navigate('Paiement', { idReservation: r.idReservation })}
                          style={styles.payer}
                        >
                          <Text style={styles.payerTexte}>Payer</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })
              )}
            </Panneau>

            <Panneau titre="Historique" style={styles.espace}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtres}>
                {FILTRES.map((f) => (
                  <Puce key={f.valeur} titre={f.titre} actif={filtre === f.valeur} onPress={() => choisirFiltre(f.valeur)} />
                ))}
              </ScrollView>
              {donnees.paiements.length === 0 ? (
                <Text style={styles.vide}>Aucun paiement pour le moment.</Text>
              ) : (
                donnees.paiements.map((p) => {
                  const operateur = OPERATEURS.find((o) => o.code === p.operateur);
                  const statut = STATUTS[p.statut];
                  return (
                    <Pressable key={p.idPaiement} onPress={() => ouvrir(p)} style={styles.ligne}>
                      <View style={[styles.pastille, { backgroundColor: operateur ? operateur.couleur : couleurs.primaire }]}>
                        <Text style={styles.lettre}>{operateur ? operateur.lettre : '?'}</Text>
                      </View>
                      <View style={styles.textes}>
                        <Text style={styles.titre} numberOfLines={1}>{p.reservation.nomElement}</Text>
                        <Text style={styles.sous} numberOfLines={1}>
                          {p.reservation.boutique} · {formatDateHeure(p.datePaiement || p.createdAt)}
                        </Text>
                      </View>
                      <View style={styles.droite}>
                        <Text style={styles.montant}>{formatPrix(p.montant)}</Text>
                        {statut ? (
                          <View style={[styles.etat, { backgroundColor: statut.fond }]}>
                            <Text style={[styles.etatTexte, { color: statut.couleur }]}>{statut.texte}</Text>
                          </View>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })
              )}
            </Panneau>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  demo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: couleurs.primaireClair,
    borderRadius: rayon,
    padding: espaces.m,
    marginBottom: espaces.m,
  },
  demoTexte: { flex: 1, fontSize: 13, color: couleurs.texte },
  espace: { marginTop: espaces.m },
  filtres: { marginBottom: espaces.m },
  vide: { fontSize: 14, color: couleurs.texteSecondaire },
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaces.s + 4,
    backgroundColor: couleurs.surface2,
    borderRadius: 16,
    padding: espaces.s + 4,
    marginBottom: espaces.s,
  },
  pastille: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  lettre: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  textes: { flex: 1 },
  titre: { fontSize: 14, fontWeight: '700', color: couleurs.texte },
  sous: { fontSize: 12, color: couleurs.texteSecondaire, marginTop: 2 },
  droite: { alignItems: 'flex-end', gap: 4 },
  montant: { fontSize: 14, fontWeight: '700', color: couleurs.texte },
  etat: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  etatTexte: { fontSize: 11, fontWeight: '700' },
  payer: { backgroundColor: couleurs.primaire, borderRadius: 18, paddingHorizontal: 16, height: 32, alignItems: 'center', justifyContent: 'center' },
  payerTexte: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});