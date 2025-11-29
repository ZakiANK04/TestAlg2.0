# 🌾 AgroVisor - AI-Powered Agricultural Advisory Platform

**AgroVisor** is an intelligent agricultural advisory system that empowers farmers with data-driven insights for crop selection, pricing predictions, yield forecasting, and risk assessment. Built with modern web technologies and machine learning, it provides personalized recommendations based on farm location, soil type, weather conditions, and market data.

---

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation Guide](#-installation-guide)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Machine Learning Model](#-machine-learning-model)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## ✨ Features

### 🎯 Core Functionality

- **🤖 AI-Powered Crop Recommendations**
  - Personalized recommendations based on farm conditions
  - Analysis of soil type, weather, and market data
  - Risk-based recommendation system (oversupply risk threshold)

- **💰 Price Prediction**
  - ML model predicts crop prices in DA/kg
  - Helps farmers make informed pricing decisions
  - Based on historical market data and trends

- **📊 Yield Forecasting**
  - Predicts expected yield per hectare (tons/ha)
  - Considers soil conditions, weather, and crop type
  - Helps in production planning

- **⚠️ Oversupply Risk Assessment**
  - Analyzes market conditions to identify oversupply risks
  - Risk percentage calculation for each crop
  - Threshold-based recommendation system

- **🌍 Multi-Language Support**
  - Full support for **English**, **French**, and **Arabic**
  - RTL (Right-to-Left) support for Arabic
  - Translated UI elements, regions, crops, and soil types

- **📱 Interactive Dashboard**
  - Comprehensive dashboard with real-time data
  - Interactive charts (Pie charts and Bar charts)
  - Detailed analysis tables
  - Farm location mapping with Leaflet

- **🏡 Farm Management**
  - Create and manage multiple farms
  - Update farm details (name, location, size, soil type)
  - Auto-detection of soil type based on region
  - Farm location visualization on map

- **💾 Data Export**
  - Save model predictions to CSV
  - Duplicate prevention system
  - Data collection for future model training

### 🎨 User Interface Features

- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **Interactive Charts**: Visual representation of crop scores and prices
- **Real-time Updates**: Dynamic recommendations based on current data
- **Smooth Animations**: Enhanced user experience with Framer Motion

---

## 🛠️ Technology Stack

### Backend

- **Framework**: Django 5.2.8 with Django REST Framework
- **Authentication**: Simple JWT (JSON Web Tokens)
- **Database**: SQLite3 (easily configurable for PostgreSQL/MySQL)
- **Machine Learning**: 
  - XGBoost (XGBClassifier, XGBRegressor)
  - scikit-learn for preprocessing
  - pandas for data manipulation
- **AI Integration**: OpenAI API for contextual advice generation
- **Additional Libraries**: 
  - joblib for model persistence
  - python-dotenv for environment variables
  - requests for API calls

### Frontend

- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts for data visualization
- **Maps**: Leaflet with react-leaflet
- **Routing**: React Router DOM v7
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Animations**: Framer Motion

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Python**: 3.8 or higher
- **Node.js**: 16 or higher
- **npm** or **yarn**: Package manager
- **Git**: Version control

---

## 🚀 Installation Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/ZakiANK04/TestAlg2.0.git
cd TestAlg2.0
```

### Step 2: Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Create a virtual environment** (recommended):
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. **Install Python dependencies**:
```bash
pip install -r requirements.txt
```

   Or install manually:
```bash
pip install django==5.2.8 djangorestframework djangorestframework-simplejwt django-cors-headers xgboost pandas scikit-learn joblib numpy openai requests python-dotenv
```

4. **Run database migrations**:
```bash
python manage.py migrate
```

5. **Create a superuser** (optional, for admin access):
```bash
python manage.py createsuperuser
```

6. **Load initial data from CSV files**:
```bash
python manage.py update_from_csv
```

   This command:
   - Loads regions from `backend/data/region_soil_mapping.csv`
   - Loads crops from `backend/data/agri_dataset.csv`

7. **Train the ML model**:
```bash
python train_model.py
```

   This will:
   - Load training data from `backend/data/agri_dataset.csv`
   - Train XGBoost models for risk, price, and yield prediction
   - Save the model to `backend/models/agri_advisor_v5.pkl`

### Step 3: Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd ../frontend
```

2. **Install Node.js dependencies**:
```bash
npm install
```

3. **Start the development server**:
```bash
npm run dev
```

   The frontend will be available at `http://localhost:5173`

---

## ⚙️ Configuration

### Backend Configuration

The main configuration file is `backend/core/settings.py`. Key settings:

- **Database**: SQLite3 by default (configured in `DATABASES`)
- **CORS**: Allowed origins in `CORS_ALLOWED_ORIGINS`
- **JWT**: Token settings in `SIMPLE_JWT`
- **ML Model Path**: `models/agri_advisor_v5.pkl`

### Environment Variables (Optional)

Create a `.env` file in the `backend` directory for sensitive settings:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
OPENAI_API_KEY=your-openai-api-key-here
```

Then load it in `settings.py`:
```python
from dotenv import load_dotenv
load_dotenv()
```

### Frontend Configuration

The frontend API endpoint is configured in components. Default:
- Backend API: `http://127.0.0.1:8000`
- Frontend: `http://localhost:5173`

To change the API endpoint, update the axios base URL in:
- `frontend/src/contexts/AuthContext.jsx`
- `frontend/src/pages/Dashboard.jsx`
- Other components that make API calls

---

## 🎯 Usage

### Starting the Application

1. **Start the Backend Server**:
```bash
cd backend
python manage.py runserver
```
   Backend runs on `http://127.0.0.1:8000`

2. **Start the Frontend Server** (in a new terminal):
```bash
cd frontend
npm run dev
```
   Frontend runs on `http://localhost:5173`

3. **Access the Application**:
   - Open your browser and navigate to `http://localhost:5173`
   - You'll see the landing page

### User Workflow

1. **Registration/Login**
   - Click "Sign Up" to create a new account
   - Accept data usage terms
   - Or click "Login" if you already have an account

2. **Create a Farm**
   - After logging in, you'll see the dashboard
   - Click "Add New Farm" button
   - Fill in farm details:
     - Farm name
     - Region (select from dropdown - auto-detects soil type)
     - Size in hectares
     - Soil type (auto-filled based on region)
     - Intended crop (optional)

3. **View Recommendations**
   - Select a farm from the dropdown
   - The system automatically generates recommendations
   - View:
     - Top recommendation with key metrics
     - Price predictor (DA/kg)
     - Yield forecast (tons/ha)
     - Oversupply risk percentage

4. **Analyze Data**
   - Click "Charts & Detailed Analysis" to view:
     - Pie chart showing top 3 crops by score
     - Bar chart comparing prices
     - Detailed analysis table with all recommendations

5. **Crop Analysis**
   - If you selected an intended crop, view detailed analysis:
     - Recommendation status (Recommended/Not Recommended)
     - Confidence level
     - Model predictions (Price, Yield, Risk)
     - AI-generated advice in your selected language

6. **Accept Recommendation**
   - Click "Accept the Suggestion" button
   - This saves the model results to `data/model_results.csv`
   - Duplicate prevention ensures no redundant entries

7. **Update Farm Details**
   - Click "Update Farm Details" button
   - Modify farm information
   - System updates existing farm if name and location match

8. **View Farm Location**
   - Farm location is displayed on an interactive map
   - Uses Leaflet with OpenStreetMap
   - Automatically zooms to the region

---

## 📁 Project Structure

```
Hachkathon/
├── backend/                          # Django backend
│   ├── api/                         # Main app
│   │   ├── models.py                # Database models (User, Farm, Region, Crop, etc.)
│   │   ├── views.py                 # API views (Recommendations, Farms, Auth)
│   │   ├── serializers.py           # DRF serializers
│   │   ├── urls.py                  # URL routing
│   │   ├── services/                # Business logic
│   │   │   ├── model_predictor.py   # ML model loading & prediction
│   │   │   ├── recommendation.py   # Recommendation engine
│   │   │   ├── ai_advice_generator.py  # OpenAI integration
│   │   │   └── weather_api.py       # Weather data
│   │   └── management/commands/    # Django management commands
│   │       ├── update_from_csv.py   # Update DB from CSV
│   │       ├── seed_regions.py      # Seed regions
│   │       └── seed_data.py         # Seed initial data
│   ├── core/                        # Django project settings
│   │   ├── settings.py              # Main configuration
│   │   └── urls.py                  # Root URL config
│   ├── data/                        # Data files
│   │   ├── agri_dataset.csv        # Training dataset (200k+ rows)
│   │   └── region_soil_mapping.csv  # Region to soil mapping
│   ├── models/                      # Trained ML models
│   │   └── agri_advisor_v5.pkl     # Saved XGBoost model
│   ├── train_model.py              # Model training script
│   ├── manage.py                   # Django management
│   └── requirements.txt            # Python dependencies
│
├── frontend/                        # React frontend
│   ├── src/
│   │   ├── pages/                  # Page components
│   │   │   ├── LandingPage.jsx     # Landing page
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Signup.jsx          # Registration page
│   │   │   └── Dashboard.jsx        # Main dashboard
│   │   ├── components/             # Reusable components
│   │   │   ├── FarmForm.jsx        # Update farm form
│   │   │   ├── AddFarmForm.jsx    # Add new farm form
│   │   │   ├── FarmMap.jsx         # Leaflet map component
│   │   │   ├── FloatingChatbot.jsx # Chatbot component
│   │   │   └── Toast.jsx          # Toast notifications
│   │   ├── contexts/               # React contexts
│   │   │   ├── AuthContext.jsx    # Authentication state
│   │   │   └── LanguageContext.jsx # i18n translations
│   │   ├── App.jsx                 # Main app component
│   │   └── main.jsx               # Entry point
│   ├── public/                     # Static files
│   │   └── logo.png               # Application logo
│   └── package.json               # Node dependencies
│
├── data/                           # Generated data
│   └── model_results.csv          # Saved model predictions
│
└── README.md                      # This file
```

---

## 🔌 API Documentation

### Authentication Endpoints

- **POST** `/api/auth/register/` - Register a new user
  - Body: `{ "email", "password", "first_name", "last_name" }`
  - Returns: User data and JWT tokens

- **POST** `/api/auth/login/` - Login user
  - Body: `{ "email", "password" }`
  - Returns: JWT access and refresh tokens

- **GET** `/api/auth/profile/` - Get user profile
  - Headers: `Authorization: Bearer <token>`
  - Returns: User profile data

### Farm Endpoints

- **GET** `/api/farms/` - List user's farms
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of farm objects

- **POST** `/api/farms/` - Create new farm
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "name", "location", "size_hectares", "soil_type", "intended_crop" }`
  - Returns: Created farm object

- **GET** `/api/farms/{id}/` - Get farm details
  - Headers: `Authorization: Bearer <token>`
  - Returns: Farm object

- **PUT** `/api/farms/{id}/` - Update farm
  - Headers: `Authorization: Bearer <token>`
  - Body: Farm data to update
  - Returns: Updated farm object
  - Note: Updates existing farm if name, location, and user match

### Recommendation Endpoints

- **GET** `/api/recommendations/{farm_id}/?lang={en|fr|ar}` - Get crop recommendations
  - Headers: `Authorization: Bearer <token>`
  - Query params: `lang` (optional, default: 'en')
  - Returns: 
    ```json
    {
      "recommendations": [...],
      "intended_crop_analysis": {
        "crop_name": "...",
        "is_recommended": true/false,
        "confidence": "high|medium|low",
        "recommendation": "...",
        "advice": [...],
        "details": {
          "price_forecast": 123.45,
          "yield_per_ha": 5.67,
          "oversupply_risk": 12.3
        }
      }
    }
    ```

### Data Endpoints

- **GET** `/api/regions/` - List all regions
  - Returns: Array of region objects with coordinates

- **GET** `/api/crops/` - List all crops
  - Returns: Array of crop objects

- **POST** `/api/save-model-result/{farm_id}/` - Save model prediction results
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "crop", "price_forecast", "yield_per_ha", "oversupply_risk" }`
  - Returns: Success message
  - Note: Prevents duplicate entries

