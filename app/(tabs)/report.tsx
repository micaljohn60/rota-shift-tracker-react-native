import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS } from "../../src/constants";
import { getAllShifts, getWeekRate, saveWeekRate } from "../../src/services/database";

interface ShiftRow {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  hoursWorked: number;
}

interface WeekGroup {
  weekKey: string;
  label: string;
  isCurrent: boolean;
  shifts: ShiftRow[];
  totalHours: number;
  rate: number | null;
}

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split("T")[0];
}

function getWeekLabel(weekKey: string): string {
  const start = new Date(weekKey);
  const end = new Date(weekKey);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function getCurrentWeekKey(): string {
  return getWeekKey(new Date().toISOString().split("T")[0]);
}

function formatDay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function ReportScreen() {
  const [weeks, setWeeks] = useState<WeekGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRate, setEditingRate] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const shifts = (await getAllShifts()) as ShiftRow[];
    const currentWeekKey = getCurrentWeekKey();

    const grouped: Record<string, ShiftRow[]> = {};
    for (const shift of shifts) {
      const key = getWeekKey(shift.date);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(shift);
    }

    const weekGroups: WeekGroup[] = await Promise.all(
      Object.entries(grouped)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(async ([weekKey, weekShifts]) => {
          const totalHours = weekShifts.reduce(
            (sum, s) => sum + s.hoursWorked,
            0,
          );
          const rate = await getWeekRate(weekKey);
          return {
            weekKey,
            label: getWeekLabel(weekKey),
            isCurrent: weekKey === currentWeekKey,
            shifts: weekShifts.sort((a, b) => a.date.localeCompare(b.date)),
            totalHours,
            rate,
          };
        }),
    );

    setWeeks(weekGroups);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const handleSaveRate = async (weekKey: string) => {
    const raw = editingRate[weekKey];
    const parsed = parseFloat(raw);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert("Invalid rate", "Please enter a valid hourly rate.");
      return;
    }
    await saveWeekRate(weekKey, parsed);
    setEditingRate((prev) => {
      const n = { ...prev };
      delete n[weekKey];
      return n;
    });
    load();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={COLORS.blue} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Weekly Report</Text>

        {weeks.length === 0 && (
          <Text style={styles.empty}>
            No shifts yet. Paste an SMS to get started.
          </Text>
        )}

        {weeks.map((week) => {
          const isEditing = editingRate[week.weekKey] !== undefined;
          const earnings =
            week.rate != null ? week.totalHours * week.rate : null;

          return (
            <View key={week.weekKey} style={styles.card}>
              {/* Week header */}
              <View style={styles.cardHeader}>
                <Text style={styles.weekLabel}>{week.label}</Text>
                {week.isCurrent && (
                  <View style={styles.currentPill}>
                    <Text style={styles.currentPillText}>Current Week</Text>
                  </View>
                )}
              </View>

              {/* Days */}
              {week.shifts.map((shift) => (
                <View key={shift.id} style={styles.dayRow}>
                  <Text style={styles.dayName}>{formatDay(shift.date)}</Text>
                  <Text style={styles.dayTime}>
                    {shift.startTime} – {shift.endTime}
                  </Text>
                  <Text style={styles.dayHours}>{shift.hoursWorked}h</Text>
                </View>
              ))}

              {/* Totals */}
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Hours</Text>
                <Text style={styles.totalValue}>
                  {week.totalHours.toFixed(1)} hrs
                </Text>
              </View>

              {/* Rate */}
              <View style={styles.rateRow}>
                <Text style={styles.totalLabel}>Hourly Rate</Text>
                {isEditing ? (
                  <View style={styles.rateInputRow}>
                    <Text style={styles.dollar}>$</Text>
                    <TextInput
                      style={styles.rateInput}
                      value={editingRate[week.weekKey]}
                      onChangeText={(v) =>
                        setEditingRate((prev) => ({
                          ...prev,
                          [week.weekKey]: v,
                        }))
                      }
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor={COLORS.textMuted}
                      autoFocus
                    />
                    <TouchableOpacity
                      style={styles.saveRateBtn}
                      onPress={() => handleSaveRate(week.weekKey)}
                    >
                      <Text style={styles.saveRateBtnText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() =>
                      setEditingRate((prev) => ({
                        ...prev,
                        [week.weekKey]: week.rate?.toString() ?? "",
                      }))
                    }
                  >
                    <Text style={styles.totalValue}>
                      {week.rate != null ? `$${week.rate}/hr` : "+ Set rate"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Earnings */}
              {earnings != null && (
                <View style={styles.earningsRow}>
                  <Text style={styles.earningsLabel}>Est. Earnings</Text>
                  <Text style={styles.earningsValue}>
                    ${earnings.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 48 },
  title: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  empty: {
    color: COLORS.textSecond,
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  weekLabel: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  currentPill: {
    backgroundColor: `${COLORS.blue}22`,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: `${COLORS.blue}55`,
  },
  currentPillText: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: "600",
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dayName: {
    color: COLORS.textSecond,
    fontSize: 13,
    flex: 1,
  },
  dayTime: {
    color: COLORS.textPrimary,
    fontSize: 13,
    flex: 1,
    textAlign: "center",
  },
  dayHours: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: "600",
    minWidth: 32,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    color: COLORS.textSecond,
    fontSize: 14,
  },
  totalValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  rateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  rateInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dollar: {
    color: COLORS.textSecond,
    fontSize: 14,
  },
  rateInput: {
    backgroundColor: COLORS.bg,
    color: COLORS.textPrimary,
    fontSize: 14,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 70,
  },
  saveRateBtn: {
    backgroundColor: COLORS.blue,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  saveRateBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  earningsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: `${COLORS.green}15`,
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: `${COLORS.green}33`,
  },
  earningsLabel: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: "600",
  },
  earningsValue: {
    color: COLORS.green,
    fontSize: 16,
    fontWeight: "700",
  },
});
