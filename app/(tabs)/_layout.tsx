import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/hooks/useTranslation';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { session, role } = useAuth();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          display: 'flex',
        },
      }}
    >
      {/* 🔒 USUARIO LOGGEADO CON SESIÓN (role: UserRoles.USER) */}
      {/* HOME - SUBASTA - TIENDA ONLINE - ACCOUNT */}
      {session && role === 'USER' && (
        <>
          <Tabs.Screen
            name='index/home'
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
          {/* Hide tabs not needed for USER */}
          <Tabs.Screen
            name='my-auctions'
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name='auth'
            options={{
              href: null,
            }}
          />
        </>
      )}

      {/* 🎭 USUARIO CON ROL SUBASTADOR (role: UserRoles.AUCTIONEER) */}
      {/* HOME - SUBASTA - TIENDA - MIS SUBASTAS - ACCOUNT */}
      {session && role === 'AUCTIONEER' && (
        <>
          <Tabs.Screen
            name='index/home'
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
                  name='list'
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
          {/* Hide auth tab for AUCTIONEER */}
          <Tabs.Screen
            name='auth'
            options={{
              href: null,
            }}
          />
        </>
      )}

      {/* 🚪 USUARIO SIN SESIÓN (NO LOGGEADO) */}
      {/* HOME - SUBASTAS - TIENDA - LOGIN */}
      {!session && (
        <>
          <Tabs.Screen
            name='index/home'
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
            name='auth'
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
          {/* Hide my-auctions and account for non-logged users */}
          <Tabs.Screen
            name='my-auctions'
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name='account'
            options={{
              href: null,
            }}
          />
        </>
      )}
    </Tabs>
  );
}