---

## 🤖 Machine Learning Model

### Model Architecture

The system uses **XGBoost** models trained on historical agricultural data:

1. **Risk Classifier** (XGBClassifier)
   - Predicts oversupply risk percentage
   - Binary classification converted to percentage

2. **Price Regressor** (XGBRegressor)
   - Predicts crop prices in DA/ton
   - Converted to DA/kg in the API (divided by 1000)

3. **Yield Regressor** (XGBRegressor)
   - Predicts yield per hectare in tons/ha

### Model Features

The models use the following features:
- **Region**: Algerian region (Wilaya)
- **Soil Type**: Type of soil (Loam, Clay, Sand, etc.)
- **Crop**: Crop type
- **Month**: Planting/harvest month
- **Year**: Year of planting
- **Planted Area**: Area in hectares
- **Temperature**: Average temperature (°C)
- **Rainfall**: Rainfall in mm

### Training the Model

To train or retrain the model:

```bash
cd backend
python train_model.py
```

This script:
1. Loads data from `backend/data/agri_dataset.csv`
2. Preprocesses features (encoding, scaling)
3. Trains three XGBoost models
4. Saves the combined model to `backend/models/agri_advisor_v5.pkl`

**Note**: Retrain the model whenever you add new data to `agri_dataset.csv`

