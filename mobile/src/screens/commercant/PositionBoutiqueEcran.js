/*
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import api, { messageErreur } from '../../api/client';
import Ecran from '../../components/Ecran';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import ChampTexte from '../../components/ChampTexte';
import Chargement from '../../components/Chargement';
import CarteOSM from '../../components/CarteOSM';
import { couleurs, espaces, rayon, ombre } from '../../theme';

const ANTANANARIVO = { lat: -18.8792, lng: 47.5079 };

// Le commerçant enregistre la position de sa boutique pour apparaître dans « Autour de moi »
export default function PositionBoutiqueEcran() {
  const [boutique, setBoutique] = useState(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [localisation, setLocalisation] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  useEffect(() => {
    api
      .get('/proximite/ma-boutique')
      .then(({ data }) => {
        setBoutique(data.boutique);
        if (data.boutique.latitude !== null && data.boutique.longitude !== null) {
          setLatitude(String(data.boutique.latitude));
          setLongitude(String(data.boutique.longitude));
        }
      })
      .catch((e) => setErreur(messageErreur(e)))
      .finally(() => setChargement(false));
  }, []);

  async function enregistrer(lat, lng) {
    setEnvoi(true);
    setErreur('');
    setSucces('');
    try {
      const { data } = await api.put('/proximite/ma-boutique', { latitude: lat, longitude: lng });
      setBoutique((b) => ({ ...b, latitude: data.boutique.latitude, longitude: data.boutique.longitude }));
      setLatitude(String(data.boutique.latitude));
      setLongitude(String(data.boutique.longitude));
      setSucces(data.message);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setEnvoi(false);
    }
  }

  async function utiliserMaPosition() {
    setLocalisation(true);
    setErreur('');
    setSucces('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setErreur("Localisation refusée. Autorisez-la dans le navigateur ou le téléphone, ou saisissez les coordonnées à la main.");
        return;
      }
      const p = await Location.getCurrentPositionAsync({});
      await enregistrer(p.coords.latitude, p.coords.longitude);
    } catch (e) {
      setErreur("Impossible d'obtenir votre position. Réessayez ou saisissez les coordonnées à la main.");
    } finally {
      setLocalisation(false);
    }
  }

  function enregistrerSaisie() {
    const lat = Number(latitude.replace(',', '.'));
    const lng = Number(longitude.replace(',', '.'));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setErreur('Saisissez deux nombres, par exemple -18.8792 et 47.5079');
      return;
    }
    enregistrer(lat, lng);
  }

  if (chargement) return <Chargement />;

  const placee = boutique && boutique.latitude !== null && boutique.longitude !== null;
  const centre = placee ? { lat: boutique.latitude, lng: boutique.longitude } : ANTANANARIVO;

  return (
    <Ecran centre={false}>
      <Text style={styles.titre}>Position de la boutique</Text>
      <Text style={styles.sous}>
        {placee
          ? 'Votre boutique apparaît dans « Autour de moi ».'
          : "Sans position, votre boutique n'apparaît pas sur la carte des clients."}
      </Text>
      <Bandeau type="succes" message={succes} />
      <Bandeau type="erreur" message={erreur} />

      <CarteOSM
        centre={centre}
        points={placee ? [{ id: null, nom: boutique.nom, lat: boutique.latitude, lng: boutique.longitude, texte: 'Position enregistrée' }] : []}
        hauteur={260}
      />

      <View style={styles.bloc}>
        <Text style={styles.blocTitre}>Étape 1 : être dans la boutique</Text>
        <Text style={styles.blocTexte}>Placez-vous dans votre boutique, puis appuyez sur le bouton : le GPS enregistre l'emplacement.</Text>
        <Bouton titre="Utiliser ma position actuelle" onPress={utiliserMaPosition} chargement={localisation || envoi} />
      </View>

      <View style={styles.bloc}>
        <Text style={styles.blocTitre}>Ou saisir les coordonnées</Text>
        <Text style={styles.blocTexte}>Copiez-les depuis Google Maps ou OpenStreetMap (clic droit sur l'emplacement).</Text>
        <ChampTexte label="Latitude" placeholder="-18.8792" keyboardType="numeric" value={latitude} onChangeText={setLatitude} />
        <ChampTexte label="Longitude" placeholder="47.5079" keyboardType="numeric" value={longitude} onChangeText={setLongitude} />
        <Bouton titre="Enregistrer ces coordonnées" variante="contour" onPress={enregistrerSaisie} chargement={envoi} />
      </View>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  titre: { fontSize: 24, fontWeight: '700', color: couleurs.texte },
  sous: { fontSize: 14, color: couleurs.texteSecondaire, marginTop: 2, marginBottom: espaces.m },
  bloc: { backgroundColor: couleurs.carte, borderRadius: rayon, padding: espaces.m, marginTop: espaces.m, ...ombre },
  blocTitre: { fontSize: 15, fontWeight: '700', color: couleurs.texte },
  blocTexte: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: 4, marginBottom: espaces.m },
});
*/
import { enregistrerStyles, useThemeVersion } from '../../theme/registre';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import api, { messageErreur } from '../../api/client';
import Ecran from '../../components/Ecran';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import ChampTexte from '../../components/ChampTexte';
import Chargement from '../../components/Chargement';
import CarteOSM from '../../components/CarteOSM';
import { couleurs, espaces, rayon, ombre } from '../../theme';

