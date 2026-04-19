import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { initDatabase } from "../src/services/database";

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(() => setDbReady(true))
      .catch(console.error);
  }, []);

  if (!dbReady) return null; // wait until db is ready before rendering anything

  return <Stack screenOptions={{ headerShown: false }} />;
}
