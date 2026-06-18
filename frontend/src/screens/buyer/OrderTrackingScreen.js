import React, { useCallback, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Heading, Subtle, Card, Button, Badge, Row } from '../../components/ui';
import { api } from '../../api/client';
import { chf, ORDER_STATUS_META } from '../../theme/status';

function Timeline({ shipment }) {
  if (!shipment) return <Subtle>Noch kein Versand erfasst.</Subtle>;
  return (
    <View>
      <Text className="font-medium text-gray-700 mb-2">{shipment.carrier} · {shipment.tracking_number}</Text>
      {shipment.events?.map((e, i) => (
        <Row key={i} className="mb-2">
          <View className="w-2 h-2 rounded-full bg-brand mr-3" />
          <Text className="text-gray-700 flex-1">{e.note || e.status}</Text>
          <Text className="text-xs text-gray-400">{new Date(e.at).toLocaleString('de-CH')}</Text>
        </Row>
      ))}
    </View>
  );
}

export default function OrderTrackingScreen({ route }) {
  const { id } = route.params;
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { const { order: o } = await api.getOrder(id); setOrder(o); } catch (e) {}
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function confirm() {
    setBusy(true);
    try {
      await api.confirmReceipt(id);
      Alert.alert('Bestätigt ✓', 'Das Geld wurde aus dem Treuhand an den Verkäufer freigegeben.');
      await load();
    } catch (e) {
      Alert.alert('Fehler', e.message);
    } finally { setBusy(false); }
  }

  async function dispute() {
    try { await api.disputeOrder(id, 'Käufer meldet Problem'); await load(); Alert.alert('Streitfall gemeldet', 'Der Admin prüft den Fall.'); }
    catch (e) { Alert.alert('Fehler', e.message); }
  }

  if (!order) return <Screen><Text className="text-gray-400">Lädt ...</Text></Screen>;
  const meta = ORDER_STATUS_META[order.status] || {};
  const canConfirm = ['funds_held', 'shipped', 'delivered'].includes(order.status);

  return (
    <Screen>
      <Card>
        <Heading className="text-lg">{order.product?.title || 'Produkt'}</Heading>
        <Row className="justify-between mt-1">
          <Badge label={meta.label} color={meta.color} />
          <Text className="font-bold text-brand">{chf(order.amount)}</Text>
        </Row>
      </Card>

      <Card>
        <Heading className="text-lg">Lieferung</Heading>
        <Timeline shipment={order.shipment} />
      </Card>

      <Card className="bg-teal-50 border-teal-100">
        <Text className="text-teal-800 text-sm">
          🔒 Treuhand-Status: {order.transaction?.status === 'released'
            ? 'Geld an Verkäufer freigegeben.'
            : 'Geld ist sicher blockiert, bis du den Erhalt bestätigst.'}
        </Text>
      </Card>

      {canConfirm ? (
        <>
          <Button title="✓ Artikel erhalten & geprüft" onPress={confirm} loading={busy} />
          <Button title="Problem melden (Streitfall)" variant="ghost" className="mt-2" onPress={dispute} />
        </>
      ) : null}
    </Screen>
  );
}
