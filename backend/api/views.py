from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import Farm, MarketData, WeatherData, Crop, SoilData, Region
from .services.recommendation import SmartProductionPlanningEngine
from .serializers import RecommendationSerializer, FarmSerializer, SoilDataSerializer, UserSerializer, RegisterSerializer, RegionSerializer, CropSerializer
import csv
import os
from datetime import datetime
from pathlib import Path

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class RegionListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        # Get all regions and remove duplicates by name (keep first occurrence)
        all_regions = Region.objects.all().order_by('name', 'id')
        seen_names = set()
        unique_regions = []
        for region in all_regions:
            if region.name not in seen_names:
                unique_regions.append(region)
                seen_names.add(region.name)
        serializer = RegionSerializer(unique_regions, many=True)
        return Response(serializer.data)

class CropListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        crops = Crop.objects.all().order_by('name')
        serializer = CropSerializer(crops, many=True)
        return Response(serializer.data)


class FarmViewSet(viewsets.ModelViewSet):
    serializer_class = FarmSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return farms for the authenticated user
        return Farm.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Assign farm to the authenticated user
        serializer.save(user=self.request.user)


class RecommendationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, farm_id):
        try:
            # Only allow access to user's own farms
            farm = Farm.objects.get(id=farm_id, user=request.user)
        except Farm.DoesNotExist:
            return Response({"error": "Farm not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Get language from query parameter (default to 'en')
        language = request.query_params.get('language', 'en')
        # Validate language (only allow en, fr, ar)
        if language not in ['en', 'fr', 'ar']:
            language = 'en'

        # Fetch weather data from API based on farm location
        from .services.weather_api import get_weather_data
        
        try:
            weather_data = get_weather_data(farm.location)
            # Create or update WeatherData entry
            weather, created = WeatherData.objects.update_or_create(
                location=farm.location,
                date=weather_data['date'],
                defaults={
                    'rainfall_mm': weather_data['rainfall_mm'],
                    'temperature_avg': weather_data['temperature_avg'],
                    'humidity_avg': weather_data['humidity_avg'],
                    'sunshine_hours': weather_data.get('sunshine_hours', 8.0)
                }
            )
        except Exception as e:
            # Fallback to latest weather data if API fails
            print(f"Weather API error: {e}")
            weather = WeatherData.objects.filter(location=farm.location).first()
            if not weather:
                weather = WeatherData.objects.first()
            if not weather:
                return Response({"error": "Weather data unavailable"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        # Get market data
        market_data = MarketData.objects.all()
        if not market_data:
            return Response({"error": "Insufficient market data for analysis"}, status=status.HTTP_400_BAD_REQUEST)

        print(f"DEBUG: Generating recommendations for Farm ID: {farm.id}, Location: {farm.location}, Soil Type: {farm.soil_type}, Language: {language}")
        engine = SmartProductionPlanningEngine(farm, weather, market_data, language=language)
        recommendations = engine.get_recommendations()
        
        # Analyze intended crop if farmer specified one
        intended_crop_analysis = None
        if farm.intended_crop:
            intended_crop_analysis = engine.analyze_intended_crop(farm.intended_crop, market_data)
        
        serializer = RecommendationSerializer(recommendations, many=True)
        response_data = {
            'recommendations': serializer.data,
            'intended_crop_analysis': intended_crop_analysis
        }
        return Response(response_data)

class SaveModelResultView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, farm_id):
        """
        Save model prediction results to CSV file for future training
        """
        try:
            farm = Farm.objects.get(id=farm_id, user=request.user)
        except Farm.DoesNotExist:
            return Response({"error": "Farm not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Get data from request
        crop_name = request.data.get('crop_name')
        price_forecast = request.data.get('price_forecast')
        yield_per_ha = request.data.get('yield_per_ha')
        oversupply_risk = request.data.get('oversupply_risk')
        
        print(f"DEBUG SaveModelResult: crop={crop_name}, price={price_forecast}, yield={yield_per_ha}, risk={oversupply_risk}")
        
        # Validate all fields are provided (check for None, not falsy, since 0 is valid)
        if crop_name is None or price_forecast is None or yield_per_ha is None or oversupply_risk is None:
            return Response({
                "error": "Missing required fields",
                "received": {
                    "crop_name": crop_name,
                    "price_forecast": price_forecast,
                    "yield_per_ha": yield_per_ha,
                    "oversupply_risk": oversupply_risk
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Convert to proper types
        try:
            price_forecast = float(price_forecast)
            yield_per_ha = float(yield_per_ha)
            oversupply_risk = float(oversupply_risk)
        except (ValueError, TypeError) as e:
            return Response({
                "error": f"Invalid data format: {str(e)}",
                "received": request.data
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get current date
        now = datetime.now()
        year = now.year
        month = now.month
        
        # Get weather data
        weather = WeatherData.objects.filter(location=farm.location).first()
        temperature_c = weather.temperature_avg if weather else 20.0
        rainfall_mm = weather.rainfall_mm if weather else 300.0
        
        # CSV file path
        BASE_DIR = Path(__file__).resolve().parent.parent.parent
        data_dir = BASE_DIR / 'data'
        csv_file = data_dir / 'model_results.csv'
        
        # Ensure data directory exists
        try:
            data_dir.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            print(f"Error creating data directory: {e}")
            return Response({
                "error": f"Failed to create data directory: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Check if file exists to determine if we need to write headers
        file_exists = csv_file.exists()
        
        # Prepare row data - match training data format
        # Note: avg_price in training data appears to be per ton, but model outputs per kg
        # Convert price back to per ton for consistency with training data format
        price_per_ton = price_forecast * 1000  # Convert DA/kg to DA/ton
        
        row_data = {
            'region': farm.location,
            'soil_type': farm.soil_type,
            'crop': crop_name,
            'month': month,
            'year': year,
            'planted_area': farm.size_hectares,
            'harvested_quantity': yield_per_ha * farm.size_hectares,  # Total yield in tons
            'avg_price': price_per_ton,  # Price per ton (to match training data format)
            'yield_per_ha': yield_per_ha,
            'oversupply_pct': oversupply_risk,
            'temperature_c': temperature_c,
            'rainfall_mm': rainfall_mm,
            'farmer_id': request.user.id,
            'farm_name': farm.name,
            'saved_at': now.isoformat()
        }
        
        # Check for duplicate entries before saving
        # A duplicate is defined as: same farmer, same farm, same crop, same month, same year
        # with very similar model predictions (within 1% tolerance)
        try:
            if file_exists:
                with open(csv_file, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    for existing_row in reader:
                        # Check if it's the same farmer, farm, crop, month, year
                        if (existing_row.get('farmer_id') == str(request.user.id) and
                            existing_row.get('farm_name') == farm.name and
                            existing_row.get('crop') == crop_name and
                            existing_row.get('month') == str(month) and
                            existing_row.get('year') == str(year)):
                            # Check if model predictions are similar (within 1% tolerance)
                            try:
                                existing_price = float(existing_row.get('avg_price', 0))
                                existing_yield = float(existing_row.get('yield_per_ha', 0))
                                existing_risk = float(existing_row.get('oversupply_pct', 0))
                                
                                price_diff = abs(existing_price - price_per_ton) / price_per_ton if price_per_ton > 0 else 0
                                yield_diff = abs(existing_yield - yield_per_ha) / yield_per_ha if yield_per_ha > 0 else 0
                                risk_diff = abs(existing_risk - oversupply_risk) / oversupply_risk if oversupply_risk > 0 else 0
                                
                                # If all differences are less than 1%, it's a duplicate
                                if price_diff < 0.01 and yield_diff < 0.01 and risk_diff < 0.01:
                                    return Response({
                                        "message": "This result has already been saved",
                                        "duplicate": True
                                    }, status=status.HTTP_200_OK)
                            except (ValueError, ZeroDivisionError):
                                # If parsing fails, continue to save (better to have duplicate than lose data)
                                pass
            
            # No duplicate found, proceed to save
            with open(csv_file, 'a', newline='', encoding='utf-8') as f:
                # Core fields matching training data format
                fieldnames = [
                    'region', 'soil_type', 'crop', 'month', 'year', 'planted_area',
                    'harvested_quantity', 'avg_price', 'yield_per_ha', 'oversupply_pct',
                    'temperature_c', 'rainfall_mm', 'farmer_id', 'farm_name', 'saved_at'
                ]
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                
                if not file_exists:
                    writer.writeheader()
                
                writer.writerow(row_data)
            
            return Response({
                "message": "Model result saved successfully",
                "file": str(csv_file)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"Error saving model result: {e}")
            print(f"Traceback: {error_trace}")
            return Response({
                "error": f"Failed to save data: {str(e)}",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
