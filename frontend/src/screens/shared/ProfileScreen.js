import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Screen, Heading, Subtle, Card, Button, Badge, Row } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

const ROLE_LABEL = { admin: 'Administrator', seller: 'Verkäufer', buyer: 'Käufer' };

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  async function onboard() {
    setBusy(true);
    try {
      const { account } = await api.onboardSeller();
      Alert.alert('Stripe Connect', `Konto: ${account.accountId}\n${account.onboardingUrl || 'Bereits verbunden.'}`);
    } catch (e) {
      Alert.alert('Fehler', e.message);
    } finally { setBusy(false); }
  }

  return (
    <Screen>
      <Card>
        <Row className="items-center">
          <View className="w-14 h-14 rounded-full bg-brand items-center justify-center mr-3">
            <Text className="text-white text-xl font-bold">{(user.full_name || user.email)[0]?.toUpperCase()}</Text>
          </View>
          <View className="flex-1">
            <Heading className="text-lg mb-0">{user.full_name || 'Nutzer'}</Heading>
            <Subtle>{user.email}</Subtle>
          </View>
          <Badge label={ROLE_LABEL[user.role] || user.role} color="#0F766E" />
        </Row>
      </Card>

      {user.role === 'seller' ? (
        <Card>
          <Heading className="text-lg">Treuhand-Auszahlung</Heading>
          <Subtle className="mb-2">
            {user.stripe_account_id ? `Stripe-Connect: ${user.stripe_account_id}` : 'Noch kein Auszahlungskonto.'}
          </Subtle>
          <Button title="Stripe-Connect einrichten/prüfen" variant="outline" onPress={onboard} loading={busy} />
        </Card>
      ) : null}

      <Card>
        <Heading className="text-lg">Über Tradelater</Heading>
        <Subtle>Lokaler B2C- & B2B-Marktplatz mit sicherem Treuhand-System (Escrow) und Verhandlungsfunktion.</Subtle>
      </Card>

      <Button title="Abmelden" variant="danger" onPress={logout} />
    </Screen>
  );
}
