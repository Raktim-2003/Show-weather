import React, { useEffect, useState } from "react";
import WeatherBackground from "./components/WeatherBackground";
import {
  convertTemperature,
  getHumidityValue,
  getVisibilityValue,
  getWindDirection,
} from "./components/Helper";
import {
  VisibilityIcon,
  WindIcon,
  HumidityIcon,
  SunriseIcon,
  SunsetIcon,
} from "./components/Icons";

const API_KEY = "68bcf1e54057aac5e7fc2c4da036fc72";
const HISTORY_KEY = "weather_search_history";
const HISTORY_LIMIT = 5;

const App = () => {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("");
  const [suggestion, setSuggestion] = useState([]);
  const [unit, setUnit] = useState("c");
  const [error, setError] = useState("");
  const [history, setHistory] = useState(() =>
    JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]")
  );

  useEffect(() => {
    if (city.trim().length >= 3 && !weather) {
      const timer = setTimeout(() => fetchSuggestion(city), 500);
      return () => clearTimeout(timer);
    }
    setSuggestion([]);
  }, [city, weather]);

  const updateHistory = (cityLabel) => {
    const next = [
      cityLabel,
      ...history.filter((c) => c.toLowerCase() !== cityLabel.toLowerCase()),
    ].slice(0, HISTORY_LIMIT);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const fetchSuggestion = async (query) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );
      console.log(res)
      setSuggestion(res.ok ? await res.json() : []);
    } catch {
      setSuggestion([]);
    }
  };

  const fetchWeatherData = async (url, label = "") => {
    setError("");
    setWeather(null);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "City not found. Please try again.");
      }
      const data = await res.json();
      setWeather(data);
      const finalLabel = label || data.name;
      setCity(finalLabel);
      updateHistory(finalLabel);
      setSuggestion([]);
    } catch (e) {
      setError(e.message || "Failed to fetch weather data. Please check your internet connection.");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return setError("Please enter a valid city");
    await fetchWeatherData(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city.trim()
      )}&appid=${API_KEY}&units=metric`
    );
  };

  const formatTime = (unix) =>
    new Date(unix * 1000).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getWeatherCondition = () =>
    weather && {
      main: weather.weather[0].main.toLowerCase(),
      description: weather.weather[0].description.toLowerCase(),
      isDay:
        Date.now() / 1000 > weather.sys.sunrise &&
        Date.now() / 1000 < weather.sys.sunset,
    };

  return (
    <div className="min-h-screen">
      <WeatherBackground condition={getWeatherCondition()} />

      <div className="flex items-center justify-center p-6 min-h-screen">
        <div className="relative z-10 max-w-md w-full text-white">
          <div className="bg-white/5 backdrop-blur-md border border-white/30 rounded-xl shadow-2xl p-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6">
              Weather Application
            </h1>

            {error && (
              <p className="text-red-300 font-semibold text-center mb-4">
                {error}
              </p>
            )}

            {!weather ? (
              <>
                {history.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {history.map((h) => (
                      <button
                        key={h}
                        onClick={() =>
                          fetchWeatherData(
                            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
                              h
                            )}&appid=${API_KEY}&units=metric`,
                            h
                          )
                        }
                        className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 rounded-full transition-colors"
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={handleSearch}
                  className="flex flex-col relative gap-4"
                >
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter your city (min 3 letters)"
                    className="p-3 rounded border border-white bg-transparent placeholder-white focus:outline-none focus:border-blue-300 transition"
                  />

                  {suggestion.length > 0 && (
                    <div className="absolute top-14 left-0 right-0 bg-black/60 backdrop-blur-md rounded-md shadow-md z-10 max-h-60 overflow-y-auto">
                      {suggestion.map((s) => (
                        <button
                          key={`${s.lat}-${s.lon}`}
                          type="button"
                          onClick={() =>
                            fetchWeatherData(
                              `https://api.openweathermap.org/data/2.5/weather?lat=${s.lat}&lon=${s.lon}&appid=${API_KEY}&units=metric`,
                              `${s.name}, ${s.country}${s.state ? `, ${s.state}` : ""}`
                            )
                          }
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-700"
                        >
                          {s.name}, {s.country}
                          {s.state && `, ${s.state}`}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="bg-purple-700 hover:bg-blue-700 font-semibold py-2 rounded transition-colors"
                  >
                    Get Weather
                  </button>
                </form>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setWeather(null);
                    setCity("");
                  }}
                  className="mb-4 bg-purple-900 hover:bg-blue-700 font-semibold py-1 px-3 rounded transition-colors"
                >
                  New Search
                </button>

                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-3xl font-bold">{weather.name}</h2>
                  <button
                    onClick={() =>
                      setUnit((u) => (u.toLowerCase() === "c" ? "f" : "c"))
                    }
                    className="bg-blue-700 hover:bg-blue-800 font-semibold py-1 px-3 rounded transition-colors"
                  >
                    &deg;{unit.toUpperCase()}
                  </button>
                </div>

                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt={weather.weather[0].description}
                  className="mx-auto my-4 animate-bounce"
                />

                <p className="text-4xl">
                  {convertTemperature(weather.main.temp, unit)}&deg;{unit.toUpperCase()}
                </p>
                <p className="capitalize">{weather.weather[0].description}</p>

                <div className="flex flex-wrap justify-around mt-6">
                  {[
                    [
                      WindIcon,
                      "Wind",
                      `${weather.wind.speed} m/s (${getWindDirection(
                        weather.wind.deg
                      )})`,
                    ],
                    [
                      VisibilityIcon,
                      "Visibility",
                      getVisibilityValue(weather.visibility),
                    ],
                    [
                      HumidityIcon,
                      "Humidity",
                      `${weather.main.humidity}% (${getHumidityValue(
                        weather.main.humidity
                      )})`,
                    ],
                  ].map(([Icon, label, value]) => (
                    <div key={label} className="flex flex-col items-center m-2">
                      <Icon />
                      <p className="mt-1 font-semibold">{label}</p>
                      <p className="text-sm">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap justify-around mt-6">
                  {[
                    [SunriseIcon, "Sunrise", weather.sys.sunrise],
                    [SunsetIcon, "Sunset", weather.sys.sunset],
                  ].map(([Icon, label, time]) => (
                    <div key={label} className="flex flex-col items-center m-2">
                      <Icon />
                      <p className="mt-1 font-semibold">{label}</p>
                      <p className="text-sm">{formatTime(time)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-sm leading-5 space-y-1">
                  <p>
                    <strong>Feels Like:</strong> {convertTemperature(weather.main.feels_like, unit)}&deg;{unit.toUpperCase()}
                  </p>
                  <p>
                    <strong>Pressure:</strong> {weather.main.pressure} hPa
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