### Model Output

- **Price Predictor**: Predicted price in DA/kg (model predicts DA/ton, divided by 1000)
- **Yield**: Predicted yield in tons/ha
- **Risk**: Oversupply risk percentage (0-100%)

---

## 🗄️ Database Management

### Database Models

- **User**: Django's built-in user model (email as username)
- **Region**: Algerian regions (Wilayas) with soil types and coordinates
- **Farm**: User farms with location, size, soil type, and intended crop
- **Crop**: Crop information with ideal conditions
- **SoilData**: Soil test results
- **WeatherData**: Weather information
- **MarketData**: Market prices and trends

### Updating Database from CSV

To update regions and crops from CSV files:

```bash
cd backend
python manage.py update_from_csv
```

This command:
- Clears existing regions and repopulates from `backend/data/region_soil_mapping.csv`
- Updates crops from `backend/data/agri_dataset.csv`
- Maintains data consistency

### Database Migrations

After model changes:

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## 🐛 Troubleshooting

### Common Issues and Solutions

1. **Model File Not Found**
   - **Error**: `FileNotFoundError: models/agri_advisor_v5.pkl`
   - **Solution**: Run `python train_model.py` to generate the model

2. **CORS Errors**
   - **Error**: `Access to XMLHttpRequest blocked by CORS policy`
   - **Solution**: Check `CORS_ALLOWED_ORIGINS` in `backend/core/settings.py`
   - Add `http://localhost:5173` to allowed origins

