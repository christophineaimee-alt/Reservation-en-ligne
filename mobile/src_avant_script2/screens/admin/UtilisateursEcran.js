import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api, { messageErreur } from '../../api/client';
import useNonLues from '../../hooks/useNonLues';
import EnTetePage from '../../components/EnTetePage';
import ChampRecherche from '../../components/ChampRecherche';
import Panneau from '../../components/Panneau';
import LigneListe from '../../components/LigneListe';
import Badge from '../../components/Badge';
import Bouton from '../../components/Bouton';
import Chargement from '../../components/Chargement';
import EtatVide from '../../components/EtatVide';
import Bandeau from '../../components/Bandeau';
import Puce from '../../components/Puce';
import { couleurs, espaces } from '../../theme';
import { infoRole, infoStatutCompte } from '../../utils/statuts';

const LIMITE = 15;

const ROLES = [
  { titre: 'Tous', valeur: null },
  { titre: 'Clients', valeur: 'CLIENT' },
  { titre: 'Commerçants', valeur: 'COMMERCANT' },
  { titre: 'Admins', valeur: 'ADMIN' },
];

const STATUTS = [
  { titre: 'Tous statuts', valeur: null },
  { titre: 'Actifs', valeur: 'ACTIF' },
  { titre: 'Suspendus', valeur: 'SUSPENDU' },
  { titre: 'Bloqués', valeur: 'BLOQUE' },
];

// UC22 : gérer les utilisateurs
export default function UtilisateursEcran({ navigation }) {
  const nonLues = useNonLues();
  const { width } = useWindowDimensions();
  const [recherche, setRecherche] = useState('');
  const [terme, setTerme] = useState('');
  const [role, setRole] = useState(null);
  const [statutCompte, setStatutCompte] = useState(null);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [rafraichit, setRafraichit] = useState(false);
  const [plus, setPlus] = useState(false);
  const [erreur, setErreur] = useState('');

  // On attend 0,4 s après la dernière frappe avant de lancer la recherche
  useEffect(() => {
    const minuteur = setTimeout(() => setTerme(recherche), 400);
    return () => clearTimeout(minuteur);
  }, [recherche]);

  const charger = useCallback(
    async (numeroPage, remplacer) => {
      try {
        setErreur('');
        const params = { page: numeroPage, limite: LIMITE };
        if (terme.trim()) params.q = terme.trim();
        if (role) params.role = role;
        if (statutCompte) params.statutCompte = statutCompte;
        const { data } = await api.get('/admin/utilisateurs', { params });
        setTotal(data.total);
        setPage(numeroPage);
        setUtilisateurs((anciens) => (remplacer ? data.utilisateurs : [...anciens, ...data.utilisateurs]));
      } catch (e) {
        setErreur(messageErreur(e));
      } finally {
        setChargement(false);
        setRafraichit(false);
        setPlus(false);
      }
    },
    [terme, role, statutCompte]
  );

  useFocusEffect(
    useCallback(() => {
      charger(1, true);
    }, [charger])
  );

  return (
    <SafeAreaView style={styles.zone}>
      <ScrollView
        contentContainerStyle={[styles.contenu, { maxWidth: width >= 900 ? 1100 : 600 }]}
        refreshControl={
          <RefreshControl
            refreshing={rafraichit}
            onRefresh={() => {
              setRafraichit(true);
              charger(1, true);
            }}
          />
        }
      >
        <EnTetePage
          titre="Utilisateurs"
          sousTitre="Recherchez, suspendez ou réactivez un compte"
          nonLues={nonLues}
          onNotifications={() => navigation.navigate('Notifications')}
        />

        <View style={styles.ajout}>
          <Bouton titre="+ Ajouter un administrateur" onPress={() => navigation.navigate('AdministrateurForm')} />
        </View>

        <ChampRecherche valeur={recherche} onChangeText={setRecherche} placeholder="Nom, e-mail ou téléphone..." />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.defilement} contentContainerStyle={styles.puces}>
          {ROLES.map((r) => (
            <Puce
              key={r.titre}
              titre={r.titre}
              actif={role === r.valeur}
              onPress={() => {
                setChargement(true);
                setRole(r.valeur);
              }}
            />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.defilement} contentContainerStyle={styles.puces}>
          {STATUTS.map((s) => (
            <Puce
              key={s.titre}
              titre={s.titre}
              actif={statutCompte === s.valeur}
              onPress={() => {
                setChargement(true);
                setStatutCompte(s.valeur);
              }}
            />
          ))}
        </ScrollView>

        <Bandeau type="erreur" message={erreur} />

        {chargement ? (
          <Chargement />
        ) : (
          <Panneau titre="Comptes" lien={`${total} utilisateur${total > 1 ? 's' : ''}`}>
            {utilisateurs.length === 0 ? (
              <EtatVide titre="Aucun utilisateur trouvé" />
            ) : (
              utilisateurs.map((u) => (
                <LigneListe
                  key={u.idUser}
                  titre={`${u.prenom} ${u.nom}`}
                  sousTitre={u.email}
                  detail={u.telephone}
                  onPress={() => navigation.navigate('UtilisateurDetail', { idUser: u.idUser })}
                  droite={
                    <>
                      <Badge info={infoRole(u.role)} />
                      <Badge info={infoStatutCompte(u.statutCompte)} />
                    </>
                  }
                />
              ))
            )}
            {utilisateurs.length < total ? (
              <View style={styles.voirPlus}>
                <Bouton
                  titre="Voir plus"
                  variante="contour"
                  chargement={plus}
                  onPress={() => {
                    setPlus(true);
                    charger(page + 1, false);
                  }}
                />
              </View>
            ) : null}
          </Panneau>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  defilement: { marginHorizontal: -espaces.m },
  puces: { paddingHorizontal: espaces.m, paddingVertical: 4 },
  voirPlus: { marginTop: espaces.s },
  ajout: { marginBottom: espaces.m },
});