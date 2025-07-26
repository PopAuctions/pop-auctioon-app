import { View, Text, StyleSheet } from 'react-native';

export default function ErrorLoading({ message }: { message?: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ocurrió un error al cargar la aplicación</Text>
      <Text style={styles.subtitle}>
        {message ??
          'Por favor, verifica tu conexión a internet y reinicia Expo. Si el problema persiste, contacta soporte.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e53935',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});
