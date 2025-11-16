import "./App.css";
import { useState, useEffect } from "react";
import Forecastcomp from "./Forecastcomp";

function App() {
  const [city, setCity] = useState("Abohar");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timezoneOffset, setTimezoneOffset] = useState(0);

  const API_KEY = "33dab0eb21c5a06ba4c94c014c370262";

  // Handle city input change
  const handleChange = (event) => {
    setCity(event.target.value);
  };

  // Fetch current weather by coordinates
  const getWeatherByCoords = async (lat, lon) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      if (!res.ok) throw new Error("Unable to fetch weather data");
      const data = await res.json();

      // Store timezone offset from weather data
      if (data.timezone) {
        setTimezoneOffset(data.timezone);
      }

      setWeatherData(data);
      setCity(data.name);

      // Also fetch forecast for this location
      await getForecastByCity(data.name);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching weather by coordinates:", err);
      setError("Unable to fetch weather data");
      setLoading(false);
    }
  };

  // Fetch current weather by city
  const getWeatherByCity = async (cityName) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();

      // Check if response is valid
      if (!data.main || !data.weather) {
        throw new Error("Invalid weather data received");
      }

      // Store timezone offset from weather data
      if (data.timezone) {
        setTimezoneOffset(data.timezone);
        console.log("timezone offset", data.timezone);
      }

      setWeatherData(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching weather:", err);
      setError(err.message || "City not found. Please try another city.");
      setWeatherData(null);
      setLoading(false);
    }
  };

  // Fetch forecast by city
  const getForecastByCity = async (cityName) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      if (!res.ok) throw new Error("Unable to fetch forecast");
      const data = await res.json();

      // Check if response is valid
      if (!data.list || data.list.length === 0) {
        throw new Error("No forecast data available");
      }

      // Get daily forecast at 12:00 PM
      const dailyForecast = data.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
      );

      setForecastData(dailyForecast);
    } catch (err) {
      console.error("Error fetching forecast:", err);
      setForecastData([]);
    }
  };

  // Get user location on initial load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          getWeatherByCoords(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to default city
          getWeatherByCity("Abohar");
          getForecastByCity("Abohar");
        }
      );
    } else {
      console.log("Geolocation not supported");
      // Fallback to default city
      getWeatherByCity("Abohar");
      getForecastByCity("Abohar");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch weather & forecast when city changes (with debounce)
  useEffect(() => {
    if (!city) return;

    const debounceTimeout = setTimeout(() => {
      getWeatherByCity(city);
      getForecastByCity(city);
    }, 500);

    return () => clearTimeout(debounceTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  return (
    <div className="left-section">
      {/* City Selection */}
      <div className="city-selection">
        <div>
          <label htmlFor="city">Choose a city:</label>
          <select id="city" value={city} onChange={handleChange}>
            <option value="">--Select a city--</option>
            <option value="Delhi">Delhi</option>
            <option value="Winnipeg">Winnipeg</option>
            <option value="New York">New York</option>
            <option value="Vancouver">Vancouver</option>
            <option value="Scranton">Scranton</option>
          </select>
        </div>

        <h3>OR</h3>

        <div>
          <label htmlFor="city-search">Search a city:</label>
          <input
            id="city-search"
            className="city-input"
            type="text"
            placeholder="Enter your city"
            value={city}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Weather Layout */}
      <div className="App">
        {loading && <div className="loading">Loading weather data...</div>}

        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <div className="weather-layout">
            {/* Current Weather Card */}
            <div className="weather-card">
              <div className="top-section">
                {weatherData ? (
                  <>
                    <h1 className="country">
                      {weatherData.name}, {weatherData.sys.country}
                    </h1>
                    <div className="date">
                      {(() => {
                        // Convert UTC timestamp to city's local time
                        const utcDate = new Date(weatherData.dt * 1000);
                        const cityTime = new Date(
                          utcDate.getTime() + timezoneOffset * 1000
                        );
                        return cityTime.toLocaleDateString("en-US", {
                          timeZone: "UTC", // Use UTC since we already adjusted the time
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        });
                      })()}
                    </div>
                    <div className="temperature">
                      <span className="icon">🌡️</span>
                      <span className="temp">
                        {Math.round(weatherData.main.temp)}°C
                      </span>
                      <span className="weather-icon">
                        {weatherData.weather[0].main === "Clear"
                          ? "☀️"
                          : weatherData.weather[0].main === "Clouds"
                          ? "☁️"
                          : weatherData.weather[0].main === "Rain"
                          ? "🌧️"
                          : "🌤️"}
                      </span>
                    </div>
                  </>
                ) : (
                  <p>No weather data available</p>
                )}
              </div>

              {weatherData && (
                <div className="bottom-section">
                  <div className="info">
                    <p className="label">HUMIDITY</p>
                    <p className="value">{weatherData.main.humidity}%</p>
                  </div>
                  <div className="info">
                    <p className="label">VISIBILITY</p>
                    <p className="value">
                      {(weatherData.visibility / 1000).toFixed(1)} km
                    </p>
                  </div>
                  <div className="info">
                    <p className="label">AIR PRESSURE</p>
                    <p className="value">{weatherData.main.pressure} hPa</p>
                  </div>
                  <div className="info">
                    <p className="label">WIND</p>
                    <p className="value">{weatherData.wind.speed} m/s</p>
                  </div>
                </div>
              )}
            </div>

            {/* Forecast Section */}
            <div className="right-section">
              {forecastData.length > 0 ? (
                forecastData
                  .slice(0, 3)
                  .map((forecast, index) => (
                    <Forecastcomp
                      key={index}
                      forcastdata={forecast}
                      timezoneOffset={timezoneOffset}
                    />
                  ))
              ) : (
                <div className="weather-card">
                  <div className="top-section">
                    <p>No forecast data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
