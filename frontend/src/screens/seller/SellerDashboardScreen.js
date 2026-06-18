import React, { useCallback, useState } from 'react';
import { View, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Heading, Subtle, Card, Row } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { chf } from '../../theme/status';

function Stat({ label, value, color = '#0F766E' }) {
  return (
    <Card className="flex-1 mx-1">
      <Text style={{ color }} className="text-2xl font-extrabold">{value}</Text>
      <Subtle>{label}</Subtle>
    </Card>
  );
}

export default function SellerDashboardScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  const load = useCallback(async () => {
    try { const { orders: o } = await api.sellingOrders(); setOrders(o); } catch (e) {}
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const open = orders.filter((o) => ['funds_held', 'processing'].includes(o.status)).length;
  const shipped = orders.filter((o) => o.status === 'shipped').length;
  const revenue = orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.amount, 0);

  return (
    <Screen>
      <Heading>Hallo, {user.full_name || 'Verkäufer'}</Heading>
      <Subtle className="mb-4">Dein Verkäufer-Dashboard</Subtle>

      <Row className="mb-2">
        <Stat label="Offene Aufträge" value={open} color="#F59E0B" />
        <Stat label="Versendet" value={shipped} color="#6366F1" />
      </Row>
      <Row className="mb-4">
        <Stat label="Umsatz (freigegeben)" value={chf(revenue)} color="#10B981" />
      </Row>

      <Card>
        <Heading className="text-lg">Treuhand-Auszahlung</Heading>
        <Subtle>Stripe-Connect-Konto: {user.stripe_account_id ? `${user.stripe_account_id}` : 'nicht verbunden'}</Subtle>
        <Subtle className="mt-1">Auszahlungen erfolgen automatisch, sobald Käufer den Erhalt bestätigen.</Subtle>
      </Card>

      <Card>
        <Heading className="text-lg">Letzte Bestellungen</Heading>
        {orders.slice(0, 5).map((o) => (
          <Row key={o.id} className="justify-between py-2 border-b border-gray-50">
            <Text className="text-gray-700">#{o.id.slice(0, 8)}</Text>
            <Text className="text-gray-500">{o.status}</Text>
            <Text className="font-semibold text-brand">{chf(o.amount)}</Text>
          </Row>
        ))}
        {orders.length === 0 ? <Subtle>Noch keine Bestellungen.</Subtle> : null}
      </Card>
    </Screen>
  );
}
