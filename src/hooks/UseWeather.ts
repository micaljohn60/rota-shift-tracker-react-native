// src/hooks/useWeather.ts
import { useState, useEffect } from 'react';
import { fetchWeather } from '../services/weather';

export function useWeather() {
  const [weatherLabel, setWeatherLabel] = useState('');

  useEffect(() => {
    fetchWeather()
      .then((w) => setWeatherLabel(`${w.emoji} ${w.temperature}°C  ${w.condition}`))
      .catch(() => setWeatherLabel('📍 Enable location for weather'));
  }, []);

  return weatherLabel;
}