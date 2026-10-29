import { enregistrerStyles, useThemeVersion } from '../../theme/registre';
import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import useNonLues from '../../hooks/useNonLues';
import EnTetePage from '../../components/EnTetePage';
import Panneau from '../../components/Panneau';
import LigneInfo from '../../components/LigneInfo';
import Bouton from '../../components/Bouton';
import { couleurs, degrade, espaces, rayon, ombre } from '../../theme';
import { initiale } from '../../utils/format';
import { LIBELLES_ROLE } from '../../utils/statuts';
import { formaterTelephone } from '../../utils/telephone';

export default function ProfilEcran({ navigation }) {
  useThemeVersion();
  const { utilisateur, deconnexion } = useAuth();
  const nonLues = useNonLues();
  const { width } = useWindowDimensions();
  const nom = `${utilisateur.prenom} ${utilisateur.nom}`;

  return (
    <SafeAreaView style={styles.zone}>
      <ScrollView contentContainerStyle={[styles.contenu, { maxWidth: width >= 900 ? 760 : 600 }]}>
        <EnTetePage
          titre="Mon profil"
          sousTitre="Vos informations et votre compte"
          nonLues={nonLues}
          onNotifications={() => navigation.navigate('Notifications')}
        />

        <View style={styles.heroZone}>
          <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.avatar}>
              <Text style={styles.lettre}>{initiale(utilisateur.prenom)}</Text>
            </View>
            <Text style={styles.nom}>{nom}</Text>
            <View style={styles.role}>
              <Text style={styles.roleTexte}>{LIBELLES_ROLE[utilisateur.role] || utilisateur.role}</Text>
            </View>
          </LinearGradient>
        </View>

        <Panneau titre="Informations" style={styles.espace}>
          <LigneInfo icone="mail" titre="E-mail" valeur={utilisateur.email} />
          <LigneInfo icone="call" titre="Téléphone" valeur={formaterTelephone(utilisateur.telephone)} />
          <LigneInfo
            icone="shield-checkmark"
            titre="Rôle"
            valeur={LIBELLES_ROLE[utilisateur.role] || utilisateur.role}
          />
        </Panneau>

        <View style={styles.espace}>
          <Bouton titre="Modifier mon profil" onPress={() => navigation.navigate('ModifierProfil')} />
          <Bouton
            titre="Changer mon mot de passe"
            variante="contour"
            onPress={() => navigation.navigate('ModifierProfil', { section: 'motdepasse' })}
            style={{ marginTop: espaces.s + 4 }}
          />
          <Bouton titre="Se déconnecter" variante="danger" onPress={deconnexion} style={{ marginTop: espaces.s + 4 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const creerStyles = () => StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  espace: { marginTop: espaces.m },
  heroZone: { backgroundColor: couleurs.carte, borderRadius: rayon, ...ombre },
  hero: { borderRadius: rayon, paddingVertical: espaces.xl, alignItems: 'center' },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lettre: { fontSize: 38, fontWeight: '700', color: '#FFFFFF' },
  nom: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginTop: espaces.m },
  role: {
    marginTop: espaces.s,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  roleTexte: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});