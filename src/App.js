import "./App.css";
import { useState, useEffect } from "react";

function App() {
  const [city, setCity] = useState("Abohar");
  const [weatherdata, setWeatherData] = useState(null);

  const handleChange = (event) => {
    setCity(event.target.value);
  };

  useEffect(() => {
    // Skip if input is empty
    if (!city) return;

    // Set a timeout to fetch after 500ms
    const debounceTimeout = setTimeout(() => {
      const fetchWeather = async () => {
        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=33dab0eb21c5a06ba4c94c014c370262`
          );
          if (!res.ok) throw new Error("City not found");
          const data = await res.json();
          console.log(data);
          setWeatherData(data);
        } catch (err) {
          setWeatherData(null);
        }
      };

      fetchWeather();
    }, 500); // wait 500ms after last keystroke

    // Cleanup function to clear previous timeout
    return () => clearTimeout(debounceTimeout);
  }, [city]);

  return (
    <div className="App">
      <div className="weather-card">
        <div className="top-section">
          <div className="location">
            <input
              className="city-input"
              type="text"
              placeholder="Enter your name"
              value={city} // bind state to input
              onChange={handleChange} // update state on change
            />
          </div>
          {weatherdata && (
            <div className="date">
              {new Date(weatherdata.dt * 1000).toLocaleDateString("en-US", {
                weekday: "short", // e.g., Tue
                month: "short", // e.g., Aug
                day: "numeric", // e.g., 23
              })}
            </div>
          )}
          {weatherdata ? (
            <div className="temperature">
              <span className="icon">🌡️</span>
              <span className="temp">{weatherdata.main.temp}°C</span>
              <span className="weather-icon">
                {weatherdata.weather[0].main === "Clear"
                  ? "☀️"
                  : weatherdata.weather[0].main === "Clouds"
                  ? "☁️"
                  : weatherdata.weather[0].main === "Rain"
                  ? "🌧️"
                  : "🌤️"}
              </span>
            </div>
          ) : (
            <p>Loading weather data...</p>
          )}
        </div>

        {weatherdata && (
          <div className="bottom-section">
            <div className="info">
              <p className="label">HUMIDITY</p>
              <p className="value">{weatherdata.main.humidity}%</p>
            </div>
            <div className="info">
              <p className="label">VISIBILITY</p>
              <p className="value">
                {(weatherdata.visibility / 1000).toFixed(1)} km
              </p>
            </div>
            <div className="info">
              <p className="label">AIR PRESSURE</p>
              <p className="value">{weatherdata.main.pressure} hPa</p>
            </div>
            <div className="info">
              <p className="label">WIND</p>
              <p className="value">{weatherdata.wind.speed} m/s</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
