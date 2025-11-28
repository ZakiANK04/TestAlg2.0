import pandas as pd
import joblib
import os
# --- CHANGED: Import XGBoost instead of Sklearn models ---
from xgboost import XGBClassifier, XGBRegressor 
from sklearn.preprocessing import StandardScaler

DATA_PATH = 'data/agri_dataset.csv'
ARTIFACTS_PATH = 'models/agri_advisor_v5.pkl'

def train_pipeline():
    print(f"--- [TRAINER] Training on {DATA_PATH} ---")
    if not os.path.exists(DATA_PATH): raise FileNotFoundError("Dataset missing!")
    
    df = pd.read_csv(DATA_PATH)
    
    # 1. Learn Dynamic Maps (Same as before)
    region_soil_map = df.groupby('region')['soil_type'].agg(lambda x: x.mode()[0]).to_dict()
    soil_crop_pool = df.groupby('soil_type')['crop'].unique().apply(list).to_dict()
    weather_ranges = df.groupby('crop').agg(
        T_min=('temperature_c', lambda x: x.quantile(0.05)),
        T_max=('temperature_c', lambda x: x.quantile(0.95)),
        R_min=('rainfall_mm', lambda x: x.quantile(0.05)),
        R_max=('rainfall_mm', lambda x: x.quantile(0.95))
    ).to_dict('index')

    # 2. Prepare Data (Same as before)
    risk_threshold = df['oversupply_pct'].quantile(0.75)
    df['oversupply_risk'] = (df['oversupply_pct'] > risk_threshold).astype(int)

    targets = ['oversupply_pct', 'harvested_quantity', 'oversupply_risk', 'avg_price', 'yield_per_ha']
    # One-Hot Encoding
    X = pd.get_dummies(df.drop(columns=targets), columns=['region', 'soil_type', 'crop'], drop_first=True)
    
    numerical_cols = ['month', 'year', 'planted_area', 'temperature_c', 'rainfall_mm']
    feature_cols = X.columns.tolist()

    # 3. TRAIN XGBOOST MODELS
    print(f"--- [TRAINER] Fitting XGBoost models on {len(df)} rows... ---")
    
    # Scaling is less critical for XGBoost than Linear Regression, 
    # but keeping it ensures our inputs remain normalized and clean.
    scaler_cls = StandardScaler()
    X_cls = X.copy(); X_cls[numerical_cols] = scaler_cls.fit_transform(X_cls[numerical_cols])
    
    # --- NEW: XGBoost Classifier (Risk) ---
    # n_estimators=100: Number of boosting rounds
    # max_depth=6: Depth of trees (controls complexity)
    # learning_rate=0.1: Step size shrinkage
    rfc = XGBClassifier(
        n_estimators=100, 
        max_depth=6, 
        learning_rate=0.1, 
        objective='binary:logistic', # For probability output
        eval_metric='logloss'
    )
    rfc.fit(X_cls, df['oversupply_risk'])

    # --- NEW: XGBoost Regressor (Price) ---
    scaler_price = StandardScaler()
    X_price = X.copy(); X_price[numerical_cols] = scaler_price.fit_transform(X_price[numerical_cols])
    
    lr_price = XGBRegressor(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        objective='reg:squarederror' # Standard regression
    )
    lr_price.fit(X_price, df['avg_price'])

    # --- NEW: XGBoost Regressor (Yield) ---
    scaler_yield = StandardScaler()
    X_yield = X.copy(); X_yield[numerical_cols] = scaler_yield.fit_transform(X_yield[numerical_cols])
    
    lr_yield = XGBRegressor(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        objective='reg:squarederror'
    )
    lr_yield.fit(X_yield, df['yield_per_ha'])

    # 4. Save (Keys remain the same so API doesn't break)
    artifacts = {
        'rfc': rfc,             # Now holds an XGBClassifier
        'scaler_cls': scaler_cls,
        'lr_price': lr_price,   # Now holds an XGBRegressor
        'scaler_price': scaler_price,
        'lr_yield': lr_yield,   # Now holds an XGBRegressor
        'scaler_yield': scaler_yield,
        'feature_cols': feature_cols,
        'numerical_cols': numerical_cols,
        'region_soil_map': region_soil_map,
        'soil_crop_pool': soil_crop_pool,
        'weather_ranges': weather_ranges,
        'risk_threshold': risk_threshold
    }
    
    os.makedirs('models', exist_ok=True)
    joblib.dump(artifacts, ARTIFACTS_PATH)
    print("--- [TRAINER] Success. XGBoost Models Saved. ---")
    return artifacts

if __name__ == "__main__":
    train_pipeline()