import React from 'react';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import BuyerNavigator from './BuyerNavigator';
import SellerNavigator from './SellerNavigator';
import AdminNavigator from './AdminNavigator';

/**
 * Wählt anhand der Rolle den passenden Navigations-Stack.
 * Admin / Verkäufer / Käufer erhalten jeweils ein eigenes Dashboard.
 */
export default function RootNavigator() {
  const { user } = useAuth();

  if (!user) return <AuthNavigator />;
  if (user.role === 'admin') return <AdminNavigator />;
  if (user.role === 'seller') return <SellerNavigator />;
  return <BuyerNavigator />;
}
