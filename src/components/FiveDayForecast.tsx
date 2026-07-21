import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WiDaySunny, WiRain, WiSnow } from 'weather-icons-react';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Wind, 
  Droplets, 
  Compass, 
  AlertTriangle, 
  Calendar, 
  Info,
  ChevronDown,
  ChevronUp,
  CloudDrizzle,
  CloudFog,
  ShieldCheck
} from 'lucide-react';
import { 
  getHubCoords, 
  mapWMOCodeToTheme,
  WeatherAnimationsStyle,
  SunraysAnimation,
  RainAnimation,
  SnowAnimation,
  FogAnimation,
  ThunderstormAnimation,
  CloudsAnimation
} from './WeatherEngine';

interface FiveDayForecastProps {
  latitude?: number;
  longitude?: number;
  destinationName: string;
  nearestHubId?: string;
  destinationId: string;
}

interface ForecastDay {
  date: Date;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  condition: string;
  icon: string;
  precipitation: string;
  humidity: string;
  windSpeed: string;
  advisory: {
    status: 'ideal' | 'caution' | 'alert';
    label: string;
    desc: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
  };
}

interface WeatherCardStyle {
  bgClass: string;
  hoverClass: string;
  borderClass: string;
  textClass: string;
  iconColor: string;
  glowClass: string;
}

function getWeatherCardStyle(code: number, isAlert: boolean): WeatherCardStyle {
  if (isAlert) {
    return {
      bgClass: 'bg-rose-50/70 dark:bg-rose-950/15',
      hoverClass: 'hover:bg-rose-100/70 dark:hover:bg-rose-950/25',
      borderClass: 'border-rose-200/60 dark:border-rose-900/40 border-l-rose-500 border-l-2',
      textClass: 'text-rose-950 dark:text-rose-100',
      iconColor: 'text-rose-500 dark:text-rose-400',
      glowClass: 'shadow-rose-100/50 dark:shadow-rose-950/20'
    };
  }

  // Clear Sky / Sunny
  if (code === 0) {
    return {
      bgClass: 'bg-amber-50/40 dark:bg-amber-950/10',
      hoverClass: 'hover:bg-amber-100/45 dark:hover:bg-amber-950/15',
      borderClass: 'border-amber-200/50 dark:border-amber-900/30 border-l-amber-400 border-l-2',
      textClass: 'text-amber-955 dark:text-amber-100',
      iconColor: 'text-amber-500 dark:text-amber-400',
      glowClass: 'shadow-amber-100/40 dark:shadow-amber-950/10'
    };
  }
  
  // Mainly Clear / Partly Cloudy
  if (code === 1 || code === 2) {
    return {
      bgClass: 'bg-sky-50/40 dark:bg-sky-950/10',
      hoverClass: 'hover:bg-sky-100/40 dark:hover:bg-sky-950/15',
      borderClass: 'border-sky-200/50 dark:border-sky-900/20 border-l-sky-400 border-l-2',
      textClass: 'text-sky-955 dark:text-sky-100',
      iconColor: 'text-sky-400 dark:text-sky-300',
      glowClass: 'shadow-sky-100/30 dark:shadow-sky-950/10'
    };
  }

  // Cloudy / Overcast
  if (code === 3) {
    return {
      bgClass: 'bg-slate-50/80 dark:bg-slate-900/40',
      hoverClass: 'hover:bg-slate-100/80 dark:hover:bg-slate-900/60',
      borderClass: 'border-slate-200/60 dark:border-slate-800/80 border-l-slate-400 border-l-2',
      textClass: 'text-slate-900 dark:text-slate-100',
      iconColor: 'text-slate-400 dark:text-slate-400',
      glowClass: 'shadow-slate-100/20 dark:shadow-slate-950/5'
    };
  }

  // Foggy
  if (code === 45 || code === 48) {
    return {
      bgClass: 'bg-zinc-50/70 dark:bg-zinc-900/30',
      hoverClass: 'hover:bg-zinc-100/70 dark:hover:bg-zinc-900/50',
      borderClass: 'border-zinc-200/60 dark:border-zinc-800/80 border-l-zinc-400 border-l-2',
      textClass: 'text-zinc-900 dark:text-zinc-100',
      iconColor: 'text-zinc-400 dark:text-zinc-400',
      glowClass: 'shadow-zinc-100/20 dark:shadow-zinc-950/5'
    };
  }

  // Rain / Drizzle / Rain Showers
  if ((code >= 51 && code <= 57) || (code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return {
      bgClass: 'bg-blue-50/40 dark:bg-blue-950/10',
      hoverClass: 'hover:bg-blue-100/40 dark:hover:bg-blue-950/15',
      borderClass: 'border-blue-200/50 dark:border-blue-900/30 border-l-blue-400 border-l-2',
      textClass: 'text-blue-955 dark:text-blue-100',
      iconColor: 'text-blue-500 dark:text-blue-400',
      glowClass: 'shadow-blue-100/30 dark:shadow-blue-950/10'
    };
  }

  // Snow / Ice
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return {
      bgClass: 'bg-cyan-50/40 dark:bg-cyan-950/10',
      hoverClass: 'hover:bg-cyan-100/40 dark:hover:bg-cyan-950/15',
      borderClass: 'border-cyan-200/50 dark:border-cyan-900/30 border-l-cyan-400 border-l-2',
      textClass: 'text-cyan-955 dark:text-cyan-100',
      iconColor: 'text-cyan-400 dark:text-cyan-300',
      glowClass: 'shadow-cyan-100/30 dark:shadow-cyan-950/10'
    };
  }

  // Thunderstorm
  if (code === 95 || code === 96 || code === 99) {
    return {
      bgClass: 'bg-indigo-50/50 dark:bg-indigo-950/15',
      hoverClass: 'hover:bg-indigo-100/50 dark:hover:bg-indigo-950/25',
      borderClass: 'border-indigo-200/50 dark:border-indigo-900/40 border-l-indigo-500 border-l-2',
      textClass: 'text-indigo-955 dark:text-indigo-100',
      iconColor: 'text-indigo-500 dark:text-indigo-400',
      glowClass: 'shadow-indigo-100/30 dark:shadow-indigo-950/10'
    };
  }

  // Fallback
  return {
    bgClass: 'bg-slate-50 dark:bg-slate-950/20',
    hoverClass: 'hover:bg-slate-100 dark:hover:bg-slate-950/40',
    borderClass: 'border-slate-100 dark:border-slate-800 border-l-slate-400 border-l-2',
    textClass: 'text-slate-900 dark:text-white',
    iconColor: 'text-slate-500 dark:text-slate-400',
    glowClass: 'shadow-slate-100/20 dark:shadow-slate-950/5'
  };
}

