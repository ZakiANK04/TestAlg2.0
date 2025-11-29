import os
import json
import re
from typing import Dict, List, Optional

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

# Get API key from environment - try loading from .env file first
from pathlib import Path
from dotenv import load_dotenv

# Load .env file if it exists
BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_path = BASE_DIR / '.env'
load_dotenv(dotenv_path=env_path, override=True)

# Get API key from environment
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
OPENAI_MODEL = os.environ.get('OPENAI_MODEL', 'gpt-4o-mini')  # Use cheaper model by default

# Debug: Print status (only if key is set to avoid exposing keys)
if OPENAI_API_KEY:
    print(f"✅ OpenAI API key found, model: {OPENAI_MODEL}")
else:
    print("⚠️  WARNING: OPENAI_API_KEY not found in environment. AI advice will use rule-based fallback.")

class AIAdviceGenerator:
    """
    Generate intelligent, contextual advice using AI models
    Falls back to rule-based if AI is unavailable
    """
    
    # Crop name translations
    CROP_TRANSLATIONS = {
        'en': {
            'Potato': 'Potato',
            'Carrot': 'Carrot',
            'Onion': 'Onion',
            'Tomato': 'Tomato',
            'Wheat': 'Wheat',
            'Barley': 'Barley',
            'Corn': 'Corn',
            'Lettuce': 'Lettuce',
            'Pepper': 'Pepper',
            'Eggplant': 'Eggplant',
            'Cucumber': 'Cucumber',
            'Zucchini': 'Zucchini',
            'Beans': 'Beans',
            'Peas': 'Peas',
            'Cabbage': 'Cabbage',
            'Broccoli': 'Broccoli',
            'Cauliflower': 'Cauliflower',
            'Spinach': 'Spinach',
            'Radish': 'Radish',
            'Beetroot': 'Beetroot',
            'Strawberry': 'Strawberry',
        },
        'fr': {
            'Potato': 'Pomme de terre',
            'Carrot': 'Carotte',
            'Onion': 'Oignon',
            'Tomato': 'Tomate',
            'Wheat': 'Blé',
            'Barley': 'Orge',
            'Corn': 'Maïs',
            'Lettuce': 'Laitue',
            'Pepper': 'Poivron',
            'Eggplant': 'Aubergine',
            'Cucumber': 'Concombre',
            'Zucchini': 'Courgette',
            'Beans': 'Haricots',
            'Peas': 'Pois',
            'Cabbage': 'Chou',
            'Broccoli': 'Brocoli',
            'Cauliflower': 'Chou-fleur',
            'Spinach': 'Épinards',
            'Radish': 'Radis',
            'Beetroot': 'Betterave',
            'Strawberry': 'Fraise',
        },
        'ar': {
            'Potato': 'بطاطا',
            'Carrot': 'جزر',
            'Onion': 'بصل',
            'Tomato': 'طماطم',
            'Wheat': 'قمح',
            'Barley': 'شعير',
            'Corn': 'ذرة',
            'Lettuce': 'خس',
            'Pepper': 'فلفل',
            'Eggplant': 'باذنجان',
            'Cucumber': 'خيار',
            'Zucchini': 'كوسة',
            'Beans': 'فاصوليا',
            'Peas': 'بازلاء',
            'Cabbage': 'ملفوف',
            'Broccoli': 'بروكلي',
            'Cauliflower': 'قرنبيط',
            'Spinach': 'سبانخ',
            'Radish': 'فجل',
            'Beetroot': 'شمندر',
            'Strawberry': 'فراولة',
        }
    }
    
    def __init__(self, language='en'):
        self.language = language  # Store language for multi-language support
        self.client = None
        if OPENAI_AVAILABLE and OPENAI_API_KEY:
            try:
                self.client = OpenAI(api_key=OPENAI_API_KEY)
                self.ai_enabled = True
                print(f"✅ AI Advice Generator initialized with OpenAI (language: {language})")
            except Exception as e:
                print(f"❌ Failed to initialize OpenAI client: {e}")
                self.ai_enabled = False
        else:
            if not OPENAI_AVAILABLE:
                print("⚠️  OpenAI library not available. Install with: pip install openai")
            elif not OPENAI_API_KEY:
                print("⚠️  OPENAI_API_KEY not set. Set it in .env file or environment variables.")
            self.ai_enabled = False
    
    def generate_crop_advice(self, crop_name: str, farm_data: Dict, analysis_scores: Dict, 
                             weather_data: Dict, market_data: Dict, is_recommended: bool) -> List[Dict]:
        """
        Generate AI-powered advice for a specific crop
        """
        if self.ai_enabled:
            try:
                print(f"🤖 Generating AI advice for {crop_name} (recommended: {is_recommended})")
                advice = self._generate_with_ai(crop_name, farm_data, analysis_scores, 
                                             weather_data, market_data, is_recommended)
                print(f"✅ AI advice generated successfully: {len(advice)} items")
                return advice
            except Exception as e:
                print(f"❌ AI advice generation failed: {e}, falling back to rule-based")
                import traceback
                traceback.print_exc()
                return self._generate_rule_based(crop_name, farm_data, analysis_scores, 
                                                weather_data, market_data, is_recommended)
        else:
            print(f"⚠️  AI not enabled, using rule-based advice for {crop_name}")
            return self._generate_rule_based(crop_name, farm_data, analysis_scores, 
                                            weather_data, market_data, is_recommended)
    
    def _generate_language_prompt(self, crop_name: str, farm_data: Dict, analysis_scores: Dict,
                                  weather_data: Dict, market_data: Dict, is_recommended: bool,
                                  location: str, is_desert: bool, soil_type: str, temp: float, rainfall: float) -> str:
        """
        Generate language-specific prompt with all instructions in target language
        """
        # Calculate oversupply risk (boolean)
        is_oversupply_high = market_data.get('supply_volume_tons', 0) / (market_data.get('demand_index', 1.0) * 1000) > 1.2
        
        if self.language == 'fr':
            # French translations
            oversupply_risk = 'ÉLEVÉ' if is_oversupply_high else 'FAIBLE'
            recommendation_status = 'RECOMMANDÉ' if is_recommended else 'NON RECOMMANDÉ'
            low_suitable = '(FAIBLE - NON ADAPTÉ)'
            very_low = '(TRÈS FAIBLES - CONDITIONS DÉSERTIQUES)'
            very_high = '(TRÈS ÉLEVÉE - RISQUE DE STRESS THERMIQUE)'
            desert_region = '(RÉGION DÉSERTIQUE - CONTRAINTES STRICTES)'
            sand_soil = "(SOL SABLEUX - FAIBLE RÉTENTION D'EAU)"
            high_risk = '(RISQUE ÉLEVÉ - ÉVITER LA SURPRODUCTION)'
            # French prompt
            return f"""Vous êtes un conseiller agricole expert et STRICT aidant un agriculteur en Algérie à décider s'il doit planter {crop_name}.

CRITIQUE : Votre objectif principal est de PRÉVENIR LA SURPRODUCTION et d'aider les agriculteurs à prendre de MEILLEURES DÉCISIONS. Soyez STRICT concernant les conditions inadaptées.

INFORMATIONS SUR LA FERME :
- Localisation : {location} {desert_region if is_desert else ''}
- Taille de la ferme : {farm_data.get('size_hectares', 0)} hectares
- Type de sol : {soil_type} {(sand_soil if soil_type.lower() == 'sand' else '')}
- pH du sol : {farm_data.get('ph_level', 6.5)}

SCORES D'ANALYSE :
- Compatibilité du sol : {analysis_scores.get('soil', 0)}/100 {(low_suitable if analysis_scores.get('soil', 0) < 50 else '')}
- Prévision de rendement : {analysis_scores.get('yield', 0)}/100
- Rentabilité : {analysis_scores.get('profit', 0)}/100
- Risque de marché : {analysis_scores.get('risk', 0)}/100 {(high_risk if analysis_scores.get('risk', 0) > 50 else '')}
- Score final : {analysis_scores.get('final_score', 0)}/100

CONDITIONS MÉTÉOROLOGIQUES :
- Précipitations : {rainfall}mm {(very_low if rainfall < 200 else '')}
- Température : {temp}°C {(very_high if temp > 30 else '')}
- Humidité : {weather_data.get('humidity_avg', 60)}%

DONNÉES DU MARCHÉ :
- Prix : {market_data.get('price_per_kg', 0)} DA/kg
- Indice de demande : {market_data.get('demand_index', 1.0)}
- Volume d'approvisionnement : {market_data.get('supply_volume_tons', 0)} tonnes
- RISQUE DE SURPRODUCTION : {oversupply_risk}

RECOMMANDATION : {recommendation_status}

RÈGLES STRICTES :
1. Si la localisation est DÉSERTIQUE (Biskra, Adrar, etc.) et que la culture nécessite beaucoup d'eau (comme la Fraise) → FORTEMENT NON RECOMMANDÉ
2. Si le sol est SABLEUX et que la culture nécessite beaucoup d'eau → NON ADAPTÉ
3. Si la température > 30°C et que la culture est sensible à la chaleur (comme la Fraise, la Laitue) → NON ADAPTÉ
4. Si les précipitations < 300mm et que la culture nécessite > 400mm → NON ADAPTÉ sans irrigation extensive
5. Si le risque de marché > 50% (surproduction) → FORTEMENT NON RECOMMANDÉ pour prévenir la surproduction
6. Soyez HONNÊTE et STRICT - ne recommandez pas de cultures inadaptées même si la rentabilité semble élevée

Générez des conseils détaillés et actionnables au format JSON avec la structure suivante :
IMPORTANT : Les noms de champs JSON (summary, strengths, etc.) restent en anglais, mais TOUT LE CONTENU doit être en français.
CRITIQUE : Fournissez UNIQUEMENT DES CONSEILS TEXTUELS - n'incluez PAS de valeurs numériques, montants de profit, scores, pourcentages ou métriques calculées. Concentrez-vous sur des explications qualitatives, des recommandations et des conseils actionnables.

{{
  "summary": "Résumé bref de 2-3 phrases en FRANÇAIS expliquant pourquoi cette culture est bonne/mauvaise pour cette ferme (PAS DE NOMBRES - seulement explication qualitative)",
  "strengths": ["Liste en FRANÇAIS des aspects positifs (PAS DE NOMBRES - seulement texte descriptif)"],
  "concerns": ["Liste en FRANÇAIS des préoccupations ou problèmes (PAS DE NOMBRES - seulement texte descriptif)"],
  "advice": [
    {{
      "category": "critical|warning|recommendation|opportunity|info",
      "priority": 1-5,
      "title": "Titre en FRANÇAIS du conseil (PAS DE NOMBRES)",
      "message": "Explication détaillée en FRANÇAIS (PAS DE NOMBRES - seulement conseil qualitatif)",
      "action": "Étape actionnable spécifique en FRANÇAIS (PAS DE NOMBRES)",
      "impact": "high|medium|positive|high_benefit|informational"
    }}
  ],
  "why_recommended": "Explication détaillée en FRANÇAIS de pourquoi cette culture est recommandée ou non (PAS DE NOMBRES - seulement explication qualitative)",
  "key_factors": ["Facteur 1 en FRANÇAIS (PAS DE NOMBRES)", "Facteur 2 en FRANÇAIS (PAS DE NOMBRES)", "Facteur 3 en FRANÇAIS (PAS DE NOMBRES)"]
}}

Soyez spécifique, pratique et concentrez-vous sur des conseils actionnables. Écrivez TOUT en français clair et professionnel. Rappelez-vous : TOUT le contenu (summary, strengths, concerns, advice messages, why_recommended, key_factors) doit être en FRANÇAIS et ne doit PAS contenir de valeurs numériques, montants de profit, scores ou métriques calculées. Seuls les noms de champs JSON restent en anglais.
"""
        
        elif self.language == 'ar':
            # Arabic translations
            oversupply_risk = 'عالي' if is_oversupply_high else 'منخفض'
            recommendation_status = 'موصى به' if is_recommended else 'غير موصى به'
            low_suitable = '(منخفضة - غير مناسبة)'
            very_low = '(منخفض جدًا - ظروف صحراوية)'
            very_high = '(عالية جدًا - خطر الإجهاد الحراري)'
            desert_region = '(منطقة صحراوية - قيود صارمة)'
            sand_soil = '(تربة رملية - احتفاظ ضعيف بالماء)'
            high_risk = '(مخاطر عالية - تجنب الإفراط في الإنتاج)'
            
            # Arabic prompt
            return f"""أنت مستشار زراعي خبير وصارم يساعد مزارعًا في الجزائر في اتخاذ قرار بشأن زراعة {crop_name}.

⚠️ تحذير حرج: يجب أن تجيب بالعربية فقط. جميع نصائحك، شروحاتك، توصياتك، الملخصات، النقاط القوية، المخاوف، الرسائل والعوامل الرئيسية يجب أن تكون بالعربية. لا تجب أبدًا بالإنجليزية أو الفرنسية.

حرج: هدفك الأساسي هو منع الإفراط في الإنتاج ومساعدة المزارعين على اتخاذ قرارات أفضل. كن صارمًا بشأن الظروف غير المناسبة.

معلومات المزرعة:
- الموقع: {location} {desert_region if is_desert else ''}
- حجم المزرعة: {farm_data.get('size_hectares', 0)} هكتار
- نوع التربة: {soil_type} {(sand_soil if soil_type.lower() == 'sand' else '')}
- درجة حموضة التربة: {farm_data.get('ph_level', 6.5)}

نتائج التحليل:
- ملاءمة التربة: {analysis_scores.get('soil', 0)}/100 {(low_suitable if analysis_scores.get('soil', 0) < 50 else '')}
- توقع الإنتاج: {analysis_scores.get('yield', 0)}/100
- الربحية: {analysis_scores.get('profit', 0)}/100
- مخاطر السوق: {analysis_scores.get('risk', 0)}/100 {(high_risk if analysis_scores.get('risk', 0) > 50 else '')}
- النتيجة النهائية: {analysis_scores.get('final_score', 0)}/100

الظروف الجوية:
- هطول الأمطار: {rainfall}مم {(very_low if rainfall < 200 else '')}
- درجة الحرارة: {temp}°م {(very_high if temp > 30 else '')}
- الرطوبة: {weather_data.get('humidity_avg', 60)}%

بيانات السوق:
- السعر: {market_data.get('price_per_kg', 0)} دج/كجم
- مؤشر الطلب: {market_data.get('demand_index', 1.0)}
- حجم العرض: {market_data.get('supply_volume_tons', 0)} طن
- خطر الإفراط في الإنتاج: {oversupply_risk}

التوصية: {recommendation_status}

قواعد صارمة:
1. إذا كان الموقع صحراويًا (بسكرة، أدرار، إلخ) وتتطلب المحصول الكثير من الماء (مثل الفراولة) → غير موصى به بشدة
2. إذا كانت التربة رملية وتحتاج المحصول الكثير من الماء → غير مناسبة
3. إذا كانت درجة الحرارة > 30°م والمحصول حساس للحرارة (مثل الفراولة، الخس) → غير مناسبة
4. إذا كان هطول الأمطار < 300مم والمحصول يحتاج > 400مم → غير مناسبة بدون ري واسع النطاق
5. إذا كان خطر السوق > 50% (إفراط في الإنتاج) → غير موصى به بشدة لمنع الإفراط في الإنتاج
6. كن صادقًا وصارمًا - لا توصي بمحاصيل غير مناسبة حتى لو بدت الربحية عالية

قم بإنشاء نصائح مفصلة وقابلة للتنفيذ بتنسيق JSON بالهيكل التالي:
مهم: أسماء الحقول JSON (summary, strengths, etc.) تبقى بالإنجليزية، لكن كل المحتوى يجب أن يكون بالعربية.
حرج: قدم نصيحة نصية فقط - لا تدرج قيمًا رقمية أو مبالغ ربح أو درجات أو نسب مئوية أو مقاييس محسوبة. ركز على التفسيرات النوعية والتوصيات والإرشادات القابلة للتنفيذ فقط.

{{
  "summary": "ملخص موجز من 2-3 جملة بالعربية يشرح لماذا هذا المحصول جيد/سيء لهذه المزرعة (بدون أرقام - فقط تفسير نوعي)",
  "strengths": ["قائمة بالعربية للجوانب الإيجابية (بدون أرقام - فقط نص وصفي)"],
  "concerns": ["قائمة بالعربية للمخاوف أو المشاكل (بدون أرقام - فقط نص وصفي)"],
  "advice": [
    {{
      "category": "critical|warning|recommendation|opportunity|info",
      "priority": 1-5,
      "title": "عنوان النصيحة بالعربية (بدون أرقام)",
      "message": "شرح مفصل بالعربية (بدون أرقام - فقط نصيحة نوعية)",
      "action": "خطوة قابلة للتنفيذ محددة بالعربية (بدون أرقام)",
      "impact": "high|medium|positive|high_benefit|informational"
    }}
  ],
  "why_recommended": "شرح مفصل بالعربية لسبب توصية هذا المحصول أو عدم التوصية به (بدون أرقام - فقط تفسير نوعي)",
  "key_factors": ["العامل 1 بالعربية (بدون أرقام)", "العامل 2 بالعربية (بدون أرقام)", "العامل 3 بالعربية (بدون أرقام)"]
}}

كن محددًا وعمليًا وركز على نصائح قابلة للتنفيذ. اكتب كل المحتوى بالعربية بشكل واضح ومهني. تذكر: كل المحتوى (summary, strengths, concerns, advice messages, why_recommended, key_factors) يجب أن يكون بالعربية ولا يجب أن يحتوي على قيم رقمية أو مبالغ ربح أو درجات أو مقاييس محسوبة. فقط أسماء الحقول JSON تبقى بالإنجليزية.
"""
        
        else:
            # English translations
            oversupply_risk = 'HIGH' if is_oversupply_high else 'LOW'
            recommendation_status = 'RECOMMENDED' if is_recommended else 'NOT RECOMMENDED'
            low_suitable = '(LOW - NOT SUITABLE)'
            very_low = '(VERY LOW - DESERT CONDITIONS)'
            very_high = '(VERY HIGH - HEAT STRESS RISK)'
            desert_region = '(DESERT REGION - STRICT CONSTRAINTS)'
            sand_soil = '(SAND SOIL - POOR WATER RETENTION)'
            high_risk = '(HIGH RISK - AVOID OVERSUPPLY)'
            
            # English prompt (default)
            # Get model predictions
            price_forecast = analysis_scores.get('price_forecast', market_data.get('price_per_kg', 0))
            yield_forecast = analysis_scores.get('yield_per_ha', 0)
            oversupply_risk_pct = analysis_scores.get('oversupply_risk', market_data.get('oversupply_risk', 0))
            
            return f"""You are a STRICT expert agricultural advisor helping a farmer in Algeria decide whether to plant {crop_name}.

⚠️ CRITICAL WARNING: You MUST respond ONLY in ENGLISH. All your advice, explanations, recommendations, summaries, strengths, concerns, messages, and key factors MUST be written in ENGLISH. Never respond in French or Arabic.

CRITICAL: Your primary goal is to PREVENT OVERSUPPLY and help farmers make BETTER DECISIONS. Be STRICT about unsuitable conditions. Base your advice on the AI model predictions (price, yield, oversupply risk) and farm conditions (region, soil, weather).

MODEL PREDICTIONS (AI Model Output):
- Price Forecast: {price_forecast:.2f} DA/kg
- Yield Forecast: {yield_forecast:.2f} tons/hectare
- Oversupply Risk: {oversupply_risk_pct:.1f}% {(high_risk if oversupply_risk_pct > 50 else '')}

FARM CONDITIONS:
- Location: {location} {desert_region if is_desert else ''}
- Farm Size: {farm_data.get('size_hectares', 0)} hectares
- Soil Type: {soil_type} {(sand_soil if soil_type.lower() == 'sand' else '')}
- Soil pH: {farm_data.get('ph_level', 6.5)}
- Year: {weather_data.get('year', 'Current')}
- Month: {weather_data.get('month', 'Current')}

WEATHER CONDITIONS:
- Rainfall: {rainfall}mm {(very_low if rainfall < 200 else '')}
- Temperature: {temp}°C {(very_high if temp > 30 else '')}
- Humidity: {weather_data.get('humidity_avg', 60)}%

RECOMMENDATION: {recommendation_status}

STRICT RULES (Based on Model Predictions and Farm Conditions):
1. If location is DESERT (Biskra, Adrar, etc.) and crop requires high water (like Strawberry) → STRONGLY NOT RECOMMENDED
2. If soil is SAND and crop needs high water → NOT SUITABLE
3. If temperature > 30°C and crop is heat-sensitive (like Strawberry, Lettuce) → NOT SUITABLE
4. If rainfall < 300mm and crop needs > 400mm → NOT SUITABLE without extensive irrigation
5. If oversupply risk > 50% (from model prediction) → STRONGLY NOT RECOMMENDED to prevent oversupply
6. Consider the model's price forecast ({price_forecast:.2f} DA/kg), yield forecast ({yield_forecast:.2f} tons/ha), and oversupply risk ({oversupply_risk_pct:.1f}%) when giving advice
7. Be HONEST and STRICT - do not recommend unsuitable crops based on region, soil, weather, and oversupply risk

Generate detailed, actionable advice in JSON format with the following structure:
IMPORTANT: The JSON field names (summary, strengths, etc.) stay in English, but ALL CONTENT must be in English.
CRITICAL: Provide ONLY TEXT ADVICE - do NOT include numerical values, profit amounts, scores, percentages, or calculated metrics. Focus on qualitative explanations, recommendations, and actionable guidance.

{{
  "summary": "Brief 2-3 sentence summary in ENGLISH explaining why this crop is good/bad for this farm (NO NUMBERS - only qualitative explanation)",
  "strengths": ["List in ENGLISH of positive aspects (NO NUMBERS - only descriptive text)"],
  "concerns": ["List in ENGLISH of concerns or issues (NO NUMBERS - only descriptive text)"],
  "advice": [
    {{
      "category": "critical|warning|recommendation|opportunity|info",
      "priority": 1-5,
      "title": "Advice title in ENGLISH (NO NUMBERS)",
      "message": "Detailed explanation in ENGLISH (NO NUMBERS - only qualitative advice)",
      "action": "Specific actionable step in ENGLISH (NO NUMBERS)",
      "impact": "high|medium|positive|high_benefit|informational"
    }}
  ],
  "why_recommended": "Detailed explanation in ENGLISH of why this crop is recommended or not (NO NUMBERS - only qualitative explanation)",
  "key_factors": ["Factor 1 in ENGLISH (NO NUMBERS)", "Factor 2 in ENGLISH (NO NUMBERS)", "Factor 3 in ENGLISH (NO NUMBERS)"]
}}

Be specific, practical, and focus on actionable advice. Write ALL content in clear, professional English language. Remember: ALL content (summary, strengths, concerns, advice messages, why_recommended, key_factors) must be in ENGLISH and must NOT contain numerical values, profit amounts, scores, or calculated metrics. Only the JSON field names stay in English.
"""
    
    def _generate_with_ai(self, crop_name: str, farm_data: Dict, analysis_scores: Dict,
                          weather_data: Dict, market_data: Dict, is_recommended: bool) -> List[Dict]:
        """
        Generate advice using OpenAI API - TWO STEP PROCESS:
        1. Generate advice in English
        2. Translate to target language if needed
        """
        # Prepare context for AI (always in English first)
        location = farm_data.get('location', 'Unknown')
        is_desert = any(desert.lower() in location.lower() for desert in ['biskra', 'adrar', 'tamanrasset', 'illizi', 'béchar', 'tindouf', 'el oued', 'ouargla', 'ghardaïa', 'laghouat'])
        soil_type = farm_data.get('soil_type', 'Unknown')
        temp = weather_data.get('temperature_avg', 20)
        rainfall = weather_data.get('rainfall_mm', 0)
        
        # Generate English prompt (always generate in English first)
        context = self._generate_english_prompt(
            crop_name, farm_data, analysis_scores, weather_data, 
            market_data, is_recommended, location, is_desert, 
            soil_type, temp, rainfall
        )
        
        print(f"🔍 DEBUG: Generating advice in English first, then translating to: {self.language}")
        
        # System message (always in English for generation)
        system_message = "You are a STRICT expert agricultural advisor specializing in crop recommendations for Algerian farmers. Your PRIMARY GOAL is to PREVENT OVERSUPPLY and help farmers make BETTER DECISIONS. Be HONEST and STRICT - do NOT recommend crops that are unsuitable for the region, climate, or soil conditions, even if profitability seems high. Always prioritize avoiding oversupply and unsuitable conditions over short-term profit. CRITICAL: When a crop is NOT RECOMMENDED, you MUST provide detailed explanations explaining WHY based on the model predictions (oversupply risk percentage, predicted yield, predicted price). Reference these specific values in your explanations (e.g., 'The model predicts 75% oversupply risk, indicating severe market saturation'). IMPORTANT: Provide ONLY TEXT ADVICE - you can reference model values to explain reasons, but do NOT include detailed numerical calculations. The numerical data (price, yield, risk) is already displayed separately. Your role is to provide qualitative advice, recommendations, and explanations that help farmers understand WHY a crop is or isn't recommended. Respond in clear, professional English."
        
        # Step 1: Generate advice in English
        response = self.client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": context}
            ],
            temperature=0.7,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )
        
        ai_response = json.loads(response.choices[0].message.content)
        
        # Step 2: Translate to target language if not English
        if self.language != 'en':
            ai_response = self._translate_advice_response(ai_response)
        
        # Convert AI response to structured advice format
        advice_list = []
        
        # Add summary as info
        if ai_response.get('summary'):
            advice_list.append({
                'category': 'info',
                'priority': 5,
                'title': self._translate_text('Analysis Summary'),
                'message': ai_response['summary'],
                'action': self._translate_text('Review the detailed analysis below'),
                'impact': 'informational'
            })
        
        # Add why recommended/not recommended
        if ai_response.get('why_recommended'):
            title = self._translate_text('Why Recommended') if is_recommended else self._translate_text('Why Not Recommended')
            advice_list.append({
                'category': 'recommendation' if is_recommended else 'warning',
                'priority': 2 if is_recommended else 1,
                'title': title,
                'message': ai_response['why_recommended'],
                'action': self._translate_text('Consider this analysis when making your decision'),
                'impact': 'high' if not is_recommended else 'positive'
            })
        
        # Add strengths
        if ai_response.get('strengths'):
            for strength in ai_response['strengths']:
                advice_list.append({
                    'category': 'opportunity',
                    'priority': 4,
                    'title': self._translate_text('Strength'),
                    'message': strength,
                    'action': self._translate_text('Leverage this advantage'),
                    'impact': 'positive'
                })
        
        # Add concerns - CRITICAL for non-recommended crops
        if ai_response.get('concerns'):
            for concern in ai_response['concerns']:
                advice_list.append({
                    'category': 'warning' if not is_recommended else 'info',
                    'priority': 1 if not is_recommended else 2,  # Higher priority for non-recommended
                    'title': self._translate_text('Concern') if not is_recommended else self._translate_text('Consideration'),
                    'message': concern,
                    'action': self._translate_text('Address this issue before planting') if not is_recommended else self._translate_text('Monitor this factor'),
                    'impact': 'high' if not is_recommended else 'medium'
                })
        
        # If crop is NOT RECOMMENDED and no concerns were provided, add a default concern based on model values
        if not is_recommended and not ai_response.get('concerns'):
            oversupply_risk = market_data.get('oversupply_risk', 0)
            yield_per_ha = market_data.get('yield_per_ha', 0)
            price_per_kg = market_data.get('price_per_kg', 0)
            
            concern_messages = []
            if oversupply_risk > 50:
                concern_messages.append(f"The model predicts {oversupply_risk:.1f}% oversupply risk, indicating high market saturation risk.")
            if yield_per_ha < 2:
                concern_messages.append(f"Predicted yield is {yield_per_ha:.1f} tons/ha, which is below optimal expectations.")
            if price_per_kg < 50:
                concern_messages.append(f"Predicted price is {price_per_kg:.2f} DA/kg, which may indicate low market demand.")
            
            if concern_messages:
                for msg in concern_messages:
                    advice_list.append({
                        'category': 'warning',
                        'priority': 1,
                        'title': self._translate_text('Model Prediction Concern'),
                        'message': msg,
                        'action': self._translate_text('Consider alternative crops with better model predictions'),
                        'impact': 'high'
                    })
        
        # Add structured advice
        if ai_response.get('advice'):
            for advice_item in ai_response['advice']:
                # Translate title if it's a string
                if isinstance(advice_item.get('title'), str):
                    # Keep the title as is (already translated in translation step)
                    pass
                advice_list.append(advice_item)
        
        return advice_list
    
    def _generate_english_prompt(self, crop_name: str, farm_data: Dict, analysis_scores: Dict,
                                 weather_data: Dict, market_data: Dict, is_recommended: bool,
                                 location: str, is_desert: bool, soil_type: str, temp: float, rainfall: float) -> str:
        """
        Generate English prompt (always generate in English first)
        """
        is_oversupply_high = market_data.get('supply_volume_tons', 0) / (market_data.get('demand_index', 1.0) * 1000) > 1.2
        oversupply_risk = 'HIGH' if is_oversupply_high else 'LOW'
        recommendation_status = 'RECOMMENDED' if is_recommended else 'NOT RECOMMENDED'
        low_suitable = '(LOW - NOT SUITABLE)'
        very_low = '(VERY LOW - DESERT CONDITIONS)'
        very_high = '(VERY HIGH - HEAT STRESS RISK)'
        desert_region = '(DESERT REGION - STRICT CONSTRAINTS)'
        sand_soil = '(SAND SOIL - POOR WATER RETENTION)'
        high_risk = '(HIGH RISK - AVOID OVERSUPPLY)'
        
        return f"""You are a STRICT expert agricultural advisor helping a farmer in Algeria decide whether to plant {crop_name}.

CRITICAL: Your primary goal is to PREVENT OVERSUPPLY and help farmers make BETTER DECISIONS. Be STRICT about unsuitable conditions.

FARM INFORMATION:
- Location: {location} {desert_region if is_desert else ''}
- Farm Size: {farm_data.get('size_hectares', 0)} hectares
- Soil Type: {soil_type} {(sand_soil if soil_type.lower() == 'sand' else '')}
- Soil pH: {farm_data.get('ph_level', 6.5)}

ANALYSIS SCORES:
- Soil Suitability: {analysis_scores.get('soil', 0)}/100 {(low_suitable if analysis_scores.get('soil', 0) < 50 else '')}
- Yield Forecast: {analysis_scores.get('yield', 0)}/100
- Profitability: {analysis_scores.get('profit', 0)}/100
- Market Risk: {analysis_scores.get('risk', 0)}/100 {(high_risk if analysis_scores.get('risk', 0) > 50 else '')}
- Final Score: {analysis_scores.get('final_score', 0)}/100

WEATHER CONDITIONS:
- Rainfall: {rainfall}mm {(very_low if rainfall < 200 else '')}
- Temperature: {temp}°C {(very_high if temp > 30 else '')}
- Humidity: {weather_data.get('humidity_avg', 60)}%

MODEL PREDICTIONS (CRITICAL DATA):
- Predicted Price: {market_data.get('price_per_kg', 0)} DA/kg (from ML model)
- Predicted Yield: {market_data.get('yield_per_ha', 0)} tons/ha (from ML model)
- Oversupply Risk: {market_data.get('oversupply_risk', 0)}% (from ML model)
- Demand Index: {market_data.get('demand_index', 1.0)}
- Supply Volume: {market_data.get('supply_volume_tons', 0)} tons

RECOMMENDATION: {recommendation_status}

CRITICAL INSTRUCTIONS FOR NOT RECOMMENDED CROPS:
If this crop is NOT RECOMMENDED, you MUST provide detailed explanations based on the MODEL PREDICTIONS above:
1. Explain WHY it's not recommended using the specific model values (price, yield, risk)
2. Reference the oversupply risk percentage - if it's high (>50%), explain the market saturation risk
3. Reference the predicted yield - if it's low, explain why yield expectations are poor
4. Reference the predicted price - if it's low, explain market price concerns
5. Explain which specific factors (soil, weather, market risk) are causing the non-recommendation
6. Provide actionable advice on what the farmer should do instead

STRICT RULES:
1. If location is DESERT (Biskra, Adrar, etc.) and crop requires high water (like Strawberry) → STRONGLY NOT RECOMMENDED
2. If soil is SAND and crop needs high water → NOT SUITABLE
3. If temperature > 30°C and crop is heat-sensitive (like Strawberry, Lettuce) → NOT SUITABLE
4. If rainfall < 300mm and crop needs > 400mm → NOT SUITABLE without extensive irrigation
5. If oversupply risk > 50% (from model) → STRONGLY NOT RECOMMENDED - explain the market saturation risk
6. Be HONEST and STRICT - do not recommend unsuitable crops even if profitability seems high
7. ALWAYS provide detailed explanations when NOT RECOMMENDED - farmers need to understand WHY

Generate detailed, actionable advice in JSON format with the following structure:
{{
  "summary": "Brief 2-3 sentence summary explaining why this crop is good/bad for this farm. If NOT RECOMMENDED, reference the model predictions (price, yield, risk) in your explanation.",
  "strengths": ["List of positive aspects (can be empty if NOT RECOMMENDED)"],
  "concerns": ["List of concerns or issues. If NOT RECOMMENDED, MUST include concerns based on model predictions (oversupply risk, low yield, low price, etc.)"],
  "advice": [
    {{
      "category": "critical|warning|recommendation|opportunity|info",
      "priority": 1-5,
      "title": "Advice title",
      "message": "Detailed explanation. If NOT RECOMMENDED, explain using model prediction values (e.g., 'The model predicts {oversupply_risk}% oversupply risk, which indicates market saturation')",
      "action": "Specific actionable step",
      "impact": "high|medium|positive|high_benefit|informational"
    }}
  ],
  "why_recommended": "Detailed explanation of why this crop is recommended or not. If NOT RECOMMENDED, MUST explain based on: (1) Model oversupply risk percentage, (2) Predicted yield vs expected, (3) Predicted price concerns, (4) Soil/weather incompatibilities. Reference the specific model values.",
  "key_factors": ["Factor 1 (e.g., 'High oversupply risk: {market_data.get('oversupply_risk', 0)}%')", "Factor 2", "Factor 3"]
}}

Be specific, practical, and focus on actionable advice. Write in clear, professional English.
"""
    
    def _translate_advice_response(self, ai_response: Dict) -> Dict:
        """
        Translate the AI response to target language using OpenAI
        Also ensures crop names are translated correctly
        """
        if self.language == 'en':
            return ai_response  # No translation needed
        
        print(f"🔍 DEBUG: Translating advice to {self.language}")
        
        # Get crop translations for the target language
        crop_translations = self.CROP_TRANSLATIONS.get(self.language, {})
        
        # Build crop translation list for the prompt
        crop_list = []
        for en_name, translated_name in crop_translations.items():
            crop_list.append(f"- {en_name} → {translated_name}")
        crop_translations_text = "\n".join(crop_list)
        
        # Prepare translation prompt with explicit crop name instructions
        translation_prompts = {
            'fr': f"""Translate the following agricultural advice from English to French. Maintain the exact JSON structure and field names. Only translate the content values (summary, strengths, concerns, advice messages, why_recommended, key_factors). Keep all field names in English. Return the complete JSON object with translated content.

IMPORTANT: Translate crop names using these exact translations:
{crop_translations_text}

For example, "Pepper" must be translated to "Poivron", "Tomato" to "Tomate", "Strawberry" to "Fraise", etc.""",
            'ar': f"""Translate the following agricultural advice from English to Arabic. Maintain the exact JSON structure and field names. Only translate the content values (summary, strengths, concerns, advice messages, why_recommended, key_factors). Keep all field names in English. Return the complete JSON object with translated content.

IMPORTANT: Translate crop names using these exact translations:
{crop_translations_text}

For example, "Pepper" must be translated to "فلفل", "Tomato" to "طماطم", "Strawberry" to "فراولة", etc."""
        }
        
        translation_prompt = translation_prompts.get(self.language, translation_prompts['fr'])
        
        # Create translation request
        translation_request = f"""{translation_prompt}

Original JSON (translate the content, keep structure):
{json.dumps(ai_response, ensure_ascii=False, indent=2)}

Return the translated JSON with the same structure."""
        
        try:
            translation_response = self.client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": f"You are a professional translator. Translate agricultural advice from English to {self.language.upper()}. Maintain exact JSON structure. Always translate crop names correctly."},
                    {"role": "user", "content": translation_request}
                ],
                temperature=0.3,  # Lower temperature for more accurate translation
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            translated_response = json.loads(translation_response.choices[0].message.content)
            
            # Post-process: Replace any remaining English crop names with translated ones
            translated_response = self._replace_crop_names_in_text(translated_response, crop_translations)
            
            print(f"✅ DEBUG: Translation successful to {self.language}")
            return translated_response
            
        except Exception as e:
            print(f"⚠️ Translation failed: {e}, returning original English advice")
            return ai_response  # Return original if translation fails
    
    def _replace_crop_names_in_text(self, text_obj: any, crop_translations: Dict) -> any:
        """
        Recursively replace English crop names with translated ones in the response
        """
        if isinstance(text_obj, str):
            # Replace crop names in the string
            result = text_obj
            for en_name, translated_name in crop_translations.items():
                # Case-insensitive replacement
                result = re.sub(r'\b' + re.escape(en_name) + r'\b', translated_name, result, flags=re.IGNORECASE)
            return result
        elif isinstance(text_obj, dict):
            # Recursively process dictionary values
            return {key: self._replace_crop_names_in_text(value, crop_translations) for key, value in text_obj.items()}
        elif isinstance(text_obj, list):
            # Recursively process list items
            return [self._replace_crop_names_in_text(item, crop_translations) for item in text_obj]
        else:
            return text_obj
    
    def _translate_text(self, text: str) -> str:
        """
        Quick translation for simple text labels
        """
        translations = {
            'en': {
                'Analysis Summary': 'Analysis Summary',
                'Why Recommended': 'Why Recommended',
                'Why Not Recommended': 'Why Not Recommended',
                'Review the detailed analysis below': 'Review the detailed analysis below',
                'Consider this analysis when making your decision': 'Consider this analysis when making your decision',
                'Strength': 'Strength',
                'Leverage this advantage': 'Leverage this advantage',
                'Concern': 'Concern',
                'Address this issue before planting': 'Address this issue before planting'
            },
            'fr': {
                'Analysis Summary': 'Résumé de l\'analyse',
                'Why Recommended': 'Pourquoi Recommandé',
                'Why Not Recommended': 'Pourquoi Non Recommandé',
                'Review the detailed analysis below': 'Examinez l\'analyse détaillée ci-dessous',
                'Consider this analysis when making your decision': 'Prenez en compte cette analyse lors de votre décision',
                'Strength': 'Point Fort',
                'Leverage this advantage': 'Tirez parti de cet avantage',
                'Concern': 'Préoccupation',
                'Address this issue before planting': 'Résolvez ce problème avant la plantation'
            },
            'ar': {
                'Analysis Summary': 'ملخص التحليل',
                'Why Recommended': 'لماذا موصى به',
                'Why Not Recommended': 'لماذا غير موصى به',
                'Review the detailed analysis below': 'راجع التحليل المفصل أدناه',
                'Consider this analysis when making your decision': 'ضع هذا التحليل في الاعتبار عند اتخاذ قرارك',
                'Strength': 'نقطة قوة',
                'Leverage this advantage': 'استفد من هذه الميزة',
                'Concern': 'مخاوف',
                'Address this issue before planting': 'عالج هذه المشكلة قبل الزراعة'
            }
        }
        
        t_dict = translations.get(self.language, translations['en'])
        return t_dict.get(text, text)
    
    def _generate_rule_based(self, crop_name: str, farm_data: Dict, analysis_scores: Dict,
                             weather_data: Dict, market_data: Dict, is_recommended: bool) -> List[Dict]:
        """
        Fallback rule-based advice generation
        Enhanced with more specific explanations - NOW MULTI-LANGUAGE
        """
        # Translate crop name to target language
        crop_translations = self.CROP_TRANSLATIONS.get(self.language, {})
        translated_crop_name = crop_translations.get(crop_name, crop_name)
        
        # Language-specific translations
        translations = {
            'en': {
                'highly': 'highly',
                'recommended': 'recommended',
                'not_recommended': 'not recommended',
                'excellent': 'excellent',
                'compatibility': 'compatibility',
                'favorable': 'favorable',
                'yield_forecast': 'yield forecast',
                'strong': 'strong',
                'profitability': 'profitability',
                'low': 'low',
                'poor': 'poor',
                'high': 'high',
                'analysis_summary': 'Analysis Summary',
                'review': 'Review detailed analysis below',
                'why_recommended': 'Why Recommended',
                'why_not_recommended': 'Why Not Recommended',
                'consider': 'Consider this analysis when making your decision',
                'soil_compatibility_issue': 'Soil Compatibility Issue',
                'not_ideal': 'is not ideal for',
                'optimal': 'optimal',
                'reduces': 'This reduces expected yield by approximately',
                'consider_amendment': 'Consider soil amendment to adjust pH to',
                'or_choose': 'or choose a crop better suited to your soil',
                'excellent_match': 'Excellent Soil Match',
                'highly_compatible': 'is highly compatible with',
                'match': 'match',
                'strongest_factors': 'This is one of the strongest factors supporting this crop choice.',
                'proceed': 'Proceed with confidence - soil conditions are optimal',
                'weather_concerns': 'Weather Concerns',
                'expected_rainfall': 'Expected rainfall',
                'requirement': 'requirement',
                'will_reduce': 'This will reduce yield by approximately',
                'plan_for': 'Plan for',
                'irrigation': 'irrigation',
                'drainage': 'drainage',
                'to_optimize': 'to optimize growing conditions',
                'high_market_risk': 'High Market Risk',
                'oversupply_risk': 'oversupply risk',
                'strongly_consider': 'Strongly consider reducing planting area by 50% or delaying planting by 2-3 months',
                'high_profit': 'High Profit Potential',
                'roi': 'ROI',
                'profit_per_ha': 'profit per hectare',
                'most_profitable': 'This is one of the most profitable options for your farm.',
                'consider_allocating': 'Consider allocating significant area to this crop if other factors are favorable'
            },
            'fr': {
                'highly': 'fortement',
                'recommended': 'recommandé',
                'not_recommended': 'non recommandé',
                'excellent': 'excellentes',
                'compatibility': 'compatibilité',
                'favorable': 'favorables',
                'yield_forecast': 'prévision de rendement',
                'strong': 'fort',
                'profitability': 'rentabilité',
                'low': 'faible',
                'poor': 'mauvaises',
                'high': 'élevé',
                'analysis_summary': 'Résumé de l\'analyse',
                'review': 'Examinez l\'analyse détaillée ci-dessous',
                'why_recommended': 'Pourquoi Recommandé',
                'why_not_recommended': 'Pourquoi Non Recommandé',
                'consider': 'Prenez en compte cette analyse lors de votre décision',
                'soil_compatibility_issue': 'Problème de Compatibilité du Sol',
                'not_ideal': 'n\'est pas idéal pour',
                'optimal': 'optimal',
                'reduces': 'Cela réduit le rendement attendu d\'environ',
                'consider_amendment': 'Envisagez un amendement du sol pour ajuster le pH à',
                'or_choose': 'ou choisissez une culture mieux adaptée à votre sol',
                'excellent_match': 'Excellente Correspondance du Sol',
                'highly_compatible': 'est très compatible avec',
                'match': 'correspondance',
                'strongest_factors': 'C\'est l\'un des facteurs les plus forts soutenant ce choix de culture.',
                'proceed': 'Procédez en toute confiance - les conditions du sol sont optimales',
                'weather_concerns': 'Préoccupations Météorologiques',
                'expected_rainfall': 'Précipitations attendues',
                'requirement': 'besoin',
                'will_reduce': 'Cela réduira le rendement d\'environ',
                'plan_for': 'Prévoyez',
                'irrigation': 'irrigation',
                'drainage': 'drainage',
                'to_optimize': 'pour optimiser les conditions de croissance',
                'high_market_risk': 'Risque de Marché Élevé',
                'oversupply_risk': 'risque de surproduction',
                'strongly_consider': 'Envisagez fortement de réduire la superficie de plantation de 50% ou de retarder la plantation de 2-3 mois',
                'high_profit': 'Potentiel de Profit Élevé',
                'roi': 'ROI',
                'profit_per_ha': 'profit par hectare',
                'most_profitable': 'C\'est l\'une des options les plus rentables pour votre ferme.',
                'consider_allocating': 'Envisagez d\'allouer une superficie importante à cette culture si les autres facteurs sont favorables'
            },
            'ar': {
                'highly': 'بشدة',
                'recommended': 'موصى به',
                'not_recommended': 'غير موصى به',
                'excellent': 'ممتازة',
                'compatibility': 'التوافق',
                'favorable': 'مواتية',
                'yield_forecast': 'توقع الإنتاج',
                'strong': 'قوي',
                'profitability': 'الربحية',
                'low': 'منخفض',
                'poor': 'ضعيفة',
                'high': 'عالي',
                'analysis_summary': 'ملخص التحليل',
                'review': 'راجع التحليل المفصل أدناه',
                'why_recommended': 'لماذا موصى به',
                'why_not_recommended': 'لماذا غير موصى به',
                'consider': 'ضع هذا التحليل في الاعتبار عند اتخاذ قرارك',
                'soil_compatibility_issue': 'مشكلة توافق التربة',
                'not_ideal': 'غير مثالي لـ',
                'optimal': 'المثالي',
                'reduces': 'هذا يقلل من الإنتاج المتوقع بنحو',
                'consider_amendment': 'فكر في تعديل التربة لضبط درجة الحموضة إلى',
                'or_choose': 'أو اختر محصولًا أكثر ملاءمة لتربتك',
                'excellent_match': 'توافق ممتاز للتربة',
                'highly_compatible': 'متوافق بشدة مع',
                'match': 'التوافق',
                'strongest_factors': 'هذا أحد أقوى العوامل الداعمة لاختيار هذا المحصول.',
                'proceed': 'تابع بثقة - ظروف التربة مثالية',
                'weather_concerns': 'مخاوف الطقس',
                'expected_rainfall': 'هطول الأمطار المتوقع',
                'requirement': 'المتطلب',
                'will_reduce': 'سيقلل هذا من الإنتاج بنحو',
                'plan_for': 'خطط لـ',
                'irrigation': 'الري',
                'drainage': 'الصرف',
                'to_optimize': 'لتحسين ظروف النمو',
                'high_market_risk': 'مخاطر السوق العالية',
                'oversupply_risk': 'خطر الإفراط في الإنتاج',
                'strongly_consider': 'فكر بشدة في تقليل مساحة الزراعة بنسبة 50% أو تأخير الزراعة لمدة 2-3 أشهر',
                'high_profit': 'إمكانات الربح العالية',
                'roi': 'العائد على الاستثمار',
                'profit_per_ha': 'الربح لكل هكتار',
                'most_profitable': 'هذا أحد أكثر الخيارات ربحية لمزرعتك.',
                'consider_allocating': 'فكر في تخصيص مساحة كبيرة لهذا المحصول إذا كانت العوامل الأخرى مواتية'
            }
        }
        
        t = translations.get(self.language, translations['en'])
        
        advice = []
        soil_score = analysis_scores.get('soil', 0)
        yield_score = analysis_scores.get('yield', 0)
        profit_score = analysis_scores.get('profit', 0)
        risk_score = analysis_scores.get('risk', 0)
        final_score = analysis_scores.get('final_score', 0)
        
        # Summary explanation
        if is_recommended:
            summary = f"{translated_crop_name} {t['highly'] if final_score >= 80 else ''} {t['recommended']} pour votre ferme. " if self.language == 'fr' else \
                     f"{translated_crop_name} {t['highly'] if final_score >= 80 else ''} {t['recommended']} لمزرعتك. " if self.language == 'ar' else \
                     f"{translated_crop_name} is {t['highly'] if final_score >= 80 else ''} {t['recommended']} for your farm. "
            if soil_score >= 80:
                summary += f"Vos conditions de sol sont {t['excellent']} ({soil_score:.0f}% {t['compatibility']}). " if self.language == 'fr' else \
                          f"ظروف التربة {t['excellent']} ({soil_score:.0f}% {t['compatibility']}). " if self.language == 'ar' else \
                          f"Your soil conditions are {t['excellent']} ({soil_score:.0f}% {t['compatibility']}). "
            if yield_score >= 75:
                summary += f"Les conditions météorologiques sont {t['favorable']} ({yield_score:.0f}% {t['yield_forecast']}). " if self.language == 'fr' else \
                          f"الظروف الجوية {t['favorable']} ({yield_score:.0f}% {t['yield_forecast']}). " if self.language == 'ar' else \
                          f"Weather conditions are {t['favorable']} ({yield_score:.0f}% {t['yield_forecast']}). "
            if profit_score >= 70:
                summary += f"Le potentiel de profit est {t['strong']} ({profit_score:.0f}% {t['profitability']})." if self.language == 'fr' else \
                          f"إمكانات الربح {t['strong']} ({profit_score:.0f}% {t['profitability']})." if self.language == 'ar' else \
                          f"Profit potential is {t['strong']} ({profit_score:.0f}% {t['profitability']})."
        else:
            summary = f"{translated_crop_name} {t['not_recommended']} pour votre ferme. " if self.language == 'fr' else \
                     f"{translated_crop_name} {t['not_recommended']} لمزرعتك. " if self.language == 'ar' else \
                     f"{translated_crop_name} is {t['not_recommended']} for your farm. "
            if soil_score < 60:
                summary += f"La {t['compatibility']} du sol est {t['low']} ({soil_score:.0f}%). " if self.language == 'fr' else \
                          f"{t['compatibility']} التربة {t['low']} ({soil_score:.0f}%). " if self.language == 'ar' else \
                          f"Soil {t['compatibility']} is {t['low']} ({soil_score:.0f}%). "
            if yield_score < 50:
                summary += f"Les conditions météorologiques sont {t['poor']} ({yield_score:.0f}% {t['yield_forecast']}). " if self.language == 'fr' else \
                          f"الظروف الجوية {t['poor']} ({yield_score:.0f}% {t['yield_forecast']}). " if self.language == 'ar' else \
                          f"Weather conditions are {t['poor']} ({yield_score:.0f}% {t['yield_forecast']}). "
            if risk_score > 60:
                summary += f"Le risque de marché est {t['high']} ({risk_score:.0f}%). " if self.language == 'fr' else \
                          f"مخاطر السوق {t['high']} ({risk_score:.0f}%). " if self.language == 'ar' else \
                          f"Market risk is {t['high']} ({risk_score:.0f}%). "
            if profit_score < 50:
                summary += f"La {t['profitability']} est {t['low']} ({profit_score:.0f}%)." if self.language == 'fr' else \
                          f"{t['profitability']} {t['low']} ({profit_score:.0f}%)." if self.language == 'ar' else \
                          f"{t['profitability']} is {t['low']} ({profit_score:.0f}%)."
        
        advice.append({
            'category': 'info',
            'priority': 5,
            'title': t['analysis_summary'],
            'message': summary,
            'action': t['review'],
            'impact': 'informational'
        })
        
        # Why recommended/not recommended - detailed explanation
        why_recommended = self._explain_recommendation(translated_crop_name, farm_data, analysis_scores, 
                                                      weather_data, market_data, is_recommended)
        advice.append({
            'category': 'recommendation' if is_recommended else 'warning',
            'priority': 2 if is_recommended else 1,
            'title': t['why_recommended'] if is_recommended else t['why_not_recommended'],
            'message': why_recommended,
            'action': t['consider'],
            'impact': 'high' if not is_recommended else 'positive'
        })
        
        # Detailed factor analysis
        if soil_score < 70:
            ph_level = farm_data.get('ph_level', 6.5)
            ideal_ph = analysis_scores.get('ideal_ph', 6.5)
            soil_type_name = farm_data.get('soil_type', 'soil')
            if self.language == 'fr':
                message = f"Votre sol {soil_type_name} avec un pH de {ph_level:.1f} {t['not_ideal']} {translated_crop_name} (pH {t['optimal']}: {ideal_ph:.1f}). {t['reduces']} {100 - soil_score:.0f}%."
                action = f"{t['consider_amendment']} {ideal_ph:.1f} {t['or_choose']}"
            elif self.language == 'ar':
                message = f"تربتك {soil_type_name} بدرجة حموضة {ph_level:.1f} {t['not_ideal']} {translated_crop_name} (درجة الحموضة {t['optimal']}: {ideal_ph:.1f}). {t['reduces']} {100 - soil_score:.0f}%."
                action = f"{t['consider_amendment']} {ideal_ph:.1f} {t['or_choose']}"
            else:
                message = f"Your {soil_type_name} soil with pH {ph_level:.1f} {t['not_ideal']} {translated_crop_name} ({t['optimal']} pH: {ideal_ph:.1f}). {t['reduces']} {100 - soil_score:.0f}%."
                action = f"{t['consider_amendment']} {ideal_ph:.1f} {t['or_choose']}"
            
            advice.append({
                'category': 'warning',
                'priority': 2,
                'title': t['soil_compatibility_issue'],
                'message': message,
                'action': action,
                'impact': 'medium'
            })
        elif soil_score >= 90:
            soil_type_name = farm_data.get('soil_type', 'soil')
            if self.language == 'fr':
                message = f"Votre sol {soil_type_name} {t['highly_compatible']} {translated_crop_name} ({soil_score:.0f}% {t['match']}). {t['strongest_factors']}"
            elif self.language == 'ar':
                message = f"تربتك {soil_type_name} {t['highly_compatible']} {translated_crop_name} ({soil_score:.0f}% {t['match']}). {t['strongest_factors']}"
            else:
                message = f"Your {soil_type_name} soil {t['highly_compatible']} {translated_crop_name} ({soil_score:.0f}% {t['match']}). {t['strongest_factors']}"
            
            advice.append({
                'category': 'opportunity',
                'priority': 4,
                'title': t['excellent_match'],
                'message': message,
                'action': t['proceed'],
                'impact': 'positive'
            })
        
        if yield_score < 50:
            rainfall_val = weather_data.get('rainfall_mm', 0)
            required = analysis_scores.get('water_requirement', 500)
            if self.language == 'fr':
                message = f"{t['expected_rainfall']} ({rainfall_val:.1f}mm) est significativement différent du {t['requirement']} de {translated_crop_name} ({required:.0f}mm). {t['will_reduce']} {100 - yield_score:.0f}%."
                action = f"{t['plan_for']} {t['irrigation'] if rainfall_val < required else t['drainage']} {t['to_optimize']}"
            elif self.language == 'ar':
                message = f"{t['expected_rainfall']} ({rainfall_val:.1f}مم) يختلف بشكل كبير عن {t['requirement']} {translated_crop_name} ({required:.0f}مم). {t['will_reduce']} {100 - yield_score:.0f}%."
                action = f"{t['plan_for']} {t['irrigation'] if rainfall_val < required else t['drainage']} {t['to_optimize']}"
            else:
                message = f"{t['expected_rainfall']} ({rainfall_val:.1f}mm) is significantly different from {translated_crop_name}'s {t['requirement']} ({required:.0f}mm). {t['will_reduce']} {100 - yield_score:.0f}%."
                action = f"{t['plan_for']} {t['irrigation'] if rainfall_val < required else t['drainage']} {t['to_optimize']}"
            
            advice.append({
                'category': 'warning',
                'priority': 2,
                'title': t['weather_concerns'],
                'message': message,
                'action': action,
                'impact': 'medium'
            })
        
        if risk_score > 70:
            if self.language == 'fr':
                message = f"L'analyse du marché montre un {t['oversupply_risk']} de {risk_score:.0f}% pour {translated_crop_name}. L'offre actuelle est élevée par rapport à la demande, ce qui peut faire chuter les prix de manière significative lors de la récolte."
            elif self.language == 'ar':
                message = f"يُظهر تحليل السوق {t['oversupply_risk']} بنسبة {risk_score:.0f}% لـ {translated_crop_name}. العرض الحالي مرتفع بالنسبة للطلب، مما قد يؤدي إلى انخفاض الأسعار بشكل كبير عند الحصاد."
            else:
                message = f"Market analysis shows {risk_score:.0f}% {t['oversupply_risk']} for {translated_crop_name}. Current supply is high relative to demand, which may cause prices to drop significantly when you harvest."
            
            advice.append({
                'category': 'critical',
                'priority': 1,
                'title': t['high_market_risk'],
                'message': message,
                'action': t['strongly_consider'],
                'impact': 'high'
            })
        
        if profit_score >= 80:
            roi = analysis_scores.get('roi', 0)
            profit_per_ha = analysis_scores.get('profit_per_ha', 0)
            if self.language == 'fr':
                message = f"{translated_crop_name} montre un excellent potentiel de profit avec {roi:.0f}% {t['roi']} et environ {profit_per_ha:,.0f} DA de {t['profit_per_ha']}. {t['most_profitable']}"
            elif self.language == 'ar':
                message = f"{translated_crop_name} يُظهر إمكانات ربح ممتازة مع {roi:.0f}% {t['roi']} وحوالي {profit_per_ha:,.0f} دج {t['profit_per_ha']}. {t['most_profitable']}"
            else:
                message = f"{translated_crop_name} shows excellent profit potential with {roi:.0f}% {t['roi']} and approximately {profit_per_ha:,.0f} DA {t['profit_per_ha']}. {t['most_profitable']}"
            
            advice.append({
                'category': 'opportunity',
                'priority': 4,
                'title': t['high_profit'],
                'message': message,
                'action': t['consider_allocating'],
                'impact': 'high_benefit'
            })
        
        return advice
    
    def _explain_recommendation(self, crop_name: str, farm_data: Dict, analysis_scores: Dict,
                               weather_data: Dict, market_data: Dict, is_recommended: bool) -> str:
        """
        Generate detailed explanation of why crop is recommended or not - MULTI-LANGUAGE
        """
        # Get translations
        translations = {
            'en': {
                'based_on': 'Based on comprehensive analysis of your farm conditions,',
                'is_recommended': 'is recommended because:',
                'is_not_recommended': 'is not recommended because:',
                'excellent_soil': 'excellent soil compatibility',
                'favorable_weather': 'favorable weather conditions',
                'yield_forecast': 'yield forecast',
                'strong_profit': 'strong profit potential',
                'profitability': 'profitability',
                'low_market_risk': 'low market risk',
                'scores_acceptable': 'scores are acceptable across all factors.',
                'final_score': 'With a final score of',
                'aligns_well': 'this crop aligns well with your farm\'s conditions and market opportunities.',
                'poor_soil': 'poor soil compatibility',
                'unfavorable_weather': 'unfavorable weather conditions',
                'high_market_risk': 'high market risk',
                'low_profitability': 'low profitability',
                'better_alternatives': 'better alternatives are available.',
                'may_result_template': 'With a final score of {score:.1f}/100, planting {crop} may result in lower yields, higher risks, or reduced profits compared to other options.'
            },
            'fr': {
                'based_on': 'Basé sur une analyse complète des conditions de votre ferme,',
                'is_recommended': 'est recommandé car:',
                'is_not_recommended': 'n\'est pas recommandé car:',
                'excellent_soil': 'excellente compatibilité du sol',
                'favorable_weather': 'conditions météorologiques favorables',
                'yield_forecast': 'prévision de rendement',
                'strong_profit': 'fort potentiel de profit',
                'profitability': 'rentabilité',
                'low_market_risk': 'faible risque de marché',
                'scores_acceptable': 'les scores sont acceptables dans tous les facteurs.',
                'final_score': 'Avec un score final de',
                'aligns_well': 'cette culture correspond bien aux conditions de votre ferme et aux opportunités du marché.',
                'poor_soil': 'faible compatibilité du sol',
                'unfavorable_weather': 'conditions météorologiques défavorables',
                'high_market_risk': 'risque de marché élevé',
                'low_profitability': 'faible rentabilité',
                'better_alternatives': 'de meilleures alternatives sont disponibles.',
                'may_result_template': 'Avec un score final de {score:.1f}/100, planter {crop} peut entraîner des rendements plus faibles, des risques plus élevés ou des profits réduits par rapport à d\'autres options.'
            },
            'ar': {
                'based_on': 'بناءً على تحليل شامل لظروف مزرعتك،',
                'is_recommended': 'موصى به لأن:',
                'is_not_recommended': 'غير موصى به لأن:',
                'excellent_soil': 'توافق ممتاز للتربة',
                'favorable_weather': 'ظروف جوية مواتية',
                'yield_forecast': 'توقع الإنتاج',
                'strong_profit': 'إمكانات ربح قوية',
                'profitability': 'الربحية',
                'low_market_risk': 'مخاطر سوق منخفضة',
                'scores_acceptable': 'النتائج مقبولة عبر جميع العوامل.',
                'final_score': 'مع نتيجة نهائية تبلغ',
                'aligns_well': 'هذا المحصول يتماشى جيدًا مع ظروف مزرعتك وفرص السوق.',
                'poor_soil': 'توافق ضعيف للتربة',
                'unfavorable_weather': 'ظروف جوية غير مواتية',
                'high_market_risk': 'مخاطر سوق عالية',
                'low_profitability': 'ربحية منخفضة',
                'better_alternatives': 'بدائل أفضل متاحة.',
                'may_result_template': 'مع نتيجة نهائية تبلغ {score:.1f}/100، قد يؤدي زراعة {crop} إلى إنتاج أقل، ومخاطر أعلى، أو أرباح أقل مقارنة بالخيارات الأخرى.'
            }
        }
        
        t = translations.get(self.language, translations['en'])
        
        explanation = f"{t['based_on']} {crop_name} "
        
        if is_recommended:
            explanation += f"{t['is_recommended']} "
            reasons = []
            
            if analysis_scores.get('soil', 0) >= 75:
                reasons.append(f"{t['excellent_soil']} ({analysis_scores['soil']:.0f}%)")
            if analysis_scores.get('yield', 0) >= 70:
                reasons.append(f"{t['favorable_weather']} ({analysis_scores['yield']:.0f}% {t['yield_forecast']})")
            if analysis_scores.get('profit', 0) >= 70:
                reasons.append(f"{t['strong_profit']} ({analysis_scores['profit']:.0f}% {t['profitability']})")
            if analysis_scores.get('risk', 0) < 40:
                reasons.append(f"{t['low_market_risk']} ({analysis_scores['risk']:.0f}%)")
            
            if reasons:
                if self.language == 'ar':
                    explanation += "، ".join(reasons) + ". "
                else:
                    explanation += ", ".join(reasons) + ". "
            else:
                explanation += t['scores_acceptable'] + " "
            
            explanation += f"{t['final_score']} {analysis_scores.get('final_score', 0):.1f}/100, {t['aligns_well']}"
        else:
            explanation += f"{t['is_not_recommended']} "
            issues = []
            
            if analysis_scores.get('soil', 0) < 60:
                issues.append(f"{t['poor_soil']} ({analysis_scores['soil']:.0f}%)")
            if analysis_scores.get('yield', 0) < 50:
                issues.append(f"{t['unfavorable_weather']} ({analysis_scores['yield']:.0f}% {t['yield_forecast']})")
            if analysis_scores.get('risk', 0) > 60:
                issues.append(f"{t['high_market_risk']} ({analysis_scores['risk']:.0f}%)")
            if analysis_scores.get('profit', 0) < 50:
                issues.append(f"{t['low_profitability']} ({analysis_scores['profit']:.0f}%)")
            
            if issues:
                if self.language == 'ar':
                    explanation += "، ".join(issues) + ". "
                else:
                    explanation += ", ".join(issues) + ". "
            else:
                explanation += t['better_alternatives'] + " "
            
            explanation += t['may_result_template'].format(
                score=analysis_scores.get('final_score', 0),
                crop=crop_name
            )
        
        return explanation

