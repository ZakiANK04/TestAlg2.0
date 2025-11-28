# Intended Crop Analysis Feature

## Overview

Farmers can now specify which crop they want to plant, and the AI will analyze it specifically, then recommend it or suggest better alternatives.

## How It Works

### 1. **Farmer Input**
- In the Farm Form, farmers can select an "Intended Crop" (optional field)
- Dropdown shows all available crops from the database
- Crop names are translated based on selected language

### 2. **Database Storage**
- The selected crop is stored in the `Farm` model as `intended_crop` (ForeignKey to Crop)
- This links the farmer's intention to their farm record

### 3. **AI Analysis**
When recommendations are requested:
- The AI engine analyzes the intended crop specifically using `analyze_intended_crop()` method
- Calculates all scores (soil, yield, profit, risk) for the intended crop
- Determines if it's recommended (threshold: score ≥ 60)
- Generates structured advice for the intended crop

### 4. **Decision Making**
The AI makes a recommendation decision:
- **Highly Recommended** (score ≥ 80): "Excellent conditions for this crop"
- **Recommended** (score ≥ 70): "Good conditions, proceed with planting"
- **Conditionally Recommended** (score ≥ 60): "Acceptable but consider alternatives"
- **Not Recommended** (score < 60 or high risk): "Better alternatives available"

### 5. **Alternative Suggestions**
If the intended crop is not recommended or score < 70:
- AI finds top 3 alternative crops with better scores
- Explains why each alternative is better:
  - Better soil compatibility
  - Better yield forecast
  - Lower market risk
  - Higher profitability
  - Higher ROI

## Response Structure

```json
{
  "recommendations": [...],  // All crop recommendations
  "intended_crop_analysis": {
    "crop_name": "Potato",
    "is_recommended": true/false,
    "confidence": "high/medium/low",
    "final_score": 75.5,
    "scores": {
      "soil": 85.0,
      "yield": 70.0,
      "profit": 80.0,
      "risk": 30.0
    },
    "recommended_area_ha": 5.3,
    "roi_percent": 120.5,
    "profit_per_ha": 150000,
    "advice": [...],  // Structured advice
    "alternatives": [
      {
        "crop": "Tomato",
        "score": 82.3,
        "reason": "Better soil compatibility (90% vs 85%); Higher profitability (85% vs 80%)",
        "details": {...}
      }
    ],
    "recommendation": "Recommended - Good conditions, proceed with planting"
  }
}
```

## Frontend Display

### Intended Crop Analysis Card
- **Green card** if recommended
- **Red card** if not recommended
- Shows:
  - Crop name
  - Recommendation status (Recommended/Not Recommended)
  - Final score with confidence level
  - Score breakdown (Soil, Yield, Profit, Risk)
  - AI advice (top 3 items)
  - Alternative crops (if not recommended)

### Alternative Crops Section
- Shows up to 3 better alternatives
- Each alternative displays:
  - Crop name
  - Score
  - Reason why it's better
  - ROI, Profit, Risk metrics

## Benefits

✅ **Personalized Analysis**: Farmer's intended crop gets specific analysis
✅ **Informed Decisions**: Clear recommendation with reasoning
✅ **Better Alternatives**: AI suggests better options if needed
✅ **Risk Mitigation**: Prevents planting unsuitable crops
✅ **Profit Optimization**: Guides farmers to more profitable crops

## Example Flow

1. **Farmer selects**: "Potato" as intended crop
2. **AI analyzes**: 
   - Soil compatibility: 85%
   - Yield forecast: 70%
   - Profitability: 80%
   - Market risk: 30%
   - Final score: 75.5
3. **AI decision**: "Recommended - Good conditions, proceed with planting"
4. **If not recommended**: Shows alternatives like "Tomato (82.3)" with reasons

This feature helps farmers make better decisions by analyzing their specific crop choice and providing intelligent alternatives when needed.

