function Forecastcomp({ forecastData, timezoneOffset = 0 }) {
  if (!forecastData) return null;

  const cityTime = new Date(forecastData.dt * 1000 + timezoneOffset * 1000);
  const dateStr = cityTime.toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="weather-card forecast-card">
      <div className="forecast-date">{dateStr}</div>
      <div className="forecast-main">
        <img
          className="forecast-icon"
          src={`https://openweathermap.org/img/wn/${forecastData.weather[0].icon}@2x.png`}
          alt={forecastData.weather[0].description}
        />
        <span className="forecast-temp">{Math.round(forecastData.main.temp)}°C</span>
      </div>
      <p className="forecast-desc">{forecastData.weather[0].description}</p>
      <p className="forecast-range">
        H: {Math.round(forecastData.main.temp_max)}° &nbsp; L: {Math.round(forecastData.main.temp_min)}°
      </p>
    </div>
  );
}

export default Forecastcomp;
