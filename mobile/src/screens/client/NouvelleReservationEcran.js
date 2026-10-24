import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api, { messageErreur } from '../../api/client';
import Panneau from '../../components/Panneau';
import Calendrier from '../../components/Calendrier';
import SelecteurCreneau from '../../components/SelecteurCreneau';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Chargement from '../../components/Chargement';
import Puce from '../../components/Puce';
import { couleurs, espaces } from '../../theme';
import { formatDateTexte, formatPrix, libelleType, versYMD } from '../../utils/format';
import { REGEX_HEURE } from '../../utils/saisie';
import PrixPromo from '../../components/PrixPromo';
import RecapPrix from '../../components/RecapPrix';
import { calculerRemise } from '../../utils/promotion';

// UC06 : consulter les disponibilités / UC07 : effectuer une réservation
export default function NouvelleReservationEcran({ route, navigation }) {
  const { idProduitService } = route.params;
  const { width } = useWindowDimensions();
  const large = width >= 900;

  const aujourdhui = useMemo(() => versYMD(new Date()), []);
  const demain = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return versYMD(d);
  }, []);

  const [article, setArticle] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [jour, setJour] = useState(aujourdhui);
  const [dispo, setDispo] = useState(null);
  const [chargementDispo, setChargementDispo] = useState(false);
  const [idCreneau, setIdCreneau] = useState(null);
  const [quantite, setQuantite] = useState(1);
  const [heure, setHeure] = useState('10:00');
  const [remarque, setRemarque] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const service = article ? article.type === 'SERVICE' : false;

  // Fiche de l'élément à réserver
  useEffect(() => {
    api
      .get(`/produits-services/${idProduitService}`)
      .then(({ data }) => {
        setArticle(data.article);
        // Un produit se retire au plus tôt demain
        if (data.article.type === 'PRODUIT') setJour(demain);
      })
      .catch((e) => setErreur(messageErreur(e)))
      .finally(() => setChargement(false));
  }, [idProduitService, demain]);

  // UC06 : créneaux libres du jour choisi (services seulement)
  const chargerCreneaux = useCallback(async () => {
    setChargementDispo(true);
    setIdCreneau(null);
    try {
      const { data } = await api.get(`/produits-services/${idProduitService}/disponibilites`, {
        params: { date: jour },
      });
      setDispo(data);
    } catch (e) {
      setDispo(null);
      setErreur(messageErreur(e));
    } finally {
      setChargementDispo(false);
    }
  }, [idProduitService, jour]);

  useEffect(() => {
    if (article && article.type === 'SERVICE') chargerCreneaux();
  }, [article, chargerCreneaux]);

  function choisirJour(valeur) {
    setErreur('');
    setJour(valeur);
  }

  async function reserver() {
    setErreur('');
    const corps = { idProduitService };
    if (remarque.trim()) corps.remarque = remarque.trim();

    if (service) {
      if (!idCreneau) {
        setErreur('Choisissez un créneau');
        return;
      }
      corps.idDisponibilite = idCreneau;
    } else {
      if (!REGEX_HEURE.test(heure)) {
        setErreur('Heure invalide (format HH:mm, par exemple 10:30)');
        return;
      }
      const dateRetrait = `${jour}T${heure}:00+03:00`;
      if (new Date(dateRetrait) <= new Date()) {
        setErreur('La date de retrait doit être dans le futur');
        return;
      }
      corps.quantite = quantite;
      corps.dateRetrait = dateRetrait;
    }

    setEnvoi(true);
    try {
      const { data } = await api.post('/reservations', corps);
      navigation.replace('ReservationDetail', {
        idReservation: data.reservation.idReservation,
        message: data.message,
      });
    } catch (e) {
      setErreur(messageErreur(e));
      setEnvoi(false);
      if (service) chargerCreneaux(); // un créneau a pu se remplir entre-temps
    }
  }

  if (chargement) return <Chargement />;

  if (!article) {
    return (
      <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
        <View style={{ padding: espaces.m }}>
          <Bandeau type="erreur" message={erreur || 'Élément introuvable'} />
        </View>
      </SafeAreaView>
    );
  }

  const epuise = !service && !article.disponible;
  const total = article.prix * (service ? 1 : quantite);

  const colonneDroite = service ? (
    <Panneau titre={`Créneaux · ${formatDateTexte(jour)}`}>
      {chargementDispo ? (
        <Chargement />
      ) : dispo && dispo.creneaux ? (
        <SelecteurCreneau creneaux={dispo.creneaux} choisi={idCreneau} onChoisir={setIdCreneau} />
      ) : dispo ? (
        <View>
          <Text style={styles.aucun}>{dispo.message || 'Aucune disponibilité à cette date'}</Text>
          {dispo.prochainesDates && dispo.prochainesDates.length > 0 ? (
            <View>
              <Text style={styles.indice}>Prochaines dates disponibles :</Text>
              <View style={styles.rangee}>
                {dispo.prochainesDates.map((d) => (
                  <Puce key={d} titre={formatDateTexte(d)} onPress={() => choisirJour(d)} />
                ))}
              </View>
            </View>
          ) : null}
        </View>
      ) : null}
    </Panneau>
  ) : (
    <Panneau titre={`Retrait · ${formatDateTexte(jour)}`}>
      <Text style={styles.label}>Quantité</Text>
      <View style={styles.stepper}>
        <Pressable style={styles.pm} onPress={() => setQuantite((q) => Math.max(1, q - 1))}>
          <Ionicons name="remove" size={20} color={couleurs.primaire} />
        </Pressable>
        <Text style={styles.qte}>{quantite}</Text>
        <Pressable
          style={styles.pm}
          onPress={() => setQuantite((q) => Math.min(article.quantiteDisponible || 1, q + 1))}
        >
          <Ionicons name="add" size={20} color={couleurs.primaire} />
        </Pressable>
        <Text style={styles.indice}>  {article.quantiteDisponible} en stock</Text>
      </View>

      <Text style={[styles.label, { marginTop: espaces.m }]}>Heure de retrait</Text>
      <TextInput
        style={styles.champ}
        value={heure}
        onChangeText={setHeure}
        placeholder="HH:mm"
        placeholderTextColor={couleurs.texteSecondaire}
        maxLength={5}
      />
    </Panneau>
  );

  return (
    <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={[styles.contenu, { maxWidth: large ? 1000 : 600 }]}>
        <Panneau>
          <View style={styles.resume}>
            <View style={styles.pastille}>
              <Ionicons name={service ? 'sparkles' : 'cube'} size={22} color={couleurs.primaire} />
            </View>
            <View style={styles.resumeTextes}>
              <Text style={styles.type}>{libelleType(article.type)}</Text>
              <Text style={styles.nom} numberOfLines={2}>{article.nom}</Text>
              {article.boutique ? <Text style={styles.boutique}>{article.boutique.nom}</Text> : null}
            </View>
              <PrixPromo prix={article.prix} promotion={article.promotion} style={styles.prix} fin />
          </View>
        </Panneau>

        <View style={styles.espace}>
          <Bandeau type="erreur" message={epuise ? 'Ce produit est épuisé pour le moment' : erreur} />
        </View>

        <View style={[styles.corps, large && styles.enLigne]}>
          <Panneau titre="Choisissez un jour" style={large ? { flex: 1 } : null}>
            <Calendrier choisi={jour} onChoisir={choisirJour} minimum={aujourdhui} />
          </Panneau>
          <View style={large ? { flex: 1 } : styles.espace}>{colonneDroite}</View>
        </View>

        <Panneau titre="Remarque (facultatif)" style={styles.espace}>
          <TextInput
            style={[styles.champ, styles.remarque]}
            value={remarque}
            onChangeText={setRemarque}
            placeholder="Précision pour le commerçant"
            placeholderTextColor={couleurs.texteSecondaire}
            multiline
            maxLength={500}
          />
        </Panneau>

        <Panneau style={styles.espace}>
          <RecapPrix article={article} total={total} />
          <View style={styles.total}>
            <Text style={styles.totalTitre}>Total</Text>
            <Text style={styles.totalValeur}>{formatPrix(total)}</Text>
          </View>
          <Bouton titre="Confirmer la réservation" onPress={reserver} chargement={envoi} desactive={epuise} />
          <Text style={styles.info}>
            Le commerçant doit accepter votre demande. Sans réponse, elle expire automatiquement. Vous pouvez annuler
            jusqu'à 2 h avant.
          </Text>
        </Panneau>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  espace: { marginTop: espaces.m },
  corps: { marginTop: espaces.m },
  enLigne: { flexDirection: 'row', alignItems: 'flex-start', gap: espaces.m },
  resume: { flexDirection: 'row', alignItems: 'center', gap: espaces.m },
  pastille: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: couleurs.primaireClair,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeTextes: { flex: 1 },
  type: { fontSize: 12, fontWeight: '700', color: couleurs.primaire },
  nom: { fontSize: 17, fontWeight: '700', color: couleurs.texte, marginTop: 1 },
  boutique: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: 1 },
  prix: { fontSize: 17, fontWeight: '700', color: couleurs.primaire },
  aucun: { fontSize: 15, color: couleurs.texteSecondaire },
  indice: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: espaces.xs },
  rangee: { flexDirection: 'row', flexWrap: 'wrap', rowGap: espaces.s, marginTop: espaces.s },
  label: { fontSize: 14, fontWeight: '600', color: couleurs.texte, marginBottom: espaces.s },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  pm: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: couleurs.primaireClair,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qte: { fontSize: 20, fontWeight: '700', color: couleurs.texte, minWidth: 52, textAlign: 'center' },
  champ: {
    backgroundColor: '#F1F2FA',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: couleurs.texte,
  },
  remarque: { minHeight: 80, textAlignVertical: 'top' },
  total: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: espaces.m },
  totalTitre: { fontSize: 18, fontWeight: '600', color: couleurs.texte },
  totalValeur: { fontSize: 22, fontWeight: '700', color: couleurs.primaire },
  info: { fontSize: 12, color: couleurs.texteSecondaire, marginTop: espaces.m, textAlign: 'center' },
});