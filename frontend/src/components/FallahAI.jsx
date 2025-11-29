import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

function FallahAI() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m FallahAI, your agricultural assistant. I can help you with questions about crops, markets, weather, and agronomy. How can I assist you today?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Use backend proxy to avoid CORS issues
      let assistantMessage = ''
      
      try {
        // Call our backend endpoint which proxies to Hugging Face
        const response = await axios.post(
          'http://127.0.0.1:8000/api/chatbot/',
          {
            message: input,
            history: messages.slice(-6) // Last 6 messages for context
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 30000 // 30 second timeout
          }
        )

        if (response.data && response.data.response) {
          assistantMessage = response.data.response.trim()
        } else if (response.data && response.data.error && response.data.fallback) {
          // API failed, will use fallback
          console.log('Backend API failed, using fallback')
        }
      } catch (apiError) {
        console.log('Backend chatbot API failed:', apiError.message)
        // Will use intelligent fallback below
      }

      // If API failed, use intelligent rule-based system
      if (!assistantMessage || assistantMessage.length < 10) {
        assistantMessage = generateIntelligentResponse(input, messages)
      }

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }])
    } catch (error) {
      console.error('Chatbot error:', error)
      // Intelligent fallback response
      const fallbackResponse = generateIntelligentResponse(input, messages)
      setMessages(prev => [...prev, { role: 'assistant', content: fallbackResponse }])
    } finally {
      setLoading(false)
    }
  }

  const generateIntelligentResponse = (question, messageHistory) => {
    const lowerQuestion = question.toLowerCase()
    const recentMessages = messageHistory.slice(-6).map(m => m.content.toLowerCase()).join(' ')
    
    // Crop-specific responses
    const cropKeywords = {
      'wheat': 'Wheat is a staple crop in Algeria. It requires well-drained loam or clay-loam soil with pH 6.0-7.5. Plant in October-November for winter wheat. Average yield is 2-4 tons/ha. Monitor for rust diseases and ensure adequate irrigation during grain filling.',
      'barley': 'Barley is drought-tolerant and suitable for semi-arid regions. Plant in October-November. It prefers pH 6.0-8.0 and can grow in various soil types. Average yield: 2-3 tons/ha. Good for rotation with wheat.',
      'potato': 'Potatoes need well-drained, loose soil with pH 5.0-6.0. Plant in February-March or August-September. Requires consistent moisture. Average yield: 20-35 tons/ha. Rotate crops to prevent disease buildup.',
      'tomato': 'Tomatoes thrive in warm climates with well-drained soil (pH 6.0-6.8). Plant in March-April. Requires regular watering and support. Average yield: 40-60 tons/ha. Watch for blight and pests.',
      'olive': 'Olive trees are well-suited to Mediterranean climates. They prefer well-drained soil with pH 6.0-8.0. Drought-tolerant once established. Plant in autumn. Yield varies: 5-20 kg per tree depending on age and variety.',
      'onion': 'Onions prefer sandy-loam soil with pH 6.0-7.0. Plant sets in early spring. Requires consistent moisture early, then drier conditions. Average yield: 15-25 tons/ha.',
      'lentils': 'Lentils are nitrogen-fixing legumes. They prefer well-drained soil with pH 6.0-7.0. Plant in October-November. Drought-tolerant. Average yield: 0.8-1.5 tons/ha. Good for soil improvement.',
      'chickpea': 'Chickpeas are drought-tolerant legumes. Prefer well-drained soil with pH 6.0-7.5. Plant in October-November. Average yield: 1-2 tons/ha. Fixes nitrogen in soil.',
      'dates': 'Date palms require hot, dry climates. They prefer well-drained soil and can tolerate salinity. Plant in spring. Yield: 50-100 kg per palm. Requires 7-10 years to mature.',
      'citrus': 'Citrus trees need well-drained soil with pH 6.0-7.5. Require regular irrigation. Plant in spring or autumn. Yield varies by type: 15-30 tons/ha for oranges.',
      'apple': 'Apples need well-drained loam soil with pH 6.0-7.0. Require winter chilling. Plant in late winter. Yield: 15-30 tons/ha depending on variety and management.',
      'pepper': 'Peppers need warm temperatures and well-drained soil (pH 6.0-7.0). Plant in March-April. Require consistent moisture. Average yield: 15-25 tons/ha.',
      'melon': 'Melons need warm weather and well-drained sandy-loam soil (pH 6.0-7.0). Plant in April-May. Require consistent irrigation. Average yield: 20-30 tons/ha.',
      'watermelon': 'Watermelons need hot, dry conditions and well-drained soil (pH 6.0-7.0). Plant in April-May. Require ample water. Average yield: 30-50 tons/ha.'
    }

    // Check for specific crop mentions
    for (const [crop, advice] of Object.entries(cropKeywords)) {
      if (lowerQuestion.includes(crop) || recentMessages.includes(crop)) {
        return advice
      }
    }

    // Region-specific responses
    if (lowerQuestion.includes('region') || lowerQuestion.includes('location') || lowerQuestion.includes('wilaya')) {
      const regions = {
        'blida': 'Blida region has a Mediterranean climate with loam soil. Good for wheat, barley, potatoes, and olives. Average rainfall: 600-800mm/year.',
        'tipaza': 'Tipaza has coastal Mediterranean climate with loam soil. Suitable for citrus, olives, and vegetables. Moderate rainfall.',
        'setif': 'Setif has semi-arid climate with clay soil. Good for wheat, barley, and lentils. Lower rainfall: 400-600mm/year.',
        'adrar': 'Adrar is desert climate with sandy soil. Best for dates and drought-tolerant crops. Very low rainfall: <100mm/year.',
        'biskra': 'Biskra has desert climate with sandy soil. Excellent for dates. Very hot summers, mild winters.',
        'ouargla': 'Ouargla is desert climate. Suitable for dates and heat-tolerant vegetables with irrigation.',
        'el oued': 'El Oued is desert climate. Known for dates and greenhouse agriculture.',
        'mila': 'Mila has Mediterranean climate with clay soil. Good for cereals and legumes.',
        'mostaganem': 'Mostaganem has coastal climate with sandy-loam soil. Suitable for citrus and vegetables.',
        'mascara': 'Mascara has Mediterranean climate. Good for various crops including apples and cereals.',
        'tiaret': 'Tiaret has semi-arid climate. Suitable for cereals and olives.',
        'ain defla': 'Ain Defla has Mediterranean climate. Good for citrus and mixed agriculture.'
      }
      
      for (const [region, info] of Object.entries(regions)) {
        if (lowerQuestion.includes(region)) {
          return info
        }
      }
      return 'Algeria has diverse climates: Mediterranean in the north, semi-arid in the center, and desert in the south. Each region has different soil types and crop suitability. Which region are you interested in?'
    }

    // Weather and climate
    if (lowerQuestion.includes('weather') || lowerQuestion.includes('rain') || lowerQuestion.includes('rainfall') || lowerQuestion.includes('temperature') || lowerQuestion.includes('climate')) {
      if (lowerQuestion.includes('when') || lowerQuestion.includes('season')) {
        return 'In Algeria, the main planting seasons are: Winter crops (wheat, barley, lentils) - October to November. Spring crops (potatoes, tomatoes, peppers) - February to April. Summer crops (melons, watermelons) - April to May. Check your specific region\'s climate patterns for optimal timing.'
      }
      return 'Weather is crucial for agriculture. In Algeria: Northern regions have Mediterranean climate (mild, wet winters; hot, dry summers). Central regions are semi-arid (less rainfall). Southern regions are desert (very hot, minimal rain). Monitor rainfall patterns, temperature extremes, and seasonal variations. Use the dashboard for current weather data.'
    }

    // Market and pricing
    if (lowerQuestion.includes('market') || lowerQuestion.includes('price') || lowerQuestion.includes('demand') || lowerQuestion.includes('sell') || lowerQuestion.includes('profit')) {
      if (lowerQuestion.includes('best') || lowerQuestion.includes('profitable') || lowerQuestion.includes('recommend')) {
        return 'Most profitable crops vary by region and market conditions. Generally, high-value crops include: dates (especially in desert regions), citrus fruits, tomatoes, peppers, and olives. Check the dashboard\'s dataset analytics for current price trends and market insights. Consider your soil type, climate, and local market demand.'
      }
      return 'Market analysis is essential. Monitor: Current prices (check dashboard), supply and demand trends, oversupply risks (high risk = >60%), seasonal price variations, and export opportunities. The dashboard provides real-time market insights and price predictions based on historical data.'
    }

    // Soil management
    if (lowerQuestion.includes('soil') || lowerQuestion.includes('fertilizer') || lowerQuestion.includes('nutrient') || lowerQuestion.includes('ph') || lowerQuestion.includes('nitrogen') || lowerQuestion.includes('phosphorus') || lowerQuestion.includes('potassium')) {
      if (lowerQuestion.includes('improve') || lowerQuestion.includes('amend') || lowerQuestion.includes('fix')) {
        return 'To improve soil: Add organic matter (compost, manure) for nutrient content and water retention. Adjust pH with lime (raise) or sulfur (lower). For clay soil: add sand and organic matter. For sandy soil: add clay and organic matter. Test soil regularly and apply balanced fertilizers based on crop needs.'
      }
      if (lowerQuestion.includes('test') || lowerQuestion.includes('check')) {
        return 'Soil testing should check: pH level (most crops prefer 6.0-7.5), nitrogen (N), phosphorus (P), potassium (K), organic matter content, and texture. Test before planting and annually. Contact local agricultural extension services for testing.'
      }
      return 'Soil health is fundamental. Key factors: pH (6.0-7.5 ideal for most crops), nutrients (N-P-K), organic matter (aim for 2-5%), and texture (loam is ideal). Different crops have different requirements. Test your soil and amend based on results. The dashboard can help match crops to your soil type.'
    }

    // Yield and production
    if (lowerQuestion.includes('yield') || lowerQuestion.includes('harvest') || lowerQuestion.includes('production') || lowerQuestion.includes('tons') || lowerQuestion.includes('kg')) {
      if (lowerQuestion.includes('increase') || lowerQuestion.includes('improve') || lowerQuestion.includes('maximize')) {
        return 'To increase yield: 1) Choose suitable crops for your soil and climate, 2) Use quality seeds/certified varieties, 3) Proper soil preparation and fertilization, 4) Timely planting and spacing, 5) Adequate irrigation, 6) Pest and disease management, 7) Weed control, 8) Crop rotation. Check dashboard recommendations for expected yields in your region.'
      }
      return 'Yield depends on crop type, soil quality, weather, and management practices. Average yields in Algeria: Wheat (2-4 t/ha), Barley (2-3 t/ha), Potatoes (20-35 t/ha), Tomatoes (40-60 t/ha), Dates (varies by palm age). Use the dashboard to see expected yields for different crops in your region based on historical data.'
    }

    // Irrigation and water
    if (lowerQuestion.includes('water') || lowerQuestion.includes('irrigation') || lowerQuestion.includes('drought') || lowerQuestion.includes('dry')) {
      return 'Water management is critical. Consider: Drip irrigation for efficiency, rainwater harvesting, mulching to retain moisture, choosing drought-tolerant crops (barley, lentils, dates), timing irrigation to crop growth stages, and monitoring soil moisture. In water-scarce regions, prioritize water-efficient crops and techniques.'
    }

    // Pests and diseases
    if (lowerQuestion.includes('pest') || lowerQuestion.includes('disease') || lowerQuestion.includes('insect') || lowerQuestion.includes('fungus') || lowerQuestion.includes('bacteria')) {
      return 'Pest and disease management: Use integrated pest management (IPM), rotate crops to break pest cycles, choose resistant varieties, monitor regularly, use biological controls when possible, and apply pesticides only when necessary. Common issues: rust in cereals, blight in tomatoes/potatoes, aphids, and fungal diseases. Consult local extension services for specific problems.'
    }

    // Planting and timing
    if (lowerQuestion.includes('when') || lowerQuestion.includes('plant') || lowerQuestion.includes('season') || lowerQuestion.includes('time') || lowerQuestion.includes('month')) {
      return 'Planting timing varies by crop and region: Winter crops (wheat, barley): October-November. Spring vegetables (potatoes, tomatoes): February-April. Summer crops (melons): April-May. Perennials (olives, citrus): Spring or autumn. Check your specific region\'s climate and the crop\'s requirements. The dashboard can provide region-specific recommendations.'
    }

    // General agricultural advice
    if (lowerQuestion.includes('help') || lowerQuestion.includes('advice') || lowerQuestion.includes('suggest') || lowerQuestion.includes('recommend')) {
      return 'I can help with: Crop selection based on your soil and region, market analysis and pricing, weather patterns and timing, soil management, yield optimization, irrigation strategies, and pest management. Be specific about your region, soil type, and what you want to grow, and I can provide tailored advice!'
    }

    // Greetings and general
    if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi') || lowerQuestion.includes('hey') || lowerQuestion.match(/^[a-z\s]{1,10}$/)) {
      return 'Hello! I\'m FallahAI, your agricultural assistant. I can help you with crop selection, market analysis, weather patterns, soil management, and farming best practices for Algeria. What would you like to know?'
    }

    // Default contextual response
    const hasCropContext = recentMessages.match(/\b(wheat|barley|potato|tomato|olive|onion|lentil|chickpea|date|citrus|apple|pepper|melon|watermelon)\b/i)
    const hasRegionContext = recentMessages.match(/\b(blida|tipaza|setif|adrar|biskra|region|wilaya)\b/i)
    
    if (hasCropContext) {
      return 'I see you\'re asking about crops. Could you be more specific? I can provide detailed information about planting, soil requirements, yields, and market conditions for specific crops. What crop are you most interested in?'
    }
    
    if (hasRegionContext) {
      return 'I can help with region-specific agricultural advice. Each region in Algeria has different climate, soil, and crop suitability. What specific information do you need about your region?'
    }

    return 'I understand you have an agricultural question. I specialize in: crop selection and management, market analysis, weather and climate patterns, soil health, yield optimization, and farming best practices for Algeria. Could you be more specific about what you\'d like to know? For example, ask about a specific crop, your region, soil type, or market conditions.'
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-emerald-100 widget-chat">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-3 sm:p-4 rounded-t-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg">FallahAI</h3>
            <p className="text-xs text-emerald-100">Your Agricultural Assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-slate-50 min-h-0">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-800 border border-slate-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-slate-200 bg-white rounded-b-xl flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about crops, weather, markets, or agronomy..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Ask me anything about agriculture, crops, markets, or weather!
        </p>
      </div>
    </div>
  )
}

export default FallahAI

