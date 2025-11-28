# Setup Instructions

## What Was Fixed

### 1. ✅ Authentication Persistence
- Created `AuthContext` to manage authentication state
- JWT tokens are now stored in localStorage and persist across page refreshes
- Automatic token refresh when access token expires
- Protected routes that redirect to login if not authenticated
- Logout functionality added

### 2. ✅ Database Restructuring
- Farms are now properly linked to authenticated users
- Users can only see and manage their own farms
- Farm creation automatically assigns to logged-in user

### 3. ✅ Weather API Integration
- Integrated OpenWeatherMap API for real-time weather data
- Weather data is fetched based on farm location
- Falls back to default values if API is unavailable
- Weather data is cached in database

### 4. ✅ Language Translations
- Added missing translations for all languages (English, French, Arabic)
- Fixed RTL support for Arabic
- All dashboard elements now translate properly

## Setup Steps

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set Up Weather API Key (Optional but Recommended)**
   - Get a free API key from https://openweathermap.org/api
   - Create a `.env` file in the `backend` directory:
     ```
     OPENWEATHER_API_KEY=your_api_key_here
     ```
   - Or set it as an environment variable:
     ```bash
     export OPENWEATHER_API_KEY=your_api_key_here  # Linux/Mac
     set OPENWEATHER_API_KEY=your_api_key_here     # Windows
     ```
   - **Note**: The system will work with default values if no API key is provided, but real-time weather data requires the API key.

3. **Run Migrations** (if needed)
   ```bash
   python manage.py migrate
   ```

4. **Start Backend Server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Frontend Server**
   ```bash
   npm run dev
   ```

## How It Works

### Authentication Flow
1. User signs up/logs in
2. JWT tokens are stored in localStorage
3. On page refresh, tokens are automatically validated
4. If token expires, refresh token is used to get new access token
5. If refresh fails, user is logged out

### Weather Data Flow
1. Farmer enters farm location
2. Backend fetches weather data from OpenWeatherMap API based on location
3. Weather data is stored in database
4. Recommendation engine uses real weather data for crop suggestions
5. If API fails, system uses default/fallback values

### Recommendation System
1. Takes farmer's input (location, soil type, farm size)
2. Fetches real-time weather data for that location
3. Analyzes market data for crops
4. Calculates scores based on:
   - Soil suitability
   - Weather/yield forecast
   - Market profitability
   - Oversupply risk
5. Provides ranked recommendations with detailed analysis

## API Endpoints

- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login (returns JWT tokens)
- `POST /api/auth/refresh/` - Refresh access token
- `GET /api/auth/profile/` - Get user profile (requires auth)
- `GET /api/farms/` - List user's farms (requires auth)
- `POST /api/farms/` - Create new farm (requires auth)
- `GET /api/recommendations/<farm_id>/` - Get crop recommendations (requires auth)

## Notes

- The weather API integration will work without an API key (uses defaults), but for production you should get a free OpenWeatherMap API key
- All protected routes require authentication
- Users can only access their own farms
- Language switching works across all pages
- RTL support is enabled for Arabic

