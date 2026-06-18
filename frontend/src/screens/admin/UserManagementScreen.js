import React, { useCallback, useState } from 'react';
import { Text, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Heading, Subtle, Card, Button, Badge, Row } from '../../components/ui';
import { api } from '../../api/client';

const ROLE_COLOR = { admin: '#EF4444', seller: '#0F766E', buyer: '#6366F1' };

/** User-Management: alle Accounts, Aktivierung/Sperrung. */
export default function UserManagementScreen() {
  const [users, setUsers] = useState([]);

  const load = useCallback(async () => {
    try { const { users: u } = await api.adminUsers(); setUsers(u); } catch (e) {}
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function toggle(u) {
    try { await api.adminSetUserActive(u.id, !u.is_active); await load(); }
    catch (e) { Alert.alert('Fehler', e.message); }
  }

  return (
    <Screen>
      <Heading>Nutzer-Verwaltung</Heading>
      <Subtle className="mb-3">{users.length} Accounts</Subtle>
      {users.map((u) => (
        <Card key={u.id}>
          <Row className="justify-between">
            <Text className="font-semibold text-gray-900">{u.full_name || u.email}</Text>
            <Badge label={u.role} color={ROLE_COLOR[u.role]} />
          </Row>
          <Subtle>{u.email}</Subtle>
          {u.stripe_account_id ? <Subtle>Stripe: {u.stripe_account_id}</Subtle> : null}
          <Row className="justify-between items-center mt-2">
            <Badge label={u.is_active ? 'Aktiv' : 'Gesperrt'} color={u.is_active ? '#10B981' : '#EF4444'} />
            <Button
              title={u.is_active ? 'Sperren' : 'Entsperren'}
              variant={u.is_active ? 'danger' : 'outline'}
              className="px-4"
              onPress={() => toggle(u)}
            />
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
