import requests
from datetime import datetime, timedelta
from django.conf import settings
import os

# OpenWeatherMap API (free tier available)
# You can get a free API key from https://openweathermap.org/api
OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY', 'your_api_key_here')
OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5'

def get_weather_data(location):
    """
    Fetch current weather data from OpenWeatherMap API based on location.
    Returns weather data in the format expected by the recommendation engine.
    """
    try:
        # First, get coordinates for the location (geocoding)
        geocode_url = f'{OPENWEATHER_BASE_URL}/weather'
        params = {
            'q': location,
            'appid': OPENWEATHER_API_KEY,
            'units': 'metric'
        }
        
        response = requests.get(geocode_url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract weather data
            main = data.get('main', {})
            weather_info = data.get('weather', [{}])[0]
            rain = data.get('rain', {})
            clouds = data.get('clouds', {})
            
            # Calculate rainfall (OpenWeatherMap provides rain in mm for last 3 hours)
            rainfall_mm = rain.get('3h', 0) or rain.get('1h', 0) or 0
            
            # For forecast, we'll use current data and estimate daily values
            # In production, you'd use the forecast API for better predictions
            temperature_avg = main.get('temp', 20)
            humidity_avg = main.get('humidity', 60)
            
            # Estimate sunshine hours (simplified: less clouds = more sunshine)
            cloud_coverage = clouds.get('all', 50)
            sunshine_hours = max(0, 12 - (cloud_coverage / 10))  # Rough estimate
            
            # If no rain data, estimate based on weather condition
            if rainfall_mm == 0:
                weather_main = weather_info.get('main', '').lower()
                if 'rain' in weather_main:
                    rainfall_mm = 5.0  # Light rain estimate
                elif 'drizzle' in weather_main:
                    rainfall_mm = 2.0
            
            return {
                'location': location,
                'date': datetime.now().date(),
                'rainfall_mm': rainfall_mm,
                'temperature_avg': temperature_avg,
                'humidity_avg': humidity_avg,
                'sunshine_hours': sunshine_hours
            }
        else:
            # If API fails, return default values
            print(f"Weather API error: {response.status_code}")
            return get_default_weather_data(location)
            
    except Exception as e:
        print(f"Error fetching weather data: {e}")
        return get_default_weather_data(location)

def get_default_weather_data(location):
    """
    Return default weather data when API is unavailable.
    These are average values for agricultural regions.
    """
    return {
        'location': location,
        'date': datetime.now().date(),
        'rainfall_mm': 10.0,  # Average daily rainfall
        'temperature_avg': 20.0,  # Average temperature
        'humidity_avg': 65.0,  # Average humidity
        'sunshine_hours': 8.0  # Average sunshine hours
    }

def get_weather_forecast(location, days=7):
    """
    Get weather forecast for the next N days.
    This would use the OpenWeatherMap forecast API.
    """
    try:
        forecast_url = f'{OPENWEATHER_BASE_URL}/forecast'
        params = {
            'q': location,
            'appid': OPENWEATHER_API_KEY,
            'units': 'metric',
            'cnt': days * 8  # 8 forecasts per day (3-hour intervals)
        }
        
        response = requests.get(forecast_url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            # Process forecast data
            # This would return a list of weather predictions
            return data.get('list', [])
        else:
            return []
    except Exception as e:
        print(f"Error fetching weather forecast: {e}")
        return []

