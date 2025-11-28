# Project Structure - AgriData Insight

## Complete Project Structure

```
Hachkathon/
│
├── backend/                          # Django REST API Backend
│   ├── api/                          # Main API application
│   │   ├── __init__.py
│   │   ├── admin.py                  # Django admin configuration
│   │   ├── apps.py                   # App configuration
│   │   ├── models.py                 # Database models (Farm, Crop, Region, WeatherData, MarketData, SoilData)
│   │   ├── serializers.py            # DRF serializers for API responses
│   │   ├── urls.py                   # API URL routing
│   │   ├── views.py                  # API views (Register, Login, Farms, Recommendations)
│   │   ├── tests.py                  # Unit tests
│   │   │
│   │   ├── management/              # Django management commands
│   │   │   └── commands/
│   │   │       ├── seed_data.py     # Seed crops and market data
│   │   │       └── seed_regions.py   # Seed Algerian regions/wilayas
│   │   │
│   │   ├── migrations/              # Database migrations
│   │   │   ├── 0001_initial.py      # Initial schema
│   │   │   └── 0002_region_farm_region.py  # Region model migration
│   │   │
│   │   └── services/                 # Business logic services
│   │       ├── recommendation.py     # AI recommendation engine
│   │       └── weather_api.py        # Weather API integration (OpenWeatherMap)
│   │
│   ├── core/                         # Django project settings
│   │   ├── __init__.py
│   │   ├── settings.py                # Django settings (CORS, JWT, etc.)
│   │   ├── urls.py                   # Main URL configuration
│   │   ├── wsgi.py                   # WSGI configuration
│   │   └── asgi.py                   # ASGI configuration
│   │
│   ├── db.sqlite3                    # SQLite database
│   ├── manage.py                     # Django management script
│   ├── requirements.txt              # Python dependencies
│   ├── view_db.py                    # Database viewer utility
│   └── .env.example                  # Environment variables template
│
├── frontend/                         # React + Vite Frontend
│   ├── public/                       # Static assets
│   │   ├── agriculture_field_1_1764285615381.png
│   │   ├── agriculture_field_2_1764285629416.png
│   │   ├── agriculture_field_3_1764285642910.png
│   │   └── vite.svg
│   │
│   ├── src/                          # Source code
│   │   ├── assets/                   # Images and assets
│   │   │   └── react.svg
│   │   │
│   │   ├── components/               # Reusable components
│   │   │   └── FarmForm.jsx         # Farm creation/update form
│   │   │
│   │   ├── contexts/                 # React Context providers
│   │   │   ├── AuthContext.jsx      # Authentication state management
│   │   │   └── LanguageContext.jsx  # Multi-language support (EN/FR/AR)
│   │   │
│   │   ├── pages/                   # Page components
│   │   │   ├── LandingPage.jsx      # Homepage
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Signup.jsx           # Registration page
│   │   │   ├── Dashboard.jsx        # Main dashboard with recommendations
│   │   │   ├── BlockchainTracker.jsx # Blockchain tracking page
│   │   │   └── PrecisionAnalytics.jsx # Analytics page
│   │   │
│   │   ├── App.jsx                   # Main app component with routing
│   │   ├── App.css                   # App styles
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Global styles
│   │
│   ├── index.html                    # HTML template
│   ├── package.json                  # Node.js dependencies
│   ├── package-lock.json             # Locked dependencies
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── postcss.config.js             # PostCSS configuration
│   ├── eslint.config.js              # ESLint configuration
│   └── README.md                     # Frontend documentation
│
├── SETUP_INSTRUCTIONS.md             # Setup and installation guide
└── PROJECT_STRUCTURE.md              # This file

```

## Key Components Description

### Backend (Django)

#### Models (`api/models.py`)
- **Region**: Algerian regions/wilayas with soil types
- **Farm**: User farms with location, size, soil type
- **Crop**: Crop information (pH, water requirements, yield)
- **WeatherData**: Weather data from API
- **MarketData**: Market prices and supply/demand
- **SoilData**: Soil test results

#### Services (`api/services/`)
- **recommendation.py**: 
  - `SmartProductionPlanningEngine`: AI recommendation engine
  - Calculates soil suitability, yield forecast, profitability, risk
  - Generates actionable advice for farmers
  
- **weather_api.py**:
  - `get_weather_data()`: Fetches weather from OpenWeatherMap API
  - `get_weather_forecast()`: Gets weather forecast
  - Falls back to defaults if API unavailable

#### API Endpoints (`api/urls.py`)
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login (JWT tokens)
- `POST /api/auth/refresh/` - Refresh access token
- `GET /api/auth/profile/` - Get user profile
- `GET /api/farms/` - List user's farms
- `POST /api/farms/` - Create new farm
- `GET /api/recommendations/<farm_id>/` - Get crop recommendations
- `GET /api/regions/` - List all regions

### Frontend (React)

#### Contexts
- **AuthContext**: 
  - Manages authentication state
  - Handles JWT token storage/refresh
  - Provides login/logout functions
  
- **LanguageContext**:
  - Multi-language support (English, French, Arabic)
  - Translation function `t()`
  - Crop name translation `translateCrop()`
  - RTL support for Arabic

#### Pages
- **LandingPage**: Homepage with features
- **Login/Signup**: Authentication pages
- **Dashboard**: 
  - Farm management
  - Crop recommendations
  - AI advice display
  - Detailed analysis table
  
- **BlockchainTracker**: Crop tracking page
- **PrecisionAnalytics**: Analytics page

#### Components
- **FarmForm**: 
  - Region selection dropdown
  - Auto-detects soil type from region
  - Farm creation/update

## Technology Stack

### Backend
- **Django 5.2.8**: Web framework
- **Django REST Framework 3.15.2**: API framework
- **djangorestframework-simplejwt 5.3.1**: JWT authentication
- **django-cors-headers 4.6.0**: CORS handling
- **requests 2.31.0**: HTTP library for weather API
- **SQLite**: Database

### Frontend
- **React 19.2.0**: UI library
- **Vite 7.2.4**: Build tool
- **React Router DOM 7.9.6**: Routing
- **Axios 1.13.2**: HTTP client
- **Tailwind CSS 4.1.17**: Styling
- **Framer Motion 12.23.24**: Animations

## Data Flow

1. **User Input** → Frontend (FarmForm)
2. **API Request** → Backend (views.py)
3. **Weather Data** → Weather API (OpenWeatherMap)
4. **Analysis** → Recommendation Engine (recommendation.py)
5. **AI Advice** → Generated based on analysis
6. **Response** → Frontend (Dashboard)
7. **Display** → User sees recommendations and advice

## Features

✅ User Authentication (JWT with persistence)
✅ Multi-language Support (EN/FR/AR with RTL)
✅ Region Selection with Auto Soil Detection
✅ Weather API Integration
✅ AI-Powered Recommendations
✅ AI Advice Generation
✅ Market Risk Analysis
✅ Profitability Calculations
✅ Protected Routes
✅ Responsive Design

