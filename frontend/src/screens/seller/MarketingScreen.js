import React, { useCallback, useState } from 'react';
import { Text, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Heading, Subtle, Card, Button, Field, Badge, Row } from '../../components/ui';
import { api } from '../../api/client';

const SLOTS = [
  { key: 'home_banner', label: 'Startseiten-Banner' },
  { key: 'category_top', label: 'Kategorie-Top' },
  { key: 'search_promoted', label: 'Suche promoted' },
];

/** Marketing / Werbe-Engine: Werbeplätze buchen. */
export default function MarketingScreen() {
  const [slot, setSlot] = useState('home_banner');
  const [budget, setBudget] = useState('50');
  const [ads, setAds] = useState([]);

  const load = useCallback(async () => {
    try { const { ads: a } = await api.myAds(); setAds(a); } catch (e) {}
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function book() {
    try {
      await api.bookAd({ slot, budget: Number(budget) });
      Alert.alert('Gebucht', 'Deine Werbung wird nach Admin-Freigabe ausgespielt.');
      await load();
    } catch (e) { Alert.alert('Fehler', e.message); }
  }

  return (
    <Screen>
      <Heading>Marketing</Heading>
      <Subtle className="mb-3">Buche Werbeplätze, um deine Produkte zu pushen.</Subtle>

      <Card>
        <Text className="text-sm font-medium text-gray-700 mb-2">Werbeplatz</Text>
        {SLOTS.map((s) => (
          <Button
            key={s.key}
            title={s.label}
            variant={slot === s.key ? 'primary' : 'outline'}
            className="mb-2"
            onPress={() => setSlot(s.key)}
          />
        ))}
        <Field label="Budget (CHF)" value={budget} onChangeText={setBudget} keyboardType="numeric" />
        <Button title="Werbeplatz buchen" variant="accent" onPress={book} />
      </Card>

      <Heading className="text-lg mt-2">Meine Buchungen</Heading>
      {ads.map((a) => (
        <Card key={a.id}>
          <Row className="justify-between">
            <Text className="text-gray-700">{a.slot}</Text>
            <Badge label={a.status} color={a.status === 'active' ? '#10B981' : '#F59E0B'} />
          </Row>
          <Subtle>Budget: CHF {a.budget}</Subtle>
        </Card>
      ))}
      {ads.length === 0 ? <Subtle>Noch keine Buchungen.</Subtle> : null}
    </Screen>
  );
}
