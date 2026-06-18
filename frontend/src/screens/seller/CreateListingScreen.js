import React, { useState } from 'react';
import { View, Text, Image, Alert, Switch } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Screen, Heading, Subtle, Field, Button, Card, Row } from '../../components/ui';
import { api } from '../../api/client';

/**
 * Inserat-Flow: Foto-Upload -> Beschreibung -> Preis -> Online.
 * Bild wird im Prototyp als lokale URI/Platzhalter referenziert; in Produktion
 * Upload zu Supabase Storage.
 */
export default function CreateListingScreen({ navigation }) {
  const [form, setForm] = useState({
    title: '', description: '', price: '', category: 'general', location: '',
    stock: '1', allow_offers: true, keywords: '',
  });
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled) setImage(res.assets[0].uri);
  }

  async function publish() {
    if (!form.title || !form.price) { Alert.alert('Fehlende Angaben', 'Titel und Preis sind erforderlich.'); return; }
    setBusy(true);
    try {
      await api.createProduct({
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        location: form.location,
        stock: Number(form.stock),
        allow_offers: form.allow_offers,
        images: image ? [image] : [`https://picsum.photos/seed/${encodeURIComponent(form.title)}/600/400`],
        seo: { keywords: form.keywords.split(',').map((k) => k.trim()).filter(Boolean), meta_title: form.title, meta_description: form.description.slice(0, 150) },
        status: 'online',
      });
      Alert.alert('Online ✓', 'Dein Inserat ist jetzt sichtbar.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Fehler', e.message);
    } finally { setBusy(false); }
  }

  return (
    <Screen>
      <Heading>Neues Inserat</Heading>
      <Subtle className="mb-3">Foto → Beschreibung → Preis → Online</Subtle>

      <Card>
        {image ? <Image source={{ uri: image }} className="w-full h-44 rounded-xl mb-3" /> : null}
        <Button title={image ? 'Anderes Foto wählen' : '📷 Foto hochladen'} variant="outline" onPress={pickImage} />
      </Card>

      <Field label="Titel" value={form.title} onChangeText={set('title')} placeholder="z. B. Vintage Rennrad" />
      <Field label="Beschreibung" value={form.description} onChangeText={set('description')} multiline placeholder="Zustand, Details ..." />
      <Row>
        <View className="flex-1 mr-2"><Field label="Preis (CHF)" value={form.price} onChangeText={set('price')} keyboardType="numeric" /></View>
        <View className="flex-1"><Field label="Lager" value={form.stock} onChangeText={set('stock')} keyboardType="numeric" /></View>
      </Row>
      <Field label="Kategorie" value={form.category} onChangeText={set('category')} placeholder="elektronik / velo / moebel ..." />
      <Field label="Standort" value={form.location} onChangeText={set('location')} placeholder="Stadt" />
      <Field label="SEO-Keywords (kommagetrennt)" value={form.keywords} onChangeText={set('keywords')} placeholder="rennrad, velo, zürich" />

      <Card>
        <Row className="justify-between">
          <Text className="text-gray-700">Preisvorschläge erlauben</Text>
          <Switch value={form.allow_offers} onValueChange={set('allow_offers')} trackColor={{ true: '#0F766E' }} />
        </Row>
      </Card>

      <Button title="Inserat veröffentlichen" onPress={publish} loading={busy} />
    </Screen>
  );
}
