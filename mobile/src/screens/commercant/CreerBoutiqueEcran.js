import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import api, { messageErreur } from '../../api/client';
import Ecran from '../../components/Ecran';
import ChampTexte from '../../components/ChampTexte';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Puce from '../../components/Puce';
import { useAuth } from '../../context/AuthContext';
import { useBoutique } from '../../context/BoutiqueContext';
import { couleurs, espaces, rayon } from '../../theme';

const STATUTS = {
  EN_ATTENTE: { libelle: 'En attente de validation', couleur: '#B7791F', fond: '#FFF4DB' },
  VALIDEE: { libelle: 'Validée', couleur: couleurs.succes, fond: couleurs.succesFond },
  REJETEE: { libelle: 'Rejetée', couleur: couleurs.erreur, fond: couleurs.erreurFond },
};

// UC11 : créer sa boutique (et la modifier ensuite)
export default function CreerBoutiqueEcran() {
  const { boutique, recharger } = useBoutique();
  const { deconnexion } = useAuth();
  const modification = Boolean(boutique);

  const [categories, setCategories] = useState([]);
  const [idCategorie, setIdCategorie] = useState(boutique ? boutique.idCategorie : null);
  const [form, setForm] = useState({
    nom: boutique ? boutique.nom : '',
    description: boutique && boutique.description ? boutique.description : '',
    adresse: boutique ? boutique.adresse : '',
    ville: boutique ? boutique.ville : '',
    telephone: boutique && boutique.telephone ? boutique.telephone : '',
    logo: boutique && boutique.logo ? boutique.logo : '',
  });
  const [erreurs, setErreurs] = useState({});
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const changer = (champ) => (valeur) => setForm((f) => ({ ...f, [champ]: valeur }));

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  async function enregistrer() {
    setErreur('');
    setSucces('');
    const e = {};
    if (form.nom.trim().length < 2) e.nom = 'Le nom est obligatoire (2 caractères minimum)';
    if (!form.adresse.trim()) e.adresse = "L'adresse est obligatoire";
    if (!form.ville.trim()) e.ville = 'La ville est obligatoire';
    if (!idCategorie) e.categorie = 'Choisissez une catégorie';
    setErreurs(e);
    if (Object.keys(e).length > 0) return;

    const corps = {
      nom: form.nom.trim(),
      description: form.description.trim(),
      adresse: form.adresse.trim(),
      ville: form.ville.trim(),
      telephone: form.telephone.trim(),
      logo: form.logo.trim(),
      idCategorie,
    };

    setEnvoi(true);
    try {
      if (modification) {
        const { data } = await api.put('/boutiques/moi', corps);
        setSucces(data.message);
      } else {
        await api.post('/boutiques', corps);
      }
      await recharger();
    } catch (err) {
      setErreur(messageErreur(err));
    } finally {
      setEnvoi(false);
    }
  }

  const statut = boutique ? STATUTS[boutique.statut] : null;

  return (
    <Ecran centre={false}Carte>
      <Text style={styles.titre}>{modification ? 'Ma boutique' : 'Créez votre boutique'}</Text>
      {!modification ? (
        <Text style={styles.intro}>
          Renseignez les informations de votre commerce. Un administrateur la validera avant qu'elle ne soit visible
          par les clients.
        </Text>
      ) : null}

      {statut ? (
        <View style={[styles.statut, { backgroundColor: statut.fond }]}>
          <Text style={[styles.statutTexte, { color: statut.couleur }]}>Statut : {statut.libelle}</Text>
          {boutique.statut === 'REJETEE' && boutique.motifRejet ? (
            <Text style={styles.motif}>Motif : {boutique.motifRejet}</Text>
          ) : null}
          {boutique.statut === 'REJETEE' ? (
            <Text style={styles.motif}>Corrigez les informations puis enregistrez : la boutique sera resoumise.</Text>
          ) : null}
        </View>
      ) : null}

      <Bandeau type="succes" message={succes} />
      <Bandeau type="erreur" message={erreur} />

      <ChampTexte label="Nom de la boutique" value={form.nom} onChangeText={changer('nom')} erreur={erreurs.nom} autoCapitalize="words" />
      <ChampTexte label="Description (facultatif)" value={form.description} onChangeText={changer('description')} multiline autoCapitalize="sentences" />
      <ChampTexte label="Adresse" value={form.adresse} onChangeText={changer('adresse')} erreur={erreurs.adresse} autoCapitalize="sentences" />
      <ChampTexte label="Ville" value={form.ville} onChangeText={changer('ville')} erreur={erreurs.ville} autoCapitalize="words" />
      <ChampTexte label="Téléphone (facultatif)" value={form.telephone} onChangeText={changer('telephone')} keyboardType="phone-pad" />
      <ChampTexte label="Logo : adresse web (facultatif)" value={form.logo} onChangeText={changer('logo')} placeholder="https://..." />

      <Text style={styles.label}>Catégorie</Text>
      <View style={styles.categories}>
        {categories.map((c) => (
          <Puce key={c.idCategorie} titre={c.nom} actif={idCategorie === c.idCategorie} onPress={() => setIdCategorie(c.idCategorie)} />
        ))}
      </View>
      {erreurs.categorie ? <Text style={styles.erreurCategorie}>{erreurs.categorie}</Text> : null}

      <Bouton
        titre={modification ? 'Enregistrer les modifications' : 'Créer ma boutique'}
        onPress={enregistrer}
        chargement={envoi}
        style={{ marginTop: espaces.m }}
      />
      {!modification ? (
        <Bouton titre="Se déconnecter" variante="texte" onPress={deconnexion} style={{ marginTop: espaces.s }} />
      ) : null}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  titre: { fontSize: 24, fontWeight: '700', color: couleurs.texte, marginBottom: espaces.s },
  intro: { fontSize: 14, color: couleurs.texteSecondaire, marginBottom: espaces.m },
  statut: { borderRadius: rayon, padding: espaces.m, marginBottom: espaces.m },
  statutTexte: { fontSize: 15, fontWeight: '700' },
  motif: { fontSize: 14, color: couleurs.texte, marginTop: espaces.xs },
  label: { fontSize: 14, fontWeight: '600', color: couleurs.texte, marginBottom: espaces.s },
  categories: { flexDirection: 'row', flexWrap: 'wrap', rowGap: espaces.s },
  erreurCategorie: { color: couleurs.erreur, fontSize: 13, marginTop: espaces.xs },
});