interface PackingItem {
  id: string;
  item: string;
  reason: string;
  icon: string;
}

interface TravelAdviceResult {
  recommendations: string[];
  packList: PackingItem[];
  riskLevel: 'ideal' | 'caution' | 'alert';
  riskLabel: string;
}

function generateTravelAdvice(forecast: ForecastDay[]): TravelAdviceResult {
  if (forecast.length === 0) {
    return {
      recommendations: ["Ensure standard travel documents are in order.", "Check dynamic updates frequently before journey commencement."],
      packList: [
        { id: "thermos", item: "Insulated Water Flask", reason: "Keeps warm beverages fresh for hours", icon: "🥤" },
        { id: "first_aid", item: "Altitude Meds & Band-Aids", reason: "Soothes nausea and light cuts on remote spurs", icon: "💊" },
        { id: "powerbank", item: "High Capacity Power Bank", reason: "Ensures phones stay charged off-grid", icon: "🔋" }
      ],
      riskLevel: "ideal",
      riskLabel: "Favorable Valley Conditions"
    };
  }

  const hasRain = forecast.some(d => (d.weatherCode >= 51 && d.weatherCode <= 67) || (d.weatherCode >= 80 && d.weatherCode <= 82));
  const hasSnow = forecast.some(d => (d.weatherCode >= 71 && d.weatherCode <= 77) || (d.weatherCode >= 85 && d.weatherCode <= 86));
  const hasStorm = forecast.some(d => d.weatherCode === 95 || d.weatherCode === 96 || d.weatherCode === 99);
  const hasFog = forecast.some(d => d.weatherCode === 45 || d.weatherCode === 48);
  const minTemp = Math.min(...forecast.map(d => d.tempMin));
  const maxTemp = Math.max(...forecast.map(d => d.tempMax));

  const recommendations: string[] = [];
  const packList: PackingItem[] = [];

  // Weather-specific alerts and gear
  if (hasStorm) {
    recommendations.push("Violent mountain storms expected. Restrict driving on treacherous landslide corridors.");
    packList.push({ id: "raincoat", item: "Heavy Duty Raincoat", reason: "For harsh continuous downpours", icon: "🧥" });
    packList.push({ id: "drybag", item: "Waterproof Dry Bags", reason: "Protects sensitive electronics & papers", icon: "🎒" });
  } else if (hasRain) {
    recommendations.push("Rainy intervals predicted. Keep an umbrella accessible and tread cautiously on wet, slick boulders.");
    packList.push({ id: "umbrella", item: "Wind-Resistant Umbrella", reason: "Shields against unexpected downpours", icon: "☂️" });
    packList.push({ id: "hiking_shoes", item: "Non-slip Hiking Boots", reason: "Ensures safety on slippery mossy trails", icon: "🥾" });
  }

  if (hasSnow) {
    recommendations.push("Freezing snowfall active. Always carry tire-gripping chains and coordinate routes with checkposts.");
    packList.push({ id: "snow_cleats", item: "Snow Spikes / Cleats", reason: "Provides critical traction on solid ice", icon: "⛓️" });
    packList.push({ id: "heavy_gloves", item: "Insulated Waterproof Gloves", reason: "Prevents frostbite during snow trekking", icon: "🧤" });
  }

  // Thermal advice
  if (minTemp < 6) {
    recommendations.push("Freezing night chills ahead! Multi-layered thermals and woollen windbreakers are absolutely mandatory.");
    packList.push({ id: "heavy_woolens", item: "Heavy-Duty Woolens & Down Jacket", reason: "Crucial for sub-zero alpine drops", icon: "🧥" });
    packList.push({ id: "thermal_inner", item: "Merino Wool Thermal Inners", reason: "Keeps core temperature balanced", icon: "👕" });
  } else if (minTemp < 12) {
    recommendations.push("Nippy alpine mornings. Packing medium-weight woollen layers or cozy fleece pullovers is highly recommended.");
    packList.push({ id: "fleece", item: "Cozy Fleece Pullover", reason: "Perfect defense against mountain breeze", icon: "🧶" });
    packList.push({ id: "muffler", item: "Woolen Muffler / Scarf", reason: "Protects throat from crisp drafts", icon: "🧣" });
  } else {
    recommendations.push("Mild, favorable temperatures. Standard layering with lightweight cardigans or hoodies is sufficient.");
    packList.push({ id: "light_hoodie", item: "Light Hoodie or Sweatshirt", reason: "Comfortable layer for shaded gorges", icon: "🧥" });
  }

  if (hasFog) {
    recommendations.push("Misty fog expected. Bring a high-power torch for safety and switch on yellow hazard tail-lamps.");
    packList.push({ id: "headlamp", item: "Bright LED Headlamp", reason: "For navigation in low-visibility fog", icon: "🔦" });
  }

  const sunnyDays = forecast.filter(d => d.weatherCode <= 2);
  if (sunnyDays.length >= 3) {
    recommendations.push("Extended sunny slots! High solar UV factor. Wear polarized glasses and carry a suncap.");
    packList.push({ id: "sunscreen", item: "SPF 50+ Sunscreen & Cap", reason: "Prevents severe sunburns at high altitudes", icon: "🧢" });
    packList.push({ id: "sunglasses", item: "UV Polarized Sunglasses", reason: "Protects eyes from dazzling high-glare crests", icon: "🕶️" });
  }

  // Universal fallback pack suggestions to populate list up to 4 items
  const defaults = [
    { id: "thermos", item: "Insulated Water Flask", reason: "Keeps warm beverages fresh for hours", icon: "🥤" },
    { id: "first_aid", item: "Altitude Meds & Band-Aids", reason: "Soothes nausea and light cuts on remote spurs", icon: "💊" },
    { id: "powerbank", item: "High Capacity Power Bank", reason: "Ensures phones stay charged off-grid", icon: "🔋" }
  ];

  while (packList.length < 4 && defaults.length > 0) {
    const dItem = defaults.shift()!;
    if (!packList.some(p => p.id === dItem.id)) {
      packList.push(dItem);
    }
  }

  // Overall risk
  let riskLevel: 'ideal' | 'caution' | 'alert' = 'ideal';
  let riskLabel = 'Perfect Valley Weather';

  if (hasStorm || hasSnow || minTemp < 4) {
    riskLevel = 'alert';
    riskLabel = 'High Alpine Caution Required';
  } else if (hasRain || hasFog || minTemp < 11) {
    riskLevel = 'caution';
    riskLabel = 'Unstable Mountain Conditions';
  }

  return {
    recommendations: Array.from(new Set(recommendations)).slice(0, 3),
    packList: packList.slice(0, 4),
    riskLevel,
    riskLabel
  };
}

