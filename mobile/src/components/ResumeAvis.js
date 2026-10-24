import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Etoiles, { COULEUR_ETOILE } from './Etoiles';
import { couleurs, espaces } from '../theme';

export default function ResumeAvis({ resume }) {
  const total = resume.nombreAvis;
  return (
    <View style={styles.zone}>
      <View style={styles.gauche}>
        <Text style={styles.note}>{total > 0 ? String(resume.noteMoyenne).replace('.', ',') : '—'}</Text>
        <Etoiles note={resume.noteMoyenne} taille={16} />
        <Text style={styles.total}>{total} avis</Text>
      </View>
      <View style={styles.droite}>
        {[5, 4, 3, 2, 1].map((n) => {
          const nb = resume.repartition[n] || 0;
          const part = total > 0 ? (nb * 100) / total : 0;
          return (
            <View key={n} style={styles.ligne}>
              <Text style={styles.etiquette}>{n}</Text>
              <Ionicons name="star" size={11} color={COULEUR_ETOILE} />
              <View style={styles.piste}>
                <View style={[styles.barre, { width: `${part}%` }]} />
              </View>
              <Text style={styles.compte}>{nb}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  zone: { flexDirection: 'row', alignItems: 'center', gap: espaces.m },
  gauche: { alignItems: 'center', minWidth: 90 },
  note: { fontSize: 40, fontWeight: '800', color: couleurs.texte },
  total: { fontSize: 12, color: couleurs.texteSecondaire, marginTop: 4 },
  droite: { flex: 1, gap: 5 },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  etiquette: { width: 10, fontSize: 12, color: couleurs.texte, fontWeight: '600' },
  piste: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#F1F2FA', overflow: 'hidden' },
  barre: { height: 6, borderRadius: 3, backgroundColor: COULEUR_ETOILE },
  compte: { width: 22, fontSize: 12, color: couleurs.texteSecondaire, textAlign: 'right' },
});