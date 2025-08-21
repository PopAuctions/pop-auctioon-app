import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/hooks/useTranslation';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { session, role } = useAuth();
  const { t } = useTranslation();

  // Función para renderizar tabs según el mapping de rutas
  const renderTabsByUserState = () => {
    // 🔒 USUARIO LOGGEADO CON SESIÓN (role: UserRoles.USER)
    // HOME - SUBASTA - TIENDA ONLINE - ACCOUNT
    if (session && role === 'USER') {
      console.log('User is logged in');
      return (
        <>
          <Tabs.Screen
            name='index'
            options={{
              title: t('tabsNames.home'),
              headerShown: false,
              tabBarIcon: ({ color }) => (
                <FontAwesome
                  name='home'
                  size={28}
                  style={{ marginBottom: -3 }}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name='auctions'
            options={{
              title: t('tabsNames.auctions'),
              headerShown: false,
              tabBarIcon: ({ color }) => (
                <FontAwesome
                  name='gavel'
                  size={28}
                  style={{ marginBottom: -3 }}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name='store'
            options={{
              title: t('tabsNames.store'),
              headerShown: false,
              tabBarIcon: ({ color }) => (
                <FontAwesome
                  name='shopping-cart'
                  size={28}
                  style={{ marginBottom: -3 }}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name='account'
            options={{
              title: t('tabsNames.account'),
              headerShown: false,
              tabBarIcon: ({ color }) => (
                <FontAwesome
                  name='user'
                  size={28}
                  style={{ marginBottom: -3 }}
                  color={color}
                />
              ),
            }}
          />
        </>
      );
    }

    // 🏆 AUCTIONEER LOGGEADO
    // HOME - SUBASTA - TIENDA - MIS SUBASTAS - ACCOUNT
    if (session && role === 'AUCTIONEER') {
      console.log('Auctioneer is logged in');
      return (
        <>
          <Tabs.Screen
            name='index'
            options={{
              title: t('tabsNames.home'),
              headerShown: false,
              tabBarIcon: ({ color }) => (
                <FontAwesome
                  name='home'
                  size={28}
                  style={{ marginBottom: -3 }}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name='auctions'
            options={{
              title: t('tabsNames.auctions'),
              headerShown: false,
              tabBarIcon: ({ color }) => (
                <FontAwesome
                  name='gavel'
                  size={28}
                  style={{ marginBottom: -3 }}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name='store'
            options={{
              title: t('tabsNames.store'),
              headerShown: false,
              tabBarIcon: ({ color }) => (
                <FontAwesome
                  name='shopping-cart'
                  size={28}
                  style={{ marginBottom: -3 }}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name='my-auctions'
            options={{
              title: t('tabsNames.myAuctions'),
              headerShown: false,
              tabBarIcon: ({ color }) => (
                <FontAwesome
                  name='list-alt'
                  size={28}
                  style={{ marginBottom: -3 }}
                  color={color}
                />
              ),
              headerRight: () => (
                <Link
                  href='/modal'
                  asChild
                >
                  <Pressable>
                    {({ pressed }) => (
                      <FontAwesome
                        name='plus'
                        size={25}
                        color={Colors[colorScheme ?? 'light'].text}
                        style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                      />
                    )}
                  </Pressable>
                </Link>
              ),
            }}
          />
          <Tabs.Screen
            name='account'
            options={{
              title: t('tabsNames.account'),
              headerShown: false,
              tabBarIcon: ({ color }) => (
                <FontAwesome
                  name='user'
                  size={28}
                  style={{ marginBottom: -3 }}
                  color={color}
                />
              ),
            }}
          />
        </>
      );
    }

    // 🚪 USUARIO SIN SESIÓN (No loggeado)
    // HOME - SUBASTAS - TIENDA - LOGIN
    return (
      <>
        <Tabs.Screen
          name='index'
          options={{
            title: t('tabsNames.home'),
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <FontAwesome
                name='home'
                size={28}
                style={{ marginBottom: -3 }}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name='auctions'
          options={{
            title: t('tabsNames.auctions'),
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <FontAwesome
                name='gavel'
                size={28}
                style={{ marginBottom: -3 }}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name='store'
          options={{
            title: t('tabsNames.store'),
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <FontAwesome
                name='shopping-cart'
                size={28}
                style={{ marginBottom: -3 }}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name='account'
          options={{
            title: t('tabsNames.login'),
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <FontAwesome
                name='sign-in'
                size={28}
                style={{ marginBottom: -3 }}
                color={color}
              />
            ),
          }}
        />
      </>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false, // Forzar que no se muestren headers en ningún tab
        tabBarShowLabel: true, // Asegurar que se muestran las labels
        tabBarStyle: {
          display: 'flex', // Asegurar que el tab bar sea visible
        },
      }}
    >
      {renderTabsByUserState()}
    </Tabs>
  );
}
