import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';

export default function LanguageSelector() {
  const { t, locale, changeLanguage, isPending } = useTranslation();

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{t('account.language')}</Text>
        {isPending && (
          <ActivityIndicator
            size='small'
            color='#2196f3'
            style={styles.loadingIndicator}
          />
        )}
      </View>
      <View style={styles.languageList}>
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageItem,
              locale === language.code && styles.selectedLanguage,
              isPending && styles.disabledLanguageItem,
            ]}
            onPress={() => changeLanguage(language.code as 'es' | 'en')}
            disabled={isPending}
          >
            <Text style={styles.flag}>{language.flag}</Text>
            <Text
              style={[
                styles.languageName,
                locale === language.code && styles.selectedLanguageName,
                isPending && styles.disabledText,
              ]}
            >
              {language.name}
            </Text>
            {locale === language.code && !isPending && (
              <Text style={styles.checkmark}>✓</Text>
            )}
            {isPending && locale === language.code && (
              <ActivityIndicator
                size='small'
                color='#2196f3'
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  languageList: {
    gap: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedLanguage: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  disabledLanguageItem: {
    opacity: 0.6,
    backgroundColor: '#f0f0f0',
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    flex: 1,
    color: '#333',
  },
  selectedLanguageName: {
    color: '#2196f3',
    fontWeight: '600',
  },
  disabledText: {
    color: '#999',
  },
  checkmark: {
    fontSize: 18,
    color: '#2196f3',
    fontWeight: 'bold',
  },
});
