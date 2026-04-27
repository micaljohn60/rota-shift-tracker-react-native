// src/hooks/useShifts.ts
import { useCallback, useState } from "react";
import {
  deleteShift,
  getAllShifts,
  updateShiftStatus,
} from "../services/database";
import { cancelShiftNotifications } from "../services/notification";
import { Shift } from "../types";
import { to24Hour, todayString } from "../utils/time";

function getCurrentWeekRange(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + diff,
  );
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) => d.toISOString().split("T")[0];
  return { start: fmt(monday), end: fmt(sunday) };
}

export function useShifts() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await getAllShifts();
    const now = new Date();

    const updated = await Promise.all(
      data.map(async (shift) => {
        const start = new Date(`${shift.date}T${to24Hour(shift.startTime)}`);
        const end = new Date(`${shift.date}T${to24Hour(shift.endTime)}`);

        if (now >= start && now < end && shift.status === "upcoming") {
          await updateShiftStatus(shift.id, "clocked-in");
          return { ...shift, status: "clocked-in" as const };
        }
        if (now >= end && shift.status !== "completed") {
          await updateShiftStatus(shift.id, "completed");
          return { ...shift, status: "completed" as const };
        }
        return shift;
      }),
    );

    // Filter to current week only for home screen
    const { start, end } = getCurrentWeekRange();
    const currentWeekShifts = updated.filter(
      (s) => s.date >= start && s.date <= end,
    );

    setShifts(currentWeekShifts);
    setLoading(false);
  }, []);

  const remove = useCallback(async (id: string) => {
    await cancelShiftNotifications(id);
    await deleteShift(id);
    setShifts((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const totalHours = shifts.reduce((sum, s) => sum + s.hoursWorked, 0);
  const upcomingCount = shifts.filter((s) => s.status === "upcoming").length;
  const todayShift = shifts.find((s) => s.date === todayString()) ?? null;

  return {
    shifts,
    loading,
    load,
    remove,
    totalHours,
    upcomingCount,
    todayShift,
  };
}
