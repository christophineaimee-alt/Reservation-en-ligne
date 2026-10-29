import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { messageErreur } from '../../api/client';
import ResumeAvis from '../../components/ResumeAvis';
import CarteAvis from '../../components/CarteAvis';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Chargement from '../../components/Chargement';
import EtatVide from '../../components/EtatVide';
import { couleurs, espaces, rayon, ombre } from '../../theme';

export default function AvisBoutiqueEcran({ route }) {
  const { idBoutique } = route.params;
  const [resume, setResume] = useState(null);
  const [avis, setAvis] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [plus, setPlus] = useState(false);
  const [erreur, setErreur] = useState('');

  const charger = useCallback(
    async (p) => {
      try {
        setErreur('');
        const { data } = await api.get(`/boutiques/${idBoutique}/avis`, { params: { page: p, limite: 10 } });
        setResume(data.resume);
        setTotal(data.total);
        setAvis((ancien) => (p === 1 ? data.avis : [...ancien, ...data.avis]));
        setPage(p);
      } catch (e) {
        setErreur(messageErreur(e));
      } finally {
        setChargement(false);
        setPlus(false);
      }
    },
    [idBoutique]
  );

  useEffect(() => {
    charger(1);
  }, [charger]);

  if (chargement) return <Chargement />;

  const entete = (
    <View>
      <Bandeau type="erreur" message={erreur} />
      {resume ? (
        <View style={styles.resume}>
          <ResumeAvis resume={resume} />
        </View>
      ) : null}
      <Text style={styles.titre}>Avis des clients</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
      <FlatList
        data={avis}
        keyExtractor={(a) => String(a.idAvis)}
        renderItem={({ item }) => <CarteAvis avis={item} />}
        ListHeaderComponent={entete}
        ListEmptyComponent={<EtatVide titre="Aucun avis pour le moment" />}
        ListFooterComponent={
          avis.length < total ? (
            <Bouton
              titre="Voir plus d'avis"
              variante="contour"
              chargement={plus}
              onPress={() => {
                setPlus(true);
                charger(page + 1);
              }}
              style={{ marginTop: espaces.s }}
            />
          ) : null
        }
        contentContainerStyle={styles.liste}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  liste: { padding: espaces.m, paddingBottom: espaces.xl, width: '100%', maxWidth: 700, alignSelf: 'center' },
  resume: { backgroundColor: couleurs.carte, borderRadius: rayon, padding: espaces.m, marginBottom: espaces.m, ...ombre },
  titre: { fontSize: 18, fontWeight: '600', color: couleurs.texte, marginBottom: espaces.s + 4 },
});