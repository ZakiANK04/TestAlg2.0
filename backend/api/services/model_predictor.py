import joblib
import pandas as pd
import os
from datetime import datetime
from pathlib import Path

# Get the backend directory (parent of api)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = BASE_DIR / 'models' / 'agri_advisor_v5.pkl'

class ModelPredictor:
    """Service to load and use the trained XGBoost model for predictions"""
    
    def __init__(self):
        self.models = None
        self.load_model()
    
    def load_model(self):
        """Load the trained model from pickle file"""
        if MODEL_PATH.exists():
            try:
                self.models = joblib.load(str(MODEL_PATH))
                print(f"Model loaded successfully from {MODEL_PATH}")
            except Exception as e:
                print(f"Error loading model: {e}")
                self.models = None
        else:
            print(f"Model file not found: {MODEL_PATH}")
            self.models = None
    
    def predict_crop(self, crop_name, region_name, soil_type, farm_size_ha, temperature_c, rainfall_mm, year=None, month=None):
        """
        Predict risk, price, and yield for a crop using the trained model
        Uses the same logic as score() function from main.py
        
        Returns:
            dict with 'risk', 'price', 'yield' or None if prediction fails
        """
        if not self.models:
            return None
        
        try:
            # Use current date if not provided
            if year is None:
                year = datetime.now().year
            if month is None:
                month = datetime.now().month
            
            # Use the same logic as score() function from main.py
            df = pd.DataFrame(0, index=[0], columns=self.models['feature_cols'])
            df['year'] = year
            df['month'] = month
            df['planted_area'] = farm_size_ha
            df['temperature_c'] = temperature_c
            df['rainfall_mm'] = rainfall_mm
            
            # Set one-hot encoded features (same as score() function)
            region_col = f"region_{region_name}"
            soil_col = f"soil_type_{soil_type}"
            crop_col = f"crop_{crop_name}"
            
            # Check if columns exist in model features
            if region_col in self.models['feature_cols']:
                df[region_col] = 1
            if soil_col in self.models['feature_cols']:
                df[soil_col] = 1
            if crop_col not in self.models['feature_cols']:
                print(f"ERROR: Crop '{crop_name}' not found in model features")
                return None
            df[crop_col] = 1
            
            # Scale numerical features
            cols = self.models['numerical_cols']
            
            # Predict risk (probability of oversupply) - same as score()
            X_cls = df.copy()
            X_cls[cols] = self.models['scaler_cls'].transform(X_cls[cols])
            risk_prob = self.models['rfc'].predict_proba(X_cls)[:, 1][0]
            risk_percent = risk_prob * 100  # Convert to percentage
            
            # Predict price - same as score()
            # Model predicts price per ton, need to convert to price per kg
            X_reg = df.copy()
            X_reg[cols] = self.models['scaler_price'].transform(X_reg[cols])
            price_per_ton = self.models['lr_price'].predict(X_reg)[0]
            price_per_kg = price_per_ton / 1000  # Convert from DA/ton to DA/kg
            
            # Predict yield - same as score()
            X_reg[cols] = self.models['scaler_yield'].transform(X_reg[cols])
            yield_per_ha = self.models['lr_yield'].predict(X_reg)[0]
            
            # Debug output
            print(f"Model prediction for {crop_name} ({region_name}, {soil_type}): risk={risk_percent:.2f}%, price={price_per_kg:.2f} DA/kg, yield={yield_per_ha:.2f} tons/ha")
            
            # Ensure yield is not negative (use absolute value if negative)
            if yield_per_ha < 0:
                print(f"WARNING: Model predicted negative yield: {yield_per_ha}, using absolute value")
                yield_per_ha = abs(yield_per_ha)
            
            return {
                'risk': risk_percent,
                'price': price_per_kg,  # Already converted to DA/kg
                'yield': yield_per_ha
            }
            
        except Exception as e:
            print(f"Error in prediction for {crop_name}: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def get_available_crops(self):
        """Get list of crops available in the model"""
        if not self.models:
            return []
        
        crops = []
        for col in self.models['feature_cols']:
            if col.startswith('crop_'):
                crop_name = col.replace('crop_', '')
                crops.append(crop_name)
        return crops
    
    def get_soil_crop_pool(self):
        """Get soil-crop mapping from model"""
        if not self.models:
            return {}
        return self.models.get('soil_crop_pool', {})
    
    def get_weather_ranges(self):
        """Get weather ranges for crops from model"""
        if not self.models:
            return {}
        return self.models.get('weather_ranges', {})

# Global instance
_model_predictor = None

def get_model_predictor():
    """Get or create the global model predictor instance"""
    global _model_predictor
    if _model_predictor is None:
        _model_predictor = ModelPredictor()
    return _model_predictor

