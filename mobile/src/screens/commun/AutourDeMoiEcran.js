
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import api, { messageErreur } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Ecran from '../../components/Ecran';
import Bandeau from '../../components/Bandeau';
import ChampTexte from '../../components/ChampTexte';
import Puce from '../../components/Puce';
import CarteOSM from '../../components/CarteOSM';
import { couleurs, espaces, rayon, ombre } from '../../theme';
import { formatPrix } from '../../utils/format';

// Villes proposées quand la localisation est refusée ou indisponible
const VILLES = [
  { nom: 'Antananarivo', lat: -18.8792, lng: 47.5079 },
  { nom: 'Toamasina', lat: -18.1492, lng: 49.4023 },
  { nom: 'Antsirabe', lat: -19.8659, lng: 47.0333 },
  { nom: 'Mahajanga', lat: -15.7167, lng: 46.3167 },
  { nom: 'Fianarantsoa', lat: -21.4536, lng: 47.0857 },
  { nom: 'Toliara', lat: -23.35, lng: 43.6667 },
  { nom: 'Antsiranana', lat: -12.2787, lng: 49.2917 },
];
const RAYONS = [2, 5, 10, 25, 50];

function distanceTexte(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${String(km).replace('.', ',')} km`;
}

// Boutiques près de chez soi : carte, distance, recherche d'article et prix bas
export default function AutourDeMoiEcran({ navigation }) {
  const { utilisateur } = useAuth();
  const [position, setPosition] = useState(null);
  const [lieu, setLieu] = useState('');
  const [etat, setEtat] = useState('recherche'); // recherche | ok | refuse
  const [km, setKm] = useState(10);
  const [tri, setTri] = useState('distance');
  const [saisie, setSaisie] = useState('');
  const [prixMin, setPrixMin] = useState('');
  const [prixMax, setPrixMax] = useState('');
  const [filtres, setFiltres] = useState({ q: '', prixMin: '', prixMax: '' });
  const [boutiques, setBoutiques] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  const localiser = useCallback(async () => {
    setEtat('recherche');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setEtat('refuse');
        return;
      }
      const p = await Location.getCurrentPositionAsync({});
      setPosition({ lat: p.coords.latitude, lng: p.coords.longitude });
      setLieu('Ma position');
      setEtat('ok');
    } catch (e) {
      setEtat('refuse');
    }
  }, []);

  useEffect(() => {
    localiser();
  }, [localiser]);

  // La recherche part 0,5 s après la dernière frappe
  useEffect(() => {
    const minuteur = setTimeout(() => setFiltres({ q: saisie.trim(), prixMin, prixMax }), 500);
    return () => clearTimeout(minuteur);
  }, [saisie, prixMin, prixMax]);

  useEffect(() => {
    if (!position) return undefined;
    let actif = true;
    setChargement(true);
    setErreur('');
    const params = { lat: position.lat, lng: position.lng, rayon: km, tri };
    if (filtres.q) params.q = filtres.q;
    if (filtres.prixMin) params.prixMin = filtres.prixMin.replace(/\s/g, '');
    if (filtres.prixMax) params.prixMax = filtres.prixMax.replace(/\s/g, '');
    api
      .get('/proximite/boutiques', { params })
      .then(({ data }) => {
        if (actif) setBoutiques(data.boutiques);
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
  }, [position, km, tri, filtres]);

  function ouvrir(idBoutique) {
    const b = boutiques.find((x) => x.idBoutique === idBoutique);
    // Un client connecté ouvre le catalogue, un visiteur la fiche publique
    navigation.navigate(utilisateur ? 'Boutique' : 'FicheBoutique', { idBoutique, nom: b ? b.nom : '' });
  }

  const points = useMemo(
    () =>
      boutiques.map((b) => ({
        id: b.idBoutique,
        nom: b.nom,
        lat: b.latitude,
        lng: b.longitude,
        texte: `à ${distanceTexte(b.distanceKm)}${b.plusBasPrix !== null ? ` · dès ${formatPrix(b.plusBasPrix)}` : ''}`,
      })),
    [boutiques]
  );

  const filtreActif = Boolean(filtres.q || filtres.prixMin || filtres.prixMax);

  return (
    <Ecran centre={false}>
      <Text style={styles.titre}>Autour de moi</Text>
      <Text style={styles.sous}>
        {etat === 'ok' ? `Boutiques à moins de ${km} km de : ${lieu}` : 'Choisissez où chercher'}
      </Text>

      {etat === 'recherche' ? (
        <View style={styles.attente}>
          <ActivityIndicator color={couleurs.primaire} />
          <Text style={styles.attenteTexte}>Recherche de votre position…</Text>
        </View>
      ) : null}

      {etat === 'refuse' ? (
        <View style={styles.refus}>
          <Text style={styles.refusTexte}>
            Position non disponible. Autorisez la localisation dans le navigateur, ou choisissez une ville.
          </Text>
          <Pressable onPress={localiser} style={styles.reessayer}>
            <Ionicons name="locate" size={16} color={couleurs.primaire} />
            <Text style={styles.reessayerTexte}>Réessayer ma position</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.rangee}>
        {etat !== 'recherche' ? (
          <Puce titre="Ma position" actif={lieu === 'Ma position'} onPress={localiser} />
        ) : null}
        {VILLES.map((v) => (
          <Puce
            key={v.nom}
            titre={v.nom}
            actif={lieu === v.nom}
            onPress={() => {
              setPosition({ lat: v.lat, lng: v.lng });
              setLieu(v.nom);
              setEtat('ok');
            }}
          />
        ))}
      </View>

      {position ? (
        <>
          <ChampTexte
            label="Que cherchez-vous ? (facultatif)"
            placeholder="robe, coiffure, Zara…"
            value={saisie}
            onChangeText={setSaisie}
          />
          <View style={styles.prix}>
            <View style={{ flex: 1 }}>
              <ChampTexte label="Prix minimum (Ar)" placeholder="20000" keyboardType="numeric" value={prixMin} onChangeText={setPrixMin} />
            </View>
            <View style={{ flex: 1 }}>
              <ChampTexte label="Prix maximum (Ar)" placeholder="300000" keyboardType="numeric" value={prixMax} onChangeText={setPrixMax} />
            </View>
          </View>

          <Text style={styles.etiquette}>Trier par</Text>
          <View style={styles.rangee}>
            <Puce titre="Plus proche" actif={tri === 'distance'} onPress={() => setTri('distance')} />
            <Puce titre="Prix bas" actif={tri === 'prix'} onPress={() => setTri('prix')} />
          </View>
          <Text style={styles.etiquette}>Rayon</Text>
          <View style={styles.rangee}>
            {RAYONS.map((r) => (
              <Puce key={r} titre={`${r} km`} actif={km === r} onPress={() => setKm(r)} />
            ))}
          </View>

          <Bandeau type="erreur" message={erreur} />

          <CarteOSM
            centre={position}
            moi={lieu === 'Ma position' ? position : null}
            points={points}
            onSelect={ouvrir}
            hauteur={320}
          />

          <Text style={styles.compte}>
            {chargement
              ? 'Recherche…'
              : boutiques.length === 0
                ? filtreActif
                  ? 'Aucune boutique proche ne propose cet article dans cette fourchette de prix.'
                  : `Aucune boutique à moins de ${km} km. Élargissez le rayon.`
                : `${boutiques.length} boutique${boutiques.length > 1 ? 's' : ''} trouvée${boutiques.length > 1 ? 's' : ''}`}
          </Text>

          {boutiques.map((b, i) => (
            <Pressable
              key={b.idBoutique}
              onPress={() => ouvrir(b.idBoutique)}
              style={({ pressed }) => [styles.carte, pressed && { opacity: 0.9 }]}
            >
              <View style={styles.numero}>
                <Text style={styles.numeroTexte}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nom} numberOfLines={1}>{b.nom}</Text>
                <Text style={styles.lieu} numberOfLines={1}>
                  {[b.adresse, b.ville].filter(Boolean).join(', ')}
                </Text>
                <View style={styles.infos}>
                  <Text style={styles.distance}>à {distanceTexte(b.distanceKm)}</Text>
                  {b.nombreAvis > 0 ? (
                    <Text style={styles.note}>★ {String(b.noteMoyenne).replace('.', ',')} ({b.nombreAvis})</Text>
                  ) : null}
                </View>
                {b.articles.length > 0 ? (
                  <View style={styles.articles}>
                    {b.articles.map((a) => (
                      <View key={a.idProduitService} style={styles.article}>
                        <Text style={styles.articleNom} numberOfLines={1}>{a.nom}</Text>
                        <Text style={styles.articlePrix}>{formatPrix(a.prix)}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color={couleurs.texteSecondaire} />
            </Pressable>
          ))}
        </>
      ) : null}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  titre: { fontSize: 24, fontWeight: '700', color: couleurs.texte },
  sous: { fontSize: 14, color: couleurs.texteSecondaire, marginTop: 2, marginBottom: espaces.m },
  attente: { flexDirection: 'row', alignItems: 'center', gap: espaces.s, marginBottom: espaces.m },
  attenteTexte: { fontSize: 14, color: couleurs.texteSecondaire },
  refus: { backgroundColor: couleurs.primaireClair, borderRadius: 16, padding: espaces.m, marginBottom: espaces.m },
  refusTexte: { fontSize: 14, color: couleurs.texte },
  reessayer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: espaces.s },
  reessayerTexte: { fontSize: 14, fontWeight: '700', color: couleurs.primaire },
  rangee: { flexDirection: 'row', flexWrap: 'wrap', gap: espaces.s, marginBottom: espaces.m },
  prix: { flexDirection: 'row', gap: espaces.s },
  etiquette: { fontSize: 13, fontWeight: '700', color: couleurs.texte, marginBottom: espaces.xs },
  compte: { fontSize: 14, fontWeight: '600', color: couleurs.texte, marginVertical: espaces.m },
  carte: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaces.m,
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    padding: espaces.m,
    marginBottom: espaces.s + 2,
    ...ombre,
  },
  numero: { width: 32, height: 32, borderRadius: 16, backgroundColor: couleurs.primaire, alignItems: 'center', justifyContent: 'center' },
  numeroTexte: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  nom: { fontSize: 16, fontWeight: '700', color: couleurs.texte },
  lieu: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: 1 },
  infos: { flexDirection: 'row', gap: espaces.m, marginTop: 4 },
  distance: { fontSize: 13, fontWeight: '700', color: couleurs.primaire },
  note: { fontSize: 13, color: couleurs.attention, fontWeight: '600' },
  articles: { marginTop: espaces.s, gap: 2 },
  article: { flexDirection: 'row', justifyContent: 'space-between', gap: espaces.s },
  articleNom: { flex: 1, fontSize: 13, color: couleurs.texte },
  articlePrix: { fontSize: 13, fontWeight: '700', color: couleurs.texte },
});
/*
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AutourDeMoiEcran() {
  return (
    <View style={styles.zone}>
      <Text style={styles.titre}>Autour de moi</Text>
      <Text style={styles.texte}>Cette fonction sera bientôt disponible.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  zone: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  titre: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  texte: { fontSize: 14, opacity: 0.7, textAlign: 'center' },
});
*/
