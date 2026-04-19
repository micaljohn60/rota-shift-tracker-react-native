export interface Shift {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "9:00 AM"
  endTime: string; // "5:00 PM"
  location: string | null;
  role: string | null;
  notes: string | null;
  hoursWorked: number;
  status: "upcoming" | "clocked-in" | "completed";
  rawSMS: string;
  createdAt: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  emoji: string;
}

export interface ParsedShift {
  date: string;
  startTime: string;
  endTime: string;
  location: string | null;
  role: string | null;
  notes: string | null;
}
