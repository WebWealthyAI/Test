import React, { useCallback, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Heading, Subtle, Card, Button, Badge, Row, Field } from '../../components/ui';
import { api } from '../../api/client';
import { chf, OFFER_STATUS_META } from '../../theme/status';

/** Käufer-Sicht der Verhandlung: eigene Offerten, Gegenvorschläge annehmen/ablehnen. */
export default function OffersScreen() {
  const [offers, setOffers] = useState([]);
  const [counter, setCounter] = useState({});

  const load = useCallback(async () => {
    try {
      const { offers: o } = await api.myOffers();
      setOffers(o);
    } catch (e) {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function act(fn, id, ...args) {
    try { await fn(id, ...args); await load(); }
    catch (e) { Alert.alert('Fehler', e.message); }
  }

  return (
    <Screen>
      <Heading>Meine Offerten</Heading>
      <Subtle className="mb-3">Preisvorschläge & Gegenvorschläge im Überblick.</Subtle>
      {offers.length === 0 ? <Text className="text-gray-400 mt-8 text-center">Noch keine Offerten.</Text> : null}
      {offers.map((o) => {
        const meta = OFFER_STATUS_META[o.status] || {};
        const last = o.history?.[o.history.length - 1];
        return (
          <Card key={o.id}>
            <Row className="justify-between">
              <Text className="font-bold text-brand text-lg">{chf(o.amount)}</Text>
              <Badge label={meta.label} color={meta.color} />
            </Row>
            <Subtle className="mt-1">Letzter Schritt: {last?.by === 'seller' ? 'Verkäufer' : 'Du'} · {chf(last?.amount)}</Subtle>

            {o.status === 'countered' ? (
              <Row className="mt-3">
                <Button title="Annehmen" className="flex-1 mr-2" onPress={() => act(api.acceptOffer, o.id)} />
                <Button title="Ablehnen" variant="danger" className="flex-1" onPress={() => act(api.rejectOffer, o.id)} />
              </Row>
            ) : null}

            {['pending', 'countered'].includes(o.status) ? (
              <View className="mt-3">
                <Field
                  placeholder="Gegenvorschlag (CHF)"
                  keyboardType="numeric"
                  value={counter[o.id] || ''}
                  onChangeText={(v) => setCounter((c) => ({ ...c, [o.id]: v }))}
                />
                <Button
                  title="Gegenvorschlag senden"
                  variant="outline"
                  onPress={() => act(api.counterOffer, o.id, { amount: Number(counter[o.id]) })}
                />
              </View>
            ) : null}

            {o.status === 'accepted' ? (
              <Subtle className="mt-2 text-green-600">✓ Akzeptiert – bereit zum Kauf zum vereinbarten Preis.</Subtle>
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}
