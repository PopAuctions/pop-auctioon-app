import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSecureApi } from '@/hooks/useSecureApi';
import { useAuth } from '@/context/auth-context';

export default function HomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { secureGet, isAuthenticated } = useSecureApi();
  const { session } = useAuth();
  const [testResults, setTestResults] = useState<string>('');

  // Test básico de conectividad
  const testConnectivity = async () => {
    try {
      setTestResults('🔄 Probando conectividad...');

      const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

      if (!API_BASE_URL) {
        setTestResults('❌ EXPO_PUBLIC_API_BASE_URL no encontrada');
        return;
      }

      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setTestResults('✅ Servidor Next.js conectado correctamente');
      } else {
        setTestResults(`❌ Error de respuesta: ${response.status}`);
      }
    } catch (error) {
      setTestResults(`❌ Error de conexión: ${error}`);
    }
  };

  // Test API Key básico
  const testApiKey = async () => {
    try {
      setTestResults('🔄 Probando API Key...');

      const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

      if (!API_KEY) {
        setTestResults('❌ EXPO_PUBLIC_API_KEY no encontrada');
        return;
      }

      if (!API_BASE_URL) {
        setTestResults('❌ EXPO_PUBLIC_API_BASE_URL no encontrada');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/mobile/protected/test`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY,
            'X-Timestamp': Date.now().toString(),
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        setTestResults(
          `✅ API Key funciona: ${JSON.stringify(result, null, 2)}`
        );
      } else {
        setTestResults(`❌ Error API Key: ${JSON.stringify(result, null, 2)}`);
      }
    } catch (error) {
      setTestResults(`❌ Exception: ${error}`);
    }
  };

  // Test endpoint SECURE (JWT + API Key)
  const testSecureEndpoint = async () => {
    try {
      setTestResults('🔄 Probando endpoint SECURE...');

      const isAuth = await isAuthenticated();
      if (!isAuth) {
        setTestResults(
          '❌ ERROR: No estás autenticado para usar endpoints SECURE'
        );
        return;
      }

      const result = await secureGet('/config?type=basic');

      if (result.error) {
        setTestResults(`❌ ERROR SECURE: ${result.error}`);
      } else {
        setTestResults(
          `✅ SUCCESS SECURE: ${JSON.stringify(result.data, null, 2)}`
        );
      }
    } catch (error) {
      setTestResults(`❌ Exception SECURE: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults('');
  };

  return (
    <ScrollView
      className='flex-1 bg-white'
      style={{ paddingTop: insets.top }}
    >
      <View className='flex-1 px-4'>
        {/* Título original */}
        <View className='items-center justify-center py-8'>
          <Text className='text-gray-800 mb-2 text-center text-3xl font-bold'>
            {t('screens.home.title')}
          </Text>
          <Text className='text-gray-600 text-center'>
            {t('screens.home.subtitle')}
          </Text>
        </View>

        {/* API Testing Section */}
        <View className='bg-gray-50 mb-6 rounded-lg p-4'>
          <Text className='text-gray-800 mb-4 text-xl font-bold'>
            🧪 API Testing (Básico)
          </Text>

          {/* Variables de entorno */}
          <View className='mb-4 rounded-lg bg-blue-50 p-3'>
            <Text className='font-semibold text-blue-800'>
              Variables de Entorno:
            </Text>
            <Text className='text-sm text-blue-700'>
              API_BASE_URL:{' '}
              {process.env.EXPO_PUBLIC_API_BASE_URL || '❌ No definida'}
            </Text>
            <Text className='text-sm text-blue-700'>
              API_KEY:{' '}
              {process.env.EXPO_PUBLIC_API_KEY
                ? '✅ Definida'
                : '❌ No definida'}
            </Text>
          </View>

          {/* Estado de autenticación */}
          <View className='mb-4 rounded-lg bg-green-50 p-3'>
            <Text className='font-semibold text-green-800'>
              Estado de Autenticación:
            </Text>
            <Text className='text-green-700'>
              {session
                ? `✅ Autenticado: ${session.user?.email}`
                : '❌ No autenticado'}
            </Text>
          </View>

          {/* Botones de testing */}
          <View className='mb-4 space-y-3'>
            <TouchableOpacity
              className='rounded-lg bg-blue-500 p-4'
              onPress={testConnectivity}
            >
              <Text className='text-center font-semibold text-white'>
                🌐 Test Conectividad
              </Text>
              <Text className='text-center text-sm text-blue-100'>
                {process.env.EXPO_PUBLIC_API_BASE_URL || 'No definida'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className='rounded-lg bg-green-500 p-4'
              onPress={testApiKey}
            >
              <Text className='text-center font-semibold text-white'>
                🔑 Test API Key Protected
              </Text>
              <Text className='text-center text-sm text-green-100'>
                /api/mobile/protected/test
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className='rounded-lg bg-purple-500 p-4'
              onPress={testSecureEndpoint}
              disabled={!session}
              style={{ opacity: session ? 1 : 0.5 }}
            >
              <Text className='text-center font-semibold text-white'>
                🔒 Test SECURE Endpoint
              </Text>
              <Text className='text-center text-sm text-purple-100'>
                /api/mobile/secure/config (JWT + API Key)
              </Text>
            </TouchableOpacity>

            {testResults !== '' && (
              <TouchableOpacity
                className='bg-gray-500 rounded-lg p-2'
                onPress={clearResults}
              >
                <Text className='text-center font-semibold text-white'>
                  🗑️ Limpiar Resultados
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Resultados */}
          {testResults !== '' && (
            <View className='bg-gray-800 rounded-lg p-3'>
              <Text className='text-gray-300 mb-2 font-semibold'>
                📋 Resultados:
              </Text>
              <Text className='font-mono text-sm text-green-400'>
                {testResults}
              </Text>
            </View>
          )}
        </View>

        {/* Información adicional */}
        <View className='rounded-lg bg-yellow-50 p-4'>
          <Text className='mb-2 font-semibold text-yellow-800'>
            💡 Pasos para probar:
          </Text>
          <Text className='mb-1 text-sm text-yellow-700'>
            1. Asegúrate de que tu servidor Next.js esté corriendo
          </Text>
          <Text className='mb-1 text-sm text-yellow-700'>
            2. Primero prueba "Test Conectividad"
          </Text>
          <Text className='text-sm text-yellow-700'>
            3. Luego prueba "Test API Key Protected"
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
