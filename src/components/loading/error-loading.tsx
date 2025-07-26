import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from '../../hooks/useTranslation';

export default function ErrorLoading({ message }: { message?: string }) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('errors.applicationError')}</Text>
      <Text style={styles.subtitle}>
        {message ?? t('errors.defaultMessage')}
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
