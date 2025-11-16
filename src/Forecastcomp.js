function Forecastcomp({ forcastdata, timezoneOffset = 0 }) {
  return (
    <div className="weather-card">
      <div className="top-section">
        {forcastdata && (
          <>
            {/* Date Section */}
            <div className="date">
              {(() => {
                // Convert UTC timestamp to city's local time
                const utcDate = new Date(forcastdata.dt * 1000);
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

            {/* Temperature & Icon Section */}
            <div className="temperature">
              <span className="icon">🌡️</span>
              <span className="temp">
                {Math.round(forcastdata.main.temp)}°C
              </span>
              <span className="weather-icon">
                {forcastdata.weather[0].main === "Clear"
                  ? "☀️"
                  : forcastdata.weather[0].main === "Clouds"
                  ? "☁️"
                  : forcastdata.weather[0].main === "Rain"
                  ? "🌧️"
                  : "🌤️"}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Forecastcomp;
