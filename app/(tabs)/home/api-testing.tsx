import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/context/auth-context';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { API_CONFIG } from '@/config/api-config';

interface TestResult {
  id: string;
  title: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  result?: any;
  error?: string;
  duration?: number;
}

export default function ApiTestingScreen() {
  const { getSession } = useAuth();
  const [session] = getSession();
  const {
    protectedGet,
    protectedPost,
    secureGet,
    securePost,
    isAuthenticated,
  } = useSecureApi();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [activeTest, setActiveTest] = useState<string | null>(null);

  // Función auxiliar para actualizar resultado de test
  const updateTestResult = useCallback(
    (id: string, updates: Partial<TestResult>) => {
      setTestResults((prev) => {
        const existing = prev.find((r) => r.id === id);
        if (existing) {
          return prev.map((r) => (r.id === id ? { ...r, ...updates } : r));
        } else {
          return [
            ...prev,
            { id, title: '', status: 'idle', ...updates } as TestResult,
          ];
        }
      });
    },
    []
  );

  // Función auxiliar para ejecutar test
  const runTest = useCallback(
    async (id: string, title: string, testFunction: () => Promise<any>) => {
      if (activeTest) return; // Solo un test a la vez

      setActiveTest(id);
      updateTestResult(id, { title, status: 'loading' });
      const startTime = Date.now();

      try {
        const result = await testFunction();
        const duration = Date.now() - startTime;
        updateTestResult(id, {
          status: 'success',
          result,
          duration,
          error: undefined,
        });
      } catch (error) {
        const duration = Date.now() - startTime;
        updateTestResult(id, {
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
          duration,
        });
      } finally {
        setActiveTest(null);
      }
    },
    [activeTest, updateTestResult]
  );

  // ========================================
  // TESTS DE CONECTIVIDAD BÁSICA
  // ========================================

  const testBasicConnectivity = () =>
    runTest('connectivity', '🌐 Conectividad Básica', async () => {
      const response = await fetch(API_CONFIG.BASE_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        status: response.status,
        statusText: response.statusText,
        url: API_CONFIG.BASE_URL,
      };
    });

  // ========================================
  // TESTS PROTECTED (Solo API Key)
  // ========================================

  const testProtectedSuccess = () =>
    runTest('protected-success', '✅ PROTECTED Success', async () => {
      return await protectedGet('/test');
    });

  const testProtected400 = () =>
    runTest('protected-400', '❌ PROTECTED 400 (Bad Request)', async () => {
      return await protectedGet('/test?scenario=bad_request');
    });

  const testProtected401 = () =>
    runTest('protected-401', '🚫 PROTECTED 401 (No API Key)', async () => {
      // Hacer request sin API key usando fetch directo
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/mobile/protected/test`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const result = await response.json();
      return { status: response.status, data: result };
    });

  const testProtected403 = () =>
    runTest('protected-403', '🔒 PROTECTED 403 (Wrong API Key)', async () => {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/mobile/protected/test`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'wrong_api_key',
          },
        }
      );

      const result = await response.json();
      return { status: response.status, data: result };
    });

  const testProtected404 = () =>
    runTest('protected-404', '🔍 PROTECTED 404 (Not Found)', async () => {
      return await protectedGet('/test?scenario=not_found');
    });

  const testProtectedReallyNotFound = () =>
    runTest(
      'protected-real-404',
      '🔍 PROTECTED Real 404 (HTML Response)',
      async () => {
        return await protectedGet('/nonexistent');
      }
    );

  const testProtectedPost = () =>
    runTest('protected-post', '📤 PROTECTED POST', async () => {
      return await protectedPost('/test', {
        message: 'Test POST data',
        timestamp: Date.now(),
      });
    });

  // ========================================
  // TESTS SECURE (JWT + API Key)
  // ========================================

  const testSecureSuccess = () =>
    runTest('secure-success', '🔐 SECURE Success', async () => {
      const isAuth = await isAuthenticated();
      if (!isAuth) {
        throw new Error('No estás autenticado para usar endpoints SECURE');
      }
      return await secureGet('/test');
    });

  const testSecure401NoJWT = () =>
    runTest('secure-401-no-jwt', '🚫 SECURE 401 (No JWT)', async () => {
      // Hacer request solo con API key, sin JWT
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/mobile/secure/config?type=basic`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_CONFIG.API_KEY,
          },
        }
      );

      const result = await response.json();
      return { status: response.status, data: result };
    });

  const testSecure401InvalidJWT = () =>
    runTest(
      'secure-401-invalid-jwt',
      '🔑 SECURE 401 (Invalid JWT)',
      async () => {
        const response = await fetch(
          `${API_CONFIG.BASE_URL}/api/mobile/secure/config?type=basic`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': API_CONFIG.API_KEY,
              Authorization: 'Bearer invalid_jwt_token',
            },
          }
        );

        const result = await response.json();
        return { status: response.status, data: result };
      }
    );

  const testSecurePost = () =>
    runTest('secure-post', '📤 SECURE POST', async () => {
      const isAuth = await isAuthenticated();
      if (!isAuth) {
        throw new Error('No estás autenticado para usar endpoints SECURE');
      }
      return await securePost('/test', {
        operation: 'create_auction',
        auctionData: { title: 'Test Auction', startingPrice: 100 },
      });
    });

  const testSecure400 = () =>
    runTest('secure-400', '❌ SECURE 400 (Bad Request)', async () => {
      const isAuth = await isAuthenticated();
      if (!isAuth) {
        throw new Error('No estás autenticado para usar endpoints SECURE');
      }
      return await secureGet('/test?scenario=bad_request');
    });

  const testSecure404 = () =>
    runTest('secure-404', '🔍 SECURE 404 (Not Found)', async () => {
      const isAuth = await isAuthenticated();
      if (!isAuth) {
        throw new Error('No estás autenticado para usar endpoints SECURE');
      }
      return await secureGet('/test?scenario=not_found');
    });

  // ========================================
  // FUNCIONES DE UTILIDAD
  // ========================================

  const clearAllResults = () => {
    setTestResults([]);
  };

  const runAllProtectedTests = async () => {
    if (activeTest) return;

    Alert.alert(
      'Ejecutar Tests PROTECTED',
      '¿Ejecutar todos los tests de endpoints PROTECTED?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ejecutar',
          onPress: async () => {
            await testProtectedSuccess();
            await new Promise((resolve) => setTimeout(resolve, 500));
            await testProtected400();
            await new Promise((resolve) => setTimeout(resolve, 500));
            await testProtected401();
            await new Promise((resolve) => setTimeout(resolve, 500));
            await testProtected403();
            await new Promise((resolve) => setTimeout(resolve, 500));
            await testProtected404();
            await new Promise((resolve) => setTimeout(resolve, 500));
            await testProtectedReallyNotFound();
            await new Promise((resolve) => setTimeout(resolve, 500));
            await testProtectedPost();
          },
        },
      ]
    );
  };

  const runAllSecureTests = async () => {
    if (activeTest) return;

    if (!session) {
      Alert.alert(
        'Error',
        'Debes estar autenticado para ejecutar tests SECURE'
      );
      return;
    }

    Alert.alert(
      'Ejecutar Tests SECURE',
      '¿Ejecutar todos los tests de endpoints SECURE?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ejecutar',
          onPress: async () => {
            await testSecureSuccess();
            await new Promise((resolve) => setTimeout(resolve, 500));
            await testSecure401NoJWT();
            await new Promise((resolve) => setTimeout(resolve, 500));
            await testSecure401InvalidJWT();
            await new Promise((resolve) => setTimeout(resolve, 500));
            await testSecure400();
            await new Promise((resolve) => setTimeout(resolve, 500));
            await testSecure404();
            await new Promise((resolve) => setTimeout(resolve, 500));
            await testSecurePost();
          },
        },
      ]
    );
  };

  // Función para obtener el color del resultado
  const getResultColor = (status: TestResult['status']) => {
    switch (status) {
      case 'loading':
        return 'bg-blue-100 border-blue-300';
      case 'success':
        return 'bg-green-100 border-green-300';
      case 'error':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <ScrollView className='flex-1 bg-white'>
      <View className='p-4'>
        {/* Header */}
        <View className='mb-6'>
          <Text className='text-gray-800 mb-2 text-2xl font-bold'>
            🧪 API Testing Lab
          </Text>
          <Text className='text-gray-600'>
            Prueba completa de todos los endpoints según
            MOBILE_API_TESTING_GUIDE.md
          </Text>
        </View>

        {/* Estado de la configuración */}
        <View className='mb-6 rounded-lg bg-blue-50 p-4'>
          <Text className='mb-2 font-semibold text-blue-800'>
            📋 Configuración:
          </Text>
          <Text className='text-sm text-blue-700'>
            API URL: {API_CONFIG.BASE_URL}
          </Text>
          <Text className='text-sm text-blue-700'>
            API Key: {API_CONFIG.API_KEY ? '✅ Configurada' : '❌ Faltante'}
          </Text>
          <Text className='text-sm text-blue-700'>
            Usuario:{' '}
            {session ? `✅ ${session.user?.email}` : '❌ No autenticado'}
          </Text>
        </View>

        {/* Controles principales */}
        <View className='mb-6'>
          <Text className='text-gray-800 mb-3 font-semibold'>
            🎮 Controles:
          </Text>

          <View className='space-y-2'>
            <TouchableOpacity
              className='rounded-lg bg-blue-500 p-3'
              onPress={testBasicConnectivity}
              disabled={!!activeTest}
            >
              <Text className='text-center font-semibold text-white'>
                🌐 Test Conectividad Básica
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className='rounded-lg bg-green-500 p-3'
              onPress={runAllProtectedTests}
              disabled={!!activeTest}
            >
              <Text className='text-center font-semibold text-white'>
                🔑 Ejecutar Tests PROTECTED
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className='rounded-lg bg-purple-500 p-3'
              onPress={runAllSecureTests}
              disabled={!!activeTest || !session}
              style={{ opacity: activeTest || !session ? 0.5 : 1 }}
            >
              <Text className='text-center font-semibold text-white'>
                🔐 Ejecutar Tests SECURE
              </Text>
            </TouchableOpacity>

            {testResults.length > 0 && (
              <TouchableOpacity
                className='bg-gray-500 rounded-lg p-2'
                onPress={clearAllResults}
                disabled={!!activeTest}
              >
                <Text className='text-center font-semibold text-white'>
                  🗑️ Limpiar Resultados
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tests individuales */}
        <View className='mb-6'>
          <Text className='text-gray-800 mb-3 font-semibold'>
            🔬 Tests Individuales:
          </Text>

          {/* Tests PROTECTED */}
          <View className='mb-4'>
            <Text className='text-gray-700 mb-2 font-medium'>
              PROTECTED Endpoints:
            </Text>
            <View className='space-y-1'>
              <TouchableOpacity
                className='rounded border border-green-300 bg-green-100 p-2'
                onPress={testProtectedSuccess}
                disabled={!!activeTest}
              >
                <Text className='text-center text-green-800'>
                  ✅ Success Case
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className='rounded border border-orange-300 bg-orange-100 p-2'
                onPress={testProtected400}
                disabled={!!activeTest}
              >
                <Text className='text-center text-orange-800'>
                  ❌ 400 Bad Request
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className='rounded border border-red-300 bg-red-100 p-2'
                onPress={testProtected401}
                disabled={!!activeTest}
              >
                <Text className='text-center text-red-800'>
                  🚫 401 No API Key
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className='rounded border border-red-300 bg-red-100 p-2'
                onPress={testProtected403}
                disabled={!!activeTest}
              >
                <Text className='text-center text-red-800'>
                  🔒 403 Wrong API Key
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className='bg-gray-100 border-gray-300 rounded border p-2'
                onPress={testProtected404}
                disabled={!!activeTest}
              >
                <Text className='text-gray-800 text-center'>
                  🔍 404 Not Found
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className='bg-gray-200 border-gray-400 rounded border p-2'
                onPress={testProtectedReallyNotFound}
                disabled={!!activeTest}
              >
                <Text className='text-gray-800 text-center'>
                  🔍 Real 404 (HTML)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className='rounded border border-blue-300 bg-blue-100 p-2'
                onPress={testProtectedPost}
                disabled={!!activeTest}
              >
                <Text className='text-center text-blue-800'>
                  📤 POST Request
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tests SECURE */}
          <View className='mb-4'>
            <Text className='text-gray-700 mb-2 font-medium'>
              SECURE Endpoints:
            </Text>
            <View className='space-y-1'>
              <TouchableOpacity
                className='rounded border border-green-300 bg-green-100 p-2'
                onPress={testSecureSuccess}
                disabled={!!activeTest || !session}
                style={{ opacity: !session ? 0.5 : 1 }}
              >
                <Text className='text-center text-green-800'>
                  🔐 Success Case
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className='rounded border border-red-300 bg-red-100 p-2'
                onPress={testSecure401NoJWT}
                disabled={!!activeTest}
              >
                <Text className='text-center text-red-800'>🚫 401 No JWT</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className='rounded border border-red-300 bg-red-100 p-2'
                onPress={testSecure401InvalidJWT}
                disabled={!!activeTest}
              >
                <Text className='text-center text-red-800'>
                  🔑 401 Invalid JWT
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className='rounded border border-orange-300 bg-orange-100 p-2'
                onPress={testSecure400}
                disabled={!!activeTest || !session}
                style={{ opacity: !session ? 0.5 : 1 }}
              >
                <Text className='text-center text-orange-800'>
                  ❌ 400 Bad Request
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className='bg-gray-100 border-gray-300 rounded border p-2'
                onPress={testSecure404}
                disabled={!!activeTest || !session}
                style={{ opacity: !session ? 0.5 : 1 }}
              >
                <Text className='text-gray-800 text-center'>
                  🔍 404 Not Found
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className='rounded border border-blue-300 bg-blue-100 p-2'
                onPress={testSecurePost}
                disabled={!!activeTest || !session}
                style={{ opacity: !session ? 0.5 : 1 }}
              >
                <Text className='text-center text-blue-800'>
                  📤 POST Request
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Indicador de test activo */}
        {activeTest && (
          <View className='mb-4 rounded-lg border border-blue-300 bg-blue-50 p-3'>
            <View className='flex-row items-center justify-center'>
              <ActivityIndicator
                size='small'
                color='#3B82F6'
              />
              <Text className='ml-2 font-medium text-blue-800'>
                Ejecutando test...
              </Text>
            </View>
          </View>
        )}

        {/* Resultados */}
        {testResults.length > 0 && (
          <View className='mb-6'>
            <Text className='text-gray-800 mb-3 font-semibold'>
              📊 Resultados:
            </Text>

            {testResults.map((result) => (
              <View
                key={result.id}
                className={`mb-3 rounded-lg border p-3 ${getResultColor(result.status)}`}
              >
                <View className='mb-2 flex-row items-center justify-between'>
                  <Text className='text-gray-800 font-medium'>
                    {result.title}
                  </Text>
                  {result.duration && (
                    <Text className='text-gray-600 text-xs'>
                      {result.duration}ms
                    </Text>
                  )}
                </View>

                {result.status === 'loading' && (
                  <View className='flex-row items-center'>
                    <ActivityIndicator
                      size='small'
                      color='#6B7280'
                    />
                    <Text className='text-gray-600 ml-2'>Ejecutando...</Text>
                  </View>
                )}

                {result.status === 'success' && result.result && (
                  <View className='bg-gray-800 rounded p-2'>
                    <Text className='font-mono text-xs text-green-400'>
                      {JSON.stringify(result.result, null, 2)}
                    </Text>
                  </View>
                )}

                {result.status === 'error' && result.error && (
                  <View className='bg-gray-800 rounded p-2'>
                    <Text className='font-mono text-xs text-red-400'>
                      ❌ {result.error}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Footer con información adicional */}
        <View className='rounded-lg bg-yellow-50 p-4'>
          <Text className='mb-2 font-semibold text-yellow-800'>
            💡 Información:
          </Text>
          <Text className='mb-1 text-sm text-yellow-700'>
            • Los tests PROTECTED solo requieren API Key
          </Text>
          <Text className='mb-1 text-sm text-yellow-700'>
            • Los tests SECURE requieren autenticación (JWT + API Key)
          </Text>
          <Text className='mb-1 text-sm text-yellow-700'>
            • Los errores 401/403/404 son esperados en algunos tests
          </Text>
          <Text className='text-sm text-yellow-700'>
            • Asegúrate de que tu servidor Next.js esté ejecutándose en{' '}
            {API_CONFIG.BASE_URL}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
