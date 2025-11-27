import random

class SmartProductionPlanningEngine:
    def __init__(self, farm, weather_forecast, market_data):
        self.farm = farm
        self.weather = weather_forecast
        self.market = market_data

    def calculate_soil_score(self, crop, soil_data):
        """
        Step 1: Soil Suitability Scoring
        Simple weighted match of pH and texture.
        """
        score = 100
        
        # pH penalty
        avg_ph = (crop.ideal_ph_min + crop.ideal_ph_max) / 2
        ph_diff = abs(soil_data.ph_level - avg_ph)
        if ph_diff > 1.0:
            score -= 30
        elif ph_diff > 0.5:
            score -= 10
            
        # Texture penalty (Simplified: assume crop prefers Loam)
        if "Loam" not in soil_data.texture and "Sand" in soil_data.texture and crop.water_requirement_mm > 500:
            score -= 20 # Sandy soil bad for thirsty crops
            
        return max(0, score)

    def calculate_yield_score(self, crop):
        """
        Step 2: Weather Yield Prediction
        f(rainfall, temp)
        """
        # Mock logic: if rainfall is within +/- 20% of requirement, high yield
        rainfall_diff = abs(self.weather.rainfall_mm - crop.water_requirement_mm)
        percent_diff = rainfall_diff / crop.water_requirement_mm
        
        if percent_diff < 0.1:
            return 95 # Excellent
        elif percent_diff < 0.3:
            return 80 # Good
        elif percent_diff < 0.5:
            return 50 # Poor
        else:
            return 20 # Failure risk

    def calculate_risk_score(self, crop_market_data):
        """
        Step 3: Over-Supply Risk Model (Cobweb)
        High supply + High previous price = High Risk
        """
        # If supply is high relative to demand
        supply_demand_ratio = crop_market_data.supply_volume_tons / (crop_market_data.demand_index * 1000) # arbitrary scale
        
        risk = 0
        if supply_demand_ratio > 1.2:
            risk = 90 # High risk of glut
        elif supply_demand_ratio > 1.0:
            risk = 60
        else:
            risk = 20 # Safe
            
        return risk

    def calculate_profitability(self, crop, yield_score, market_data):
        """
        Step 4: Profitability Model
        Profit = Yield * Price - Cost
        """
        expected_yield = crop.base_yield_per_ha * (yield_score / 100.0)
        revenue = expected_yield * market_data.price_per_kg * 1000 # tons to kg
        cost = 50000 # Mock cost per ha in DA
        profit = revenue - cost
        
        # Normalize to 0-100 score (mock normalization)
        profit_score = min(100, max(0, profit / 1000)) 
        return profit_score

    def get_recommendations(self):
        """
        Step 5: Final Decision
        """
        results = []
        soil_data = self.farm.soil_samples.last()
        if not soil_data:
            # Create a mock soil data object for on-the-fly analysis if real data missing
            # This allows the "Soil Type" input from the form to work immediately
            class MockSoil:
                def __init__(self, texture):
                    self.texture = texture
                    self.ph_level = 6.5 # Default neutral
            
            soil_data = MockSoil(self.farm.soil_type)

        print(f"DEBUG: Using Soil Data - Texture: {soil_data.texture}, pH: {soil_data.ph_level}")

        # Iterate over all crops in market data
        # In real app, we'd query all crops
        for m_data in self.market:
            crop = m_data.crop
            soil_score = self.calculate_soil_score(crop, soil_data)
            yield_score = self.calculate_yield_score(crop)
            risk_score = self.calculate_risk_score(m_data)
            profit_score = self.calculate_profitability(crop, yield_score, m_data)

            # Weighted Final Score
            # Final = 0.3*Soil + 0.2*Yield + 0.3*Profit - 0.2*Risk
            final_score = (0.3 * soil_score) + (0.2 * yield_score) + (0.3 * profit_score) - (0.2 * risk_score)
            
            print(f"DEBUG: Crop: {crop.name}, SoilScore: {soil_score}, Final: {final_score}")

            # Calculate recommended planting area and quantity
            # Recommend planting 70% of farm for top crops, scaled by score
            recommended_area_ha = self.farm.size_hectares * 0.7 * (final_score / 100)
            expected_yield_tons = recommended_area_ha * crop.base_yield_per_ha
            expected_revenue = expected_yield_tons * 1000 * m_data.price_per_kg  # Convert tons to kg

            results.append({
                "crop": crop.name,
                "final_score": round(final_score, 1),
                "details": {
                    "soil_suitability": round(soil_score, 1),
                    "yield_forecast": round(yield_score, 1),
                    "profitability": round(profit_score, 1),
                    "oversupply_risk": round(risk_score, 1),
                    "price_forecast": round(m_data.price_per_kg, 2),
                    "recommended_area_ha": round(recommended_area_ha, 2),
                    "expected_yield_tons": round(expected_yield_tons, 2),
                    "expected_revenue_da": round(expected_revenue, 2)
                }
            })
            
        # Sort by final score
        results.sort(key=lambda x: x['final_score'], reverse=True)
        return results
