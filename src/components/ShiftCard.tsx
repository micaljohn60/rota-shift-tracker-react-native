// src/components/ShiftCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Shift } from '..//types';
import { COLORS } from '../constants';
import { formatDate } from '../utils/time';

interface Props {
  shift: Shift;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG: Record<Shift['status'], { label: string; color: string; bg: string }> = {
  'upcoming':   { label: 'Upcoming',   color: COLORS.blue,  bg: '#1A2A3A' },
  'clocked-in': { label: 'Clocked In', color: COLORS.green, bg: '#0A2A1A' },
  'completed':  { label: 'Completed',  color: '#666',       bg: '#1A1A1A' },
};

export default function ShiftCard({ shift, onDelete }: Props) {
  const status = STATUS_CONFIG[shift.status];

  return (
    <View style={[styles.card, { borderLeftColor: status.color }]}>

      {/* Date + Badge */}
      <View style={styles.row}>
        <Text style={styles.date}>{formatDate(shift.date)}</Text>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      {/* Time range */}
      <View style={styles.timeRow}>
        <Text style={styles.time}>{shift.startTime}</Text>
        <View style={styles.timeLine} />
        <Text style={styles.time}>{shift.endTime}</Text>
      </View>

      {/* Details row */}
      <View style={styles.row}>
        <View style={styles.details}>
          {shift.location && <Text style={styles.detail}>📍 {shift.location}</Text>}
          {shift.role     && <Text style={styles.detail}>💼 {shift.role}</Text>}
          <Text style={styles.detail}>⏱ {shift.hoursWorked} hrs</Text>
        </View>
        <TouchableOpacity onPress={() => onDelete(shift.id)} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>

      {shift.notes && <Text style={styles.notes}>📝 {shift.notes}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  time: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '700' },
  timeLine: { flex: 1, height: 1, backgroundColor: COLORS.border, marginHorizontal: 12 },
  details: { gap: 4 },
  detail: { color: COLORS.textSecond, fontSize: 13 },
  deleteBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#2A1A1A', alignItems: 'center', justifyContent: 'center',
  },
  deleteText: { color: COLORS.red, fontSize: 12, fontWeight: '700' },
  notes: { color: '#666', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
});