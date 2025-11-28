# AI-Powered Crop Advice Feature

## Overview

The system now uses **OpenAI** to generate intelligent, detailed advice about crops. The AI explains **why** a crop is good or not for the farmer's specific conditions, providing contextual, actionable recommendations.

## Key Features

### 1. **Intelligent Advice Generation**
- Uses OpenAI GPT models (default: `gpt-4o-mini`)
- Analyzes all factors comprehensively
- Provides natural language explanations
- Explains specific strengths and concerns

### 2. **Detailed Crop Analysis**
For the **intended crop** selected by the farmer, the AI provides:
- **Summary**: Brief overview of why crop is good/bad
- **Why Recommended/Not Recommended**: Detailed explanation
- **Strengths**: List of positive aspects
- **Concerns**: List of issues to address
- **Structured Advice**: Categorized, prioritized recommendations

### 3. **Automatic Fallback**
- If OpenAI API is unavailable → Uses rule-based advice
- If API fails → Falls back gracefully
- System always works, even without AI

## How It Works

### For Intended Crop Analysis

1. **Farmer selects crop** in farm form
2. **System analyzes** the crop with all factors:
   - Soil compatibility
   - Weather conditions
   - Market risk
   - Profitability
3. **AI generates advice** explaining:
   - Why it's recommended or not
   - Specific strengths
   - Specific concerns
   - Actionable recommendations
4. **Dashboard displays** comprehensive analysis

### Advice Structure

Each advice item includes:
```json
{
  "category": "critical|warning|recommendation|opportunity|info",
  "priority": 1-5,
  "title": "Clear title",
  "message": "Detailed explanation",
  "action": "Specific actionable step",
  "impact": "high|medium|positive|high_benefit|informational"
}
```

## Example Output

### Recommended Crop (Potato)

**Summary:**
"Potato is highly recommended for your farm. Your soil conditions are excellent (85% compatibility). Weather conditions are favorable (75% yield forecast). Profit potential is strong (80% profitability score)."

**Why Recommended:**
"Based on comprehensive analysis, Potato is recommended because: excellent soil compatibility (85%), favorable weather conditions (75% yield forecast), strong profit potential (80% profitability), low market risk (25%). With a final score of 78.5/100, this crop aligns well with your farm's conditions and market opportunities."

**Strengths:**
- Excellent soil pH match (6.5 vs optimal 6.0-6.5)
- Favorable rainfall forecast (550mm vs required 600mm)
- Strong market demand with good prices

**Concerns:**
- Slight rainfall deficit may require supplemental irrigation

### Not Recommended Crop (Wheat)

**Summary:**
"Wheat is not recommended for your farm. Soil compatibility is low (45%). Weather conditions are poor (35% yield forecast). Market risk is high (75%)."

**Why Not Recommended:**
"Based on comprehensive analysis, Wheat is not recommended because: poor soil compatibility (45%), unfavorable weather conditions (35% yield forecast), high market risk (75%), low profitability (40%). With a final score of 38.5/100, planting Wheat may result in lower yields, higher risks, or reduced profits compared to other options."

**Strengths:**
- None identified

**Concerns:**
- Soil pH too acidic for optimal growth
- Insufficient rainfall for crop requirements
- High market oversupply risk

## Setup

### 1. Get OpenAI API Key
- Visit: https://platform.openai.com/api-keys
- Create account and get API key

### 2. Set Environment Variable

**Windows:**
```powershell
$env:OPENAI_API_KEY="your-api-key-here"
```

**Linux/Mac:**
```bash
export OPENAI_API_KEY="your-api-key-here"
```

### 3. Optional: Choose Model
```bash
export OPENAI_MODEL=gpt-4o-mini  # Default (cheap, fast)
# or
export OPENAI_MODEL=gpt-4o  # Better quality, more expensive
```

### 4. Install Dependencies
```bash
pip install openai
```

## Benefits

✅ **More Intelligent**: AI understands context and relationships between factors
✅ **More Detailed**: Explains WHY, not just WHAT
✅ **More Natural**: Human-readable, conversational explanations
✅ **More Actionable**: Specific, practical advice tailored to the farmer
✅ **Always Works**: Graceful fallback ensures system reliability

## Cost

- **gpt-4o-mini**: ~$0.0003 per advice generation
- Very affordable for production use
- 1000 requests ≈ $0.30

## Technical Details

### AI Advice Generator
- Location: `backend/api/services/ai_advice_generator.py`
- Handles AI API calls
- Provides fallback to rule-based advice
- Converts AI response to structured format

### Integration
- Used in `SmartProductionPlanningEngine`
- Called for both intended crop and general recommendations
- Seamlessly integrated with existing recommendation system

## Troubleshooting

**AI not working?**
1. Check `OPENAI_API_KEY` is set
2. Check internet connection
3. Check OpenAI account has credits
4. System will automatically fallback to rule-based advice

**Advice seems generic?**
- AI may not be configured
- Check environment variables
- Check console for error messages

The system is designed to work with or without AI, ensuring reliability and availability.

