import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS } from "../../src/constants";
import { saveEvent } from "../../src/services/database";
import {
    scheduleEventNotification
} from "../../src/services/notification";

function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return `${hours}:${String(minutes).padStart(2, "0")} ${period}`;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function AddEventScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d;
  });
  const [showDate, setShowDate] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter an event title.");
      return;
    }
    setSaving(true);
    const event = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: title.trim(),
      date: formatDate(date),
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      notes: notes.trim() || null,
      createdAt: new Date().toISOString(),
    };
    await saveEvent(event);
    await scheduleEventNotification(event);

    Alert.alert("✅ Event Saved!", `"${event.title}" added with a reminder.`, [
      { text: "Done", onPress: () => router.back() },
    ]);
    setSaving(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Add Event</Text>
            <View style={{ width: 50 }} />
          </View>

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Meeting, appointment..."
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowDate(true)}
          >
            <Text style={styles.pickerText}>
              {date.toLocaleDateString("en-AU", {
                weekday: "short",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </TouchableOpacity>
          {showDate && (
            <DateTimePicker
              value={date}
              mode="date"
              onChange={(_, d) => {
                setShowDate(false);
                if (d) setDate(d);
              }}
            />
          )}

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Start Time</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setShowStart(true)}
              >
                <Text style={styles.pickerText}>{formatTime(startTime)}</Text>
              </TouchableOpacity>
              {showStart && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  onChange={(_, d) => {
                    setShowStart(false);
                    if (d) setStartTime(d);
                  }}
                />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>End Time</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setShowEnd(true)}
              >
                <Text style={styles.pickerText}>{formatTime(endTime)}</Text>
              </TouchableOpacity>
              {showEnd && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  onChange={(_, d) => {
                    setShowEnd(false);
                    if (d) setEndTime(d);
                  }}
                />
              )}
            </View>
          </View>

          <Text style={styles.label}>
            Notes <Text style={styles.optional}>(optional)</Text>
          </Text>
          <TextInput
            style={[styles.input, { minHeight: 80 }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any extra details..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>Save Event & Set Reminder</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 48 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  back: { color: COLORS.blue, fontSize: 16 },
  title: { color: COLORS.textPrimary, fontSize: 18, fontWeight: "700" },
  label: {
    color: COLORS.textSecond,
    fontSize: 13,
    marginBottom: 6,
    marginTop: 14,
  },
  optional: { color: COLORS.textMuted, fontSize: 12 },
  input: {
    backgroundColor: COLORS.card,
    color: COLORS.textPrimary,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  picker: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerText: { color: COLORS.textPrimary, fontSize: 14 },
  row: { flexDirection: "row" },
  saveBtn: {
    backgroundColor: COLORS.blue,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
