import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SellerDashboardScreen from '../screens/seller/SellerDashboardScreen';
import CreateListingScreen from '../screens/seller/CreateListingScreen';
import InventoryScreen from '../screens/seller/InventoryScreen';
import SellerOrdersScreen from '../screens/seller/SellerOrdersScreen';
import MarketingScreen from '../screens/seller/MarketingScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const brand = '#0F766E';

function tabIcon(emoji) {
  return ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

function InventoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: brand }, headerTintColor: '#fff' }}>
      <Stack.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Inventar' }} />
      <Stack.Screen name="CreateListing" component={CreateListingScreen} options={{ title: 'Neues Inserat' }} />
      <Stack.Screen name="Marketing" component={MarketingScreen} options={{ title: 'Marketing' }} />
    </Stack.Navigator>
  );
}

export default function SellerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: brand,
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tab.Screen name="DashboardTab" component={SellerDashboardScreen} options={{ title: 'Dashboard', tabBarIcon: tabIcon('📊') }} />
      <Tab.Screen name="InventoryTab" component={InventoryStack} options={{ title: 'Inventar', tabBarIcon: tabIcon('🏷️') }} />
      <Tab.Screen name="SellerOrdersTab" component={SellerOrdersScreen} options={{ title: 'Bestellungen', tabBarIcon: tabIcon('📦') }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profil', tabBarIcon: tabIcon('👤') }} />
    </Tab.Navigator>
  );
}
