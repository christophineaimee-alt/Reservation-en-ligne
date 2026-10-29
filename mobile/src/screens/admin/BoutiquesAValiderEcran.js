import { enregistrerStyles, useThemeVersion } from '../../theme/registre';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api, { messageErreur } from '../../api/client';
import useNonLues from '../../hooks/useNonLues';
import EnTetePage from '../../components/EnTetePage';
import Panneau from '../../components/Panneau';
import LigneListe from '../../components/LigneListe';
import Pilule from '../../components/Pilule';
import Badge from '../../components/Badge';
import Chargement from '../../components/Chargement';
import EtatVide from '../../components/EtatVide';
import Bandeau from '../../components/Bandeau';
import Puce from '../../components/Puce';
import { couleurs, espaces } from '../../theme';
import { formatDateHeure } from '../../utils/format';
import { infoStatutBoutique } from '../../utils/statuts';

const FILTRES = [
  { titre: 'En attente', valeur: 'EN_ATTENTE', vide: 'Aucune boutique en attente de validation' },
  { titre: 'Validées', valeur: 'VALIDEE', vide: 'Aucune boutique validée' },
  { titre: 'Rejetées', valeur: 'REJETEE', vide: 'Aucune boutique rejetée' },
];

// UC23 : valider les boutiques
export default function BoutiquesAValiderEcran({ navigation }) {
  useThemeVersion();
  const nonLues = useNonLues();
  const { width } = useWindowDimensions();
  const [statut, setStatut] = useState('EN_ATTENTE');
  const [boutiques, setBoutiques] = useState([]);
  const [occupe, setOccupe] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [rafraichit, setRafraichit] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  const charger = useCallback(async () => {
    try {
      setErreur('');
      const { data } = await api.get('/admin/boutiques', { params: { statut } });
      setBoutiques(data.boutiques);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setChargement(false);
      setRafraichit(false);
    }
  }, [statut]);

  // Recharge à chaque affichage (retour d'une fiche) et à chaque changement de filtre
  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger])
  );

  function choisirFiltre(valeur) {
    setChargement(true);
    setSucces('');
    setStatut(valeur);
  }

  async function valider(idBoutique) {
    setOccupe(idBoutique);
    setErreur('');
    setSucces('');
    try {
      const { data } = await api.patch(`/admin/boutiques/${idBoutique}/validation`, { decision: 'VALIDER' });
      setSucces(data.message);
      await charger();
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setOccupe(null);
    }
  }

  const ouvrir = (idBoutique, action) => navigation.navigate('BoutiqueAdminDetail', { idBoutique, action });
  const filtre = FILTRES.find((f) => f.valeur === statut);
  const n = boutiques.length;

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
          titre="Boutiques"
          sousTitre="Examinez et validez les nouvelles boutiques"
          nonLues={nonLues}
          onNotifications={() => navigation.navigate('Notifications')}
        />

        <View style={styles.puces}>
          {FILTRES.map((f) => (
            <Puce key={f.valeur} titre={f.titre} actif={statut === f.valeur} onPress={() => choisirFiltre(f.valeur)} />
          ))}
        </View>

        <Bandeau type="succes" message={succes} />
        <Bandeau type="erreur" message={erreur} />

        {chargement ? (
          <Chargement />
        ) : (
          <Panneau titre="Activité" lien={`${n} boutique${n > 1 ? 's' : ''}`}>
            {n === 0 ? (
              <EtatVide titre={filtre.vide} />
            ) : (
              boutiques.map((b) => (
                <LigneListe
                  key={b.idBoutique}
                  avatar={b.nom}
                  titre={b.nom}
                  sousTitre={[b.categorie ? b.categorie.nom : '', b.ville].filter(Boolean).join(' · ')}
                  detail={`${
                    b.commercant ? `${b.commercant.utilisateur.prenom} ${b.commercant.utilisateur.nom} · ` : ''
                  }soumise le ${formatDateHeure(b.createdAt)}`}
                  onPress={() => ouvrir(b.idBoutique)}
                  droite={
                    b.statut === 'EN_ATTENTE' ? (
                      <>
                        <Pilule titre="Rejeter" variante="danger" onPress={() => ouvrir(b.idBoutique, 'rejeter')} desactive={occupe === b.idBoutique} />
                        <Pilule titre="Valider" variante="plein" onPress={() => valider(b.idBoutique)} occupe={occupe === b.idBoutique} />
                      </>
                    ) : (
                      <>
                        <Badge info={infoStatutBoutique(b.statut)} />
                        <Pilule titre="Détail" onPress={() => ouvrir(b.idBoutique)} />
                      </>
                    )
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

const creerStyles = () => StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  puces: { flexDirection: 'row', marginVertical: espaces.s },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});