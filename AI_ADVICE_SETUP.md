# AI-Powered Advice Generation Setup

## Overview

The system now uses **OpenAI** (or similar AI models) to generate intelligent, contextual advice about crops. The AI analyzes all factors and provides detailed explanations of why a crop is good or not for the farmer's specific conditions.

## Features

### 1. **Intelligent Advice Generation**
- Uses OpenAI GPT models to generate natural language advice
- Analyzes all factors: soil, weather, market, profitability
- Provides detailed explanations of why crops are recommended or not
- Explains specific strengths and concerns

### 2. **Fallback System**
- If OpenAI API is unavailable or fails, automatically falls back to rule-based advice
- Ensures the system always works, even without AI
- Seamless transition between AI and rule-based advice

### 3. **Enhanced Advice Structure**
Each advice item includes:
- **Category**: critical, warning, recommendation, opportunity, info
- **Priority**: 1-5 (1 = most important)
- **Title**: Clear, descriptive title
- **Message**: Detailed explanation
- **Action**: Specific actionable step
- **Impact**: Level of impact (high, medium, positive, etc.)

## Setup Instructions

### 1. **Get OpenAI API Key**

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy the key

### 2. **Set Environment Variable**

**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY="your-api-key-here"
```

**Windows (Command Prompt):**
```cmd
set OPENAI_API_KEY=your-api-key-here
```

**Linux/Mac:**
```bash
export OPENAI_API_KEY="your-api-key-here"
```

**Or create a `.env` file in the `backend` directory:**
```
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

### 3. **Optional: Choose Model**

Default model is `gpt-4o-mini` (cheaper, faster). You can use:
- `gpt-4o-mini` - Recommended (cheap, fast, good quality)
- `gpt-4o` - Better quality but more expensive
- `gpt-3.5-turbo` - Cheaper alternative

Set via environment variable:
```bash
export OPENAI_MODEL=gpt-4o-mini
```

### 4. **Install Dependencies**

Already installed in `requirements.txt`:
```
openai>=1.0.0
```

If not installed:
```bash
pip install openai
```

## How It Works

### 1. **AI Analysis Process**

When a farmer selects an intended crop:

1. System collects all data:
   - Farm details (location, size, soil type, pH)
   - Analysis scores (soil, yield, profit, risk)
   - Weather conditions
   - Market data

2. AI receives comprehensive context:
   ```
   - Farm information
   - Analysis scores
   - Weather conditions
   - Market data
   - Recommendation status
   ```

3. AI generates structured advice:
   - Summary explanation
   - Strengths list
   - Concerns list
   - Detailed advice items
   - Why recommended/not recommended

### 2. **Advice Categories**

- **Critical** (Priority 1): Must address immediately
- **Warning** (Priority 2): Should address soon
- **Recommendation** (Priority 3): Best practices
- **Opportunity** (Priority 4): Potential benefits
- **Info** (Priority 5): General information

### 3. **Example AI Advice**

**For Recommended Crop:**
```json
{
  "summary": "Potato is highly recommended for your farm. Your soil conditions are excellent (85% compatibility). Weather conditions are favorable (75% yield forecast). Profit potential is strong (80% profitability score).",
  "why_recommended": "Based on comprehensive analysis, Potato is recommended because: excellent soil compatibility (85%), favorable weather conditions (75% yield forecast), strong profit potential (80% profitability), low market risk (25%). With a final score of 78.5/100, this crop aligns well with your farm's conditions and market opportunities.",
  "strengths": [
    "Excellent soil pH match (6.5 vs optimal 6.0-6.5)",
    "Favorable rainfall forecast (550mm vs required 600mm)",
    "Strong market demand with good prices"
  ],
  "concerns": [
    "Slight rainfall deficit may require supplemental irrigation"
  ]
}
```

**For Not Recommended Crop:**
```json
{
  "summary": "Wheat is not recommended for your farm. Soil compatibility is low (45%). Weather conditions are poor (35% yield forecast). Market risk is high (75%).",
  "why_recommended": "Based on comprehensive analysis, Wheat is not recommended because: poor soil compatibility (45%), unfavorable weather conditions (35% yield forecast), high market risk (75%), low profitability (40%). With a final score of 38.5/100, planting Wheat may result in lower yields, higher risks, or reduced profits compared to other options.",
  "strengths": [],
  "concerns": [
    "Soil pH too acidic for optimal growth",
    "Insufficient rainfall for crop requirements",
    "High market oversupply risk"
  ]
}
```

## Benefits

✅ **More Intelligent**: AI understands context and relationships
✅ **More Detailed**: Explains WHY, not just WHAT
✅ **More Natural**: Human-readable explanations
✅ **More Actionable**: Specific, practical advice
✅ **Always Works**: Falls back to rule-based if AI unavailable

## Cost Considerations

- **gpt-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- Average request: ~500 input tokens, ~300 output tokens
- Cost per advice generation: ~$0.0003 (very cheap)
- 1000 requests = ~$0.30

## Troubleshooting

### AI Not Working?

1. **Check API Key**: Ensure `OPENAI_API_KEY` is set correctly
2. **Check Internet**: OpenAI requires internet connection
3. **Check Balance**: Ensure your OpenAI account has credits
4. **Check Logs**: Look for error messages in console

### Fallback to Rule-Based

If AI fails, the system automatically uses rule-based advice. You'll see:
```
AI advice generation failed: [error], falling back to rule-based
```

This is normal and the system will continue working.

## Testing

To test if AI is working:

1. Set your API key
2. Create a farm with an intended crop
3. View recommendations
4. Check if advice is more detailed and contextual

If advice is generic/rule-based, AI may not be configured. Check environment variables and API key.

