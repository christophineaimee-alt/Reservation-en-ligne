import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import api, { messageErreur } from '../../api/client';
import Ecran from '../../components/Ecran';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Chargement from '../../components/Chargement';
import { couleurs, degrade, espaces, rayon, ombre } from '../../theme';
import { formatDateHeure, formatPrix } from '../../utils/format';
import { recuHtml } from '../../utils/recuHtml';

// Reçu d'un paiement réussi
export default function RecuEcran({ route, navigation }) {
  const { idPaiement } = route.params;
  const [recu, setRecu] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    let actif = true;
    api
      .get(`/paiements/${idPaiement}/recu`)
      .then(({ data }) => {
        if (actif) setRecu(data.recu);
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
  }, [idPaiement]);

  async function telecharger() {
    setEnvoi(true);
    setErreur('');
    try {
      const html = recuHtml(recu);
      if (Platform.OS === 'web') {
        // Dans le navigateur : fenêtre d'impression, choisir « Enregistrer au format PDF »
        await Print.printAsync({ html });
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Reçu de paiement',
            UTI: 'com.adobe.pdf',
          });
        } else {
          await Print.printAsync({ uri });
        }
      }
    } catch (e) {
      setErreur(`Impossible de générer le reçu${e && e.message ? ` : ${e.message}` : ''}`);
    } finally {
      setEnvoi(false);
    }
  }

  if (chargement) return <Chargement />;
  if (!recu) {
    return (
      <Ecran centre={false}>
        <Bandeau type="erreur" message={erreur || 'Reçu introuvable'} />
        <Bouton titre="Retour" variante="contour" onPress={() => navigation.goBack()} />
      </Ecran>
    );
  }

  const boutique = recu.boutique || {};
  const lieu = [boutique.adresse, boutique.ville].filter(Boolean).join(', ');

  return (
    <Ecran centre={false}>
      <Bandeau type="erreur" message={erreur} />
      <View style={styles.ticket}>
        <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.haut}>
          <View style={styles.cercle}>
            <Ionicons name="checkmark" size={30} color={couleurs.primaire} />
          </View>
          <Text style={styles.hautTitre}>Paiement confirmé</Text>
          <Text style={styles.montant}>{formatPrix(recu.montant)}</Text>
          <Text style={styles.hautSous}>Reçu n° {recu.numero}</Text>
        </LinearGradient>

        {recu.simulation ? (
          <View style={styles.demo}>
            <Text style={styles.demoTexte}>Reçu de démonstration : paiement simulé, aucun argent réel prélevé.</Text>
          </View>
        ) : null}

        <View style={styles.corps}>
          <Section titre="Boutique">
            <Ligne titre="Nom" valeur={boutique.nom} />
            <Ligne titre="Adresse" valeur={lieu} />
            <Ligne titre="Téléphone" valeur={boutique.telephone} />
          </Section>
          <Pointille />
          <Section titre="Client">
            <Ligne titre="Nom" valeur={recu.client} />
          </Section>
          <Pointille />
          <Section titre="Détail">
            <Ligne titre="Article" valeur={recu.element.nom} />
            {recu.element.type === 'PRODUIT' ? <Ligne titre="Quantité" valeur={String(recu.element.quantite)} /> : null}
            <Ligne titre="Prix unitaire" valeur={formatPrix(recu.element.prixUnitaire)} />
            <Ligne titre="Rendez-vous" valeur={formatDateHeure(recu.rendezVous)} />
            <Ligne titre="Réservation" valeur={`n° ${recu.idReservation}`} />
          </Section>
          <Pointille />
          <Section titre="Paiement">
            <Ligne titre="Montant payé" valeur={formatPrix(recu.montant)} />
            <Ligne titre="Opérateur" valeur={recu.operateurLibelle} />
            <Ligne titre="Numéro" valeur={recu.telephone} />
            <Ligne titre="Date" valeur={formatDateHeure(recu.datePaiement)} />
            <Ligne titre="Référence" valeur={recu.referenceInterne} />
          </Section>
        </View>
      </View>

      <Bouton
        titre={Platform.OS === 'web' ? 'Imprimer / enregistrer en PDF' : 'Télécharger / partager (PDF)'}
        onPress={telecharger}
        chargement={envoi}
      />
      <Bouton titre="Retour" variante="texte" onPress={() => navigation.goBack()} style={{ marginTop: espaces.s }} />
    </Ecran>
  );
}

function Section({ titre, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitre}>{titre.toUpperCase()}</Text>
      {children}
    </View>
  );
}

function Ligne({ titre, valeur }) {
  if (!valeur) return null;
  return (
    <View style={styles.ligne}>
      <Text style={styles.ligneTitre}>{titre}</Text>
      <Text style={styles.ligneValeur}>{valeur}</Text>
    </View>
  );
}

// Trait en pointillés, comme sur un ticket de caisse
function Pointille() {
  return (
    <View style={styles.pointilleZone}>
      <View style={styles.pointille} />
    </View>
  );
}

const styles = StyleSheet.create({
  ticket: {
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    overflow: 'hidden',
    marginBottom: espaces.m,
    ...ombre,
  },
  haut: { alignItems: 'center', paddingVertical: espaces.l, paddingHorizontal: espaces.m },
  cercle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: couleurs.carte,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaces.s + 4,
  },
  hautTitre: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  montant: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', marginVertical: 4 },
  hautSous: { fontSize: 12, color: 'rgba(255,255,255,0.9)' },
  demo: { backgroundColor: couleurs.avertFond, paddingVertical: 8, paddingHorizontal: espaces.m },
  demoTexte: { fontSize: 12, color: '#8A5A00', textAlign: 'center' },
  corps: { padding: espaces.m },
  section: { marginVertical: espaces.xs },
  sectionTitre: { fontSize: 11, letterSpacing: 0.6, color: couleurs.texteSecondaire, marginBottom: espaces.xs },
  ligne: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, gap: espaces.m },
  ligneTitre: { fontSize: 14, color: couleurs.texteSecondaire },
  ligneValeur: { flex: 1, fontSize: 14, fontWeight: '600', color: couleurs.texte, textAlign: 'right' },
  pointilleZone: { height: 1, overflow: 'hidden', marginVertical: espaces.s + 4 },
  pointille: { height: 2, borderWidth: 1, borderStyle: 'dashed', borderColor: couleurs.bordureForte },
});