3. **Database Errors**
   - **Error**: `no such table: api_region`
   - **Solution**: Run `python manage.py migrate`

4. **Port Already in Use**
   - **Error**: `Address already in use`
   - **Solution**: 
     - Backend: Change port with `python manage.py runserver 8001`
     - Frontend: Change port in `vite.config.js` or use `npm run dev -- --port 5174`

5. **Module Not Found**
   - **Error**: `ModuleNotFoundError: No module named 'dotenv'`
   - **Solution**: Install missing package: `pip install python-dotenv`

6. **Geocoding Not Working**
   - **Error**: Map doesn't show region location
   - **Solution**: Check internet connection (uses OpenStreetMap Nominatim API)
   - Ensure User-Agent header is set (already configured)

7. **Translation Not Working**
   - **Error**: Text not translated
   - **Solution**: Check `LanguageContext.jsx` for missing translation keys
   - Ensure language is saved in localStorage

---

## 🌐 Language Support

### Supported Languages

- **English** (en): Default language
- **French** (fr): Complete translation
- **Arabic** (ar): Full translation with RTL support

### Translation Coverage

All UI elements are translated:
- Navigation menus
- Form labels and buttons
- Error messages
- Success notifications
- Region names
- Crop names
- Soil types
- AI-generated advice
- Confidence levels
- Recommendation texts

### Adding New Translations

Edit `frontend/src/contexts/LanguageContext.jsx`:
1. Add translation key to all three language objects (`en`, `fr`, `ar`)
2. Use `t('key')` in components to display translated text

---

## 🧪 Testing

### Backend Testing

```bash
cd backend
python manage.py test
```

### Frontend Linting

```bash
cd frontend
npm run lint
```

---

## 📈 Future Enhancements

- [ ] Historical data tracking and trends
- [ ] Real-time weather API integration
- [ ] Mobile app version (React Native)
- [ ] Advanced analytics dashboard
- [ ] Export reports to PDF
- [ ] Email/SMS notification system
- [ ] Multi-farm comparison tool
- [ ] Seasonal planning calendar
- [ ] Integration with IoT sensors
- [ ] Blockchain-based data verification

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit your changes**: `git commit -m 'Add some AmazingFeature'`
4. **Push to the branch**: `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Add comments for complex logic
- Update documentation for new features
- Test your changes thoroughly
- Ensure translations are added for all languages

---

## 📄 License

This project is part of a hackathon submission. Please refer to the repository for license information.

---

## 👥 Authors

- **Development Team** - Initial work and implementation

---

## 🙏 Acknowledgments

- OpenStreetMap for map tiles and geocoding
- OpenAI for AI advice generation
- Django and React communities
- All contributors and testers

---

**AgroVisor** - Empowering farmers with AI-driven agricultural insights 🌱

For questions or support, please open an issue on GitHub.
