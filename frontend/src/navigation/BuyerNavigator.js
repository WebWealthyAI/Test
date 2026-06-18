import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DiscoverScreen from '../screens/buyer/DiscoverScreen';
import ProductDetailScreen from '../screens/buyer/ProductDetailScreen';
import CheckoutScreen from '../screens/buyer/CheckoutScreen';
import OffersScreen from '../screens/buyer/OffersScreen';
import OrdersScreen from '../screens/buyer/OrdersScreen';
import OrderTrackingScreen from '../screens/buyer/OrderTrackingScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const brand = '#0F766E';

function tabIcon(emoji) {
  return ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

function DiscoverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: brand }, headerTintColor: '#fff' }}>
      <Stack.Screen name="Discover" component={DiscoverScreen} options={{ title: 'Entdecken' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Produkt' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Kasse' }} />
    </Stack.Navigator>
  );
}

function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: brand }, headerTintColor: '#fff' }}>
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Meine Bestellungen' }} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ title: 'Tracking' }} />
    </Stack.Navigator>
  );
}

export default function BuyerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: brand,
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tab.Screen name="DiscoverTab" component={DiscoverStack} options={{ title: 'Entdecken', tabBarIcon: tabIcon('🔍') }} />
      <Tab.Screen name="OffersTab" component={OffersScreen} options={{ title: 'Offerten', tabBarIcon: tabIcon('🤝') }} />
      <Tab.Screen name="OrdersTab" component={OrdersStack} options={{ title: 'Bestellungen', tabBarIcon: tabIcon('📦') }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profil', tabBarIcon: tabIcon('👤') }} />
    </Tab.Navigator>
  );
}
