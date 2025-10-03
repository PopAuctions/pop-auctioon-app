import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/ui/useColorScheme';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { getSession } = useAuth();
  const [session, role] = getSession();

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
      {/* INDEX redirect - hidden from tab bar */}
      <Tabs.Screen
        name='index'
        options={{
          href: null, // Hide from tab bar
        }}
      />

      {/* HOME tab - visible for all users */}
      <Tabs.Screen
        name='home'
        options={{
          title: t('tabsNames.home'),
          tabBarLabel: t('tabsNames.home'),
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

      {/* AUCTIONS tab - visible for all users */}
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

      {/* STORE tab - visible for all users */}
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

      {/* MY AUCTIONS tab - only visible for AUCTIONEER */}
      <Tabs.Screen
        name='my-auctions'
        options={{
          title: t('tabsNames.myAuctions'),
          headerShown: false,
          href: session && role === 'AUCTIONEER' ? undefined : null,
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

      {/* ACCOUNT tab - only visible for logged users */}
      <Tabs.Screen
        name='account'
        options={{
          title: t('tabsNames.account'),
          headerShown: false,
          href: session ? undefined : null,
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

      {/* AUTH tab - only visible for non-logged users */}
      <Tabs.Screen
        name='auth'
        options={{
          title: t('tabsNames.login'),
          headerShown: false,
          href: !session ? undefined : null,
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
    </Tabs>
  );
}
