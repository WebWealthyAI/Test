import React, { useCallback, useState } from 'react';
import { View, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Heading, Subtle, Card, Badge, Row } from '../../components/ui';
import { api } from '../../api/client';
import { chf } from '../../theme/status';

function Stat({ label, value, color }) {
  return (
    <Card className="flex-1 mx-1">
      <Text style={{ color }} className="text-xl font-extrabold">{value}</Text>
      <Subtle>{label}</Subtle>
    </Card>
  );
}

/** Admin-Übersicht: System-Monitoring + Kennzahlen. */
export default function AdminDashboardScreen() {
  const [data, setData] = useState({ escrow: null, reports: [], orders: [] });

  const load = useCallback(async () => {
    try {
      const [{ summary }, { reports }] = await Promise.all([
        api.adminEscrow(), api.adminReports(),
      ]);
      setData({ escrow: summary, reports, orders: [] });
    } catch (e) {}
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const critical = data.reports.filter((r) => r.severity === 'critical' && !r.resolved);

  return (
    <Screen>
      <Heading>Administration</Heading>
      <Subtle className="mb-4">Plattform-Überwachung Tradelater.ch</Subtle>

      <Row className="mb-2">
        <Stat label="Im Treuhand blockiert" value={chf(data.escrow?.held || 0)} color="#F59E0B" />
        <Stat label="Freigegeben" value={chf(data.escrow?.released || 0)} color="#10B981" />
      </Row>
      <Row className="mb-4">
        <Stat label="Plattform-Gebühren" value={chf(data.escrow?.platformFees || 0)} color="#0F766E" />
        <Stat label="Erstattet" value={chf(data.escrow?.refunded || 0)} color="#EF4444" />
      </Row>

      <Card>
        <Heading className="text-lg">System-Monitoring</Heading>
        {data.reports.length === 0 ? <Subtle>Keine Meldungen – alles ruhig.</Subtle> : null}
        {data.reports.slice(0, 8).map((r) => (
          <Row key={r.id} className="justify-between py-2 border-b border-gray-50">
            <Badge label={r.type} color={r.severity === 'critical' ? '#EF4444' : r.severity === 'warning' ? '#F59E0B' : '#6B7280'} />
            <Text className="text-gray-600 flex-1 ml-2 text-sm" numberOfLines={1}>{r.message}</Text>
            {r.resolved ? <Text className="text-green-600 text-xs">erledigt</Text> : null}
          </Row>
        ))}
      </Card>

      {critical.length > 0 ? (
        <Card className="bg-red-50 border-red-100">
          <Text className="text-red-700 font-semibold">⚠ {critical.length} kritische offene Meldung(en)</Text>
        </Card>
      ) : null}
    </Screen>
  );
}
