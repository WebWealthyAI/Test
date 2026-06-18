import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { Screen, Heading, Subtle, Button, Card, Field, Row, Badge } from '../../components/ui';
import { api } from '../../api/client';
import { chf } from '../../theme/status';

/**
 * Kasse: löst den Treuhand-Checkout aus. Das Backend erstellt einen
 * Stripe PaymentIntent mit manual capture – das Geld wird BLOCKIERT, bis
 * der Käufer den Erhalt bestätigt.
 */
export default function CheckoutScreen({ route, navigation }) {
  const { product, offer } = route.params;
  const amount = offer ? offer.amount : product.price;
  const [method, setMethod] = useState(product.delivery_options?.[0] || 'shipping');
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);

  async function pay() {
    setBusy(true);
    try {
      const res = await api.checkout({
        product_id: product.id,
        offer_id: offer?.id,
        delivery_method: method,
        shipping_address: method === 'shipping' ? { line: address } : null,
      });
      // Im Mock-Modus ist der PaymentIntent bereits "requires_capture" (blockiert).
      Alert.alert(
        'Zahlung autorisiert 🔒',
        `${chf(amount)} sind nun im Treuhand blockiert. Das Geld wird erst freigegeben, wenn du den Erhalt bestätigst.`,
        [{ text: 'Zu meinen Bestellungen', onPress: () => navigation.navigate('OrdersTab') }],
      );
    } catch (e) {
      Alert.alert('Zahlung fehlgeschlagen', e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Card>
        <Heading className="text-lg">{product.title}</Heading>
        <Row className="justify-between mt-1">
          <Subtle>Betrag</Subtle>
          <Text className="text-xl font-bold text-brand">{chf(amount)}</Text>
        </Row>
        {offer ? <Badge label="Aus akzeptierter Offerte" color="#10B981" /> : null}
      </Card>

      <Card>
        <Heading className="text-lg">Lieferung</Heading>
        <Row>
          {(product.delivery_options || ['shipping']).map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => setMethod(opt)}
              className={`flex-1 mr-2 rounded-xl py-3 items-center border ${method === opt ? 'bg-brand border-brand' : 'bg-white border-gray-200'}`}
            >
              <Text className={method === opt ? 'text-white font-semibold' : 'text-gray-700'}>
                {opt === 'pickup' ? 'Abholung' : 'Versand'}
              </Text>
            </TouchableOpacity>
          ))}
        </Row>
        {method === 'shipping' ? (
          <Field label="Lieferadresse" value={address} onChangeText={setAddress} placeholder="Strasse, PLZ Ort" className="mt-3" />
        ) : null}
      </Card>

      <Card className="bg-teal-50 border-teal-100">
        <Row>
          <Text className="text-lg mr-2">🔒</Text>
          <Text className="flex-1 text-teal-800 text-sm">
            Treuhand-Schutz: Dein Geld wird sicher blockiert und erst an den Verkäufer
            ausgezahlt, wenn du „Artikel erhalten & geprüft“ bestätigst.
          </Text>
        </Row>
      </Card>

      <Button title={`Jetzt bezahlen · ${chf(amount)}`} onPress={pay} loading={busy} />
    </Screen>
  );
}