const ANTANANARIVO = { lat: -18.8792, lng: 47.5079 };

// Le commerçant enregistre la position de sa boutique pour apparaître dans « Autour de moi »
export default function PositionBoutiqueEcran() {
  useThemeVersion();
  const [boutique, setBoutique] = useState(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [localisation, setLocalisation] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  useEffect(() => {
    api
      .get('/proximite/ma-boutique')
      .then(({ data }) => {
        setBoutique(data.boutique);
        if (data.boutique.latitude !== null && data.boutique.longitude !== null) {
          setLatitude(String(data.boutique.latitude));
          setLongitude(String(data.boutique.longitude));
        }
      })
      .catch((e) => setErreur(messageErreur(e)))
      .finally(() => setChargement(false));
  }, []);

  async function enregistrer(lat, lng) {
    setEnvoi(true);
    setErreur('');
    setSucces('');
    try {
      const { data } = await api.put('/proximite/ma-boutique', { latitude: lat, longitude: lng });
      setBoutique((b) => ({ ...b, latitude: data.boutique.latitude, longitude: data.boutique.longitude }));
      setLatitude(String(data.boutique.latitude));
      setLongitude(String(data.boutique.longitude));
      setSucces(data.message);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setEnvoi(false);
    }
  }

  async function utiliserMaPosition() {
    setLocalisation(true);
    setErreur('');
    setSucces('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setErreur("Localisation refusée. Autorisez-la dans le navigateur ou le téléphone, ou saisissez les coordonnées à la main.");
        return;
      }
      const p = await Location.getCurrentPositionAsync({});
      await enregistrer(p.coords.latitude, p.coords.longitude);
    } catch (e) {
      setErreur("Impossible d'obtenir votre position. Réessayez ou saisissez les coordonnées à la main.");
    } finally {
      setLocalisation(false);
    }
  }

  function enregistrerSaisie() {
    const lat = Number(latitude.replace(',', '.'));
    const lng = Number(longitude.replace(',', '.'));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setErreur('Saisissez deux nombres, par exemple -18.8792 et 47.5079');
      return;
    }
    enregistrer(lat, lng);
  }

  if (chargement) return <Chargement />;

  const placee = boutique && boutique.latitude !== null && boutique.longitude !== null;
  const centre = placee ? { lat: boutique.latitude, lng: boutique.longitude } : ANTANANARIVO;

  return (
    <Ecran centre={false}>
      <Text style={styles.titre}>Position de la boutique</Text>
      <Text style={styles.sous}>
        {placee
          ? 'Votre boutique apparaît dans « Autour de moi ».'
          : "Sans position, votre boutique n'apparaît pas sur la carte des clients."}
      </Text>
      <Bandeau type="succes" message={succes} />
      <Bandeau type="erreur" message={erreur} />

      <CarteOSM
        centre={centre}
        points={placee ? [{ id: null, nom: boutique.nom, lat: boutique.latitude, lng: boutique.longitude, texte: 'Position enregistrée' }] : []}
        hauteur={260}
      />

      <View style={styles.bloc}>
        <Text style={styles.blocTitre}>Étape 1 : être dans la boutique</Text>
        <Text style={styles.blocTexte}>Placez-vous dans votre boutique, puis appuyez sur le bouton : le GPS enregistre l'emplacement.</Text>
        <Bouton titre="Utiliser ma position actuelle" onPress={utiliserMaPosition} chargement={localisation || envoi} />
      </View>

      <View style={styles.bloc}>
        <Text style={styles.blocTitre}>Ou saisir les coordonnées</Text>
        <Text style={styles.blocTexte}>Copiez-les depuis Google Maps ou OpenStreetMap (clic droit sur l'emplacement).</Text>
        <ChampTexte label="Latitude" placeholder="-18.8792" keyboardType="numeric" value={latitude} onChangeText={setLatitude} />
        <ChampTexte label="Longitude" placeholder="47.5079" keyboardType="numeric" value={longitude} onChangeText={setLongitude} />
        <Bouton titre="Enregistrer ces coordonnées" variante="contour" onPress={enregistrerSaisie} chargement={envoi} />
      </View>
    </Ecran>
  );
}

const creerStyles = () => StyleSheet.create({
  titre: { fontSize: 24, fontWeight: '700', color: couleurs.texte },
  sous: { fontSize: 14, color: couleurs.texteSecondaire, marginTop: 2, marginBottom: espaces.m },
  bloc: { backgroundColor: couleurs.carte, borderRadius: rayon, padding: espaces.m, marginTop: espaces.m, ...ombre },
  blocTitre: { fontSize: 15, fontWeight: '700', color: couleurs.texte },
  blocTexte: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: 4, marginBottom: espaces.m },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});