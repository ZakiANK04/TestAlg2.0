from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
import pandas as pd
import joblib
import os
import csv
from contextlib import asynccontextmanager
from train_model import train_pipeline, ARTIFACTS_PATH, DATA_PATH
from weather_service import WeatherService

models = {}
weather_engine = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load or Train
    if os.path.exists(ARTIFACTS_PATH):
        print("Loading models...")
        models.update(joblib.load(ARTIFACTS_PATH))
    else:
        print("Training models...")
        models.update(train_pipeline())
    
    # Startup: Weather
    global weather_engine
    weather_engine = WeatherService(DATA_PATH)
    yield
    models.clear()

app = FastAPI(title="Agri-Advisor V5", lifespan=lifespan)

class CropInput(BaseModel):
    year: int
    month: int
    crop: str
    region: str
    planted_area: float

class ConfirmationInput(BaseModel):
    year: int
    month: int
    crop: str
    region: str
    planted_area: float
    predicted_yield: float
    predicted_price: float
    predicted_risk_prob: float

def score(crop, region, soil, year, month, area, temp, rain):
    df = pd.DataFrame(0, index=[0], columns=models['feature_cols'])
    df['year'] = year; df['month'] = month; df['planted_area'] = area
    df['temperature_c'] = temp; df['rainfall_mm'] = rain
    
    if f"region_{region}" in models['feature_cols']: df[f"region_{region}"] = 1
    if f"soil_type_{soil}" in models['feature_cols']: df[f"soil_type_{soil}"] = 1
    if f"crop_{crop}" in models['feature_cols']: df[f"crop_{crop}"] = 1
    else: return None

    cols = models['numerical_cols']
    X_cls = df.copy(); X_cls[cols] = models['scaler_cls'].transform(X_cls[cols])
    risk = models['rfc'].predict_proba(X_cls)[:, 1][0]
    
    X_reg = df.copy(); X_reg[cols] = models['scaler_price'].transform(X_reg[cols])
    price = models['lr_price'].predict(X_reg)[0]
    
    X_reg[cols] = models['scaler_yield'].transform(X_reg[cols])
    yld = models['lr_yield'].predict(X_reg)[0]
    
    return risk, price, yld

def background_retrain():
    try:
        new_artifacts = train_pipeline()
        models.update(new_artifacts)
        global weather_engine
        weather_engine = WeatherService(DATA_PATH)
    except: pass

@app.post("/predict_optimization")
def predict_optimization(data: CropInput):
    soil = models['region_soil_map'].get(data.region, 'Loamy')
    temp, rain = weather_engine.get_weather(data.region, data.year, data.month)
    
    res = score(data.crop, data.region, soil, data.year, data.month, data.planted_area, temp, rain)
    if not res: raise HTTPException(400, "Crop not supported")
    risk, price, yld = res

    response = {
        "status": "PROCEED",
        "weather": {"temp": temp, "rain": rain},
        "soil": soil,
        "prediction": {"risk": round(risk, 2), "price": round(price, 2), "yield": round(yld, 2)}
    }

    if risk >= 0.45:
        response['status'] = "HIGH_RISK"
        best_alt = None
        max_rev = -float('inf')
        
        candidates = models['soil_crop_pool'].get(soil, [])
        for alt in candidates:
            if alt == data.crop: continue
            wr = models['weather_ranges'].get(alt)
            if not wr or not (wr['T_min'] <= temp <= wr['T_max'] and wr['R_min'] <= rain <= wr['R_max']):
                continue
            
            alt_res = score(alt, data.region, soil, data.year, data.month, data.planted_area, temp, rain)
            if alt_res:
                a_risk, a_price, a_yld = alt_res
                a_rev = a_price * a_yld * data.planted_area
                if a_risk < 0.50 and a_rev > max_rev:
                    max_rev = a_rev
                    best_alt = {"crop": alt, "risk": round(a_risk, 2), "price": round(a_price, 2)}
        
        response['alternative'] = best_alt if best_alt else "No suitable alternatives."

    return response

@app.post("/confirm_advice")
def confirm_advice(fb: ConfirmationInput, background_tasks: BackgroundTasks):
    soil = models['region_soil_map'].get(fb.region, 'Loamy')
    temp, rain = weather_engine.get_weather(fb.region, fb.year, fb.month)
    
    row = [fb.region, soil, fb.crop, fb.month, fb.year, fb.planted_area, 
           round(fb.planted_area * fb.predicted_yield, 2), round(fb.predicted_price, 2), 
           round(fb.predicted_yield, 2), round(fb.predicted_risk_prob * 100, 2), temp, rain]
    
    with open(DATA_PATH, 'a', newline='') as f:
        csv.writer(f).writerow(row)
    
    background_tasks.add_task(background_retrain)
    return {"message": "Data saved. Retraining started."}