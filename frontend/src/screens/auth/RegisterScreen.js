import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { Screen, Heading, Field, Button, Card, Row } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
  { key: 'buyer', label: 'Käufer' },
  { key: 'seller', label: 'Verkäufer' },
];

export default function RegisterScreen({ navigation }) {
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', role: 'buyer' });

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    try {
      await register(form);
    } catch (err) {
      Alert.alert('Registrierung fehlgeschlagen', err.message);
    }
  }

  return (
    <Screen>
      <Card className="mt-8">
        <Heading>Konto erstellen</Heading>
        <Field label="Name" value={form.full_name} onChangeText={set('full_name')} placeholder="Vor- und Nachname" />
        <Field label="E-Mail" value={form.email} onChangeText={set('email')} placeholder="du@beispiel.ch" keyboardType="email-address" />
        <Field label="Telefon" value={form.phone} onChangeText={set('phone')} placeholder="+41 ..." keyboardType="phone-pad" />
        <Field label="Passwort" value={form.password} onChangeText={set('password')} placeholder="••••••••" secureTextEntry />

        <Text className="text-sm font-medium text-gray-700 mb-1">Ich möchte</Text>
        <Row className="mb-4">
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r.key}
              onPress={() => set('role')(r.key)}
              className={`flex-1 mr-2 rounded-xl py-3 items-center border ${form.role === r.key ? 'bg-brand border-brand' : 'bg-white border-gray-200'}`}
            >
              <Text className={form.role === r.key ? 'text-white font-semibold' : 'text-gray-700'}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </Row>

        <Button title="Registrieren" onPress={submit} loading={loading} />
        <Button title="Zurück zur Anmeldung" variant="ghost" className="mt-2" onPress={() => navigation.goBack()} />
      </Card>
      <Text className="text-xs text-gray-400 px-2">
        Als Verkäufer wird automatisch ein Stripe-Connect-Konto für Treuhand-Auszahlungen vorbereitet.
      </Text>
    </Screen>
  );
}
