import { registerRootComponent } from 'expo';
import { chargerPreferenceTheme } from './src/theme/preference';

// Le mode (jour ou nuit) est lu avant de charger le reste de l'application
chargerPreferenceTheme().finally(() => {
  const App = require('./App').default;
  registerRootComponent(App);
});