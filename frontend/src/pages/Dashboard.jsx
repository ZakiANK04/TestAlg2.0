import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import FarmForm from '../components/FarmForm'

function Dashboard() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentFarmId, setCurrentFarmId] = useState(1)
  const [farmDetails, setFarmDetails] = useState(null)
  const navigate = useNavigate()
  const { language, setLanguage, t } = useLanguage()

  const fetchRecommendations = (farmId) => {
    console.log('Fetching recommendations for farm:', farmId)
    setLoading(true)
    fetch(`http://127.0.0.1:8000/api/recommendations/${farmId}/`)
      .then(res => res.json())
      .then(data => {
        console.log('Recommendations received:', data)
        setRecommendations(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchRecommendations(currentFarmId)
  }, [currentFarmId])

  const handleFarmCreated = (newFarm) => {
    console.log('New farm created, updating ID to:', newFarm.id)
    setCurrentFarmId(newFarm.id)
    setFarmDetails(newFarm)
  }

  const topRec = recommendations.length > 0 ? recommendations[0] : null

  return (
    <div className="min-h-screen">
      <nav className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 shadow-xl">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">AgriData Insight</h1>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {['en', 'fr', 'ar'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${language === lang
                      ? 'bg-emerald-900 text-white'
                      : 'bg-emerald-800/50 text-emerald-100 hover:bg-emerald-800'
                    }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/blockchain')}
              className="bg-emerald-800 px-4 py-2 rounded-lg hover:bg-emerald-900 transition-all hover:scale-105"
            >
              {t('blockchainTracker')}
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="bg-emerald-800 px-4 py-2 rounded-lg hover:bg-emerald-900 transition-all hover:scale-105"
            >
              {t('aiAnalytics')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-emerald-800 px-4 py-2 rounded-lg hover:bg-emerald-900 transition-all hover:scale-105"
            >
              {t('home')}
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 animate-slide-in">
            <FarmForm onFarmCreated={handleFarmCreated} />

            <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100 card-hover">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                Current Context
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-emerald-700">Farm ID:</span> {currentFarmId}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-emerald-700">Location:</span> {farmDetails ? farmDetails.location : 'Mitidja (Default)'}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-emerald-700">Soil:</span> {farmDetails ? farmDetails.soil_type : 'Loam (Default)'}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-16 animate-fade-in">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 text-lg">Analyzing soil and market data...</p>
              </div>
            ) : (
              <div className="animate-fade-in">
                {topRec && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl shadow-lg border-2 border-emerald-400 top-recommendation">
                      <h3 className="font-medium text-emerald-600 mb-2 flex items-center gap-2">
                        {t('topRecommendation')}
                      </h3>
                      <p className="text-5xl font-bold gradient-text mb-2">{topRec.crop}</p>
                      <p className="text-sm text-emerald-700 font-semibold">{t('score')}: {topRec.final_score}/100</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 card-hover">
                      <h3 className="font-medium text-slate-500 mb-2 flex items-center gap-2">
                        {t('recommendedArea')}
                      </h3>
                      <p className="text-4xl font-bold text-slate-800 mb-1">{topRec.details.recommended_area_ha} ha</p>
                      <p className="text-sm text-slate-500">{t('ofYourFarm')}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 card-hover">
                      <h3 className="font-medium text-slate-500 mb-2 flex items-center gap-2">
                        {t('expectedYield')}
                      </h3>
                      <p className="text-4xl font-bold text-slate-800 mb-1">{topRec.details.expected_yield_tons} tons</p>
                      <p className="text-sm text-slate-500">{t('totalHarvest')}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 card-hover">
                      <h3 className="font-medium text-slate-500 mb-2 flex items-center gap-2">
                        {t('expectedRevenue')}
                      </h3>
                      <p className="text-4xl font-bold text-emerald-600 mb-1">{(topRec.details.expected_revenue_da / 1000).toFixed(0)}K DA</p>
                      <p className="text-sm text-slate-500">{t('estimatedIncome')}</p>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                  <div className="p-5 bg-gradient-to-r from-slate-50 to-emerald-50 border-b border-slate-200">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                      Detailed Analysis
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="p-4 font-semibold">Crop</th>
                          <th className="p-4 font-semibold">Suitability</th>
                          <th className="p-4 font-semibold">Yield</th>
                          <th className="p-4 font-semibold">Profit</th>
                          <th className="p-4 font-semibold">Risk</th>
                          <th className="p-4 font-semibold">Final Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recommendations.map((rec, i) => (
                          <tr key={i} className="hover:bg-emerald-50 transition-colors duration-200">
                            <td className="p-4 font-semibold text-slate-800">{rec.crop}</td>
                            <td className="p-4 text-slate-600">{rec.details.soil_suitability}</td>
                            <td className="p-4 text-slate-600">{rec.details.yield_forecast}</td>
                            <td className="p-4 text-slate-600">{rec.details.profitability}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${rec.details.oversupply_risk > 70 ? 'bg-red-100 text-red-700' :
                                rec.details.oversupply_risk > 40 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                {rec.details.oversupply_risk}
                              </span>
                            </td>
                            <td className="p-4 font-bold text-emerald-600 text-lg">{rec.final_score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
