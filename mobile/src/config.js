import { Platform } from 'react-native';

// Aperçu dans VS Code (navigateur) : l'API est sur ce même PC.
// Sur un téléphone : remplacer par l'adresse IPv4 du PC (commande ipconfig).
const IP_DU_PC = '192.168.1.20';

export const API_URL =
  Platform.OS === 'web' ? 'http://localhost:3000/api' : `http://${IP_DU_PC}:3000/api`;