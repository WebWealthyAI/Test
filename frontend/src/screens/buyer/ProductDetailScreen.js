import React, { useEffect, useState } from 'react';
import { View, Text, Image, Alert } from 'react-native';
import { Screen, Heading, Subtle, Button, Card, Field, Badge, Row } from '../../components/ui';
import { api } from '../../api/client';
import { chf } from '../../theme/status';

export default function ProductDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMsg, setOfferMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getProduct(id).then(({ product: p }) => {
      setProduct(p);
      setOfferAmount(String(Math.round(p.price * 0.9)));
    }).catch(() => {});
  }, [id]);

  async function sendOffer() {
    setBusy(true);
    try {
      await api.makeOffer({ product_id: id, amount: Number(offerAmount), message: offerMsg });
      Alert.alert('Offerte gesendet', 'Der Verkäufer wurde benachrichtigt.');
      setOfferMsg('');
    } catch (e) {
      Alert.alert('Fehler', e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!product) return <Screen><Text className="text-gray-400">Lädt ...</Text></Screen>;

  return (
    <Screen>
      {product.images?.[0] ? <Image source={{ uri: product.images[0] }} className="w-full h-56 rounded-2xl mb-3" /> : null}
      <Heading>{product.title}</Heading>
      <Row className="mb-2">
        <Text className="text-2xl font-extrabold text-brand mr-3">{chf(product.price)}</Text>
        <Badge label={`Lager: ${product.stock}`} color={product.stock > 0 ? '#10B981' : '#EF4444'} />
      </Row>
      <Subtle className="mb-3">{product.location} · {product.category} · Lieferung: {product.delivery_options?.join(', ')}</Subtle>
      <Card><Text className="text-gray-700">{product.description}</Text></Card>

      <Button
        title="Direkt kaufen (Treuhand)"
        onPress={() => navigation.navigate('Checkout', { product })}
        disabled={product.stock <= 0}
      />

      {product.allow_offers ? (
        <Card className="mt-4">
          <Heading className="text-lg">Preis vorschlagen</Heading>
          <Subtle className="mb-2">Verhandle einen fairen Preis mit dem Verkäufer.</Subtle>
          <Field label="Dein Angebot (CHF)" value={offerAmount} onChangeText={setOfferAmount} keyboardType="numeric" />
          <Field label="Nachricht (optional)" value={offerMsg} onChangeText={setOfferMsg} placeholder="z. B. Abholung heute möglich" multiline />
          <Button title="Offerte senden" variant="accent" onPress={sendOffer} loading={busy} />
        </Card>
      ) : null}
    </Screen>
  );
}
