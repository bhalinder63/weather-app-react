function Forecastcomp({ forcastdata }) {
  return (
    <div className="weather-card">
      <div className="top-section">
        {forcastdata && (
          <>
            {/* Date Section */}
            <div className="date">
              {new Date(forcastdata.dt * 1000).toLocaleDateString("en-US", {
                weekday: "short", // e.g., Tue
                month: "short", // e.g., Aug
                day: "numeric", // e.g., 23
              })}
            </div>

            {/* Temperature & Icon Section */}
            <div className="temperature">
              <span className="icon">🌡️</span>
              <span className="temp">{forcastdata.main.temp}°C</span>
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
