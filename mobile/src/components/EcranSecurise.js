import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Si l'écran plante, on voit l'erreur au lieu d'une page blanche
export default class EcranSecurise extends React.Component {
  state = { erreur: null };

  static getDerivedStateFromError(erreur) {
    return { erreur };
  }

  componentDidCatch(erreur, info) {
    console.error('Erreur dans un écran :', erreur, info && info.componentStack);
  }

  render() {
    if (!this.state.erreur) return this.props.children;
    const texte = String(this.state.erreur && this.state.erreur.stack ? this.state.erreur.stack : this.state.erreur);
    return (
      <View style={{ flex: 1, backgroundColor: '#FFF4F4', padding: 20, justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#B3203B' }}>Cet écran a rencontré une erreur</Text>
        <ScrollView style={{ marginVertical: 14, maxHeight: 320 }}>
          <Text selectable style={{ color: '#3A1F26', fontSize: 12 }}>{texte}</Text>
        </ScrollView>
        <TouchableOpacity
          onPress={() => this.setState({ erreur: null })}
          style={{ backgroundColor: '#B3203B', borderRadius: 24, padding: 14, alignItems: 'center' }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }
}