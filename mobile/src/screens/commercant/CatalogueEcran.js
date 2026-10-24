import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api, { messageErreur } from '../../api/client';
import useNonLues from '../../hooks/useNonLues';
import EnTetePage from '../../components/EnTetePage';
import Panneau from '../../components/Panneau';
import LigneListe from '../../components/LigneListe';
import Badge from '../../components/Badge';
import Bouton from '../../components/Bouton';
import Chargement from '../../components/Chargement';
import EtatVide from '../../components/EtatVide';
import Bandeau from '../../components/Bandeau';
import Puce from '../../components/Puce';
import { couleurs, espaces } from '../../theme';
import { formatPrix } from '../../utils/format';

const PRODUIT = { libelle: 'Produit', couleur: couleurs.attention, fond: '#FFF4DB' };
const SERVICE = { libelle: 'Service', couleur: couleurs.primaire, fond: couleurs.primaireClair };
const DESACTIVE = { libelle: 'Désactivé', couleur: '#4B5563', fond: '#E5E7EB' };
const RUPTURE = { libelle: 'Rupture', couleur: couleurs.erreur, fond: couleurs.erreurFond };

// UC12 : gérer les produits et services
export default function CatalogueEcran({ navigation }) {
  const nonLues = useNonLues();
  const { width } = useWindowDimensions();
  const [articles, setArticles] = useState([]);
  const [type, setType] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [rafraichit, setRafraichit] = useState(false);
  const [erreur, setErreur] = useState('');

  const charger = useCallback(async () => {
    try {
      setErreur('');
      const { data } = await api.get('/commercant/produits-services');
      setArticles(data.articles);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setChargement(false);
      setRafraichit(false);
    }
  }, []);

  // Recharge au retour d'un formulaire
  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger])
  );

  const visibles = type ? articles.filter((a) => a.type === type) : articles;
  const n = visibles.length;

  return (
    <SafeAreaView style={styles.zone}>
      <ScrollView
        contentContainerStyle={[styles.contenu, { maxWidth: width >= 900 ? 1100 : 600 }]}
        refreshControl={
          <RefreshControl
            refreshing={rafraichit}
            onRefresh={() => {
              setRafraichit(true);
              charger();
            }}
          />
        }
      >
        <EnTetePage
          titre="Catalogue"
          sousTitre="Vos produits et vos services"
          nonLues={nonLues}
          onNotifications={() => navigation.navigate('Notifications')}
        />

        <View style={styles.ajout}>
          <Bouton titre="+ Ajouter un produit ou un service" onPress={() => navigation.navigate('ArticleForm')} />
        </View>

        <View style={styles.puces}>
          <Puce titre="Tout" actif={type === null} onPress={() => setType(null)} />
          <Puce titre="Produits" actif={type === 'PRODUIT'} onPress={() => setType('PRODUIT')} />
          <Puce titre="Services" actif={type === 'SERVICE'} onPress={() => setType('SERVICE')} />
        </View>

        <Bandeau type="erreur" message={erreur} />

        {chargement ? (
          <Chargement />
        ) : (
          <Panneau titre="Éléments" lien={`${n} élément${n > 1 ? 's' : ''}`}>
            {n === 0 ? (
              <EtatVide titre="Aucun élément" message="Ajoutez vos produits et services avec le bouton ci-dessus." />
            ) : (
              visibles.map((a) => (
                <LigneListe
                  key={a.idProduitService}
                  icone={a.type === 'SERVICE' ? 'sparkles' : 'cube'}
                  titre={a.nom}
                  sousTitre={formatPrix(a.prix)}
                  detail={
                    a.type === 'SERVICE'
                      ? a.dureeMinutes
                        ? `${a.dureeMinutes} min`
                        : null
                      : `Stock : ${a.quantiteDisponible}`
                  }
                  onPress={() => navigation.navigate('ArticleForm', { article: a })}
                  droite={
                    <>
                      {!a.actif ? <Badge info={DESACTIVE} /> : null}
                      {a.type === 'PRODUIT' && a.quantiteDisponible === 0 ? <Badge info={RUPTURE} /> : null}
                      <Badge info={a.type === 'SERVICE' ? SERVICE : PRODUIT} />
                    </>
                  }
                />
              ))
            )}
          </Panneau>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  ajout: { marginVertical: espaces.m },
  puces: { flexDirection: 'row', marginBottom: espaces.s },
});