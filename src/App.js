import "./App.css";
import { useState, useEffect } from "react";
import Forecastcomp from "./Forecastcomp";

function App() {
  const [city, setCity] = useState("Abohar");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);

  const API_KEY = "33dab0eb21c5a06ba4c94c014c370262";

  // Handle city input change
  const handleChange = (event) => {
    setCity(event.target.value);
  };

  // Fetch current weather by coordinates
  const getWeatherByCoords = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      setWeatherData(data);
      setCity(data.name); // auto-set city name
    } catch (err) {
      console.error("Error fetching weather by coordinates:", err);
    }
  };

  // Fetch current weather by city
  const getWeatherByCity = async (cityName) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      const data = await res.json();
      setWeatherData(data);
    } catch (err) {
      console.error("Error fetching weather:", err);
      setWeatherData(null);
    }
  };

  // Fetch forecast by city
  const getForecastByCity = async (cityName) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      const data = await res.json();
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
          // Optionally fetch forecast by coordinates here if needed
        },
        (error) => {
          console.error("Error getting location:", error);
          setCity("Abohar"); // fallback city
        }
      );
    } else {
      console.log("Geolocation not supported");
      setCity("Abohar");
    }
  }, []);

  // Fetch weather & forecast when city changes (with debounce)
  useEffect(() => {
    if (!city) return;

    const debounceTimeout = setTimeout(() => {
      getWeatherByCity(city);
      getForecastByCity(city);
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [city]);

  return (
    <div className="left-section">
      {/* City Selection */}
      <label htmlFor="city">Choose a city:</label>
      <select id="city" value={city} onChange={handleChange}>
        <option value="">--Select a city--</option>
        <option value="Delhi">Delhi</option>
        <option value="Winnipeg">Winnipeg</option>
        <option value="New York">New York</option>
        <option value="Vancouver">Vancouver</option>
        <option value="Scranton">Scranton</option>
      </select>

      <h3>OR</h3>

      <label htmlFor="city-search">Search a city:</label>
      <input
        id="city-search"
        className="city-input"
        type="text"
        placeholder="Enter your city"
        value={city}
        onChange={handleChange}
      />

      {/* Weather Layout */}
      <div className="App">
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
                    {new Date(weatherData.dt * 1000).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </div>
                  <div className="temperature">
                    <span className="icon">🌡️</span>
                    <span className="temp">{weatherData.main.temp}°C</span>
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
                <p>Loading weather data...</p>
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
            {forecastData.slice(1, 4).map((forecast, index) => (
              <Forecastcomp key={index} forcastdata={forecast} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
