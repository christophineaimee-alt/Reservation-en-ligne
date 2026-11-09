/*
import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { htmlCarte } from './carteHtml';

// Carte OpenStreetMap sur le web : une iframe qui reçoit la page HTML
export default function CarteOSM({ centre, points = [], moi, onSelect, hauteur = 300 }) {
  const cle = JSON.stringify([centre, points, moi]);
  const html = useMemo(() => htmlCarte(centre, points, moi), [cle]);

  useEffect(() => {
    function recevoir(e) {
      const m = e.data;
      if (m && m.type === 'boutique' && onSelect) onSelect(m.id);
    }
    window.addEventListener('message', recevoir);
    return () => window.removeEventListener('message', recevoir);
  }, [onSelect]);

  return (
    <View style={{ height: hauteur, borderRadius: 20, overflow: 'hidden' }}>
      <iframe
        key={cle}
        title="Carte des boutiques"
        srcDoc={html}
        style={{ border: 0, width: '100%', height: '100%' }}
        sandbox="allow-scripts allow-same-origin"
        referrerPolicy="origin"
      />
    </View>
  );
}
*/
import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { htmlCarte, estSombre } from './carteHtml';
import { useThemeVersion } from '../theme/registre';
import { couleurs } from '../theme';

// Carte OpenStreetMap sur le web : une iframe qui reçoit la page HTML
export default function CarteOSM({ centre, points = [], moi, onSelect, hauteur = 300 }) {
  useThemeVersion();
  const sombre = estSombre(couleurs.fond);
  const cle = JSON.stringify([centre, points, moi, sombre]);
  const html = useMemo(() => htmlCarte(centre, points, moi, sombre), [cle]);

  useEffect(() => {
    function recevoir(e) {
      const m = e.data;
      if (m && m.type === 'boutique' && onSelect) onSelect(m.id);
    }
    window.addEventListener('message', recevoir);
    return () => window.removeEventListener('message', recevoir);
  }, [onSelect]);

  return (
    <View style={{ height: hauteur, borderRadius: 20, overflow: 'hidden' }}>
      <iframe
        key={cle}
        title="Carte des boutiques"
        srcDoc={html}
        style={{ border: 0, width: '100%', height: '100%' }}
        sandbox="allow-scripts allow-same-origin"
        referrerPolicy="origin"
      />
    </View>
  );
}