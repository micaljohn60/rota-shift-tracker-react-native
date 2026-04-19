// src/services/aiParser.ts
import { ParsedShift } from "../types";
import { todayString } from "../utils/time";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? "";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

export async function parseShiftWithAI(
  smsText: string,
): Promise<ParsedShift[]> {
  const prompt = `You are a shift SMS parser. Extract ALL shifts from the SMS below.
Today's date is ${todayString()}. And it is only for next coming week, don't calculate further week
Resolve relative days like "fri", "sat", "tomorrow", "next Monday" to real YYYY-MM-DD dates.
If multiple shifts are mentioned, return ALL of them.

SMS: "${smsText}"

if the time is 11-9 you have to extract between 2:30 PM to 4:00 PM because it is brake time
and it doesn't count as shift.

Return ONLY a raw JSON array — no markdown, no backticks, no explanation.
Even if there is only one shift, return an array:
[
  {
    "date": "YYYY-MM-DD",
    "startTime": "H:MM AM/PM",
    "endTime": "H:MM AM/PM",
    "location": "string or null",
    "role": "string or null",
    "notes": "string or null"
  }
]`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 8192,
      },
    }),
  });

  console.log(response.status);

  if (!response.ok) {
    console.log(response.status);
    console.log(API_KEY);
    const err = await response.text();
    console.log(err);
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();

  const raw = data.candidates[0].content.parts[0].text
    .trim()
    .replace(/```json|```/g, "");

  const parsed = JSON.parse(raw);
  console.log(data);
  // Handle both array and single object responses
  return Array.isArray(parsed) ? parsed : [parsed];
}
