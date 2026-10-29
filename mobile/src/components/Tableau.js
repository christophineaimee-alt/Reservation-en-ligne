import { enregistrerStyles } from '../theme/registre';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { couleurs, espaces } from '../theme';
import { initiale } from '../utils/format';

// colonnes : [{ titre, flex = 1, minWidth = 100, rendu: (ligne) => noeud }]
export default function Tableau({ colonnes, lignes, cle, vide = 'Aucune donnée', onLigne }) {
  const largeurMin = colonnes.reduce((somme, c) => somme + (c.minWidth || 100), 0);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flexGrow: 1, minWidth: largeurMin }}>
        <View style={styles.entete}>
          {colonnes.map((c, i) => (
            <View key={i} style={{ flex: c.flex || 1, minWidth: c.minWidth || 100 }}>
              <Text style={styles.enteteTexte}>{c.titre}</Text>
            </View>
          ))}
        </View>
        {lignes.length === 0 ? (
          <Text style={styles.vide}>{vide}</Text>
        ) : (
          lignes.map((l, n) => (
            <Pressable
              key={cle ? cle(l) : n}
              onPress={onLigne ? () => onLigne(l) : undefined}
              style={({ pressed }) => [styles.ligne, n % 2 === 1 && styles.ligneAlternee, pressed && onLigne && { opacity: 0.9 }]}
            >
              {colonnes.map((c, i) => (
                <View key={i} style={{ flex: c.flex || 1, minWidth: c.minWidth || 100, justifyContent: 'center' }}>
                  {c.rendu(l)}
                </View>
              ))}
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

// Cellule « avatar + nom + petit texte », très courante dans les tableaux
export function CelluleAvatar({ nom, sous }) {
  return (
    <View style={styles.avatarLigne}>
      <View style={styles.avatar}>
        <Text style={styles.avatarLettre}>{initiale(nom || '?')}</Text>
      </View>
      <View style={{ flexShrink: 1 }}>
        <Text style={styles.cellule} numberOfLines={1}>{nom}</Text>
        {sous ? <Text style={styles.sous} numberOfLines={1}>{sous}</Text> : null}
      </View>
    </View>
  );
}

export function Cellule({ children }) {
  return <Text style={styles.cellule} numberOfLines={2}>{children}</Text>;
}

const creerStyles = () => StyleSheet.create({
  entete: { flexDirection: 'row', paddingVertical: espaces.s + 2, paddingHorizontal: espaces.s + 4, borderBottomWidth: 1, borderBottomColor: couleurs.bordure },
  enteteTexte: { fontSize: 11, fontWeight: '700', color: couleurs.texteSecondaire, textTransform: 'uppercase', letterSpacing: 0.4 },
  ligne: { flexDirection: 'row', alignItems: 'center', paddingVertical: espaces.s + 4, paddingHorizontal: espaces.s + 4, borderRadius: 14 },
  ligneAlternee: { backgroundColor: couleurs.surface2 },
  vide: { fontSize: 14, color: couleurs.texteSecondaire, paddingVertical: espaces.m, paddingHorizontal: espaces.s + 4 },
  cellule: { fontSize: 13, fontWeight: '600', color: couleurs.texte },
  sous: { fontSize: 11, color: couleurs.texteSecondaire, marginTop: 1 },
  avatarLigne: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: couleurs.primaireClair, alignItems: 'center', justifyContent: 'center' },
  avatarLettre: { fontSize: 14, fontWeight: '700', color: couleurs.primaire },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});