export function FiveDayForecast({ latitude, longitude, destinationName, nearestHubId, destinationId }: FiveDayForecastProps) {
  const [forecastList, setForecastList] = useState<ForecastDay[]>([]);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'openweathermap' | 'openmeteo' | 'simulated'>('openmeteo');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    const loadForecast = async () => {
      // 1. Determine Coordinates
      let lat = latitude;
      let lon = longitude;
      if (!lat || !lon) {
        const coords = getHubCoords(nearestHubId || destinationId);
        lat = coords.lat;
        lon = coords.lon;
      }

      const apiKey = (import.meta as any).env?.VITE_OPENWEATHERMAP_API_KEY;
      const cacheKey = `hillytrip_forecast_cache_${destinationId.toLowerCase()}`;

      // Try to load from localStorage cache first to show data immediately and avoid network requests if fresh
      let hasCachedData = false;
      let cacheIsFresh = false;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { forecastList: cachedList, source, timestamp } = JSON.parse(cached);
          if (cachedList && cachedList.length > 0) {
            const hydratedList = cachedList.map((item: any) => ({
              ...item,
              date: new Date(item.date)
            }));
            if (active) {
              setForecastList(hydratedList);
              setDataSource(source);
              hasCachedData = true;
              
              // Use 30 minutes cache validity
              const CACHE_EXPIRY = 30 * 60 * 1000;
              if (timestamp && (Date.now() - timestamp < CACHE_EXPIRY)) {
                cacheIsFresh = true;
                setLoading(false);
              }
            }
          }
        }
      } catch (cacheErr) {
        console.warn("Failed to retrieve or parse weather forecast cache:", cacheErr);
      }

      // If cached data is fresh, skip the API call entirely to minimize requests
      if (cacheIsFresh) {
        return;
      }

      // Show loader only if we don't have cached data to display
      if (!hasCachedData) {
        setLoading(true);
      }
      setError(null);

      try {
        // Attempt to fetch from OpenWeatherMap if API key is provided
        if (apiKey && apiKey !== 'YOUR_OPENWEATHERMAP_API_KEY' && apiKey.trim() !== '') {
          try {
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`OpenWeatherMap request failed with status: ${response.status}`);
            
            const data = await response.json();
            if (data && data.list) {
              // OpenWeatherMap returns list of forecast items every 3 hours. 
              // We'll aggregate them by day (5 days).
              const groupedByDay: Record<string, any[]> = {};
              data.list.forEach((item: any) => {
                const dateStr = item.dt_txt.split(' ')[0];
                if (!groupedByDay[dateStr]) {
                  groupedByDay[dateStr] = [];
                }
                groupedByDay[dateStr].push(item);
              });

              const days = Object.keys(groupedByDay).slice(0, 5);
              const processedDays: ForecastDay[] = days.map(dayStr => {
                const dayItems = groupedByDay[dayStr];
                
                // Find min/max temperature
                let tempMin = Infinity;
                let tempMax = -Infinity;
                let humiditySum = 0;
                let windSum = 0;
                
                dayItems.forEach(item => {
                  if (item.main.temp_min < tempMin) tempMin = item.main.temp_min;
                  if (item.main.temp_max > tempMax) tempMax = item.main.temp_max;
                  humiditySum += item.main.humidity;
                  windSum += item.wind.speed;
                });

                // Pick representative item (mid-day if possible, or first one)
                const repItem = dayItems[Math.floor(dayItems.length / 2)] || dayItems[0];
                const weather = repItem.weather[0];
                const mainCondition = weather.main.toLowerCase();
                const oWMCode = weather.id;

                // Map OpenWeatherMap Condition & Code to our layout
                let condition = weather.description;
                let mappedCode = 0; // WMO equivalent fallback
                
                if (oWMCode >= 200 && oWMCode < 300) {
                  mappedCode = 95; // Thunderstorm
                } else if (oWMCode >= 300 && oWMCode < 400) {
                  mappedCode = 51; // Drizzle
                } else if (oWMCode >= 500 && oWMCode < 600) {
                  mappedCode = 61; // Rain
                } else if (oWMCode >= 600 && oWMCode < 700) {
                  mappedCode = 71; // Snow
                } else if (oWMCode >= 700 && oWMCode < 800) {
                  mappedCode = 45; // Fog/Mist
                } else if (oWMCode === 800) {
                  mappedCode = 0; // Clear
                } else if (oWMCode === 801 || oWMCode === 802) {
                  mappedCode = 1; // Partly Cloudy
                } else if (oWMCode > 802) {
                  mappedCode = 3; // Cloudy
                }

                const advisory = generateAdvisory(mappedCode, tempMax, windSum / dayItems.length);

                return {
                  date: new Date(dayStr),
                  tempMax: Math.round(tempMax),
                  tempMin: Math.round(tempMin),
                  weatherCode: mappedCode,
                  condition: condition.charAt(0).toUpperCase() + condition.slice(1),
                  icon: getWeatherEmoji(mappedCode),
                  precipitation: repItem.pop ? `${Math.round(repItem.pop * 100)}%` : '0%',
                  humidity: `${Math.round(humiditySum / dayItems.length)}%`,
                  windSpeed: `${Math.round((windSum / dayItems.length) * 3.6)} km/h`,
                  advisory
                };
              });

              if (active) {
                setForecastList(processedDays);
                setDataSource('openweathermap');
                setLoading(false);
                localStorage.setItem(cacheKey, JSON.stringify({
                  forecastList: processedDays,
                  source: 'openweathermap',
                  timestamp: Date.now()
                }));
                return;
              }
            }
          } catch (owmError) {
            console.warn("OpenWeatherMap fetch failed, falling back to Open-Meteo:", owmError);
          }
        }

        // 2. Open-Meteo High-Quality Fallback (Used when key is missing or OWM call fails)
        const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_max&timezone=auto`;
        const openMeteoResponse = await fetch(openMeteoUrl);
        if (!openMeteoResponse.ok) throw new Error("Both weather APIs failed to respond.");

        const openMeteoData = await openMeteoResponse.json();
        if (openMeteoData && openMeteoData.daily) {
          const daily = openMeteoData.daily;
          const processedDays: ForecastDay[] = [];

          for (let i = 0; i < 5; i++) {
            const code = daily.weather_code[i];
            const maxTemp = daily.temperature_2m_max[i];
            const minTemp = daily.temperature_2m_min[i];
            const rainSum = daily.precipitation_sum[i];
            const wind = daily.wind_speed_10m_max[i];
            const humidity = daily.relative_humidity_2m_max[i];

            const conditionStr = getWMOConditionLabel(code);
            const advisory = generateAdvisory(code, maxTemp, wind);

            processedDays.push({
              date: new Date(daily.time[i]),
              tempMax: Math.round(maxTemp),
              tempMin: Math.round(minTemp),
              weatherCode: code,
              condition: conditionStr,
              icon: getWeatherEmoji(code),
              precipitation: rainSum > 0 ? `${Math.round(rainSum)} mm` : '0%',
              humidity: `${Math.round(humidity)}%`,
              windSpeed: `${Math.round(wind)} km/h`,
              advisory
            });
          }

          if (active) {
            setForecastList(processedDays);
            setDataSource('openmeteo');
            setLoading(false);
            localStorage.setItem(cacheKey, JSON.stringify({
              forecastList: processedDays,
              source: 'openmeteo',
              timestamp: Date.now()
            }));
          }
        }
      } catch (err: any) {
        console.error("Forecast fetching completely failed. Checking local storage cache...", err);
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const { forecastList: cachedList, source } = JSON.parse(cached);
            if (active && cachedList && cachedList.length > 0) {
              // Map date strings back to Date objects
              const hydratedList = cachedList.map((item: any) => ({
                ...item,
                date: new Date(item.date)
              }));
              setForecastList(hydratedList);
              setDataSource(source);
              setLoading(false);
              return;
            }
          }
        } catch (cacheErr) {}

        // 3. Perfect Static Simulation if completely offline
        if (active) {
          setError("Weather feeds offline. Displaying generalized regional seasonal forecast.");
          generateSimulatedForecast();
          setLoading(false);
        }
      }
    };

    const generateSimulatedForecast = () => {
      const days: ForecastDay[] = [];
      const now = new Date();
      for (let i = 0; i < 5; i++) {
        const nextDate = new Date(now);
        nextDate.setDate(now.getDate() + i);
        
        // Simulating moderate Himalayan weather
        const tempMax = 16 - i * 0.5 + Math.round(Math.random() * 3);
        const tempMin = 8 - i * 0.5 + Math.round(Math.random() * 2);
        const weatherCode = i === 2 ? 61 : i === 4 ? 3 : 1; // Rain on day 3, cloudy day 5, others partly cloudy
        
        days.push({
          date: nextDate,
          tempMax,
          tempMin,
          weatherCode,
          condition: getWMOConditionLabel(weatherCode),
          icon: getWeatherEmoji(weatherCode),
          precipitation: i === 2 ? '4 mm' : '0%',
          humidity: i === 2 ? '85%' : '55%',
          windSpeed: '12 km/h',
          advisory: generateAdvisory(weatherCode, tempMax, 12)
        });
      }
      setForecastList(days);
      setDataSource('simulated');
    };

    loadForecast();
    return () => {
      active = false;
    };
  }, [latitude, longitude, destinationId]);

  // Helper inside forecast mapping
  const getWeatherEmoji = (code: number): string => {
    if (code === 0) return '☀️';
    if (code === 1 || code === 2) return '🌤️';
    if (code === 3) return '☁️';
    if (code === 45 || code === 48) return '🌫️';
    if (code >= 51 && code <= 57) return '🌧️';
    if (code >= 61 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌧️';
    if (code >= 85 && code <= 86) return '❄️';
    if (code === 95 || code === 96 || code === 99) return '⛈️';
    return '☀️';
  };

  const getWMOConditionLabel = (code: number): string => {
    if (code === 0) return 'Clear Sky';
    if (code === 1) return 'Mainly Clear';
    if (code === 2) return 'Partly Cloudy';
    if (code === 3) return 'Overcast';
    if (code === 45 || code === 48) return 'Foggy';
    if (code >= 51 && code <= 55) return 'Light Drizzle';
    if (code >= 61 && code <= 65) return 'Showers';
    if (code >= 71 && code <= 75) return 'Snow Fall';
    if (code >= 80 && code <= 82) return 'Rain Showers';
    if (code === 95 || code === 96 || code === 99) return 'Thunderstorm';
    return 'Pristine Valleys';
  };

  const generateAdvisory = (code: number, tempMax: number, windSpeed: number) => {
    // 1. Extreme Alert (Storms, Snow, Freezing temps)
    if (code === 95 || code === 96 || code === 99 || windSpeed > 30) {
      return {
        status: 'alert' as const,
        label: 'Storm Warning',
        desc: 'Slick hairpins and landslide risks. Postpone high-pass driving.',
        bgClass: 'bg-rose-50 dark:bg-rose-950/20',
        textClass: 'text-rose-700 dark:text-rose-400',
        borderClass: 'border-rose-100 dark:border-rose-900/30'
      };
    }
    
    if (code >= 71 && code <= 77) {
      return {
        status: 'alert' as const,
        label: 'Snow Conditions',
        desc: 'Sub-zero. Carry snow chains and thermal windscreens.',
        bgClass: 'bg-sky-50 dark:bg-sky-950/20',
        textClass: 'text-sky-700 dark:text-sky-400',
        borderClass: 'border-sky-100 dark:border-sky-900/30'
      };
    }

    // 2. Caution (Rain, Heavy fog, cold temperatures)
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      return {
        status: 'caution' as const,
        label: 'Wet Trails',
        desc: 'Slippery viewpoints. Carry durable rain gears & umbrella.',
        bgClass: 'bg-amber-50 dark:bg-amber-950/20',
        textClass: 'text-amber-700 dark:text-amber-400',
        borderClass: 'border-amber-100 dark:border-amber-900/30'
      };
    }

    if (code === 45 || code === 48) {
      return {
        status: 'caution' as const,
        label: 'Fog Hazard',
        desc: 'Low horizontal visibility. Switch on yellow hazard fog-lamps.',
        bgClass: 'bg-zinc-50 dark:bg-zinc-950/20',
        textClass: 'text-zinc-700 dark:text-zinc-400',
        borderClass: 'border-zinc-100 dark:border-zinc-900/30'
      };
    }

    if (tempMax < 10) {
      return {
        status: 'caution' as const,
        label: 'Chilly Run',
        desc: 'Nippy afternoon wind. Ensure multi-layered woollen jackets.',
        bgClass: 'bg-cyan-50 dark:bg-cyan-950/10',
        textClass: 'text-cyan-700 dark:text-cyan-400',
        borderClass: 'border-cyan-100 dark:border-cyan-900/20'
      };
    }

    // 3. Perfect condition (Clear / Partly cloudy)
    return {
      status: 'ideal' as const,
      label: 'Perfect Sightseeing',
      desc: 'Outstanding high-altitude visibility. Ideal for scenic trekking.',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/20',
      textClass: 'text-emerald-700 dark:text-emerald-400',
      borderClass: 'border-emerald-100 dark:border-emerald-900/30'
    };
  };

  const renderWeatherIcon = (code: number, className: string) => {
    if (code === 0) return <WiDaySunny className={`${className} text-amber-500 animate-spin-slow`} size={32} />;
    if (code === 1 || code === 2) return <Cloud className={`${className} text-sky-400`} />;
    if (code === 3) return <Cloud className={`${className} text-slate-400`} />;
    if (code === 45 || code === 48) return <CloudFog className={`${className} text-zinc-400`} />;
    if (code >= 51 && code <= 57) return <CloudDrizzle className={`${className} text-teal-400`} />;
    if (code >= 61 && code <= 67 || code >= 80 && code <= 82) return <WiRain className={`${className} text-sky-500`} size={32} />;
    if (code >= 71 && code <= 77 || code >= 85 && code <= 86) return <WiSnow className={`${className} text-sky-200 animate-pulse`} size={32} />;
    if (code === 95 || code === 96 || code === 99) return <CloudLightning className={`${className} text-indigo-500`} />;
    return <WiDaySunny className={`${className} text-amber-500`} size={32} />;
  };

  const getDayName = (date: Date): string => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getFormattedDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const travelAdvice = generateTravelAdvice(forecastList);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200 dark:border-slate-800 space-y-5 relative overflow-hidden">
      <style>{`
        .high-contrast-text-shadow {
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.95), 0 0 4px rgba(255, 255, 255, 0.8), 0 0 1px rgba(255, 255, 255, 0.5);
        }
        .dark .high-contrast-text-shadow {
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.95), 0 0 4px rgba(0, 0, 0, 0.8), 0 0 1px rgba(0, 0, 0, 0.5);
        }
        .weather-card-details-glass {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .dark .weather-card-details-glass {
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .weather-icon-pop {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.85));
        }
        .dark .weather-icon-pop {
          filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 8px rgba(15, 23, 42, 0.85));
        }
      `}</style>
      <WeatherAnimationsStyle />
      
      {/* 4. Weather & Travel Forecast Header (Accordion Trigger) */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 relative z-10 cursor-pointer select-none group/hdr"
      >
        <div className="space-y-1 pr-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <h4 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2 group-hover/hdr:text-indigo-600 dark:group-hover/hdr:text-indigo-400 transition-colors">
              🌦 Weather & Travel Forecast (5 Days)
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time weather, rainfall, temperature and travel conditions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Feed badge indicating connection status */}
          <span className={`text-[9px] font-mono px-2 py-1 rounded-md border font-bold flex items-center gap-1 ${
            dataSource === 'openweathermap'
              ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30'
              : dataSource === 'openmeteo'
              ? 'bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900/30'
              : 'bg-zinc-50 dark:bg-zinc-950/20 text-zinc-650 dark:text-zinc-400 border-zinc-200 dark:border-zinc-900/30'
          }`}>
            <ShieldCheck className="w-3 h-3" />
            {dataSource === 'openweathermap' ? 'Live OpenWeatherMap' : dataSource === 'openmeteo' ? 'Open-Meteo Feed' : 'Local Archive'}
          </span>

          <div
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition border border-slate-100 dark:border-slate-800"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {error && isExpanded && (
        <div className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/10 px-3 py-2 rounded-xl flex items-center gap-2 border border-amber-200/20 relative z-10">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden relative z-10 space-y-4 pt-1"
          >
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 py-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                    <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mx-auto" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Horizontal Forecast Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {forecastList.map((day, i) => {
                    const isAlert = day.advisory.status === 'alert';
                    const style = getWeatherCardStyle(day.weatherCode, isAlert);
                    return (
                      <div 
                        key={i} 
                        className={`${style.bgClass} ${style.hoverClass} border ${style.borderClass} rounded-2xl p-3 sm:p-4 text-center transition-all duration-300 flex flex-col justify-between shadow-xs ${style.glowClass} group relative overflow-hidden`}
                      >
                        {/* Ambient Weather Animation Background (placed on top of glass but below text for extreme high-fidelity visibility) */}
                        <div className="absolute inset-0 pointer-events-none select-none opacity-90 dark:opacity-75 group-hover:opacity-100 dark:group-hover:opacity-95 transition-opacity duration-300 z-[5] overflow-hidden">
                          {(() => {
                            const cardTheme = mapWMOCodeToTheme(day.weatherCode, parseFloat(day.windSpeed) || 10);
                            if (cardTheme === 'sunny') return <SunraysAnimation />;
                            if (cardTheme === 'rain') return <RainAnimation />;
                            if (cardTheme === 'snow') return <SnowAnimation />;
                            if (cardTheme === 'fog') return <FogAnimation />;
                            if (cardTheme === 'thunderstorm') return <ThunderstormAnimation />;
                            if (cardTheme === 'windy' || cardTheme === 'cloudy' || cardTheme === 'partly_cloudy') {
                              return <CloudsAnimation fast={cardTheme === 'windy'} />;
                            }
                            return null;
                          })()}
                        </div>

                        {/* Translucent background overlay with high-contrast blurred layer */}
                        <div className="absolute inset-0 weather-card-details-glass z-[2] pointer-events-none" />

                        <div className="space-y-0.5 relative z-10">
                          <span className={`block text-xs font-black high-contrast-text-shadow ${isAlert ? 'text-rose-950 dark:text-rose-100' : 'text-slate-800 dark:text-slate-100'}`}>
                            {getDayName(day.date)}
                          </span>
                          <span className="block text-[10px] font-mono font-bold text-slate-500 dark:text-slate-350 high-contrast-text-shadow">
                            {getFormattedDate(day.date)}
                          </span>
                        </div>

                        <div className="my-3 flex flex-col items-center justify-center transition-transform duration-300 group-hover:scale-110 relative z-10">
                          {renderWeatherIcon(day.weatherCode, "w-8 h-8 weather-icon-pop")}
                          <span className="mt-1.5 block text-[10px] font-bold text-slate-700 dark:text-slate-205 line-clamp-1 leading-snug high-contrast-text-shadow">
                            {day.condition}
                          </span>
                        </div>

                        <div className="space-y-2.5 relative z-10">
                          {/* Max/Min temp */}
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white high-contrast-text-shadow">
                              {day.tempMax}°
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 high-contrast-text-shadow">
                              / {day.tempMin}°
                            </span>
                          </div>

                          {/* Sub-metrics */}
                          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-300/50 dark:border-slate-800/80 text-[9px] font-semibold text-slate-600 dark:text-slate-300">
                            <div className="flex flex-col items-center justify-center">
                              <Droplets className="w-2.5 h-2.5 text-sky-500 mb-0.5 filter drop-shadow-xs" />
                              <span className="font-mono scale-90 high-contrast-text-shadow">{day.precipitation}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                              <Droplets className="w-2.5 h-2.5 text-sky-400 mb-0.5 filter drop-shadow-xs" />
                              <span className="font-mono scale-90 high-contrast-text-shadow">{day.humidity}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                              <Wind className="w-2.5 h-2.5 text-slate-500 mb-0.5 filter drop-shadow-xs" />
                              <span className="font-mono scale-90 truncate max-w-full high-contrast-text-shadow">{day.windSpeed.split(' ')[0]}</span>
                            </div>
                          </div>

                          {/* Simple badge status */}
                          <div className={`mt-2 py-0.5 px-1.5 rounded text-[8px] font-black uppercase tracking-wider ${day.advisory.bgClass} ${day.advisory.textClass}`}>
                            {day.advisory.label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Trekker & Driver advisory banner */}
                <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/20 text-indigo-500 shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5 flex-grow">
                    <span className="block text-xs font-black text-slate-900 dark:text-white">
                      Intelligent Planner Recommendations
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      The upcoming days show <strong className="text-indigo-600 dark:text-indigo-400">
                        {forecastList.filter(d => d.advisory.status === 'ideal').length} Perfect Trekking
                      </strong> day{forecastList.filter(d => d.advisory.status === 'ideal').length !== 1 ? 's' : ''} and{' '}
                      <strong className="text-amber-600 dark:text-amber-400">
                        {forecastList.filter(d => d.advisory.status === 'caution').length} Caution
                      </strong> day{forecastList.filter(d => d.advisory.status === 'caution').length !== 1 ? 's' : ''}. Consider hiking on {
                        forecastList.find(d => d.advisory.status === 'ideal')?.date.toLocaleDateString('en-US', { weekday: 'long' }) || 'sunny segments'
                      }.
                    </p>
                  </div>

                  {/* Disclaimer */}
                  <div className="text-[9px] text-slate-400 font-medium sm:text-right max-w-xs leading-tight sm:border-l sm:border-slate-200 sm:dark:border-slate-800 sm:pl-3">
                    Mountain weather shifts dynamically. Always consult with your assigned cab driver or guide checkposts before heading above 10,000 feet.
                  </div>
                </div>

                {/* Smart Travel Advisor & Packing Checklist */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Smart Travel Advice List */}
                  <div className="space-y-3 bg-slate-50/60 dark:bg-slate-950/10 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                      <span className="text-base">💡</span>
                      <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Tailored Travel & Route Advice
                      </h5>
                    </div>
                    
                    {travelAdvice.recommendations.length > 0 ? (
                      <ul className="space-y-2.5">
                        {travelAdvice.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-605 dark:text-slate-300 leading-relaxed">
                            <span className="text-indigo-500 font-black mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No special alerts. Standard mountain gear recommended.</p>
                    )}

                    <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        travelAdvice.riskLevel === 'alert' 
                          ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400' 
                          : travelAdvice.riskLevel === 'caution'
                          ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
                          : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {travelAdvice.riskLabel}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Dynamic Packing Checklist */}
                  <div className="space-y-3 bg-slate-50/60 dark:bg-slate-950/10 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <span className="text-base">🎒</span>
                        <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Smart Packing List ({Object.values(checkedItems).filter(Boolean).length}/{travelAdvice.packList.length})
                        </h5>
                      </div>
                      {Object.values(checkedItems).filter(Boolean).length === travelAdvice.packList.length && travelAdvice.packList.length > 0 && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full animate-bounce">
                          All Packed! 🎉
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {travelAdvice.packList.map((item) => {
                        const isChecked = !!checkedItems[item.id];
                        return (
                          <button
                            key={item.id}
                            onClick={() => setCheckedItems(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                            className={`w-full text-left p-2 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                              isChecked 
                                ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-500/30 text-slate-500 line-through decoration-slate-450/50' 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/30'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-lg shrink-0 text-slate-800 dark:text-white">{item.icon}</span>
                              <div className="min-w-0">
                                <span className={`block text-xs font-black truncate ${isChecked ? 'text-slate-400 dark:text-slate-550' : 'text-slate-850 dark:text-slate-100'}`}>
                                  {item.item}
                                </span>
                                <span className="block text-[10px] text-slate-500 dark:text-slate-400 truncate leading-snug">
                                  {item.reason}
                                </span>
                              </div>
                            </div>

                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                              isChecked 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'border-slate-300 dark:border-slate-700'
                            }`}>
                              {isChecked && (
                                <svg className="w-3 h-3 stroke-current stroke-[3px]" fill="none" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
