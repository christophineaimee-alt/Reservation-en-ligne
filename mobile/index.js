/*
import { registerRootComponent } from 'expo';
import { chargerPreferenceTheme } from './src/theme/preference';

// Le mode (jour ou nuit) est lu avant de charger le reste de l'application
chargerPreferenceTheme().finally(() => {
  const App = require('./App').default;
  registerRootComponent(App);
});
*/
import React, { useEffect, useState } from 'react';
import { registerRootComponent } from 'expo';
import { chargerPreferenceTheme } from './src/theme/preference';

// L'application est enregistrée immédiatement ; le mode (jour ou nuit) est lu avant d'afficher l'écran
function Racine() {
  const [pret, setPret] = useState(false);

  useEffect(() => {
    chargerPreferenceTheme()
      .catch(() => {})
      .finally(() => setPret(true));
  }, []);

  if (!pret) return null;
  const App = require('./App').default;
  return <App />;
}

registerRootComponent(Racine);