const env = require('./config/env');
const app = require('./app');
const planificateur = require('./services/planificateur');

app.listen(env.port, '0.0.0.0', () => {
  console.log(`API prête sur http://localhost:${env.port}`);
  planificateur.demarrer();
});