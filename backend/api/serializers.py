from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Farm, Crop, SoilData, WeatherData, MarketData

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user


class FarmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farm
        fields = ['id', 'user', 'name', 'location', 'size_hectares', 'soil_type']
        read_only_fields = ['user']

class CropSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crop
        fields = '__all__'

class SoilDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoilData
        fields = '__all__'

class RecommendationSerializer(serializers.Serializer):
    crop = serializers.CharField()
    final_score = serializers.FloatField()
    details = serializers.DictField()
