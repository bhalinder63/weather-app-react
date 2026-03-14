import "./App.css";
import { useState, useEffect, useRef } from "react";
import Forecastcomp from "./Forecastcomp";

const API_KEY = "33dab0eb21c5a06ba4c94c014c370262";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

function App() {
  const [city, setCity] = useState("Abohar");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timezoneOffset, setTimezoneOffset] = useState(0);
  const userChangedCity = useRef(false);

  const formatLocalDate = (dt, offset) => {
    const cityTime = new Date(dt * 1000 + offset * 1000);
    return cityTime.toLocaleDateString("en-US", {
      timeZone: "UTC",
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handleChange = (event) => {
    userChangedCity.current = true;
    setCity(event.target.value);
  };

  const applyWeatherData = (data, fData) => {
    if (data.timezone) setTimezoneOffset(data.timezone);
    setWeatherData(data);
    if (fData?.list?.length > 0) {
      setForecastData(fData.list.filter((item) => item.dt_txt.includes("12:00:00")));
    } else {
      setForecastData([]);
    }
  };

  const getWeatherByCoords = async (lat, lon) => {
    try {
      setLoading(true);
      setError(null);
      const [wRes, fRes] = await Promise.all([
        fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
        fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
      ]);
      if (!wRes.ok) throw new Error("Unable to fetch weather data");
      const [data, fData] = await Promise.all([wRes.json(), fRes.json()]);
      applyWeatherData(data, fData);
      setCity(data.name); // internal update — does not trigger debounce (userChangedCity stays false)
    } catch (err) {
      setError("Unable to fetch weather data");
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherByCity = async (cityName) => {
    try {
      setLoading(true);
      setError(null);
      const [wRes, fRes] = await Promise.all([
        fetch(`${BASE_URL}/weather?q=${cityName}&units=metric&appid=${API_KEY}`),
        fetch(`${BASE_URL}/forecast?q=${cityName}&units=metric&appid=${API_KEY}`),
      ]);
      if (!wRes.ok) throw new Error("City not found");
      const data = await wRes.json();
      if (!data.main || !data.weather) throw new Error("Invalid weather data received");
      const fData = fRes.ok ? await fRes.json() : null;
      applyWeatherData(data, fData);
    } catch (err) {
      setError(err.message || "City not found. Please try another city.");
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial load: use geolocation, fall back to default city
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          getWeatherByCoords(latitude, longitude);
        },
        () => {
          getWeatherByCity("Abohar");
        }
      );
    } else {
      getWeatherByCity("Abohar");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced fetch — only fires when the user changed the city input
  useEffect(() => {
    if (!city || !userChangedCity.current) return;
    userChangedCity.current = false;

    const timeout = setTimeout(() => {
      getWeatherByCity(city);
    }, 500);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  return (
    <div className="app-wrapper">
      <div className="city-selection">
        <div className="input-group">
          <label htmlFor="city">Choose a city</label>
          <select id="city" value={city} onChange={handleChange}>
            <option value="">-- Select --</option>
            <option value="Delhi">Delhi</option>
            <option value="Winnipeg">Winnipeg</option>
            <option value="New York">New York</option>
            <option value="Vancouver">Vancouver</option>
            <option value="Scranton">Scranton</option>
          </select>
        </div>

        <span className="divider">or</span>

        <div className="input-group">
          <label htmlFor="city-search">Search a city</label>
          <input
            id="city-search"
            className="city-input"
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={handleChange}
          />
        </div>
      </div>

      {loading && <div className="loading">Loading weather data...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && (
        <div className="weather-layout">
          {weatherData && (
            <div className="weather-card main-card">
              <div className="top-section">
                <h1 className="country">
                  {weatherData.name}, {weatherData.sys.country}
                </h1>
                <div className="date">{formatLocalDate(weatherData.dt, timezoneOffset)}</div>
                <div className="weather-main">
                  <img
                    className="weather-icon-img"
                    src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                    alt={weatherData.weather[0].description}
                  />
                  <span className="temp">{Math.round(weatherData.main.temp)}°C</span>
                </div>
                <p className="description">{weatherData.weather[0].description}</p>
                <p className="feels-like">
                  Feels like {Math.round(weatherData.main.feels_like)}°C &nbsp;·&nbsp;
                  H: {Math.round(weatherData.main.temp_max)}° L: {Math.round(weatherData.main.temp_min)}°
                </p>
              </div>
              <div className="bottom-section">
                <div className="info">
                  <p className="label">HUMIDITY</p>
                  <p className="value">{weatherData.main.humidity}%</p>
                </div>
                <div className="info">
                  <p className="label">VISIBILITY</p>
                  <p className="value">{(weatherData.visibility / 1000).toFixed(1)} km</p>
                </div>
                <div className="info">
                  <p className="label">PRESSURE</p>
                  <p className="value">{weatherData.main.pressure} hPa</p>
                </div>
                <div className="info">
                  <p className="label">WIND</p>
                  <p className="value">{weatherData.wind.speed} m/s</p>
                </div>
              </div>
            </div>
          )}

          <div className="right-section">
            <h3 className="forecast-title">3-Day Forecast</h3>
            {forecastData.length > 0 ? (
              forecastData
                .slice(0, 3)
                .map((forecast, index) => (
                  <Forecastcomp
                    key={index}
                    forecastData={forecast}
                    timezoneOffset={timezoneOffset}
                  />
                ))
            ) : (
              <p className="no-forecast">No forecast available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
