import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [weather, setWeather] = useState(null);
  const [alert, setAlert] = useState(null);

  // Fetch data from FastAPI backend
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/alerts")
      .then((res) => res.json())
      .then((data) => {
        setWeather(data.data);
        setAlert(data.alert);
      })
      .catch((err) => console.error("Error fetching API:", err));
  }, []);

  return (
    <div className="dashboard">
      <h1> Coastal Threat Monitoring System</h1>

      {weather ? (
        <div className="card">
          <h2>📍 Location: {weather.location}</h2>
          <p>💨 Wind Speed: {weather.wind_speed} km/h</p>
          <p>🌊 Tide Level: {weather.tide_level.toFixed(2)} m</p>
          <h3 className={alert.includes("Alert") ? "alert" : "normal"}>
            {alert}
          </h3>
        </div>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
}

export default App;

