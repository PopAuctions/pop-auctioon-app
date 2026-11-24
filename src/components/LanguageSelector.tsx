import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { LOCALE_CONFIG, SUPPORTED_LANGUAGES } from '@/i18n/locales';

export default function LanguageSelector() {
  const { t, locale, changeLanguage, isPending } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{t('screens.account.title')}</Text>
        {isPending && (
          <ActivityIndicator
            size='small'
            color='#2196f3'
            style={styles.loadingIndicator}
          />
        )}
      </View>
      <View style={styles.languageList}>
        {SUPPORTED_LANGUAGES.map((language) => (
          <TouchableOpacity
            key={language}
            style={[
              styles.languageItem,
              locale === language && styles.selectedLanguage,
              isPending && styles.disabledLanguageItem,
            ]}
            onPress={() => changeLanguage(language)}
            disabled={isPending}
          >
            <Text style={styles.flag}>{LOCALE_CONFIG[language].flag}</Text>
            <Text
              style={[
                styles.languageName,
                locale === language && styles.selectedLanguageName,
                isPending && styles.disabledText,
              ]}
            >
              {LOCALE_CONFIG[language].label}
            </Text>
            {locale === language && !isPending && (
              <Text style={styles.checkmark}>✓</Text>
            )}
            {isPending && locale === language && (
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
