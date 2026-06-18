import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import EscrowMonitorScreen from '../screens/admin/EscrowMonitorScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AdminToolsScreen from '../screens/admin/AdminToolsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();
const brand = '#0F766E';

function tabIcon(emoji) {
  return ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: brand },
        headerTintColor: '#fff',
        tabBarActiveTintColor: brand,
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Übersicht', tabBarIcon: tabIcon('📊') }} />
      <Tab.Screen name="Escrow" component={EscrowMonitorScreen} options={{ title: 'Treuhand', tabBarIcon: tabIcon('💰') }} />
      <Tab.Screen name="Users" component={UserManagementScreen} options={{ title: 'Nutzer', tabBarIcon: tabIcon('👥') }} />
      <Tab.Screen name="Tools" component={AdminToolsScreen} options={{ title: 'Tools', tabBarIcon: tabIcon('🛠️') }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profil', tabBarIcon: tabIcon('👤') }} />
    </Tab.Navigator>
  );
}
