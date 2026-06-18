import React, { useCallback, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Heading, Subtle, Card, Button, Badge, Row } from '../../components/ui';
import { api } from '../../api/client';
import { chf } from '../../theme/status';

const TX_META = {
  authorized: { label: 'Blockiert', color: '#F59E0B' },
  captured: { label: 'Eingezogen', color: '#3B82F6' },
  released: { label: 'Freigegeben', color: '#10B981' },
  refunded: { label: 'Erstattet', color: '#EF4444' },
  failed: { label: 'Fehlgeschlagen', color: '#9CA3AF' },
};

/** Treuhand-Überwachung: blockierte/freigegebene Gelder + Streitschlichtung. */
export default function EscrowMonitorScreen() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);

  const load = useCallback(async () => {
    try { const { transactions: t, summary: s } = await api.adminEscrow(); setTransactions(t); setSummary(s); } catch (e) {}
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function refund(tx) {
    Alert.alert('Erstattung bestätigen', `${chf(tx.amount)} an den Käufer zurückerstatten?`, [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Erstatten',
        style: 'destructive',
        onPress: async () => {
          try { await api.adminRefund(tx.order_id, 'Admin-Entscheid'); await load(); }
          catch (e) { Alert.alert('Fehler', e.message); }
        },
      },
    ]);
  }

  return (
    <Screen>
      <Heading>Treuhand-Monitor</Heading>
      <Subtle className="mb-3">Stripe-Connect Escrow-Übersicht</Subtle>

      {summary ? (
        <Card className="bg-teal-50 border-teal-100">
          <Row className="justify-between"><Text className="text-teal-800">Blockiert</Text><Text className="font-bold text-teal-900">{chf(summary.held)}</Text></Row>
          <Row className="justify-between"><Text className="text-teal-800">Freigegeben</Text><Text className="font-bold text-teal-900">{chf(summary.released)}</Text></Row>
          <Row className="justify-between"><Text className="text-teal-800">Gebühren</Text><Text className="font-bold text-teal-900">{chf(summary.platformFees)}</Text></Row>
        </Card>
      ) : null}

      {transactions.map((tx) => {
        const meta = TX_META[tx.status] || {};
        return (
          <Card key={tx.id}>
            <Row className="justify-between">
              <Text className="font-semibold text-gray-900">{chf(tx.amount)}</Text>
              <Badge label={meta.label} color={meta.color} />
            </Row>
            <Subtle className="mt-1">Order #{String(tx.order_id).slice(0, 8)} · Gebühr {chf(tx.platform_fee)}</Subtle>
            <Subtle>PI: {tx.payment_intent_id}</Subtle>
            {tx.status === 'authorized' ? (
              <Button title="An Käufer erstatten (Streitfall)" variant="danger" className="mt-2" onPress={() => refund(tx)} />
            ) : null}
          </Card>
        );
      })}
      {transactions.length === 0 ? <Subtle>Noch keine Transaktionen.</Subtle> : null}
    </Screen>
  );
}
