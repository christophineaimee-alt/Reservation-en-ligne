import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import api, { messageErreur } from '../../api/client';
import Ecran from '../../components/Ecran';
import ChampTexte from '../../components/ChampTexte';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Chargement from '../../components/Chargement';
import Puce from '../../components/Puce';
import { couleurs, espaces, rayon } from '../../theme';
import { formatDateTexte, prochainsJours } from '../../utils/format';
import { REGEX_HEURE, entier } from '../../utils/saisie';

// UC15 : gérer les disponibilités (créneaux)
export default function DisponibilitesEcran() {
  const jours = useMemo(() => prochainsJours(21), []);
  const [jour, setJour] = useState(jours[0].valeur);
  const [liste, setListe] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [panneau, setPanneau] = useState(null); // null, 'generer' ou 'ajouter'
  const [gen, setGen] = useState({ duree: '60', capacite: '1', debut: jours[0].valeur, fin: jours[6].valeur });
  const [ajout, setAjout] = useState({ debut: '08:00', fin: '09:00', capacite: '1' });
  const [aSupprimer, setASupprimer] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const { data } = await api.get('/commercant/disponibilites', { params: { date: jour } });
      setListe(data.disponibilites);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setChargement(false);
    }
  }, [jour]);

  useEffect(() => {
    charger();
  }, [charger]);

  // Exécute une action, affiche le message, puis recharge la liste
  async function executer(action) {
    setErreur('');
    setSucces('');
    setEnvoi(true);
    try {
      const message = await action();
      if (message) setSucces(message);
      await charger();
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setEnvoi(false);
    }
  }

  function choisirJour(valeur) {
    setErreur('');
    setSucces('');
    setASupprimer(null);
    setJour(valeur);
  }

  function generer() {
    const duree = entier(gen.duree);
    const capacite = entier(gen.capacite);
    if (!duree || duree < 5 || duree > 480) {
      setErreur('Durée invalide (entre 5 et 480 minutes)');
      return;
    }
    if (!capacite || capacite < 1) {
      setErreur('Capacité invalide (1 minimum)');
      return;
    }
    if (gen.fin < gen.debut) {
      setErreur('La date de fin doit être après la date de début');
      return;
    }
    executer(async () => {
      const { data } = await api.post('/commercant/disponibilites/generer', {
        dateDebut: gen.debut,
        dateFin: gen.fin,
        dureeMinutes: duree,
        capacite,
      });
      return data.message;
    });
  }

  function ajouter() {
    const capacite = entier(ajout.capacite);
    if (!REGEX_HEURE.test(ajout.debut) || !REGEX_HEURE.test(ajout.fin)) {
      setErreur('Heure invalide (format HH:mm, par exemple 08:30)');
      return;
    }
    if (ajout.debut >= ajout.fin) {
      setErreur("L'heure de fin doit être après l'heure de début");
      return;
    }
    if (!capacite || capacite < 1) {
      setErreur('Capacité invalide (1 minimum)');
      return;
    }
    executer(async () => {
      const { data } = await api.post('/commercant/disponibilites', {
        date: jour,
        heureDebut: ajout.debut,
        heureFin: ajout.fin,
        capacite,
      });
      return data.message;
    });
  }

  const modifier = (c, corps) =>
    executer(async () => (await api.put(`/commercant/disponibilites/${c.idDisponibilite}`, corps)).data.message);

  function changerCapacite(c, delta) {
    if (c.capacite + delta < 1) return;
    modifier(c, { capacite: c.capacite + delta });
  }

  function supprimer(c) {
    setASupprimer(null);
    executer(async () => (await api.delete(`/commercant/disponibilites/${c.idDisponibilite}`)).data.message);
  }

  return (
    <Ecran centre={false}Carte>
      <View style={styles.actions}>
        <Bouton
          titre="Générer des créneaux"
          variante={panneau === 'generer' ? 'plein' : 'contour'}
          onPress={() => setPanneau(panneau === 'generer' ? null : 'generer')}
          style={styles.action}
        />
        <Bouton
          titre="Ajouter un créneau"
          variante={panneau === 'ajouter' ? 'plein' : 'contour'}
          onPress={() => setPanneau(panneau === 'ajouter' ? null : 'ajouter')}
          style={styles.action}
        />
      </View>

      {panneau === 'generer' ? (
        <View style={styles.panneau}>
          <Text style={styles.panneauTitre}>Générer à partir des horaires</Text>
          <Text style={styles.aide}>Les jours fermés sont ignorés, les créneaux déjà existants sont conservés.</Text>
          <Text style={styles.label}>Du</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.defile}>
            {jours.map((j) => (
              <Puce key={j.valeur} titre={j.libelle} actif={gen.debut === j.valeur} onPress={() => setGen((g) => ({ ...g, debut: j.valeur }))} />
            ))}
          </ScrollView>
          <Text style={styles.label}>Au</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.defile}>
            {jours.map((j) => (
              <Puce key={j.valeur} titre={j.libelle} actif={gen.fin === j.valeur} onPress={() => setGen((g) => ({ ...g, fin: j.valeur }))} />
            ))}
          </ScrollView>
          <ChampTexte label="Durée d'un créneau (minutes)" value={gen.duree} onChangeText={(t) => setGen((g) => ({ ...g, duree: t }))} keyboardType="numeric" />
          <ChampTexte label="Places par créneau" value={gen.capacite} onChangeText={(t) => setGen((g) => ({ ...g, capacite: t }))} keyboardType="numeric" />
          <Bouton titre="Générer" onPress={generer} chargement={envoi} />
        </View>
      ) : null}

      {panneau === 'ajouter' ? (
        <View style={styles.panneau}>
          <Text style={styles.panneauTitre}>Nouveau créneau le {formatDateTexte(jour)}</Text>
          <ChampTexte label="Début (HH:mm)" value={ajout.debut} onChangeText={(t) => setAjout((a) => ({ ...a, debut: t }))} maxLength={5} />
          <ChampTexte label="Fin (HH:mm)" value={ajout.fin} onChangeText={(t) => setAjout((a) => ({ ...a, fin: t }))} maxLength={5} />
          <ChampTexte label="Places" value={ajout.capacite} onChangeText={(t) => setAjout((a) => ({ ...a, capacite: t }))} keyboardType="numeric" />
          <Bouton titre="Ajouter" onPress={ajouter} chargement={envoi} />
        </View>
      ) : null}

      <Bandeau type="succes" message={succes} />
      <Bandeau type="erreur" message={erreur} />

      <Text style={styles.section}>Créneaux du jour</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.defile}>
        {jours.map((j) => (
          <Puce key={j.valeur} titre={j.libelle} actif={jour === j.valeur} onPress={() => choisirJour(j.valeur)} />
        ))}
      </ScrollView>
      <Text style={styles.dateTitre}>{formatDateTexte(jour)}</Text>

      {chargement ? (
        <Chargement />
      ) : liste.length === 0 ? (
        <Text style={styles.vide}>Aucun créneau ce jour-là.</Text>
      ) : (
        liste.map((c) => (
          <View key={c.idDisponibilite} style={[styles.carte, c.bloque && styles.carteBloquee]}>
            <View style={styles.ligne}>
              <Text style={styles.heures}>{c.heureDebut} - {c.heureFin}</Text>
              {c.bloque ? <Text style={styles.badgeBloque}>Bloqué</Text> : null}
            </View>
            <Text style={styles.detail}>
              {c.capacite - c.placesRestantes} réservée(s) sur {c.capacite} place(s)
            </Text>

            <View style={styles.ligneActions}>
              <Pressable style={styles.pm} onPress={() => changerCapacite(c, -1)}>
                <Text style={styles.pmTexte}>−</Text>
              </Pressable>
              <Text style={styles.capacite}>{c.capacite}</Text>
              <Pressable style={styles.pm} onPress={() => changerCapacite(c, 1)}>
                <Text style={styles.pmTexte}>+</Text>
              </Pressable>
              <Bouton
                titre={c.bloque ? 'Débloquer' : 'Bloquer'}
                variante="contour"
                onPress={() => modifier(c, { bloque: !c.bloque })}
                style={styles.petit}
              />
              <Bouton titre="Supprimer" variante="texte" onPress={() => setASupprimer(c.idDisponibilite)} style={styles.petit} />
            </View>

            {aSupprimer === c.idDisponibilite ? (
              <View style={styles.confirmation}>
                <Text style={styles.confirmationTexte}>Supprimer ce créneau ?</Text>
                <Bouton titre="Oui, supprimer" onPress={() => supprimer(c)} chargement={envoi} />
                <Bouton titre="Non" variante="texte" onPress={() => setASupprimer(null)} />
              </View>
            ) : null}
          </View>
        ))
      )}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: espaces.s, marginBottom: espaces.m },
  action: { flex: 1, paddingHorizontal: 8 },
  panneau: {
    backgroundColor: '#F7F7FC',
    borderRadius: rayon,
    borderWidth: 1,
    borderColor: couleurs.primaire,
    padding: espaces.m,
    marginBottom: espaces.m,
  },
  panneauTitre: { fontSize: 17, fontWeight: '700', color: couleurs.texte },
  aide: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: 2, marginBottom: espaces.s },
  label: { fontSize: 14, fontWeight: '600', color: couleurs.texte, marginTop: espaces.s, marginBottom: espaces.xs },
  defile: { flexGrow: 0, marginBottom: espaces.s },
  section: { fontSize: 17, fontWeight: '700', color: couleurs.texte, marginBottom: espaces.s },
  dateTitre: { fontSize: 15, fontWeight: '600', color: couleurs.primaire, marginBottom: espaces.s },
  vide: { fontSize: 14, color: couleurs.texteSecondaire, marginTop: espaces.s },
  carte: {
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espaces.m,
    marginBottom: espaces.s,
  },
  carteBloquee: { opacity: 0.6 },
  ligne: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heures: { fontSize: 17, fontWeight: '700', color: couleurs.texte },
  badgeBloque: {
    fontSize: 12,
    fontWeight: '700',
    color: couleurs.erreur,
    backgroundColor: couleurs.erreurFond,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  detail: { fontSize: 14, color: couleurs.texteSecondaire, marginTop: 2 },
  ligneActions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: espaces.s, gap: espaces.xs },
  pm: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: couleurs.primaire,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pmTexte: { fontSize: 20, color: couleurs.primaire, fontWeight: '700' },
  capacite: { fontSize: 16, fontWeight: '700', color: couleurs.texte, minWidth: 28, textAlign: 'center' },
  petit: { minHeight: 38, paddingHorizontal: 12 },
  confirmation: { marginTop: espaces.s, borderTopWidth: 1, borderTopColor: couleurs.bordure, paddingTop: espaces.s },
  confirmationTexte: { fontSize: 14, color: couleurs.texte, marginBottom: espaces.s },
});