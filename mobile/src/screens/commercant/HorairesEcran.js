import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import api, { messageErreur } from '../../api/client';
import Ecran from '../../components/Ecran';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Chargement from '../../components/Chargement';
import { couleurs, espaces, rayon } from '../../theme';
import { JOURS, ORDRE_JOURS } from '../../utils/format';
import { REGEX_HEURE } from '../../utils/saisie';

// Par défaut : lundi à samedi 08:00 - 17:00, dimanche fermé
function lignesParDefaut() {
  return ORDRE_JOURS.map((jour) => ({ jour, ouvert: jour !== 0, ouverture: '08:00', fermeture: '17:00' }));
}

// UC14 : gérer les horaires d'ouverture
export default function HorairesEcran() {
  const [lignes, setLignes] = useState(lignesParDefaut());
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [aConfirmer, setAConfirmer] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    api
      .get('/commercant/horaires')
      .then(({ data }) => {
        if (data.horaires.length > 0) {
          setLignes(
            ORDRE_JOURS.map((jour) => {
              const h = data.horaires.find((x) => x.jour === jour);
              if (!h) return { jour, ouvert: false, ouverture: '08:00', fermeture: '17:00' };
              return {
                jour,
                ouvert: !h.ferme,
                ouverture: h.heureOuverture || '08:00',
                fermeture: h.heureFermeture || '17:00',
              };
            })
          );
        }
      })
      .catch((e) => setErreur(messageErreur(e)))
      .finally(() => setChargement(false));
  }, []);

  function maj(jour, champs) {
    setAConfirmer(false);
    setLignes((liste) => liste.map((l) => (l.jour === jour ? { ...l, ...champs } : l)));
  }

  async function enregistrer(confirmer) {
    setErreur('');
    setSucces('');
    for (const l of lignes) {
      if (!l.ouvert) continue;
      if (!REGEX_HEURE.test(l.ouverture) || !REGEX_HEURE.test(l.fermeture)) {
        setErreur(`${JOURS[l.jour]} : heure invalide (format HH:mm, par exemple 08:30)`);
        return;
      }
      if (l.ouverture >= l.fermeture) {
        setErreur(`${JOURS[l.jour]} : la fermeture doit être après l'ouverture`);
        return;
      }
    }
    const horaires = lignes.map((l) =>
      l.ouvert
        ? { jour: l.jour, ferme: false, heureOuverture: l.ouverture, heureFermeture: l.fermeture }
        : { jour: l.jour, ferme: true }
    );
    const corps = { horaires };
    if (confirmer) corps.confirmer = true;

    setEnvoi(true);
    try {
      const { data } = await api.put('/commercant/horaires', corps);
      setSucces(data.message);
      setAConfirmer(false);
    } catch (e) {
      const details = e.response && e.response.data && e.response.data.details;
      if (e.response && e.response.status === 409 && details && details.reservationsConcernees) {
        setAConfirmer(true);
      }
      setErreur(messageErreur(e));
    } finally {
      setEnvoi(false);
    }
  }

  if (chargement) return <Chargement />;

  return (
    <Ecran centre={false}Carte>
      <Text style={styles.intro}>
        Ces horaires servent de base à la génération des créneaux de réservation.
      </Text>
      <Bandeau type="succes" message={succes} />
      <Bandeau type="erreur" message={erreur} />

      {lignes.map((l) => (
        <View key={l.jour} style={styles.carte}>
          <View style={styles.entete}>
            <Text style={styles.jour}>{JOURS[l.jour]}</Text>
            <Text style={styles.etat}>{l.ouvert ? 'Ouvert' : 'Fermé'}</Text>
            <Switch value={l.ouvert} onValueChange={(v) => maj(l.jour, { ouvert: v })} trackColor={{ true: couleurs.primaire }} />
          </View>
          {l.ouvert ? (
            <View style={styles.heures}>
              <TextInput
                style={styles.champ}
                value={l.ouverture}
                onChangeText={(t) => maj(l.jour, { ouverture: t })}
                maxLength={5}
                placeholder="08:00"
                placeholderTextColor={couleurs.texteSecondaire}
              />
              <Text style={styles.tiret}>à</Text>
              <TextInput
                style={styles.champ}
                value={l.fermeture}
                onChangeText={(t) => maj(l.jour, { fermeture: t })}
                maxLength={5}
                placeholder="17:00"
                placeholderTextColor={couleurs.texteSecondaire}
              />
            </View>
          ) : null}
        </View>
      ))}

      <Bouton titre="Enregistrer les horaires" onPress={() => enregistrer(false)} chargement={envoi} />
      {aConfirmer ? (
        <Bouton
          titre="Enregistrer quand même"
          variante="contour"
          onPress={() => enregistrer(true)}
          style={{ marginTop: espaces.s }}
        />
      ) : null}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, color: couleurs.texteSecondaire, marginBottom: espaces.m },
  carte: {
    backgroundColor: '#F7F7FC',
    borderRadius: rayon,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espaces.m,
    marginBottom: espaces.s,
  },
  entete: { flexDirection: 'row', alignItems: 'center' },
  jour: { flex: 1, fontSize: 16, fontWeight: '600', color: couleurs.texte },
  etat: { fontSize: 14, color: couleurs.texteSecondaire, marginRight: espaces.s },
  heures: { flexDirection: 'row', alignItems: 'center', marginTop: espaces.s },
  champ: {
    flex: 1,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: rayon,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: couleurs.texte,
    textAlign: 'center',
  },
  tiret: { marginHorizontal: espaces.s, color: couleurs.texteSecondaire },
});