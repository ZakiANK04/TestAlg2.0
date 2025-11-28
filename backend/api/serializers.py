from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Farm, Crop, SoilData, WeatherData, MarketData, Region

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


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ['id', 'name', 'name_ar', 'soil_type', 'latitude', 'longitude']

class FarmSerializer(serializers.ModelSerializer):
    intended_crop_name = serializers.CharField(source='intended_crop.name', read_only=True)
    
    class Meta:
        model = Farm
        fields = ['id', 'user', 'name', 'location', 'region', 'size_hectares', 'soil_type', 'intended_crop', 'intended_crop_name']
        read_only_fields = ['user']
    
    def create(self, validated_data):
        # If region is provided, use its soil type
        region = validated_data.get('region')
        if region and not validated_data.get('soil_type'):
            validated_data['soil_type'] = region.soil_type
        return super().create(validated_data)

class CropSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crop
        fields = '__all__'

class SoilDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoilData
        fields = '__all__'

class AdviceItemSerializer(serializers.Serializer):
    category = serializers.CharField()
    priority = serializers.IntegerField()
    title = serializers.CharField()
    message = serializers.CharField()
    action = serializers.CharField()
    impact = serializers.CharField()

class RecommendationSerializer(serializers.Serializer):
    crop = serializers.CharField()
    final_score = serializers.FloatField()
    confidence = serializers.CharField(required=False)
    advice = serializers.ListField(child=AdviceItemSerializer(), required=False)
    details = serializers.DictField()
