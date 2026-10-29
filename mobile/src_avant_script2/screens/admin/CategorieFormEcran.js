import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { messageErreur } from '../../api/client';
import Panneau from '../../components/Panneau';
import ChampTexte from '../../components/ChampTexte';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Puce from '../../components/Puce';
import { couleurs, espaces, rayon } from '../../theme';

// UC24 : ajouter, renommer, désactiver une catégorie
export default function CategorieFormEcran({ route, navigation }) {
  const categorie = route.params && route.params.categorie ? route.params.categorie : null;
  const edition = Boolean(categorie);
  const { width } = useWindowDimensions();

  const [nom, setNom] = useState(categorie ? categorie.nom : '');
  const [description, setDescription] = useState(categorie && categorie.description ? categorie.description : '');
  const [actif, setActif] = useState(categorie ? categorie.actif : true);
  const [etaitActive, setEtaitActive] = useState(categorie ? categorie.actif : true);
  const [nbBoutiques, setNbBoutiques] = useState(categorie ? categorie._count.boutiques : 0);
  const [autres, setAutres] = useState([]);
  const [cible, setCible] = useState(null);
  const [erreurNom, setErreurNom] = useState('');
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const besoinReaffectation = edition && etaitActive && !actif && nbBoutiques > 0;

  // Catégories actives vers lesquelles on peut réaffecter les boutiques
  useEffect(() => {
    if (edition) {
      api
        .get('/categories')
        .then(({ data }) => setAutres(data.categories.filter((c) => c.idCategorie !== categorie.idCategorie)))
        .catch(() => {});
    }
  }, [edition, categorie]);

  async function enregistrer() {
    setErreur('');
    setSucces('');
    if (!nom.trim()) {
      setErreurNom('Le nom est obligatoire');
      return;
    }
    setErreurNom('');
    if (besoinReaffectation && !cible) {
      setErreur(`Choisissez la catégorie qui recevra les ${nbBoutiques} boutique(s)`);
      return;
    }

    setEnvoi(true);
    try {
      if (edition) {
        const corps = { nom: nom.trim(), description: description.trim(), actif };
        if (besoinReaffectation) corps.reaffecterVers = cible;
        const { data } = await api.put(`/categories/${categorie.idCategorie}`, corps);
        setSucces(data.message);
        setEtaitActive(actif);
        if (besoinReaffectation) {
          setNbBoutiques(0);
          setCible(null);
        }
      } else {
        await api.post('/categories', { nom: nom.trim(), description: description.trim() });
        navigation.goBack();
        return;
      }
    } catch (e) {
      setErreur(messageErreur(e));
    }
    setEnvoi(false);
  }

  return (
    <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={[styles.contenu, { maxWidth: width >= 900 ? 760 : 600 }]}>
        <Bandeau type="succes" message={succes} />
        <Bandeau type="erreur" message={erreur} />

        <Panneau titre={edition ? 'Modifier la catégorie' : 'Nouvelle catégorie'}>
          <ChampTexte label="Nom" value={nom} onChangeText={setNom} erreur={erreurNom} autoCapitalize="words" />
          <ChampTexte
            label="Description (facultatif)"
            value={description}
            onChangeText={setDescription}
            multiline
            autoCapitalize="sentences"
          />

          {edition ? (
            <View style={styles.interrupteur}>
              <View style={{ flex: 1 }}>
                <Text style={styles.interrupteurTitre}>Catégorie active</Text>
                <Text style={styles.interrupteurTexte}>
                  Désactivée : elle n'est plus proposée pour les nouvelles boutiques.
                </Text>
              </View>
              <Switch value={actif} onValueChange={setActif} trackColor={{ true: couleurs.primaire }} />
            </View>
          ) : null}

          {besoinReaffectation ? (
            <View style={styles.reaffectation}>
              <Text style={styles.reaffectationTitre}>
                {nbBoutiques} boutique{nbBoutiques > 1 ? 's sont rattachées' : ' est rattachée'} à cette catégorie.
              </Text>
              <Text style={styles.reaffectationTexte}>Choisissez la catégorie qui les accueillera :</Text>
              <View style={styles.choix}>
                {autres.length === 0 ? (
                  <Text style={styles.reaffectationTexte}>Aucune autre catégorie active. Créez-en une d'abord.</Text>
                ) : (
                  autres.map((c) => (
                    <Puce key={c.idCategorie} titre={c.nom} actif={cible === c.idCategorie} onPress={() => setCible(c.idCategorie)} />
                  ))
                )}
              </View>
            </View>
          ) : null}

          <Bouton titre={edition ? 'Enregistrer' : 'Ajouter la catégorie'} onPress={enregistrer} chargement={envoi} />
        </Panneau>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  interrupteur: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: couleurs.surface2,
    borderRadius: 16,
    padding: espaces.m,
    marginBottom: espaces.m,
  },
  interrupteurTitre: { fontSize: 15, fontWeight: '600', color: couleurs.texte },
  interrupteurTexte: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: 2 },
  reaffectation: { backgroundColor: couleurs.avertFond, borderRadius: rayon, padding: espaces.m, marginBottom: espaces.m },
  reaffectationTitre: { fontSize: 15, fontWeight: '700', color: couleurs.attention },
  reaffectationTexte: { fontSize: 14, color: couleurs.texte, marginTop: espaces.xs },
  choix: { flexDirection: 'row', flexWrap: 'wrap', rowGap: espaces.s, marginTop: espaces.s },
});