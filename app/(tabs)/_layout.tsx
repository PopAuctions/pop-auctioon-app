import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { APP_USER_ROLES } from '@/constants';
import { Text } from 'react-native';

const TabLabel = ({ label, color }: { label: string; color: string }) => {
  return (
    <Text
      numberOfLines={2}
      className='text-center'
      style={{
        color,
        fontSize: 11,
        lineHeight: 13,
      }}
    >
      {label}
    </Text>
  );
};

export default function TabLayout() {
  const { t } = useTranslation();
  const { getSession } = useAuth();
  const [session, role] = getSession();

  const isAuctioneer = role === APP_USER_ROLES.AUCTIONEER;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
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
          headerShown: false,
          tabBarLabel: ({ color }) => (
            <TabLabel
              label={t('tabsNames.home')}
              color={color}
            />
          ),
          tabBarIcon: ({ color }) => (
            <FontAwesome
              name='home'
              size={28}
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
          tabBarLabel: ({ color }) => (
            <TabLabel
              label={t('tabsNames.auctions')}
              color={color}
            />
          ),
          tabBarIcon: ({ color }) => (
            <FontAwesome
              name='gavel'
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* STORE tab - visible for all users */}
      <Tabs.Screen
        name='online-store'
        options={{
          title: t('tabsNames.store'),
          headerShown: false,
          tabBarLabel: ({ color }) => (
            <TabLabel
              label={t('tabsNames.store')}
              color={color}
            />
          ),
          tabBarIcon: ({ color }) => (
            <FontAwesome
              name='shopping-cart'
              size={27}
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
          href: session && isAuctioneer ? undefined : null,
          tabBarLabel: ({ color }) => (
            <TabLabel
              label={t('tabsNames.myAuctions')}
              color={color}
            />
          ),
          tabBarIcon: ({ color }) => (
            <FontAwesome
              name='list'
              size={28}
              color={color}
            />
          ),
        }}
      />

      {/* MY ONLINE STORE tab - only visible for AUCTIONEER */}
      <Tabs.Screen
        name='my-online-store'
        options={{
          title: t('tabsNames.myOnlineStore'),
          headerShown: false,
          href: session && isAuctioneer ? undefined : null,
          tabBarLabel: ({ color }) => (
            <TabLabel
              label={t('tabsNames.myOnlineStore')}
              color={color}
            />
          ),
          tabBarIcon: ({ color }) => (
            <FontAwesome
              name='shopping-bag'
              size={24}
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
          tabBarLabel: ({ color }) => (
            <TabLabel
              label={t('tabsNames.account')}
              color={color}
            />
          ),
          tabBarIcon: ({ color }) => (
            <FontAwesome
              name='user'
              size={26}
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
          tabBarLabel: ({ color }) => (
            <TabLabel
              label={t('tabsNames.login')}
              color={color}
            />
          ),
          tabBarIcon: ({ color }) => (
            <FontAwesome
              name='sign-in'
              size={28}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
