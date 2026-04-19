// src/constants/index.ts

export const COLORS = {
  bg: "#1C1C1E", // iOS system gray 6 — perfect for LCD
  card: "#2C2C2E", // iOS system gray 5
  border: "#3A3A3C", // iOS system gray 4
  blue: "#4A90E2",
  green: "#00C48C",
  red: "#E25555",
  textPrimary: "#FFFFFF",
  textSecond: "#AEAEB2", // lighter than before — more readable on LCD
  textMuted: "#636366",
} as const;

export const WMO_CODES: Record<number, { condition: string; emoji: string }> = {
  0: { condition: "Clear sky", emoji: "☀️" },
  1: { condition: "Mainly clear", emoji: "🌤️" },
  2: { condition: "Partly cloudy", emoji: "⛅" },
  3: { condition: "Overcast", emoji: "☁️" },
  45: { condition: "Foggy", emoji: "🌫️" },
  51: { condition: "Light drizzle", emoji: "🌦️" },
  61: { condition: "Light rain", emoji: "🌧️" },
  63: { condition: "Moderate rain", emoji: "🌧️" },
  65: { condition: "Heavy rain", emoji: "🌧️" },
  80: { condition: "Rain showers", emoji: "🌦️" },
  95: { condition: "Thunderstorm", emoji: "⛈️" },
};

export const NOTIFICATION_IDS = {
  dailyWeather: "daily-weather",
  shiftNight: (id: string) => `shift-night-${id}`,
  shift30Min: (id: string) => `shift-30min-${id}`,
  shiftClockIn: (id: string) => `shift-clockin-${id}`,
  shiftClockOut: (id: string) => `shift-clockout-${id}`,
} as const;
