// src/services/weather.ts
import * as Location from 'expo-location';
import { WeatherData } from '../types';
import { WMO_CODES } from '../constants';

export async function fetchWeather(): Promise<WeatherData> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('Location permission denied');

  const { coords } = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = coords;

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,weathercode&temperature_unit=celsius`;

  const res = await fetch(url);
  const data = await res.json();

  const temp = Math.round(data.current.temperature_2m as number);
  const code = data.current.weathercode as number;
  const meta = WMO_CODES[code] ?? { condition: 'Unknown', emoji: '🌡️' };

  return { temperature: temp, ...meta };
}