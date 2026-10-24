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
import { couleurs, espaces } from '../../theme';

const ACTIVE = { libelle: 'Active', couleur: couleurs.succes, fond: couleurs.succesFond };
const DESACTIVEE = { libelle: 'Désactivée', couleur: '#4B5563', fond: '#E5E7EB' };

// UC24 : gérer les catégories
export default function CategoriesEcran({ navigation }) {
  const nonLues = useNonLues();
  const { width } = useWindowDimensions();
  const [categories, setCategories] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [rafraichit, setRafraichit] = useState(false);
  const [erreur, setErreur] = useState('');

  const charger = useCallback(async () => {
    try {
      setErreur('');
      const { data } = await api.get('/categories/tous');
      setCategories(data.categories);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setChargement(false);
      setRafraichit(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger])
  );

  const n = categories.length;

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
          titre="Catégories"
          sousTitre="Organisez les types de commerces"
          nonLues={nonLues}
          onNotifications={() => navigation.navigate('Notifications')}
        />

        <View style={styles.ajout}>
          <Bouton titre="+ Ajouter une catégorie" onPress={() => navigation.navigate('CategorieForm')} />
        </View>

        <Bandeau type="erreur" message={erreur} />

        {chargement ? (
          <Chargement />
        ) : (
          <Panneau titre="Catégories" lien={`${n} catégorie${n > 1 ? 's' : ''}`}>
            {n === 0 ? (
              <EtatVide titre="Aucune catégorie" message="Ajoutez-en une avec le bouton ci-dessus." />
            ) : (
              categories.map((c) => (
                <LigneListe
                  key={c.idCategorie}
                  icone="albums"
                  titre={c.nom}
                  sousTitre={c.description || null}
                  detail={`${c._count.boutiques} boutique${c._count.boutiques > 1 ? 's' : ''}`}
                  onPress={() => navigation.navigate('CategorieForm', { categorie: c })}
                  droite={<Badge info={c.actif ? ACTIVE : DESACTIVEE} />}
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
});