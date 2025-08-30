from fastapi import FastAPI
from services.weather import get_weather_data
from services.anomaly import detect_anomalies

app = FastAPI()

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/weather")
def fetch_weather():
    data = get_weather_data()
    return data

@app.get("/api/alerts")
def alerts():
    data = get_weather_data()
    alert = detect_anomalies(data)
    return {"alert": alert, "data": data}

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
