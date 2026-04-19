// src/components/StatsBar.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

interface Props {
  upcoming: number;
  total: number;
  hours: number;
}

export default function StatsBar({ upcoming, total, hours }: Props) {
  return (
    <View style={styles.container}>
      <Stat label="Upcoming" value={String(upcoming)} />
      <View style={styles.divider} />
      <Stat label="Total Shifts" value={String(total)} />
      <View style={styles.divider} />
      <Stat label="Hours Logged" value={`${Math.round(hours * 10) / 10}h`} />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  stat: { flex: 1, alignItems: 'center' },
  value: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800' },
  label: { color: '#666', fontSize: 11, marginTop: 2 },
  divider: { width: 1, height: 32, backgroundColor: COLORS.border },
});