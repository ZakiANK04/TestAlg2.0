import random
from datetime import datetime, timedelta
from collections import defaultdict
from .ai_advice_generator import AIAdviceGenerator
from .model_predictor import get_model_predictor

class SmartProductionPlanningEngine:
    def __init__(self, farm, weather_forecast, market_data, language='en'):
        self.farm = farm
        self.weather = weather_forecast
        self.market = market_data
        self.language = language  # Store language for AI advice generation
        self.ai_advice_generator = AIAdviceGenerator(language=language)
        self.advice_categories = {
            'critical': [],  # Must address immediately
            'warning': [],   # Should address soon
            'recommendation': [],  # Best practices
            'opportunity': [],  # Potential benefits
            'info': []  # General information
        }
        
        # Define desert/semi-desert regions (strict climate constraints)
        self.desert_regions = ['Biskra', 'Adrar', 'Tamanrasset', 'Illizi', 'Béchar', 'Tindouf', 'El Oued', 'Ouargla', 'Ghardaïa', 'Laghouat']
        self.semi_desert_regions = ['Djelfa', 'M\'Sila', 'El Bayadh', 'Naâma', 'Aïn Salah']
        
        # Crop-specific climate requirements (strict)
        self.crop_climate_requirements = {
            'Strawberry': {
                'max_temp': 25,  # Cannot tolerate high temperatures
                'min_rainfall': 400,  # Needs adequate water
                'max_temp_avg': 22,  # Optimal temperature
                'soil_preferred': ['Loam', 'Silt'],  # Not suitable for sand
                'desert_suitable': False  # Not suitable for desert
            },
            'Lettuce': {
                'max_temp': 25,
                'min_rainfall': 200,
                'max_temp_avg': 20,
                'soil_preferred': ['Loam', 'Clay', 'Silt'],
                'desert_suitable': False
            },
            'Tomato': {
                'max_temp': 35,
                'min_rainfall': 300,
                'max_temp_avg': 28,
                'soil_preferred': ['Loam', 'Clay'],
                'desert_suitable': True  # Can work with irrigation
            },
            'Wheat': {
                'max_temp': 30,
                'min_rainfall': 300,
                'max_temp_avg': 20,
                'soil_preferred': ['Loam', 'Clay'],
                'desert_suitable': False
            }
        }

    def calculate_soil_score(self, crop, soil_data):
        """
        Enhanced Soil Suitability Scoring with multiple factors
        Includes regional climate constraints
        """
        score = 100.0
        
        # Check regional climate constraints FIRST (strict validation)
        location = self.farm.location if hasattr(self.farm, 'location') else ''
        region_name = location if isinstance(location, str) else getattr(self.farm.region, 'name', '') if self.farm.region else ''
        
        # Apply strict climate penalties for unsuitable regions
        climate_penalty = self._check_climate_constraints(crop, region_name, soil_data.texture)
        if climate_penalty > 0:
            score -= climate_penalty  # Apply heavy penalty for unsuitable climate
        
        # 1. pH Analysis (40% of soil score)
        ideal_ph_center = (crop.ideal_ph_min + crop.ideal_ph_max) / 2
        ph_range = crop.ideal_ph_max - crop.ideal_ph_min
        ph_diff = abs(soil_data.ph_level - ideal_ph_center)
        
        if soil_data.ph_level < crop.ideal_ph_min:
            # Too acidic
            ph_penalty = min(40, (crop.ideal_ph_min - soil_data.ph_level) * 15)
            score -= ph_penalty
        elif soil_data.ph_level > crop.ideal_ph_max:
            # Too alkaline
            ph_penalty = min(40, (soil_data.ph_level - crop.ideal_ph_max) * 15)
            score -= ph_penalty
        else:
            # Within range - bonus for being close to center
            if ph_diff < ph_range * 0.2:
                score += 5  # Optimal pH bonus
        
        # 2. Texture Compatibility (30% of soil score)
        texture_score = self._analyze_texture_compatibility(crop, soil_data.texture)
        score = (score * 0.7) + (texture_score * 0.3)
        
        # 3. Water Retention Analysis (20% of soil score)
        water_retention_score = self._analyze_water_retention(crop, soil_data.texture)
        score = (score * 0.8) + (water_retention_score * 0.2)
        
        # 4. Nutrient Availability (10% of soil score - if soil data available)
        if hasattr(soil_data, 'nitrogen') and soil_data.nitrogen:
            nutrient_score = self._analyze_nutrients(crop, soil_data)
            score = (score * 0.9) + (nutrient_score * 0.1)
        
        return max(0, min(100, score))
    
    def _check_climate_constraints(self, crop, region_name, soil_texture):
        """
        Check if crop is suitable for region's climate
        Returns penalty score (0-100) for unsuitable conditions
        """
        penalty = 0
        region_lower = region_name.lower() if region_name else ''
        
        # Check if region is desert/semi-desert
        is_desert = any(desert.lower() in region_lower for desert in self.desert_regions)
        is_semi_desert = any(semi.lower() in region_lower for semi in self.semi_desert_regions)
        
        # Get crop requirements
        crop_reqs = self.crop_climate_requirements.get(crop.name, {})
        
        if not crop_reqs:
            # For crops without specific requirements, apply general desert rules
            if is_desert:
                # High water requirement crops are not suitable for desert
                if crop.water_requirement_mm > 400:
                    penalty += 50  # Heavy penalty
                if soil_texture == 'Sand' and crop.water_requirement_mm > 300:
                    penalty += 30  # Additional penalty for sand + high water
            return penalty
        
        # Check desert suitability
        if (is_desert or is_semi_desert) and not crop_reqs.get('desert_suitable', False):
            penalty += 60  # Heavy penalty for non-desert crops in desert
        
        # Check temperature constraints
        if self.weather.temperature_avg > crop_reqs.get('max_temp', 35):
            temp_excess = self.weather.temperature_avg - crop_reqs.get('max_temp', 35)
            penalty += min(40, temp_excess * 5)  # 5 points per degree over max
        
        # Check rainfall constraints
        if self.weather.rainfall_mm < crop_reqs.get('min_rainfall', 200):
            rainfall_deficit = crop_reqs.get('min_rainfall', 200) - self.weather.rainfall_mm
            penalty += min(50, rainfall_deficit / 10)  # Penalty for insufficient rainfall
        
        # Check soil type constraints
        preferred_soils = crop_reqs.get('soil_preferred', [])
        if preferred_soils and soil_texture not in preferred_soils:
            if soil_texture == 'Sand' and 'Sand' not in preferred_soils:
                penalty += 40  # Heavy penalty for sand if not preferred
            else:
                penalty += 20  # Moderate penalty for non-preferred soil
        
        return penalty

    def _analyze_texture_compatibility(self, crop, soil_texture):
        """Analyze soil texture compatibility with crop"""
        # Texture preferences by crop water needs
        texture_suitability = {
            'Loam': {'high_water': 100, 'medium_water': 100, 'low_water': 95},
            'Clay': {'high_water': 90, 'medium_water': 85, 'low_water': 70},
            'Silt': {'high_water': 95, 'medium_water': 90, 'low_water': 85},
            'Sand': {'high_water': 60, 'medium_water': 75, 'low_water': 90}
        }
        
        water_category = 'high_water' if crop.water_requirement_mm > 500 else \
                        'low_water' if crop.water_requirement_mm < 300 else 'medium_water'
        
        return texture_suitability.get(soil_texture, {}).get(water_category, 70)

    def _analyze_water_retention(self, crop, soil_texture):
        """Analyze water retention capacity"""
        retention_capacity = {
            'Clay': 0.9,
            'Loam': 0.8,
            'Silt': 0.75,
            'Sand': 0.4
        }
        
        retention = retention_capacity.get(soil_texture, 0.6)
        water_need_ratio = crop.water_requirement_mm / 600  # Normalize to 600mm
        
        if retention >= water_need_ratio * 0.8:
            return 100
        elif retention >= water_need_ratio * 0.6:
            return 80
        elif retention >= water_need_ratio * 0.4:
            return 60
        else:
            return 40

    def _analyze_nutrients(self, crop, soil_data):
        """Analyze nutrient availability"""
        # Simplified nutrient analysis
        score = 70  # Base score
        
        # Nitrogen (ideal: 1.5-2.5%)
        if 1.5 <= soil_data.nitrogen <= 2.5:
            score += 10
        elif soil_data.nitrogen < 1.0:
            score -= 15
        
        # Phosphorus (ideal: 0.8-1.2%)
        if 0.8 <= soil_data.phosphorus <= 1.2:
            score += 10
        elif soil_data.phosphorus < 0.5:
            score -= 10
        
        # Potassium (ideal: 1.0-1.5%)
        if 1.0 <= soil_data.potassium <= 1.5:
            score += 10
        
        return max(0, min(100, score))

    def calculate_yield_score(self, crop):
        """
        Enhanced Weather Yield Prediction with multiple factors
        """
        scores = []
        
        # 1. Rainfall Analysis (40% weight)
        rainfall_score = self._analyze_rainfall(crop)
        scores.append(('rainfall', rainfall_score, 0.4))
        
        # 2. Temperature Analysis (30% weight)
        temp_score = self._analyze_temperature(crop)
        scores.append(('temperature', temp_score, 0.3))
        
        # 3. Growing Season Length (20% weight)
        season_score = self._analyze_growing_season(crop)
        scores.append(('season', season_score, 0.2))
        
        # 4. Humidity & Sunshine (10% weight)
        climate_score = self._analyze_climate(crop)
        scores.append(('climate', climate_score, 0.1))
        
        # Weighted average
        total_score = sum(score * weight for _, score, weight in scores)
        return max(0, min(100, total_score))

    def _analyze_rainfall(self, crop):
        """Detailed rainfall analysis"""
        rainfall = self.weather.rainfall_mm
        required = crop.water_requirement_mm
        ratio = rainfall / required if required > 0 else 0
        
        if 0.9 <= ratio <= 1.1:
            return 100  # Perfect match
        elif 0.8 <= ratio <= 1.2:
            return 90  # Good match
        elif 0.7 <= ratio <= 1.3:
            return 75  # Acceptable
        elif 0.6 <= ratio <= 1.4:
            return 60  # Moderate deviation
        elif 0.5 <= ratio <= 1.5:
            return 45  # Significant deviation
        elif ratio < 0.5:
            return max(20, 30 - (0.5 - ratio) * 40)  # Very low rainfall
        else:
            return max(20, 30 - (ratio - 1.5) * 20)  # Very high rainfall

    def _analyze_temperature(self, crop):
        """Temperature suitability analysis"""
        temp = self.weather.temperature_avg
        
        # Optimal temperature ranges by crop type (simplified)
        # Most crops prefer 18-25°C
        optimal_min, optimal_max = 18, 25
        
        if optimal_min <= temp <= optimal_max:
            return 100
        elif 15 <= temp < optimal_min or optimal_max < temp <= 28:
            return 85
        elif 12 <= temp < 15 or 28 < temp <= 32:
            return 65
        elif 10 <= temp < 12 or 32 < temp <= 35:
            return 45
        else:
            return 25

    def _analyze_growing_season(self, crop):
        """Analyze if growing season length is adequate"""
        # Simplified: assume 180 days available growing season
        available_days = 180
        required_days = crop.growing_days
        
        if required_days <= available_days * 0.9:
            return 100
        elif required_days <= available_days:
            return 85
        elif required_days <= available_days * 1.1:
            return 70
        else:
            return 50

    def _analyze_climate(self, crop):
        """Analyze humidity and sunshine"""
        humidity = self.weather.humidity_avg
        sunshine = self.weather.sunshine_hours
        
        # Optimal: 60-70% humidity, 8+ hours sunshine
        humidity_score = 100 - abs(humidity - 65) * 2
        sunshine_score = min(100, sunshine * 10)
        
        return (humidity_score * 0.5 + sunshine_score * 0.5)

    def calculate_risk_score(self, crop_market_data):
        """
        Enhanced Market Risk Analysis with STRICT oversupply prevention
        PRIORITIZE avoiding oversupply to help farmers make better decisions
        """
        # 1. Supply/Demand Ratio (60% weight - INCREASED for oversupply prevention)
        supply_demand_ratio = crop_market_data.supply_volume_tons / (crop_market_data.demand_index * 1000) if crop_market_data.demand_index > 0 else 2.0
        
        # STRICT oversupply penalties
        if supply_demand_ratio > 1.5:
            base_risk = 95  # CRITICAL oversupply
        elif supply_demand_ratio > 1.3:
            base_risk = 85  # High oversupply
        elif supply_demand_ratio > 1.2:
            base_risk = 75  # Moderate oversupply
        elif supply_demand_ratio > 1.0:
            base_risk = 55  # Slight oversupply - still penalized
        elif supply_demand_ratio > 0.8:
            base_risk = 25  # Balanced
        else:
            base_risk = 10  # Under-supply (low risk)
        
        # 2. Price Volatility Indicator (25% weight)
        # High price + high supply = risk of price crash
        price_volatility_risk = 0
        if crop_market_data.price_per_kg > 100 and supply_demand_ratio > 1.0:
            price_volatility_risk = 30
        elif crop_market_data.price_per_kg > 80 and supply_demand_ratio > 1.1:
            price_volatility_risk = 20
        
        # 3. Demand Trend (15% weight)
        demand_risk = 0
        if crop_market_data.demand_index < 0.8:
            demand_risk = 25
        elif crop_market_data.demand_index < 0.9:
            demand_risk = 15
        
        # 4. Prevent lettuce oversupply (common issue - extra penalty)
        lettuce_penalty = 0
        if crop_market_data.crop.name.lower() == 'lettuce':
            if supply_demand_ratio > 1.1:
                lettuce_penalty = 20  # Extra penalty for lettuce oversupply
            elif supply_demand_ratio > 1.0:
                lettuce_penalty = 10  # Moderate penalty
        
        # Weighted combination (risk weight increased for oversupply prevention)
        total_risk = (base_risk * 0.6) + (price_volatility_risk * 0.25) + (demand_risk * 0.15) + lettuce_penalty
        return min(100, max(0, total_risk))

    def calculate_profitability(self, crop, yield_score, market_data):
        """
        Enhanced Profitability Model with ROI calculation
        """
        # Expected yield adjusted by yield score
        expected_yield = crop.base_yield_per_ha * (yield_score / 100.0)
        
        # Revenue calculation
        revenue_per_ha = expected_yield * market_data.price_per_kg * 1000  # tons to kg
        
        # Cost calculation (more realistic)
        base_cost = 50000  # Base cost per ha
        # Adjust cost based on crop requirements
        if crop.water_requirement_mm > 500:
            base_cost += 10000  # Irrigation costs
        if crop.growing_days > 150:
            base_cost += 5000  # Longer season = more labor
        
        total_cost = base_cost
        profit_per_ha = revenue_per_ha - total_cost
        
        # ROI calculation
        roi = (profit_per_ha / total_cost) * 100 if total_cost > 0 else 0
        
        # Normalize to 0-100 score
        # ROI > 200% = 100, ROI > 100% = 80, ROI > 50% = 60, etc.
        if roi >= 200:
            profit_score = 100
        elif roi >= 150:
            profit_score = 90
        elif roi >= 100:
            profit_score = 80
        elif roi >= 50:
            profit_score = 65
        elif roi >= 25:
            profit_score = 50
        elif roi >= 0:
            profit_score = 35
        else:
            profit_score = max(0, 20 + roi)  # Negative ROI
        
        return profit_score, profit_per_ha, roi

    def get_recommendations(self):
        """
        Enhanced Final Decision with confidence scoring using model predictions
        """
        results = []
        soil_data = self.farm.soil_samples.last()
        if not soil_data:
            class MockSoil:
                def __init__(self, texture):
                    self.texture = texture
                    self.ph_level = 6.5
                    self.nitrogen = 1.5
                    self.phosphorus = 0.8
                    self.potassium = 1.0
            
            soil_data = MockSoil(self.farm.soil_type)

        # Use model predictor for all predictions
        model_predictor = get_model_predictor()
        if not model_predictor or not model_predictor.models:
            print("WARNING: Model not available, falling back to database")
            # Fallback to database if model not available
            return self._get_recommendations_from_db(soil_data)
        
        print(f"Using model for predictions. Farm: {self.farm.location}, Soil: {soil_data.texture}")
        
        # Get available crops from model
        available_crops = model_predictor.get_available_crops()
        soil_crop_pool = model_predictor.get_soil_crop_pool()
        
        # Get crops suitable for this soil type
        suitable_crops = soil_crop_pool.get(soil_data.texture, available_crops)
        
        # Get crop objects from database for soil score calculation
        from api.models import Crop as CropModel
        
        # Analyze all suitable crops using model predictions
        for crop_name in suitable_crops:
            try:
                crop = CropModel.objects.get(name=crop_name)
            except CropModel.DoesNotExist:
                continue
            
            # Get model predictions
            prediction = model_predictor.predict_crop(
                crop_name=crop_name,
                region_name=self.farm.location,
                soil_type=soil_data.texture,
                farm_size_ha=self.farm.size_hectares,
                temperature_c=self.weather.temperature_avg,
                rainfall_mm=self.weather.rainfall_mm
            )
            
            if not prediction:
                continue
            
            # Extract model predictions
            model_risk = prediction.get('risk', 0)  # Oversupply risk percentage
            model_price = prediction.get('price', 0)  # Price per kg
            model_yield_per_ha = prediction.get('yield', 0)  # Yield per hectare in tons
            
            # Ensure yield is valid
            if model_yield_per_ha <= 0:
                print(f"ERROR: Invalid yield prediction {model_yield_per_ha} for {crop_name}, skipping")
                continue
            
            # Calculate scores based on model predictions
            soil_score = self.calculate_soil_score(crop, soil_data)
            
            # Yield score based on model prediction vs crop base yield
            if crop.base_yield_per_ha > 0:
                yield_ratio = model_yield_per_ha / crop.base_yield_per_ha
                yield_score = min(100, max(0, yield_ratio * 100))
            else:
                yield_score = 50
            
            # Risk score from model (already in percentage)
            risk_score = model_risk
            
            # Profitability from model predictions
            # model_price is already in DA/kg (converted from DA/ton in model_predictor)
            # model_yield_per_ha is in tons/ha, need to convert to kg/ha
            revenue_per_ha = model_yield_per_ha * 1000 * model_price  # tons to kg, then multiply by price per kg
            base_cost = 50000
            if crop.water_requirement_mm > 500:
                base_cost += 10000
            if crop.growing_days > 150:
                base_cost += 5000
            profit_per_ha = revenue_per_ha - base_cost
            roi = (profit_per_ha / base_cost) * 100 if base_cost > 0 else 0
            
            # Profit score
            if roi >= 200:
                profit_score = 100
            elif roi >= 150:
                profit_score = 90
            elif roi >= 100:
                profit_score = 80
            elif roi >= 50:
                profit_score = 65
            elif roi >= 25:
                profit_score = 50
            elif roi >= 0:
                profit_score = 35
            else:
                profit_score = max(0, 20 + roi)
            
            # Enhanced weighted scoring with dynamic weights
            weights = {
                'soil': 0.25,
                'yield': 0.25,
                'profit': 0.25,
                'risk': 0.25
            }
            
            # Apply strict penalties for unsuitable conditions
            if soil_score < 40:
                final_score = (
                    weights['soil'] * soil_score * 0.5 +
                    weights['yield'] * yield_score +
                    weights['profit'] * profit_score -
                    weights['risk'] * risk_score * 1.5
                )
            elif risk_score > 70:
                final_score = (
                    weights['soil'] * soil_score +
                    weights['yield'] * yield_score +
                    weights['profit'] * profit_score -
                    weights['risk'] * risk_score * 1.8
                )
            else:
                final_score = (
                    weights['soil'] * soil_score +
                    weights['yield'] * yield_score +
                    weights['profit'] * profit_score -
                    weights['risk'] * risk_score
                )
            
            # Calculate confidence level
            confidence = self._calculate_confidence(soil_score, yield_score, profit_score, risk_score)

            # Enhanced weighted scoring with dynamic weights
            # PRIORITIZE avoiding oversupply and unsuitable conditions
            # Risk weight INCREASED to prevent oversupply
            weights = {
                'soil': 0.25,  # Reduced slightly
                'yield': 0.25,
                'profit': 0.25,  # Reduced slightly
                'risk': 0.25  # INCREASED - prioritize avoiding oversupply
            }
            
            # Apply strict penalties for unsuitable conditions
            # If soil score is very low (<40), heavily penalize
            if soil_score < 40:
                final_score = (
                    weights['soil'] * soil_score * 0.5 +  # Heavy penalty
                    weights['yield'] * yield_score +
                    weights['profit'] * profit_score -
                    weights['risk'] * risk_score * 1.5  # Risk penalty amplified
                )
            # If risk is very high (>70), heavily penalize
            elif risk_score > 70:
                final_score = (
                    weights['soil'] * soil_score +
                    weights['yield'] * yield_score +
                    weights['profit'] * profit_score -
                    weights['risk'] * risk_score * 1.8  # Very heavy risk penalty
                )
            else:
                final_score = (
                    weights['soil'] * soil_score +
                    weights['yield'] * yield_score +
                    weights['profit'] * profit_score -
                    weights['risk'] * risk_score
                )
            
            # Calculate confidence level
            confidence = self._calculate_confidence(soil_score, yield_score, profit_score, risk_score)
            
            # Calculate recommended planting area (more intelligent)
            recommended_area_ha = self._calculate_optimal_area(
                final_score, self.farm.size_hectares, risk_score, profit_per_ha
            )
            
            # Calculate expected values from model predictions
            expected_yield_tons = recommended_area_ha * model_yield_per_ha
            # model_price is already in DA/kg, expected_yield_tons is in tons
            expected_revenue = expected_yield_tons * 1000 * model_price  # tons to kg, then multiply by price per kg
            expected_profit = expected_revenue - (recommended_area_ha * base_cost)
            
            # Generate AI-powered advice (with fallback to rule-based)
            farm_data = {
                'location': self.farm.location,
                'size_hectares': self.farm.size_hectares,
                'soil_type': soil_data.texture,
                'ph_level': soil_data.ph_level
            }
            
            analysis_scores = {
                'soil': soil_score,
                'yield': yield_score,
                'profit': profit_score,
                'risk': risk_score,
                'final_score': final_score,
                'roi': roi,
                'profit_per_ha': profit_per_ha,
                'ideal_ph': (crop.ideal_ph_min + crop.ideal_ph_max) / 2,
                'water_requirement': crop.water_requirement_mm
            }
            
            weather_data_dict = {
                'rainfall_mm': self.weather.rainfall_mm,
                'temperature_avg': self.weather.temperature_avg,
                'humidity_avg': self.weather.humidity_avg
            }
            
            # Use model predictions for market data
            market_data_dict = {
                'price_per_kg': model_price,
                'demand_index': 1.0 - (model_risk / 100),  # Convert risk to demand index
                'supply_volume_tons': 0  # Not used from model
            }
            
            is_recommended = final_score >= 60
            structured_advice = self.ai_advice_generator.generate_crop_advice(
                crop.name,
                farm_data,
                analysis_scores,
                weather_data_dict,
                market_data_dict,
                is_recommended
            )
            
            # If AI didn't generate enough advice, supplement with rule-based
            if len(structured_advice) < 3:
                # Create mock market data for rule-based advice
                class MockMarketData:
                    def __init__(self, price, risk):
                        self.price_per_kg = price
                        self.demand_index = 1.0 - (risk / 100)
                        self.supply_volume_tons = 1000
                
                mock_market = MockMarketData(model_price, model_risk)
                rule_based_advice = self.generate_structured_advice(
                    crop, soil_score, yield_score, risk_score, profit_score, 
                    soil_data, mock_market, recommended_area_ha, roi, profit_per_ha
                )
                # Merge advice, avoiding duplicates
                existing_titles = {a.get('title', '') for a in structured_advice if isinstance(a, dict)}
                for item in rule_based_advice:
                    if isinstance(item, dict) and item.get('title') not in existing_titles:
                        structured_advice.append(item)

            results.append({
                "crop": crop.name,
                "final_score": round(final_score, 1),
                "confidence": confidence,
                "advice": structured_advice,
                "details": {
                    "price_forecast": round(model_price, 2),  # From model
                    "yield_per_ha": round(model_yield_per_ha, 2),  # From model (tons/ha)
                    "oversupply_risk": round(risk_score, 1),  # From model
                    # Keep these for other parts of the UI
                    "soil_suitability": round(soil_score, 1),
                    "yield_forecast": round(yield_score, 1),
                    "profitability": round(profit_score, 1),
                    "roi_percent": round(roi, 1),
                    "profit_per_ha": round(profit_per_ha, 0),
                    "recommended_area_ha": round(recommended_area_ha, 2),
                    "expected_yield_tons": round(expected_yield_tons, 2),
                    "expected_revenue_da": round(expected_revenue, 2),
                    "expected_profit_da": round(expected_profit, 2)
                }
            })
            
        # Sort by final score
        results.sort(key=lambda x: x['final_score'], reverse=True)
        return results
    
    def _get_recommendations_from_db(self, soil_data):
        """Fallback method using database if model not available"""
        results = []
        for m_data in self.market:
            crop = m_data.crop
            soil_score = self.calculate_soil_score(crop, soil_data)
            yield_score = self.calculate_yield_score(crop)
            risk_score = self.calculate_risk_score(m_data)
            profit_score, profit_per_ha, roi = self.calculate_profitability(crop, yield_score, m_data)
            
            weights = {'soil': 0.25, 'yield': 0.25, 'profit': 0.25, 'risk': 0.25}
            final_score = (
                weights['soil'] * soil_score +
                weights['yield'] * yield_score +
                weights['profit'] * profit_score -
                weights['risk'] * risk_score
            )
            
            confidence = self._calculate_confidence(soil_score, yield_score, profit_score, risk_score)
            recommended_area_ha = self._calculate_optimal_area(
                final_score, self.farm.size_hectares, risk_score, profit_per_ha
            )
            expected_yield_tons = recommended_area_ha * crop.base_yield_per_ha * (yield_score / 100.0)
            expected_revenue = expected_yield_tons * 1000 * m_data.price_per_kg
            expected_profit = expected_revenue - (recommended_area_ha * 50000)
            
            results.append({
                "crop": crop.name,
                "final_score": round(final_score, 1),
                "confidence": confidence,
                "advice": [],
                "details": {
                    "soil_suitability": round(soil_score, 1),
                    "yield_forecast": round(yield_score, 1),
                    "profitability": round(profit_score, 1),
                    "oversupply_risk": round(risk_score, 1),
                    "roi_percent": round(roi, 1),
                    "profit_per_ha": round(profit_per_ha, 0),
                    "price_forecast": round(m_data.price_per_kg, 2),
                    "recommended_area_ha": round(recommended_area_ha, 2),
                    "expected_yield_tons": round(expected_yield_tons, 2),
                    "expected_revenue_da": round(expected_revenue, 2),
                    "expected_profit_da": round(expected_profit, 2)
                }
            })
        
        results.sort(key=lambda x: x['final_score'], reverse=True)
        return results

    def _calculate_confidence(self, soil_score, yield_score, profit_score, risk_score):
        """Calculate confidence level in recommendation"""
        # High confidence if all factors are consistent
        scores = [soil_score, yield_score, profit_score]
        score_variance = sum((s - sum(scores)/len(scores))**2 for s in scores) / len(scores)
        
        avg_score = sum(scores) / len(scores)
        risk_penalty = risk_score * 0.3
        
        if avg_score >= 80 and risk_score < 30 and score_variance < 400:
            return "high"
        elif avg_score >= 65 and risk_score < 50:
            return "medium"
        else:
            return "low"

    def _calculate_optimal_area(self, final_score, farm_size, risk_score, profit_per_ha):
        """Intelligently calculate optimal planting area"""
        # Base recommendation: 70% of farm for top crops
        base_percentage = 0.7
        
        # Adjust based on score
        if final_score >= 80:
            percentage = base_percentage * 1.0
        elif final_score >= 70:
            percentage = base_percentage * 0.85
        elif final_score >= 60:
            percentage = base_percentage * 0.70
        elif final_score >= 50:
            percentage = base_percentage * 0.50
        else:
            percentage = base_percentage * 0.30
        
        # Risk adjustment
        if risk_score > 70:
            percentage *= 0.5  # Reduce by 50% if high risk
        elif risk_score > 50:
            percentage *= 0.75  # Reduce by 25% if moderate risk
        
        # Profitability adjustment
        if profit_per_ha > 200000:
            percentage = min(0.9, percentage * 1.1)  # Increase if very profitable
        elif profit_per_ha < 50000:
            percentage *= 0.8  # Decrease if low profit
        
        recommended = farm_size * percentage * (final_score / 100)
        return max(0.1, min(farm_size * 0.9, recommended))  # Between 0.1ha and 90% of farm

    def generate_structured_advice(self, crop, soil_score, yield_score, risk_score, profit_score,
                                   soil_data, market_data, recommended_area_ha, roi, profit_per_ha):
        """
        Generate structured, prioritized advice with categories
        """
        advice = {
            'critical': [],
            'warning': [],
            'recommendation': [],
            'opportunity': [],
            'info': []
        }
        
        # CRITICAL ADVICE (Must address)
        if risk_score > 75:
            advice['critical'].append({
                'title': 'High Market Risk Detected',
                'message': f'Market oversupply risk is {risk_score:.0f}% for {crop.name}. Strongly consider reducing planting area or delaying planting to avoid price collapse.',
                'action': 'Reduce planting area by 50% or delay planting by 2-3 months',
                'impact': 'high'
            })
        
        if soil_score < 50:
            avg_ph = (crop.ideal_ph_min + crop.ideal_ph_max) / 2
            if abs(soil_data.ph_level - avg_ph) > 1.5:
                advice['critical'].append({
                    'title': 'Critical Soil pH Issue',
                    'message': f'Soil pH ({soil_data.ph_level:.1f}) is far from ideal range ({crop.ideal_ph_min:.1f}-{crop.ideal_ph_max:.1f}) for {crop.name}.',
                    'action': f'Apply soil amendment: {"Lime" if soil_data.ph_level < avg_ph else "Sulfur"} to adjust pH to {avg_ph:.1f}',
                    'impact': 'high'
                })
        
        if yield_score < 30:
            advice['critical'].append({
                'title': 'Poor Weather Conditions',
                'message': f'Weather forecast indicates very poor conditions (score: {yield_score:.0f}%) for {crop.name}.',
                'action': 'Consider alternative crops or delay planting until conditions improve',
                'impact': 'high'
            })
        
        # WARNING ADVICE (Should address)
        if 50 <= risk_score <= 75:
            advice['warning'].append({
                'title': 'Moderate Market Risk',
                'message': f'Moderate oversupply risk ({risk_score:.0f}%) detected. Market may become saturated.',
                'action': 'Monitor market trends weekly and consider diversifying with other crops',
                'impact': 'medium'
            })
        
        if soil_score < 70:
            if "Loam" not in soil_data.texture and crop.water_requirement_mm > 500:
                advice['warning'].append({
                    'title': 'Soil Water Retention Concern',
                    'message': f'Your {soil_data.texture} soil may not retain enough water for {crop.name} (needs {crop.water_requirement_mm:.0f}mm).',
                    'action': 'Install irrigation system or add organic matter to improve water retention',
                    'impact': 'medium'
                })
        
        rainfall_diff = abs(self.weather.rainfall_mm - crop.water_requirement_mm)
        if rainfall_diff > crop.water_requirement_mm * 0.3:
            if self.weather.rainfall_mm < crop.water_requirement_mm * 0.7:
                advice['warning'].append({
                    'title': 'Insufficient Rainfall Expected',
                    'message': f'Expected rainfall ({self.weather.rainfall_mm:.1f}mm) is {((1 - self.weather.rainfall_mm/crop.water_requirement_mm)*100):.0f}% below {crop.name}\'s requirement ({crop.water_requirement_mm:.0f}mm).',
                    'action': 'Plan supplemental irrigation: {:.0f}mm needed'.format(crop.water_requirement_mm - self.weather.rainfall_mm),
                    'impact': 'medium'
                })
            elif self.weather.rainfall_mm > crop.water_requirement_mm * 1.3:
                advice['warning'].append({
                    'title': 'Excessive Rainfall Expected',
                    'message': f'High rainfall ({self.weather.rainfall_mm:.1f}mm) expected, {((self.weather.rainfall_mm/crop.water_requirement_mm - 1)*100):.0f}% above requirement.',
                    'action': 'Ensure proper drainage systems and consider raised beds to prevent waterlogging',
                    'impact': 'medium'
                })
        
        # RECOMMENDATIONS (Best practices)
        if soil_score >= 90:
            advice['recommendation'].append({
                'title': 'Optimal Soil Conditions',
                'message': f'Excellent soil compatibility ({soil_score:.0f}%) for {crop.name}.',
                'action': 'Maintain current soil conditions. No amendments needed.',
                'impact': 'positive'
            })
        
        if yield_score >= 85:
            advice['recommendation'].append({
                'title': 'Favorable Weather Forecast',
                'message': f'Weather conditions are highly favorable ({yield_score:.0f}%) for {crop.name}.',
                'action': 'Proceed with planting as planned. Monitor weather updates weekly.',
                'impact': 'positive'
            })
        
        # Planting strategy recommendation
        if recommended_area_ha > self.farm.size_hectares * 0.4:
            advice['recommendation'].append({
                'title': 'Optimal Planting Strategy',
                'message': f'{crop.name} is highly recommended for your farm.',
                'action': f'Allocate {recommended_area_ha:.2f} hectares ({recommended_area_ha/self.farm.size_hectares*100:.0f}% of farm) for optimal results',
                'impact': 'positive'
            })
        elif recommended_area_ha < 1.0:
            advice['recommendation'].append({
                'title': 'Limited Planting Recommendation',
                'message': f'Consider {crop.name} as a secondary crop.',
                'action': f'Plant on {recommended_area_ha:.2f} hectares as part of crop diversification strategy',
                'impact': 'positive'
            })
        
        # OPPORTUNITIES (Potential benefits)
        if profit_score >= 85 and roi > 150:
            advice['opportunity'].append({
                'title': 'High Profit Opportunity',
                'message': f'Exceptional profit potential: {roi:.0f}% ROI, {profit_per_ha:,.0f} DA/ha profit expected.',
                'action': f'Consider increasing allocation to {min(self.farm.size_hectares * 0.6, recommended_area_ha * 1.2):.2f} ha if market conditions remain stable',
                'impact': 'high_benefit'
            })
        
        if market_data.demand_index > 1.2 and risk_score < 30:
            advice['opportunity'].append({
                'title': 'High Market Demand',
                'message': f'Market demand is {((market_data.demand_index - 1) * 100):.0f}% above normal with low supply risk.',
                'action': 'This is an excellent time to plant. Prices are likely to remain strong.',
                'impact': 'high_benefit'
            })
        
        # INFO (General information)
        if self.weather.temperature_avg < 15:
            advice['info'].append({
                'title': 'Temperature Alert',
                'message': f'Low temperatures ({self.weather.temperature_avg:.1f}°C) expected.',
                'action': 'Consider using protective covers or delaying planting by 2-3 weeks',
                'impact': 'informational'
            })
        elif self.weather.temperature_avg > 30:
            advice['info'].append({
                'title': 'Heat Stress Warning',
                'message': f'High temperatures ({self.weather.temperature_avg:.1f}°C) may cause heat stress.',
                'action': 'Ensure adequate irrigation and consider heat-tolerant varieties or shade nets',
                'impact': 'informational'
            })
        
        # Convert to list format for API compatibility
        advice_list = []
        for category in ['critical', 'warning', 'recommendation', 'opportunity', 'info']:
            for item in advice[category]:
                advice_list.append({
                    'category': category,
                    'priority': self._get_priority(category),
                    'title': item['title'],
                    'message': item['message'],
                    'action': item['action'],
                    'impact': item['impact']
                })
        
        return advice_list

    def _get_priority(self, category):
        """Get priority level for advice category"""
        priorities = {
            'critical': 1,
            'warning': 2,
            'recommendation': 3,
            'opportunity': 4,
            'info': 5
        }
        return priorities.get(category, 5)

    def analyze_intended_crop(self, intended_crop, market_data):
        """
        Analyze the crop the farmer wants to plant
        Returns analysis and suggests alternatives if not recommended
        """
        # Get soil data
        soil_data = self.farm.soil_samples.last()
        if not soil_data:
            class MockSoil:
                def __init__(self, texture):
                    self.texture = texture
                    self.ph_level = 6.5
                    self.nitrogen = 1.5
                    self.phosphorus = 0.8
                    self.potassium = 1.0
            
            soil_data = MockSoil(self.farm.soil_type)
        
        # Find market data for intended crop (needed for AI advice generation)
        crop_market_data = None
        for m_data in market_data:
            if m_data.crop.id == intended_crop.id:
                crop_market_data = m_data
                break
        
        if not crop_market_data:
            return {
                'crop_name': intended_crop.name,
                'is_recommended': False,
                'reason': 'No market data available for this crop',
                'score': 0,
                'alternatives': []
            }
        
        # Use model predictions for intended crop
        model_predictor = get_model_predictor()
        if not model_predictor or not model_predictor.models:
            # Fallback to database if model not available
            # Calculate scores for intended crop (fallback)
            soil_score = self.calculate_soil_score(intended_crop, soil_data)
            yield_score = self.calculate_yield_score(intended_crop)
            risk_score = self.calculate_risk_score(crop_market_data)
            profit_score, profit_per_ha, roi = self.calculate_profitability(intended_crop, yield_score, crop_market_data)
            
            # Use fallback values
            model_risk = risk_score
            model_price = crop_market_data.price_per_kg
            model_yield_per_ha = intended_crop.base_yield_per_ha * (yield_score / 100.0)
        else:
            # Get model predictions
            prediction = model_predictor.predict_crop(
                crop_name=intended_crop.name,
                region_name=self.farm.location,
                soil_type=soil_data.texture,
                farm_size_ha=self.farm.size_hectares,
                temperature_c=self.weather.temperature_avg,
                rainfall_mm=self.weather.rainfall_mm
            )
            
            if not prediction:
                return {
                    'crop_name': intended_crop.name,
                    'is_recommended': False,
                    'reason': 'Model prediction failed for this crop',
                    'score': 0,
                    'alternatives': []
                }
            
            # Extract model predictions
            model_risk = prediction.get('risk', 0)  # Oversupply risk percentage
            model_price = prediction.get('price', 0)  # Price per kg
            model_yield_per_ha = prediction.get('yield', 0)  # Yield per hectare in tons
            
            # Calculate scores for final_score calculation (still needed for recommendation logic)
            soil_score = self.calculate_soil_score(intended_crop, soil_data)
            
            # Yield score based on model prediction
            if intended_crop.base_yield_per_ha > 0:
                yield_ratio = model_yield_per_ha / intended_crop.base_yield_per_ha
                yield_score = min(100, max(0, yield_ratio * 100))
            else:
                yield_score = 50
            
            # Profitability from model predictions
            # model_price is already in DA/kg (converted from DA/ton in model_predictor)
            # model_yield_per_ha is in tons/ha, need to convert to kg/ha
            revenue_per_ha = model_yield_per_ha * 1000 * model_price  # tons to kg, then multiply by price per kg
            base_cost = 50000
            if intended_crop.water_requirement_mm > 500:
                base_cost += 10000
            if intended_crop.growing_days > 150:
                base_cost += 5000
            profit_per_ha = revenue_per_ha - base_cost
            roi = (profit_per_ha / base_cost) * 100 if base_cost > 0 else 0
            
            # Profit score for final_score calculation
            if roi >= 200:
                profit_score = 100
            elif roi >= 150:
                profit_score = 90
            elif roi >= 100:
                profit_score = 80
            elif roi >= 50:
                profit_score = 65
            elif roi >= 25:
                profit_score = 50
            elif roi >= 0:
                profit_score = 35
            else:
                profit_score = max(0, 20 + roi)
            
            risk_score = model_risk
        
        # Calculate final score
        weights = {'soil': 0.30, 'yield': 0.25, 'profit': 0.30, 'risk': 0.15}
        final_score = (
            weights['soil'] * soil_score +
            weights['yield'] * yield_score +
            weights['profit'] * profit_score -
            weights['risk'] * risk_score
        )
        
        # Determine if recommended based on oversupply risk threshold
        # Crop is recommended if oversupply risk is below threshold (e.g., 50%)
        # It doesn't need to be the best option, just needs low risk
        OVERSUPPLY_RISK_THRESHOLD = 50  # Percentage threshold
        is_recommended = model_risk < OVERSUPPLY_RISK_THRESHOLD
        confidence = self._calculate_confidence(soil_score, yield_score, profit_score, risk_score)
        
        # Generate advice for intended crop
        recommended_area_ha = self._calculate_optimal_area(
            final_score, self.farm.size_hectares, risk_score, profit_per_ha
        )
        
        # Use AI to generate detailed, contextual advice about why this crop is good/bad
        farm_data = {
            'location': self.farm.location,
            'size_hectares': self.farm.size_hectares,
            'soil_type': soil_data.texture,
            'ph_level': soil_data.ph_level
        }
        
        # Use model predictions for AI advice instead of profitability
        analysis_scores = {
            'soil': soil_score,
            'yield': yield_score,
            'risk': risk_score,
            'final_score': final_score,
            'ideal_ph': (intended_crop.ideal_ph_min + intended_crop.ideal_ph_max) / 2,
            'water_requirement': intended_crop.water_requirement_mm,
            # Model predictions
            'price_forecast': model_price,  # From model (DA/kg)
            'yield_per_ha': model_yield_per_ha,  # From model (tons/ha)
            'oversupply_risk': model_risk  # From model (percentage)
        }
        
        weather_data_dict = {
            'rainfall_mm': self.weather.rainfall_mm,
            'temperature_avg': self.weather.temperature_avg,
            'humidity_avg': self.weather.humidity_avg
        }
        
        # Use model predictions instead of database market data
        market_data_dict = {
            'price_per_kg': model_price,  # From model
            'yield_per_ha': model_yield_per_ha,  # From model
            'oversupply_risk': model_risk,  # From model
            'demand_index': crop_market_data.demand_index if crop_market_data else 1.0,
            'supply_volume_tons': crop_market_data.supply_volume_tons if crop_market_data else 0
        }
        
        # Generate AI-powered advice
        advice = self.ai_advice_generator.generate_crop_advice(
            intended_crop.name,
            farm_data,
            analysis_scores,
            weather_data_dict,
            market_data_dict,
            is_recommended
        )
        
        # If AI didn't generate enough advice, supplement with rule-based
        if len(advice) < 3:
            rule_based_advice = self.generate_structured_advice(
                intended_crop, soil_score, yield_score, risk_score, profit_score,
                soil_data, crop_market_data, recommended_area_ha, roi, profit_per_ha
            )
            # Merge advice, avoiding duplicates
            existing_titles = {a.get('title', '') for a in advice if isinstance(a, dict)}
            for item in rule_based_advice:
                if isinstance(item, dict) and item.get('title') not in existing_titles:
                    advice.append(item)
        
        # Get alternative recommendations using model predictions
        alternatives = []
        
        if not is_recommended or final_score < 70:
            # Use model to predict alternatives
            model_predictor = get_model_predictor()
            if model_predictor and model_predictor.models:
                # Get available crops from model
                available_crops = model_predictor.get_available_crops()
                soil_crop_pool = model_predictor.get_soil_crop_pool()
                weather_ranges = model_predictor.get_weather_ranges()
                
                # Get crops suitable for this soil type
                suitable_crops = soil_crop_pool.get(soil_data.texture, available_crops)
                
                # Filter by weather compatibility
                temp = self.weather.temperature_avg
                rain = self.weather.rainfall_mm
                
                candidate_crops = []
                for crop_name in suitable_crops:
                    if crop_name == intended_crop.name:
                        continue
                    
                    # Check weather compatibility
                    wr = weather_ranges.get(crop_name)
                    if wr and not (wr['T_min'] <= temp <= wr['T_max'] and wr['R_min'] <= rain <= wr['R_max']):
                        continue
                    
                    # Predict using model
                    prediction = model_predictor.predict_crop(
                        crop_name=crop_name,
                        region_name=self.farm.location,
                        soil_type=soil_data.texture,
                        farm_size_ha=self.farm.size_hectares,
                        temperature_c=temp,
                        rainfall_mm=rain
                    )
                    
                    if prediction:
                        # Calculate score from model predictions
                        model_risk = prediction['risk']
                        model_price = prediction['price']
                        model_yield = prediction['yield']
                        
                        # Convert to scores (0-100)
                        risk_score_alt = model_risk  # Already in percentage
                        price_score = min(100, (model_price / 200) * 100) if model_price > 0 else 0
                        yield_score_alt = min(100, (model_yield / 50) * 100) if model_yield > 0 else 0
                        
                        # Use same soil score calculation
                        from api.models import Crop as CropModel
                        try:
                            alt_crop_obj = CropModel.objects.get(name=crop_name)
                            soil_score_alt = self.calculate_soil_score(alt_crop_obj, soil_data)
                        except:
                            soil_score_alt = 70  # Default if crop not in DB
                        
                        # Calculate profit score
                        profit_per_ha_alt = (model_yield * model_price * 1000) - 50000
                        roi_alt = (profit_per_ha_alt / 50000) * 100 if profit_per_ha_alt > 0 else 0
                        profit_score_alt = min(100, max(0, 20 + roi_alt))
                        
                        # Calculate final score
                        weights = {'soil': 0.30, 'yield': 0.25, 'profit': 0.30, 'risk': 0.15}
                        alt_final_score = (
                            weights['soil'] * soil_score_alt +
                            weights['yield'] * yield_score_alt +
                            weights['profit'] * profit_score_alt -
                            weights['risk'] * risk_score_alt
                        )
                        
                        if alt_final_score > final_score:
                            candidate_crops.append({
                                'crop': crop_name,
                                'score': alt_final_score,
                                'risk': model_risk,
                                'price': model_price,
                                'yield': model_yield,
                                'roi': roi_alt,
                                'profit_per_ha': profit_per_ha_alt
                            })
                
                # Sort by score and take top 3
                candidate_crops.sort(key=lambda x: x['score'], reverse=True)
                
                for alt in candidate_crops[:3]:
                    alternatives.append({
                        'crop': alt['crop'],
                        'score': round(alt['score'], 1),
                        'reason': f"Better predicted score ({alt['score']:.1f} vs {final_score:.1f}) with lower risk ({alt['risk']:.1f}%)",
                        'details': {
                            'roi_percent': round(alt['roi'], 1),
                            'profit_per_ha': round(alt['profit_per_ha'], 0),
                            'oversupply_risk': round(alt['risk'], 1)
                        }
                    })
        
        # Build response with model predictions
        analysis = {
            'crop_name': intended_crop.name,
            'is_recommended': is_recommended,
            'confidence': confidence,
            'final_score': round(final_score, 1),
            'scores': {
                'soil': round(soil_score, 1),
                'yield': round(yield_score, 1),
                'profit': round(profit_score, 1),
                'risk': round(risk_score, 1)
            },
            'details': {
                'price_forecast': round(model_price, 2),  # From model (DA/kg)
                'yield_per_ha': round(model_yield_per_ha, 2),  # From model (tons/ha)
                'oversupply_risk': round(model_risk, 1)  # From model (percentage)
            },
            'recommended_area_ha': round(recommended_area_ha, 2),
            'roi_percent': round(roi, 1),
            'profit_per_ha': round(profit_per_ha, 0),
            'advice': advice,
            'alternatives': alternatives,
            'recommendation': self._get_recommendation_decision(is_recommended, final_score, risk_score, profit_score)
        }
        
        return analysis

    def _get_alternative_reason(self, alternative_rec, intended_score, intended_soil, intended_yield, intended_risk, intended_profit):
        """Generate reason why alternative is better"""
        reasons = []
        
        if alternative_rec['details']['soil_suitability'] > intended_soil + 10:
            reasons.append(f"Better soil compatibility ({alternative_rec['details']['soil_suitability']:.0f}% vs {intended_soil:.0f}%)")
        
        if alternative_rec['details']['yield_forecast'] > intended_yield + 10:
            reasons.append(f"Better yield forecast ({alternative_rec['details']['yield_forecast']:.0f}% vs {intended_yield:.0f}%)")
        
        if alternative_rec['details']['oversupply_risk'] < intended_risk - 20:
            reasons.append(f"Lower market risk ({alternative_rec['details']['oversupply_risk']:.0f}% vs {intended_risk:.0f}%)")
        
        if alternative_rec['details']['profitability'] > intended_profit + 10:
            reasons.append(f"Higher profitability ({alternative_rec['details']['profitability']:.0f}% vs {intended_profit:.0f}%)")
        
        if alternative_rec['details']['roi_percent'] > 50:
            reasons.append(f"Higher ROI ({alternative_rec['details']['roi_percent']:.0f}%)")
        
        if reasons:
            return "; ".join(reasons)
        else:
            return f"Overall better score ({alternative_rec['final_score']:.0f} vs {intended_score:.0f})"

    def _get_recommendation_decision(self, is_recommended, final_score, risk_score, profit_score):
        """Get recommendation decision text"""
        if is_recommended and final_score >= 80:
            return "Highly Recommended - Excellent conditions for this crop"
        elif is_recommended and final_score >= 70:
            return "Recommended - Good conditions, proceed with planting"
        elif is_recommended and final_score >= 60:
            return "Conditionally Recommended - Acceptable but consider alternatives"
        elif risk_score > 70:
            return "Not Recommended - High market risk detected"
        elif profit_score < 40:
            return "Not Recommended - Low profitability expected"
        else:
            return "Not Recommended - Better alternatives available"
