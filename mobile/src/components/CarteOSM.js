/*
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { htmlCarte } from './carteHtml';

// Carte OpenStreetMap sur le téléphone : une WebView qui affiche la page HTML
export default function CarteOSM({ centre, points = [], moi, onSelect, hauteur = 300 }) {
  const cle = JSON.stringify([centre, points, moi]);
  const html = useMemo(() => htmlCarte(centre, points, moi), [cle]);
  return (
    <View style={{ height: hauteur, borderRadius: 20, overflow: 'hidden' }}>
      <WebView
        key={cle}
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        onMessage={(e) => {
          try {
            const m = JSON.parse(e.nativeEvent.data);
            if (m && m.type === 'boutique' && onSelect) onSelect(m.id);
          } catch (err) {
            // message ignoré
          }
        }}
      />
    </View>
  );
}
*/
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { htmlCarte, estSombre } from './carteHtml';
import { useThemeVersion } from '../theme/registre';
import { couleurs } from '../theme';

// Carte OpenStreetMap sur le téléphone : une WebView qui affiche la page HTML
export default function CarteOSM({ centre, points = [], moi, onSelect, hauteur = 300 }) {
  useThemeVersion();
  const sombre = estSombre(couleurs.fond);
  const cle = JSON.stringify([centre, points, moi, sombre]);
  const html = useMemo(() => htmlCarte(centre, points, moi, sombre), [cle]);
  return (
    <View style={{ height: hauteur, borderRadius: 20, overflow: 'hidden' }}>
      <WebView
        key={cle}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://marketplace.local' }}
        javaScriptEnabled
        onMessage={(e) => {
          try {
            const m = JSON.parse(e.nativeEvent.data);
            if (m && m.type === 'boutique' && onSelect) onSelect(m.id);
          } catch (err) {
            // message ignoré
          }
        }}
      />
    </View>
  );
}