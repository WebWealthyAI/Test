import React, { useCallback, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Heading, Subtle, Card, Button, Field, Badge, Row } from '../../components/ui';
import { api } from '../../api/client';

/** Admin-Tools: SEO-Management, Logistik, Offerten-Logs, Werbe-Engine. */
export default function AdminToolsScreen() {
  const [seo, setSeo] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [offers, setOffers] = useState([]);
  const [ads, setAds] = useState([]);

  const load = useCallback(async () => {
    try {
      const [seoRes, shipRes, offRes, adsRes] = await Promise.all([
        api.adminSeo(), api.adminShipments(), api.adminOffers(), api.adminAds(),
      ]);
      setSeo(seoRes.seo); setShipments(shipRes.shipments); setOffers(offRes.offers); setAds(adsRes.ads);
    } catch (e) {}
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function saveSeo() {
    try { await api.adminUpdateSeo(seo); Alert.alert('Gespeichert', 'SEO-Einstellungen aktualisiert.'); }
    catch (e) { Alert.alert('Fehler', e.message); }
  }

  async function approveAd(ad) {
    try { await api.adminSetAdStatus(ad.id, ad.status === 'active' ? 'rejected' : 'active'); await load(); }
    catch (e) { Alert.alert('Fehler', e.message); }
  }

  return (
    <Screen>
      <Heading>Admin-Tools</Heading>

      <Card>
        <Heading className="text-lg">SEO-Management</Heading>
        {seo ? (
          <>
            <Field label="Seitentitel" value={seo.siteTitle} onChangeText={(v) => setSeo({ ...seo, siteTitle: v })} />
            <Field label="Meta-Beschreibung" value={seo.metaDescription} onChangeText={(v) => setSeo({ ...seo, metaDescription: v })} multiline />
            <Field label="Robots" value={seo.robots} onChangeText={(v) => setSeo({ ...seo, robots: v })} />
            <Button title="SEO speichern" onPress={saveSeo} />
          </>
        ) : <Subtle>Lädt ...</Subtle>}
      </Card>

      <Card>
        <Heading className="text-lg">Logistik ({shipments.length})</Heading>
        {shipments.slice(0, 5).map((s) => (
          <Row key={s.id} className="justify-between py-1">
            <Text className="text-gray-700">{s.carrier} · {s.tracking_number}</Text>
            <Badge label={s.status} color="#6366F1" />
          </Row>
        ))}
        {shipments.length === 0 ? <Subtle>Keine Lieferungen.</Subtle> : null}
      </Card>

      <Card>
        <Heading className="text-lg">Offerten-Log ({offers.length})</Heading>
        {offers.slice(0, 6).map((o) => (
          <Row key={o.id} className="justify-between py-1">
            <Text className="text-gray-700">#{o.id.slice(0, 6)} · CHF {o.amount}</Text>
            <Badge label={o.status} color="#F59E0B" />
          </Row>
        ))}
        {offers.length === 0 ? <Subtle>Keine Offerten.</Subtle> : null}
      </Card>

      <Card>
        <Heading className="text-lg">Werbe-Engine ({ads.length})</Heading>
        {ads.map((a) => (
          <Row key={a.id} className="justify-between py-1">
            <Text className="text-gray-700">{a.slot} · CHF {a.budget}</Text>
            <Row>
              <Button
                title={a.status === 'active' ? 'Stoppen' : 'Freigeben'}
                variant="outline"
                className="px-3 mr-2"
                onPress={() => approveAd(a)}
              />
              <Badge label={a.status} color={a.status === 'active' ? '#10B981' : '#F59E0B'} />
            </Row>
          </Row>
        ))}
        {ads.length === 0 ? <Subtle>Keine Buchungen.</Subtle> : null}
      </Card>
    </Screen>
  );
}
