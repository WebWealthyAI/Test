import React from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView,
} from 'react-native';

// Wiederverwendbare UI-Bausteine (NativeWind / Tailwind className).

export function Screen({ children, scroll = true, className = '' }) {
  if (scroll) {
    return (
      <ScrollView
        className={`flex-1 bg-gray-50 ${className}`}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      >
        {children}
      </ScrollView>
    );
  }
  return <View className={`flex-1 bg-gray-50 p-4 ${className}`}>{children}</View>;
}

export function Card({ children, className = '' }) {
  return (
    <View className={`bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 ${className}`}>
      {children}
    </View>
  );
}

export function Heading({ children, className = '' }) {
  return <Text className={`text-2xl font-bold text-gray-900 mb-1 ${className}`}>{children}</Text>;
}

export function Subtle({ children, className = '' }) {
  return <Text className={`text-sm text-gray-500 ${className}`}>{children}</Text>;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, className = '' }) {
  const styles = {
    primary: 'bg-brand',
    accent: 'bg-accent',
    outline: 'bg-white border border-brand',
    danger: 'bg-red-500',
    ghost: 'bg-gray-100',
  };
  const textStyles = {
    primary: 'text-white',
    accent: 'text-white',
    outline: 'text-brand',
    danger: 'text-white',
    ghost: 'text-gray-700',
  };
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`rounded-xl py-3 px-4 items-center ${styles[variant]} ${disabled || loading ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#0F766E' : '#fff'} />
      ) : (
        <Text className={`font-semibold ${textStyles[variant]}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export function Field({ label, value, onChangeText, placeholder, keyboardType, secureTextEntry, multiline }) {
  return (
    <View className="mb-3">
      {label ? <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        className={`bg-white border border-gray-200 rounded-xl px-3 py-3 text-gray-900 ${multiline ? 'h-24' : ''}`}
        style={multiline ? { textAlignVertical: 'top' } : undefined}
      />
    </View>
  );
}

export function Badge({ label, color = '#6B7280' }) {
  return (
    <View style={{ backgroundColor: `${color}22` }} className="self-start rounded-full px-3 py-1">
      <Text style={{ color }} className="text-xs font-semibold">{label}</Text>
    </View>
  );
}

export function Row({ children, className = '' }) {
  return <View className={`flex-row items-center ${className}`}>{children}</View>;
}
