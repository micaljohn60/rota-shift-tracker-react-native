// src/services/database.ts
import * as SQLite from "expo-sqlite";
import { Shift } from "../types";

let db: SQLite.SQLiteDatabase;

export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync("rota.db");
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS shifts (
      id          TEXT PRIMARY KEY,
      date        TEXT NOT NULL,
      startTime   TEXT NOT NULL,
      endTime     TEXT NOT NULL,
      location    TEXT,
      role        TEXT,
      notes       TEXT,
      hoursWorked REAL NOT NULL,
      status      TEXT NOT NULL DEFAULT 'upcoming',
      rawSMS      TEXT NOT NULL,
      createdAt   TEXT NOT NULL
    );
  `);

  await db.execAsync(`
  CREATE TABLE IF NOT EXISTS week_rates (
    weekKey TEXT PRIMARY KEY,
    rate    REAL NOT NULL
  );
`);

  await db.execAsync(`
  CREATE TABLE IF NOT EXISTS events (
    id        TEXT PRIMARY KEY,
    title     TEXT NOT NULL,
    date      TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime   TEXT NOT NULL,
    notes     TEXT,
    createdAt TEXT NOT NULL
  );
`);
}

export async function saveShift(shift: Shift): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO shifts
     (id, date, startTime, endTime, location, role, notes, hoursWorked, status, rawSMS, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      shift.id,
      shift.date,
      shift.startTime,
      shift.endTime,
      shift.location ?? null,
      shift.role ?? null,
      shift.notes ?? null,
      shift.hoursWorked,
      shift.status,
      shift.rawSMS,
      shift.createdAt,
    ],
  );
}

export async function getAllShifts(): Promise<Shift[]> {
  return db.getAllAsync<Shift>(
    "SELECT * FROM shifts ORDER BY date ASC, startTime ASC",
  );
}

export async function updateShiftStatus(
  id: string,
  status: Shift["status"],
): Promise<void> {
  await db.runAsync("UPDATE shifts SET status = ? WHERE id = ?", [status, id]);
}

export async function deleteShift(id: string): Promise<void> {
  await db.runAsync("DELETE FROM shifts WHERE id = ?", [id]);
}

export async function getTodayShift(today: string): Promise<Shift | null> {
  const row = await db.getFirstAsync<Shift>(
    "SELECT * FROM shifts WHERE date = ? LIMIT 1",
    [today],
  );
  return row ?? null;
}

export async function getWeekRate(weekKey: string): Promise<number | null> {
  const row = await db.getFirstAsync<{ rate: number }>(
    "SELECT rate FROM week_rates WHERE weekKey = ?",
    [weekKey],
  );
  return row?.rate ?? null;
}

export async function saveWeekRate(
  weekKey: string,
  rate: number,
): Promise<void> {
  await db.runAsync(
    "INSERT OR REPLACE INTO week_rates (weekKey, rate) VALUES (?, ?)",
    [weekKey, rate],
  );
}

export async function saveEvent(event: {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  createdAt: string;
}): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO events
     (id, title, date, startTime, endTime, notes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      event.id,
      event.title,
      event.date,
      event.startTime,
      event.endTime,
      event.notes ?? null,
      event.createdAt,
    ],
  );
}

export async function getAllEvents(): Promise<
  {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    notes: string | null;
    createdAt: string;
  }[]
> {
  return db.getAllAsync(
    "SELECT * FROM events ORDER BY date ASC, startTime ASC",
  );
}

export async function deleteEvent(id: string): Promise<void> {
  await db.runAsync("DELETE FROM events WHERE id = ?", [id]);
}
