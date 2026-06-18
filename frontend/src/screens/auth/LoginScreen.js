import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Screen, Heading, Subtle, Field, Button, Card } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

// Schnellzugang zu den Seed-Demokonten.
const DEMO = [
  { label: 'Käufer', email: 'kaeufer@tradelater.ch', password: 'buyer123' },
  { label: 'Verkäufer', email: 'verkaeufer@tradelater.ch', password: 'seller123' },
  { label: 'Admin', email: 'admin@tradelater.ch', password: 'admin123' },
];

export default function LoginScreen({ navigation }) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function submit(e = email, p = password) {
    try {
      await login(e, p);
    } catch (err) {
      Alert.alert('Anmeldung fehlgeschlagen', err.message);
    }
  }

  return (
    <Screen>
      <View className="mt-12 mb-8">
        <Text className="text-4xl font-extrabold text-brand">Tradelater</Text>
        <Subtle>Lokaler Marktplatz mit Treuhand-Schutz</Subtle>
      </View>

      <Card>
        <Heading>Anmelden</Heading>
        <Field label="E-Mail" value={email} onChangeText={setEmail} placeholder="du@beispiel.ch" keyboardType="email-address" />
        <Field label="Passwort" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
        <Button title="Anmelden" onPress={() => submit()} loading={loading} />
        <Button title="Konto erstellen" variant="ghost" className="mt-2" onPress={() => navigation.navigate('Register')} />
      </Card>

      <Subtle className="mt-4 mb-2">Demo-Konten (Prototyp):</Subtle>
      {DEMO.map((d) => (
        <Button
          key={d.email}
          title={`Als ${d.label} testen`}
          variant="outline"
          className="mb-2"
          onPress={() => submit(d.email, d.password)}
        />
      ))}
    </Screen>
  );
}
