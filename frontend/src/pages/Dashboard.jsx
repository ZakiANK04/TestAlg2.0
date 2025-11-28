import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import FarmForm from '../components/FarmForm'
import axios from 'axios'

function Dashboard() {
  const [recommendations, setRecommendations] = useState([])
  const [intendedCropAnalysis, setIntendedCropAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentFarmId, setCurrentFarmId] = useState(null)
  const [farmDetails, setFarmDetails] = useState(null)
  const [farms, setFarms] = useState([])
  const navigate = useNavigate()
  const { language, setLanguage, t, translateCrop, translateRegion } = useLanguage()
  const { user, logout } = useAuth()

  // Fetch user's farms
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      axios.get('http://127.0.0.1:8000/api/farms/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => {
          setFarms(res.data)
          if (res.data.length > 0 && !currentFarmId) {
            setCurrentFarmId(res.data[0].id)
            setFarmDetails(res.data[0])
          }
        })
        .catch(err => {
          console.error('Error fetching farms:', err)
        })
    }
  }, [])

  const fetchRecommendations = (farmId) => {
    if (!farmId) return
    
    console.log('Fetching recommendations for farm:', farmId)
    setLoading(true)
    const token = localStorage.getItem('access_token')
    
    axios.get(`http://127.0.0.1:8000/api/recommendations/${farmId}/`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        language: language || 'en'  // Pass selected language to backend
      }
    })
      .then(res => {
        console.log('Recommendations received:', res.data)
        setRecommendations(res.data.recommendations || res.data)
        setIntendedCropAnalysis(res.data.intended_crop_analysis || null)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching recommendations:', err)
        if (err.response?.status === 401) {
          logout()
          navigate('/login')
        }
        setLoading(false)
      })
  }

  useEffect(() => {
    if (currentFarmId) {
      fetchRecommendations(currentFarmId)
    }
  }, [currentFarmId, language]) // Refresh when language changes

  useEffect(() => {
    // Set document direction based on language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  const handleFarmCreated = (newFarm) => {
    console.log('New farm created, updating ID to:', newFarm.id)
    setCurrentFarmId(newFarm.id)
    setFarmDetails(newFarm)
  }

  const topRec = recommendations.length > 0 ? recommendations[0] : null

  return (
    <div className="min-h-screen">
      <nav className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-3 sm:p-4 shadow-xl">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">AgriData Insight</h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
            {user && (
              <span className="text-emerald-100 text-sm sm:text-base hidden sm:inline">
                {t('welcome')} {user.first_name || user.username}
              </span>
            )}
            <div className="flex gap-1 sm:gap-2">
              {['en', 'fr', 'ar'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg font-medium transition-all ${language === lang
                      ? 'bg-emerald-900 text-white'
                      : 'bg-emerald-800/50 text-emerald-100 hover:bg-emerald-800'
                    }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="bg-emerald-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-emerald-900 transition-all hover:scale-105 text-xs sm:text-sm md:text-base"
            >
              {t('aiAnalytics')}
            </button>
            <button
              onClick={() => {
                logout()
                navigate('/')
              }}
              className="bg-red-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-red-700 transition-all hover:scale-105 text-xs sm:text-sm md:text-base"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="lg:col-span-1 animate-slide-in">
            {farms.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-emerald-100">
                <h3 className="font-semibold text-slate-800 mb-2 sm:mb-3 text-sm sm:text-base">{t('selectFarm')}</h3>
                <select
                  className="w-full p-2 sm:p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm sm:text-base"
                  value={currentFarmId || ''}
                  onChange={(e) => {
                    const farmId = parseInt(e.target.value)
                    setCurrentFarmId(farmId)
                    const farm = farms.find(f => f.id === farmId)
                    setFarmDetails(farm)
                  }}
                >
                  {farms.map(farm => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name} - {translateRegion(farm.location)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <FarmForm onFarmCreated={handleFarmCreated} />

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-emerald-100 card-hover">
              <h3 className="font-semibold text-slate-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                {t('currentContext')}
              </h3>
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-xs sm:text-sm text-slate-600">
                  <span className="font-medium text-emerald-700">{t('farmId')}:</span> {currentFarmId}
                </p>
                <p className="text-xs sm:text-sm text-slate-600">
                  <span className="font-medium text-emerald-700">{t('location')}:</span> {farmDetails ? translateRegion(farmDetails.location) : translateRegion('Mitidja')}
                </p>
                <p className="text-xs sm:text-sm text-slate-600">
                  <span className="font-medium text-emerald-700">{t('soilType')}:</span> {farmDetails ? farmDetails.soil_type : 'Loam (Default)'}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {!currentFarmId ? (
              <div className="flex flex-col items-center justify-center p-8 sm:p-16 animate-fade-in">
                <p className="text-slate-500 text-base sm:text-lg">{t('noFarmsMessage')}</p>
                <p className="text-slate-400 text-xs sm:text-sm mt-2">{t('createFarmFirst')}</p>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center p-8 sm:p-16 animate-fade-in">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-3 sm:mb-4"></div>
                <p className="text-slate-500 text-base sm:text-lg">{t('analyzingData')}</p>
              </div>
            ) : (
              <div className="animate-fade-in">
                {/* Intended Crop Analysis Section */}
                {intendedCropAnalysis && (
                  <div className={`rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border-2 ${
                    intendedCropAnalysis.is_recommended 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400' 
                      : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-400'
                  }`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          intendedCropAnalysis.is_recommended ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {intendedCropAnalysis.is_recommended ? (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800">
                            {t('yourCropAnalysis')}: {translateCrop(intendedCropAnalysis.crop_name)}
                          </h3>
                          <p className={`text-base sm:text-lg font-semibold ${
                            intendedCropAnalysis.is_recommended ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {intendedCropAnalysis.is_recommended ? t('recommended') : t('notRecommended')}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1">{intendedCropAnalysis.recommendation}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        {intendedCropAnalysis.confidence && (
                          <p className="text-xs text-slate-500 capitalize">{t('confidence')}: {intendedCropAnalysis.confidence}</p>
                        )}
                      </div>
                    </div>

                    {/* Model Values Breakdown */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">{t('pricePredictor')}</p>
                        <p className="text-2xl font-bold text-slate-800">{Number(intendedCropAnalysis.details?.price_forecast || 0).toFixed(1)} {t('daPerKg')}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">{t('yield')}</p>
                        <p className="text-2xl font-bold text-slate-800">{Number(intendedCropAnalysis.details?.yield_per_ha || 0).toFixed(1)} {t('tonsPerHa')}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">{t('risk')}</p>
                        <p className="text-2xl font-bold text-red-600">{Number(intendedCropAnalysis.details?.oversupply_risk || 0).toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Advice for Intended Crop */}
                    {intendedCropAnalysis.advice && intendedCropAnalysis.advice.length > 0 && (
                      <div className="mb-4 sm:mb-6">
                        <h4 className="font-bold text-slate-800 mb-2 sm:mb-3 text-sm sm:text-base">{t('aiAdvice')}</h4>
                        <div className="space-y-2">
                          {intendedCropAnalysis.advice.slice(0, 3).map((advice, index) => (
                            <div key={index} className="bg-white rounded-lg p-2 sm:p-3 border-l-4 border-emerald-500">
                              <p className="text-xs sm:text-sm text-slate-700">
                                {typeof advice === 'object' ? advice.message : advice}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {topRec && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-gradient-to-br from-emerald-50 to-white p-4 sm:p-6 rounded-xl shadow-lg border-2 border-emerald-400 top-recommendation">
                      <h3 className="font-medium text-emerald-600 mb-2 flex items-center gap-2 text-sm sm:text-base">
                        {t('topRecommendation')}
                      </h3>
                      <p className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-2">{translateCrop(topRec.crop)}</p>
                      <p className="text-xs sm:text-sm text-emerald-700 font-semibold">{t('oversupplyRisk')}: {Number(topRec.details.oversupply_risk).toFixed(1)}%</p>
                    </div>

                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 card-hover">
                      <h3 className="font-medium text-slate-500 mb-2 flex items-center gap-2 text-sm sm:text-base">
                        {t('pricePredictor')}
                      </h3>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-1">{Number(topRec.details.price_forecast).toFixed(1)} {t('daPerKg')}</p>
                      <p className="text-xs sm:text-sm text-slate-500">{t('expectedPrice')}</p>
                    </div>

                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 card-hover">
                      <h3 className="font-medium text-slate-500 mb-2 flex items-center gap-2 text-sm sm:text-base">
                        {t('expectedYield')}
                      </h3>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-1">{Number(topRec.details.expected_yield_tons).toFixed(1)} {t('tons')}</p>
                      <p className="text-xs sm:text-sm text-slate-500">{t('totalHarvest')}</p>
                    </div>

                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 card-hover">
                      <h3 className="font-medium text-slate-500 mb-2 flex items-center gap-2 text-sm sm:text-base">
                        {t('expectedRevenue')}
                      </h3>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-600 mb-1">{(topRec.details.expected_revenue_da / 1000).toFixed(0)}K DA</p>
                      <p className="text-xs sm:text-sm text-slate-500">{t('estimatedIncome')}</p>
                    </div>
                  </div>
                )}


                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                  <div className="p-3 sm:p-5 bg-gradient-to-r from-slate-50 to-emerald-50 border-b border-slate-200">
                    <h3 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
                      {t('detailedAnalysis')}
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                      <thead className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="p-2 sm:p-4 font-semibold">{t('crop')}</th>
                          <th className="p-2 sm:p-4 font-semibold">{t('pricePredictor')}</th>
                          <th className="p-2 sm:p-4 font-semibold">{t('yield')}</th>
                          <th className="p-2 sm:p-4 font-semibold">{t('risk')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recommendations.map((rec, i) => (
                          <tr key={i} className="hover:bg-emerald-50 transition-colors duration-200">
                            <td className="p-2 sm:p-4 font-semibold text-slate-800 text-sm sm:text-base">{translateCrop(rec.crop)}</td>
                            <td className="p-2 sm:p-4 text-slate-600 text-xs sm:text-sm">{Number(rec.details.price_forecast).toFixed(1)} {t('daPerKg')}</td>
                            <td className="p-2 sm:p-4 text-slate-600 text-xs sm:text-sm">{Number(rec.details.yield_per_ha || 0).toFixed(1)} {t('tonsPerHa')}</td>
                            <td className="p-2 sm:p-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${rec.details.oversupply_risk > 70 ? 'bg-red-100 text-red-700' :
                                rec.details.oversupply_risk > 40 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                {Number(rec.details.oversupply_risk).toFixed(1)}%
                              </span>
                            </td>
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
