import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import api, { messageErreur } from '../../api/client';
import Ecran from '../../components/Ecran';
import ChampTexte from '../../components/ChampTexte';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Puce from '../../components/Puce';
import { couleurs, espaces, rayon } from '../../theme';
import { entier, montant } from '../../utils/saisie';

// UC12 : gérer produits et services / UC13 : gérer les stocks
export default function ArticleFormEcran({ route, navigation }) {
  const article = route.params && route.params.article ? route.params.article : null;
  const edition = Boolean(article);

  const [type, setType] = useState(article ? article.type : 'PRODUIT');
  const [actif, setActif] = useState(article ? article.actif : true);
  const [form, setForm] = useState({
    nom: article ? article.nom : '',
    description: article && article.description ? article.description : '',
    prix: article ? String(article.prix) : '',
    photo: article && article.photo ? article.photo : '',
    dureeMinutes: article && article.dureeMinutes ? String(article.dureeMinutes) : '',
    quantite: '0',
    seuilAlerte: '0',
  });
  const [erreurs, setErreurs] = useState({});
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [confirmerSuppression, setConfirmerSuppression] = useState(false);

  const [envoiStock, setEnvoiStock] = useState(false);
  const [erreurStock, setErreurStock] = useState('');
  const [succesStock, setSuccesStock] = useState('');
  const [alerteStock, setAlerteStock] = useState('');

  const changer = (champ) => (valeur) => setForm((f) => ({ ...f, [champ]: valeur }));

  // Stock actuel d'un produit existant
  useEffect(() => {
    if (edition && type === 'PRODUIT') {
      api
        .get(`/commercant/produits-services/${article.idProduitService}/stock`)
        .then(({ data }) =>
          setForm((f) => ({
            ...f,
            quantite: String(data.stock.quantite),
            seuilAlerte: String(data.stock.seuilAlerte),
          }))
        )
        .catch((e) => setErreurStock(messageErreur(e)));
    }
  }, [edition, type, article]);

  async function enregistrer() {
    setErreur('');
    setSucces('');
    const e = {};
    if (!form.nom.trim()) e.nom = 'Le nom est obligatoire';
    const prix = montant(form.prix);
    if (prix === null) e.prix = 'Prix invalide (nombre positif)';
    let duree = null;
    if (type === 'SERVICE') {
      duree = entier(form.dureeMinutes);
      if (!duree || duree < 1) e.dureeMinutes = 'Durée invalide (en minutes)';
    }
    let quantite = 0;
    let seuil = 0;
    if (!edition && type === 'PRODUIT') {
      quantite = entier(form.quantite);
      seuil = entier(form.seuilAlerte);
      if (quantite === null) e.quantite = 'Quantité invalide (nombre entier)';
      if (seuil === null) e.seuilAlerte = 'Seuil invalide (nombre entier)';
    }
    setErreurs(e);
    if (Object.keys(e).length > 0) return;

    setEnvoi(true);
    try {
      if (edition) {
        const corps = {
          nom: form.nom.trim(),
          description: form.description.trim(),
          prix,
          photo: form.photo.trim(),
          actif,
        };
        if (type === 'SERVICE') corps.dureeMinutes = duree;
        const { data } = await api.put(`/commercant/produits-services/${article.idProduitService}`, corps);
        setSucces(data.message);
      } else {
        const corps = { nom: form.nom.trim(), prix, type };
        if (form.description.trim()) corps.description = form.description.trim();
        if (form.photo.trim()) corps.photo = form.photo.trim();
        if (type === 'SERVICE') corps.dureeMinutes = duree;
        if (type === 'PRODUIT') {
          corps.quantite = quantite;
          corps.seuilAlerte = seuil;
        }
        await api.post('/commercant/produits-services', corps);
        navigation.goBack();
        return;
      }
    } catch (err) {
      setErreur(messageErreur(err));
    }
    setEnvoi(false);
  }

  async function enregistrerStock() {
    setErreurStock('');
    setSuccesStock('');
    setAlerteStock('');
    const quantite = entier(form.quantite);
    const seuil = entier(form.seuilAlerte);
    if (quantite === null) {
      setErreurStock('Quantité invalide (nombre entier)');
      return;
    }
    if (seuil === null) {
      setErreurStock("Seuil d'alerte invalide (nombre entier)");
      return;
    }
    setEnvoiStock(true);
    try {
      const { data } = await api.put(`/commercant/produits-services/${article.idProduitService}/stock`, {
        quantite,
        seuilAlerte: seuil,
      });
      setSuccesStock(data.message);
      if (data.alerte) setAlerteStock(data.alerte);
    } catch (err) {
      setErreurStock(messageErreur(err));
    } finally {
      setEnvoiStock(false);
    }
  }

  async function supprimer() {
    setErreur('');
    setEnvoi(true);
    try {
      await api.delete(`/commercant/produits-services/${article.idProduitService}`);
      navigation.goBack();
    } catch (err) {
      setErreur(messageErreur(err));
      setConfirmerSuppression(false);
      setEnvoi(false);
    }
  }

  return (
    <Ecran centre={false}Carte>
      <Bandeau type="succes" message={succes} />
      <Bandeau type="erreur" message={erreur} />

      {!edition ? (
        <View style={styles.types}>
          <Puce titre="Produit" actif={type === 'PRODUIT'} onPress={() => setType('PRODUIT')} />
          <Puce titre="Service" actif={type === 'SERVICE'} onPress={() => setType('SERVICE')} />
        </View>
      ) : (
        <Text style={styles.typeFixe}>{type === 'SERVICE' ? 'Service' : 'Produit'}</Text>
      )}

      <ChampTexte label="Nom" value={form.nom} onChangeText={changer('nom')} erreur={erreurs.nom} autoCapitalize="sentences" />
      <ChampTexte label="Description (facultatif)" value={form.description} onChangeText={changer('description')} multiline autoCapitalize="sentences" />
      <ChampTexte label="Prix (Ar)" value={form.prix} onChangeText={changer('prix')} erreur={erreurs.prix} keyboardType="numeric" placeholder="12000" />
      <ChampTexte label="Photo : adresse web (facultatif)" value={form.photo} onChangeText={changer('photo')} placeholder="https://..." />

      {type === 'SERVICE' ? (
        <ChampTexte label="Durée (minutes)" value={form.dureeMinutes} onChangeText={changer('dureeMinutes')} erreur={erreurs.dureeMinutes} keyboardType="numeric" placeholder="60" />
      ) : null}

      {!edition && type === 'PRODUIT' ? (
        <View>
          <ChampTexte label="Quantité en stock" value={form.quantite} onChangeText={changer('quantite')} erreur={erreurs.quantite} keyboardType="numeric" />
          <ChampTexte label="Seuil d'alerte (0 = aucune alerte)" value={form.seuilAlerte} onChangeText={changer('seuilAlerte')} erreur={erreurs.seuilAlerte} keyboardType="numeric" />
        </View>
      ) : null}

      {edition ? (
        <View style={styles.interrupteur}>
          <View style={{ flex: 1 }}>
            <Text style={styles.interrupteurTitre}>Visible dans le catalogue</Text>
            <Text style={styles.interrupteurTexte}>Désactivé : les clients ne le voient plus.</Text>
          </View>
          <Switch value={actif} onValueChange={setActif} trackColor={{ true: couleurs.primaire }} />
        </View>
      ) : null}

      <Bouton titre={edition ? 'Enregistrer' : 'Ajouter au catalogue'} onPress={enregistrer} chargement={envoi} />

      {edition && type === 'PRODUIT' ? (
        <View style={styles.stock}>
          <Text style={styles.stockTitre}>Stock</Text>
          <Bandeau type="succes" message={succesStock} />
          <Bandeau type="erreur" message={erreurStock} />
          {alerteStock ? (
            <View style={styles.alerte}>
              <Text style={styles.alerteTexte}>{alerteStock}</Text>
            </View>
          ) : null}
          <ChampTexte label="Quantité en stock" value={form.quantite} onChangeText={changer('quantite')} keyboardType="numeric" />
          <ChampTexte label="Seuil d'alerte (0 = aucune alerte)" value={form.seuilAlerte} onChangeText={changer('seuilAlerte')} keyboardType="numeric" />
          <Bouton titre="Enregistrer le stock" variante="contour" onPress={enregistrerStock} chargement={envoiStock} />
        </View>
      ) : null}

      {edition && !confirmerSuppression ? (
        <Bouton
          titre="Supprimer cet élément"
          variante="texte"
          onPress={() => setConfirmerSuppression(true)}
          style={{ marginTop: espaces.l }}
        />
      ) : null}

      {edition && confirmerSuppression ? (
        <View style={styles.suppression}>
          <Text style={styles.suppressionTexte}>
            Supprimer définitivement ? S'il a un historique de réservations, il sera seulement désactivé.
          </Text>
          <Bouton titre="Oui, supprimer" onPress={supprimer} chargement={envoi} />
          <Bouton titre="Non, garder" variante="texte" onPress={() => setConfirmerSuppression(false)} />
        </View>
      ) : null}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  types: { flexDirection: 'row', marginBottom: espaces.m },
  typeFixe: { fontSize: 13, fontWeight: '700', color: couleurs.primaire, marginBottom: espaces.m },
  interrupteur: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: couleurs.surface2,
    borderRadius: rayon,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espaces.m,
    marginBottom: espaces.m,
  },
  interrupteurTitre: { fontSize: 15, fontWeight: '600', color: couleurs.texte },
  interrupteurTexte: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: 2 },
  stock: {
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espaces.m,
    marginTop: espaces.l,
  },
  stockTitre: { fontSize: 18, fontWeight: '700', color: couleurs.texte, marginBottom: espaces.m },
  alerte: { backgroundColor: couleurs.avertFond, borderRadius: rayon, padding: 12, marginBottom: espaces.m },
  alerteTexte: { color: couleurs.attention, fontSize: 14, fontWeight: '600' },
  suppression: {
    borderWidth: 1,
    borderColor: couleurs.erreur,
    borderRadius: rayon,
    padding: espaces.m,
    marginTop: espaces.l,
  },
  suppressionTexte: { fontSize: 14, color: couleurs.texte, marginBottom: espaces.m },
});