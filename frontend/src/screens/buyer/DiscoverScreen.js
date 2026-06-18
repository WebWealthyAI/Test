import React, { useCallback, useState } from 'react';
import { View, Text, Image, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Field, Badge } from '../../components/ui';
import { api } from '../../api/client';
import { chf } from '../../theme/status';

function ProductCard({ product, onPress }) {
  const boosted = product.boosted_until && new Date(product.boosted_until) > new Date();
  return (
    <TouchableOpacity onPress={onPress} className="bg-white rounded-2xl mb-3 overflow-hidden border border-gray-100">
      {product.images?.[0] ? (
        <Image source={{ uri: product.images[0] }} className="w-full h-40" />
      ) : (
        <View className="w-full h-40 bg-gray-100 items-center justify-center"><Text className="text-gray-400">Kein Bild</Text></View>
      )}
      <View className="p-3">
        {boosted ? <Badge label="⭐ Top-Inserat" color="#F59E0B" /> : null}
        <Text className="text-base font-semibold text-gray-900 mt-1" numberOfLines={1}>{product.title}</Text>
        <Text className="text-gray-500 text-sm" numberOfLines={1}>{product.location} · {product.category}</Text>
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-lg font-bold text-brand">{chf(product.price)}</Text>
          {product.allow_offers ? <Badge label="Offerte möglich" color="#0F766E" /> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function DiscoverScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (query = q) => {
    try {
      const { products: items } = await api.discover(query);
      setProducts(items);
    } catch (e) {
      // im Prototyp still scheitern lassen
    }
  }, [q]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-3 pb-1 bg-white border-b border-gray-100">
        <Field placeholder="Suche nach Produkten, Keywords ..." value={q} onChangeText={(v) => { setQ(v); load(v); }} />
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => navigation.navigate('ProductDetail', { id: item.id })} />
        )}
        ListEmptyComponent={<Text className="text-center text-gray-400 mt-12">Keine Produkte gefunden.</Text>}
      />
    </View>
  );
}
