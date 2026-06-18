import React, { useCallback, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Heading, Subtle, Card, Button, Badge, Row, Field } from '../../components/ui';
import { api } from '../../api/client';
import { chf, ORDER_STATUS_META } from '../../theme/status';

/** Order Management: Status-Updates, Versand erfassen, Tracking. */
export default function SellerOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [tracking, setTracking] = useState({});

  const load = useCallback(async () => {
    try { const { orders: o } = await api.sellingOrders(); setOrders(o); } catch (e) {}
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function ship(order) {
    try {
      await api.shipOrder(order.id, { carrier: 'Swiss Post', tracking_number: tracking[order.id] || undefined });
      await load();
      Alert.alert('Versendet', 'Der Käufer wurde benachrichtigt.');
    } catch (e) { Alert.alert('Fehler', e.message); }
  }

  return (
    <Screen>
      <Heading>Bestellungen</Heading>
      <Subtle className="mb-3">Status verwalten und Lieferungen erfassen.</Subtle>
      {orders.length === 0 ? <Subtle>Noch keine Bestellungen.</Subtle> : null}
      {orders.map((o) => {
        const meta = ORDER_STATUS_META[o.status] || {};
        return (
          <Card key={o.id}>
            <Row className="justify-between">
              <Text className="font-semibold text-gray-900">#{o.id.slice(0, 8)}</Text>
              <Text className="font-bold text-brand">{chf(o.amount)}</Text>
            </Row>
            <Badge label={meta.label} color={meta.color} />

            {o.status === 'funds_held' ? (
              <View className="mt-3">
                <Subtle className="mb-1">Geld ist im Treuhand blockiert – jetzt versenden.</Subtle>
                <Field placeholder="Tracking-Nr. (optional)" value={tracking[o.id] || ''} onChangeText={(v) => setTracking((t) => ({ ...t, [o.id]: v }))} />
                <Button title="Als versendet markieren" onPress={() => ship(o)} />
              </View>
            ) : null}

            {o.status === 'completed' ? (
              <Subtle className="mt-2 text-green-600">✓ Käufer hat bestätigt – Auszahlung freigegeben.</Subtle>
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}
