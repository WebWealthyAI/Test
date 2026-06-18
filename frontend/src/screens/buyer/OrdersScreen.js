import React, { useCallback, useState } from 'react';
import { Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Heading, Subtle, Card, Badge, Row } from '../../components/ui';
import { TouchableOpacity } from 'react-native';
import { api } from '../../api/client';
import { chf, ORDER_STATUS_META } from '../../theme/status';

/** Käufer-Bestellungen mit Live-Status (Following). */
export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);

  const load = useCallback(async () => {
    try { const { orders: o } = await api.myOrders(); setOrders(o); } catch (e) {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <Screen>
      <Heading>Meine Bestellungen</Heading>
      <Subtle className="mb-3">Verfolge Status, Lieferung und Treuhand-Freigabe.</Subtle>
      {orders.length === 0 ? <Text className="text-gray-400 mt-8 text-center">Noch keine Bestellungen.</Text> : null}
      {orders.map((o) => {
        const meta = ORDER_STATUS_META[o.status] || {};
        return (
          <TouchableOpacity key={o.id} onPress={() => navigation.navigate('OrderTracking', { id: o.id })}>
            <Card>
              <Row className="justify-between">
                <Text className="font-semibold text-gray-900">Bestellung #{o.id.slice(0, 8)}</Text>
                <Text className="font-bold text-brand">{chf(o.amount)}</Text>
              </Row>
              <Row className="justify-between mt-2">
                <Badge label={meta.label} color={meta.color} />
                <Text className="text-brand text-sm">Details ›</Text>
              </Row>
            </Card>
          </TouchableOpacity>
        );
      })}
    </Screen>
  );
}
