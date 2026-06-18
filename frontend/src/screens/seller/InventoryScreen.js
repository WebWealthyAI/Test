import React, { useCallback, useState } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Heading, Subtle, Card, Button, Badge, Row } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { chf } from '../../theme/status';

/** Inventar: Lagerbestand anpassen, Artikel pausieren/aktivieren, Push to Top. */
export default function InventoryScreen({ navigation }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);

  const load = useCallback(async () => {
    try {
      const { products: all } = await api.discover('', '');
      // Eigene Produkte – im Prototyp filtern wir clientseitig.
      setProducts(all.filter((p) => p.seller_id === user.id));
    } catch (e) {}
  }, [user.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function run(fn) { try { await fn(); await load(); } catch (e) { Alert.alert('Fehler', e.message); } }

  return (
    <Screen>
      <Row className="justify-between items-center mb-3">
        <Heading>Inventar</Heading>
        <Button title="+ Inserat" className="px-4" onPress={() => navigation.navigate('CreateListing')} />
      </Row>

      {products.length === 0 ? <Subtle>Noch keine Produkte. Erstelle dein erstes Inserat.</Subtle> : null}
      {products.map((p) => {
        const boosted = p.boosted_until && new Date(p.boosted_until) > new Date();
        return (
          <Card key={p.id}>
            <Row className="justify-between">
              <Text className="font-semibold text-gray-900 flex-1" numberOfLines={1}>{p.title}</Text>
              <Text className="font-bold text-brand">{chf(p.price)}</Text>
            </Row>
            <Row className="mt-2">
              <Badge label={p.status === 'online' ? 'Online' : p.status === 'paused' ? 'Pausiert' : p.status} color={p.status === 'online' ? '#10B981' : '#9CA3AF'} />
              <View className="w-2" />
              <Badge label={`Lager: ${p.stock}`} color="#6366F1" />
              {boosted ? <><View className="w-2" /><Badge label="⭐ Top" color="#F59E0B" /></> : null}
            </Row>

            <Row className="mt-3">
              <Button title="−" variant="ghost" className="px-5 mr-2" onPress={() => run(() => api.adjustStock(p.id, -1))} />
              <Button title="+" variant="ghost" className="px-5 mr-2" onPress={() => run(() => api.adjustStock(p.id, 1))} />
              <Button
                title={p.status === 'paused' ? 'Aktivieren' : 'Pausieren'}
                variant="outline"
                className="flex-1"
                onPress={() => run(() => api.setProductStatus(p.id, p.status === 'paused' ? 'online' : 'paused'))}
              />
            </Row>
            <Button title="⭐ Push to Top (24h)" variant="accent" className="mt-2" onPress={() => run(() => api.boostProduct(p.id, 24))} />
          </Card>
        );
      })}
    </Screen>
  );
}
