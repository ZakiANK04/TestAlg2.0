import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'

function PrecisionAnalytics() {
  const navigate = useNavigate()
  const { language, setLanguage, t } = useLanguage()
  const [selectedSensor, setSelectedSensor] = useState('soil')

  const sensorData = {
    soil: {
      moisture: 68,
      temperature: 24,
      ph: 6.8,
      nitrogen: 45,
      phosphorus: 32,
      potassium: 28,
      status: 'Optimal',
      lastUpdate: '2 mins ago'
    },
    weather: {
      temperature: 28,
      humidity: 65,
      sunlight: 8.5,
      windSpeed: 12,
      rainfall: 2.3,
      pressure: 1013,
      status: 'Good',
      lastUpdate: '5 mins ago'
    },
    irrigation: {
      waterUsage: 450,
      efficiency: 87,
      pressure: 3.2,
      flowRate: 125,
      schedule: 'Active',
      nextCycle: '4 hours',
      status: 'Active',
      lastUpdate: '1 min ago'
    }
  }

  const aiInsights = [
    {
      title: 'Optimal Irrigation Detected',
      message: 'Current soil moisture levels are perfect. Consider reducing next irrigation cycle by 15%.',
      priority: 'low',
      action: 'Adjust Schedule'
    },
    {
      title: 'Nutrient Alert',
      message: 'Phosphorus levels are slightly below optimal. Recommend fertilizer application within 3 days.',
      priority: 'medium',
      action: 'View Recommendations'
    },
    {
      title: 'Weather Forecast Impact',
      message: 'Heavy rainfall predicted in 48 hours. Pause irrigation and prepare drainage systems.',
      priority: 'high',
      action: 'View Forecast'
    }
  ]

  const renderGauge = (value, max, label, unit, color) => (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-slate-200">
      <h4 className="text-xs sm:text-sm font-semibold text-slate-600 mb-3 sm:mb-4">{label}</h4>
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto">
        <svg className="transform -rotate-90 w-24 h-24 sm:w-32 sm:h-32">
          <circle
            cx="48"
            cy="48"
            r="42"
            stroke="#e2e8f0"
            strokeWidth="10"
            fill="none"
            className="sm:hidden"
          />
          <circle
            cx="48"
            cy="48"
            r="42"
            stroke={color}
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${(value / max) * 263.89} 263.89`}
            strokeLinecap="round"
            className="sm:hidden"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="#e2e8f0"
            strokeWidth="12"
            fill="none"
            className="hidden sm:block"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke={color}
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${(value / max) * 351.86} 351.86`}
            strokeLinecap="round"
            className="hidden sm:block"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl sm:text-3xl font-bold text-slate-800">{value}</span>
          <span className="text-xs text-slate-500">{unit}</span>
        </div>
      </div>
      <div className="mt-3 sm:mt-4 bg-slate-50 rounded-lg p-2">
        <div className="flex justify-between text-xs text-slate-600">
          <span>0</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <nav className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 sm:p-4 shadow-xl">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Precision Analytics</h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
            <div className="flex gap-1 sm:gap-2">
              {['en', 'fr', 'ar'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg font-medium transition-all ${
                    language === lang
                      ? 'bg-purple-900 text-white'
                      : 'bg-purple-800/50 text-purple-100 hover:bg-purple-800'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-purple-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-purple-900 transition-all hover:scale-105 text-xs sm:text-sm md:text-base"
            >
              {t('dashboard')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-purple-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-purple-900 transition-all hover:scale-105 text-xs sm:text-sm md:text-base"
            >
              {t('home')}
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 sm:p-6 md:p-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">IoT Sensor Dashboard</h2>
          <p className="text-sm sm:text-base text-slate-600">Real-time monitoring and AI-powered insights for your farm</p>
        </div>

        {/* Sensor Type Selector */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8">
          {['soil', 'weather', 'irrigation'].map((sensor) => (
            <button
              key={sensor}
              onClick={() => setSelectedSensor(sensor)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                selectedSensor === sensor
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-purple-50'
              }`}
            >
              {sensor.charAt(0).toUpperCase() + sensor.slice(1)} Sensors
            </button>
          ))}
        </div>

        {/* Sensor Data Display */}
        <motion.div
          key={selectedSensor}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          {selectedSensor === 'soil' && (
            <>
              {renderGauge(sensorData.soil.moisture, 100, 'Soil Moisture', '%', '#10b981')}
              {renderGauge(sensorData.soil.temperature, 40, 'Temperature', '°C', '#f59e0b')}
              {renderGauge(sensorData.soil.ph, 14, 'pH Level', 'pH', '#3b82f6')}
            </>
          )}
          {selectedSensor === 'weather' && (
            <>
              {renderGauge(sensorData.weather.temperature, 50, 'Temperature', '°C', '#ef4444')}
              {renderGauge(sensorData.weather.humidity, 100, 'Humidity', '%', '#06b6d4')}
              {renderGauge(sensorData.weather.sunlight, 12, 'Sunlight', 'hrs', '#eab308')}
            </>
          )}
          {selectedSensor === 'irrigation' && (
            <>
              {renderGauge(sensorData.irrigation.waterUsage, 1000, 'Water Usage', 'L', '#0ea5e9')}
              {renderGauge(sensorData.irrigation.efficiency, 100, 'Efficiency', '%', '#22c55e')}
              {renderGauge(sensorData.irrigation.pressure, 5, 'Pressure', 'bar', '#8b5cf6')}
            </>
          )}
        </motion.div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4">{t('sensorDetails')}</h3>
            <div className="space-y-3">
              {Object.entries(sensorData[selectedSensor]).map(([key, value]) => {
                if (key === 'status' || key === 'lastUpdate') return null
                return (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-semibold text-slate-800">{value}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">{t('status')}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  sensorData[selectedSensor].status === 'Optimal' || sensorData[selectedSensor].status === 'Good'
                    ? 'bg-green-100 text-green-700'
                    : sensorData[selectedSensor].status === 'Active'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {sensorData[selectedSensor].status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">{t('lastUpdated')}: {sensorData[selectedSensor].lastUpdate}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4">{t('historicalTrend')}</h3>
            <div className="h-40 sm:h-48 flex items-end justify-between gap-1 sm:gap-2">
              {[45, 52, 48, 55, 62, 58, 65, 63, 68, 65].map((height, index) => (
                <div key={index} className="flex-1 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-lg transition-all hover:opacity-75" style={{ height: `${height}%` }}></div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>10 days ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4">{t('aiInsights')}</h3>
          <div className="space-y-3 sm:space-y-4">
            {aiInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 sm:p-4 rounded-lg border-l-4 ${
                  insight.priority === 'high' ? 'bg-red-50 border-red-500' :
                  insight.priority === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-green-50 border-green-500'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                  <h4 className="font-semibold text-slate-800 text-sm sm:text-base">{insight.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                    insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {insight.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm mb-2 sm:mb-3">{insight.message}</p>
                <button className="text-purple-600 hover:text-purple-700 font-semibold text-xs sm:text-sm">
                  {insight.action} →
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default PrecisionAnalytics
