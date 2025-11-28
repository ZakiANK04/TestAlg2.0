from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import Farm, MarketData, WeatherData, Crop, SoilData, Region
from .services.recommendation import SmartProductionPlanningEngine
from .serializers import RecommendationSerializer, FarmSerializer, SoilDataSerializer, UserSerializer, RegisterSerializer, RegionSerializer, CropSerializer

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
        regions = Region.objects.all()
        serializer = RegionSerializer(regions, many=True)
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
