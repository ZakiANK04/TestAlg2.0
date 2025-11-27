from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import Farm, MarketData, WeatherData, Crop, SoilData
from .services.recommendation import SmartProductionPlanningEngine
from .serializers import RecommendationSerializer, FarmSerializer, SoilDataSerializer, UserSerializer, RegisterSerializer

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


class FarmViewSet(viewsets.ModelViewSet):
    queryset = Farm.objects.all()
    serializer_class = FarmSerializer

    def perform_create(self, serializer):
        # Mock user for now, or use request.user if auth is set up
        # For simplicity in this MVP, we might just assign to the first user or create one
        from django.contrib.auth.models import User
        user = User.objects.first()
        serializer.save(user=user)


class RecommendationView(APIView):
    def get(self, request, farm_id):
        try:
            farm = Farm.objects.get(id=farm_id)
        except Farm.DoesNotExist:
            return Response({"error": "Farm not found"}, status=status.HTTP_404_NOT_FOUND)

        # Mock fetching latest weather and market data
        # In real app, filter by location/date
        weather = WeatherData.objects.first() 
        market_data = MarketData.objects.all()

        if not weather or not market_data:
             return Response({"error": "Insufficient data for analysis"}, status=status.HTTP_400_BAD_REQUEST)

        print(f"DEBUG: Generating recommendations for Farm ID: {farm.id}, Soil Type: {farm.soil_type}")
        engine = SmartProductionPlanningEngine(farm, weather, market_data)
        recommendations = engine.get_recommendations()
        
        serializer = RecommendationSerializer(recommendations, many=True)
        return Response(serializer.data)
