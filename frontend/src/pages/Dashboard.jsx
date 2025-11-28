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
  const { language, setLanguage, t, translateCrop } = useLanguage()
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
                      {farm.name} - {farm.location}
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
                  <span className="font-medium text-emerald-700">{t('location')}:</span> {farmDetails ? farmDetails.location : 'Mitidja (Default)'}
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
                        <p className="text-2xl sm:text-3xl font-bold text-slate-800">{intendedCropAnalysis.final_score}</p>
                        <p className="text-xs sm:text-sm text-slate-600">{t('finalScore')}</p>
                        {intendedCropAnalysis.confidence && (
                          <p className="text-xs text-slate-500 mt-1 capitalize">{t('confidence')}: {intendedCropAnalysis.confidence}</p>
                        )}
                      </div>
                    </div>

                    {/* Scores Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">{t('suitability')}</p>
                        <p className="text-2xl font-bold text-slate-800">{intendedCropAnalysis.scores.soil}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">{t('yield')}</p>
                        <p className="text-2xl font-bold text-slate-800">{intendedCropAnalysis.scores.yield}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">{t('profit')}</p>
                        <p className="text-2xl font-bold text-slate-800">{intendedCropAnalysis.scores.profit}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">{t('risk')}</p>
                        <p className="text-2xl font-bold text-red-600">{intendedCropAnalysis.scores.risk}</p>
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

                    {/* Alternatives Section */}
                    {intendedCropAnalysis.alternatives && intendedCropAnalysis.alternatives.length > 0 && (
                      <div className="bg-white rounded-lg p-4 sm:p-6 border-2 border-blue-300">
                        <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          {t('alternatives')}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4">
                          {t('alternativesDescription')}
                        </p>
                        <div className="space-y-2 sm:space-y-3">
                          {intendedCropAnalysis.alternatives.map((alt, index) => (
                            <div key={index} className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                                <h5 className="font-bold text-base sm:text-lg text-slate-800">{translateCrop(alt.crop)}</h5>
                                <span className="bg-emerald-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                                  {alt.score}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-700 mb-2">
                                <span className="font-semibold">{t('reason')}:</span> {alt.reason}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                <div>
                                  <span className="text-slate-500">{t('roi')}:</span>
                                  <span className="font-semibold text-emerald-600 ml-1">{alt.details.roi_percent}%</span>
                                </div>
                                <div>
                                  <span className="text-slate-500">{t('profit')}:</span>
                                  <span className="font-semibold text-emerald-600 ml-1">{alt.details.profit_per_ha?.toLocaleString()} DA/ha</span>
                                </div>
                                <div>
                                  <span className="text-slate-500">{t('risk')}:</span>
                                  <span className="font-semibold text-red-600 ml-1">{alt.details.oversupply_risk}</span>
                                </div>
                              </div>
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
                      <p className="text-xs sm:text-sm text-emerald-700 font-semibold">{t('score')}: {topRec.final_score}/100</p>
                    </div>

                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 card-hover">
                      <h3 className="font-medium text-slate-500 mb-2 flex items-center gap-2 text-sm sm:text-base">
                        {t('recommendedArea')}
                      </h3>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-1">{topRec.details.recommended_area_ha} ha</p>
                      <p className="text-xs sm:text-sm text-slate-500">{t('ofYourFarm')}</p>
                    </div>

                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 card-hover">
                      <h3 className="font-medium text-slate-500 mb-2 flex items-center gap-2 text-sm sm:text-base">
                        {t('expectedYield')}
                      </h3>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-1">{topRec.details.expected_yield_tons} tons</p>
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

                {/* AI Advice Section - Structured */}
                {topRec && topRec.advice && topRec.advice.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border-2 border-emerald-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                            {t('aiAdvice')} - {translateCrop(topRec.crop)}
                          </h3>
                          {topRec.confidence && (
                            <p className="text-xs sm:text-sm text-slate-600">
                              {t('confidence')}: <span className="font-semibold capitalize">{topRec.confidence}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Group advice by category */}
                    {['critical', 'warning', 'recommendation', 'opportunity', 'info'].map(category => {
                      const categoryAdvice = topRec.advice.filter(a => 
                        typeof a === 'object' ? a.category === category : false
                      );
                      if (categoryAdvice.length === 0) return null;
                      
                      const categoryStyles = {
                        critical: { bg: 'bg-red-50', border: 'border-red-500', icon: '🚨', title: t('criticalAdvice') },
                        warning: { bg: 'bg-yellow-50', border: 'border-yellow-500', icon: '⚠️', title: t('warnings') },
                        recommendation: { bg: 'bg-blue-50', border: 'border-blue-500', icon: '💡', title: t('recommendations') },
                        opportunity: { bg: 'bg-green-50', border: 'border-green-500', icon: '💰', title: t('opportunities') },
                        info: { bg: 'bg-slate-50', border: 'border-slate-400', icon: 'ℹ️', title: t('information') }
                      };
                      
                      const style = categoryStyles[category];
                      
                      return (
                        <div key={category} className={`${style.bg} rounded-lg p-3 sm:p-4 mb-3 border-l-4 ${style.border}`}>
                          <h4 className="font-bold text-slate-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                            <span>{style.icon}</span>
                            {style.title}
                          </h4>
                          <div className="space-y-2 sm:space-y-3">
                            {categoryAdvice.map((advice, index) => (
                              <div key={index} className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                                <h5 className="font-semibold text-slate-800 mb-1 sm:mb-2 text-sm sm:text-base">{advice.title}</h5>
                                <p className="text-xs sm:text-sm text-slate-700 mb-2 leading-relaxed">{advice.message}</p>
                                <div className="bg-emerald-50 rounded p-2 border-l-2 border-emerald-400">
                                  <p className="text-xs sm:text-sm font-medium text-emerald-800">
                                    <span className="font-bold">{t('action')}:</span> {advice.action}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* All Recommendations Advice */}
                {recommendations.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-slate-200">
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t('allCropsAdvice')}
                    </h3>
                    <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                      {recommendations.slice(0, 5).map((rec, index) => (
                        rec.advice && rec.advice.length > 0 && (
                          <div key={index} className="border-b border-slate-200 pb-3 sm:pb-4 last:border-0">
                            <h4 className="font-semibold text-emerald-700 mb-2 text-sm sm:text-base">
                              {translateCrop(rec.crop)} ({t('score')}: {rec.final_score})
                            </h4>
                            <ul className="space-y-1 sm:space-y-2">
                              {rec.advice.slice(0, 3).map((advice, advIndex) => {
                                const adviceText = typeof advice === 'object' ? advice.message : advice;
                                const adviceTitle = typeof advice === 'object' ? advice.title : null;
                                return (
                                  <li key={advIndex} className="text-xs sm:text-sm text-slate-600">
                                    {adviceTitle && <span className="font-semibold text-slate-800">{adviceTitle}: </span>}
                                    <span>{adviceText}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )
                      ))}
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
                          <th className="p-2 sm:p-4 font-semibold">{t('suitability')}</th>
                          <th className="p-2 sm:p-4 font-semibold">{t('yield')}</th>
                          <th className="p-2 sm:p-4 font-semibold">{t('profit')}</th>
                          <th className="p-2 sm:p-4 font-semibold">{t('risk')}</th>
                          <th className="p-2 sm:p-4 font-semibold">{t('finalScore')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recommendations.map((rec, i) => (
                          <tr key={i} className="hover:bg-emerald-50 transition-colors duration-200">
                            <td className="p-2 sm:p-4 font-semibold text-slate-800 text-sm sm:text-base">{translateCrop(rec.crop)}</td>
                            <td className="p-2 sm:p-4 text-slate-600 text-xs sm:text-sm">{rec.details.soil_suitability}</td>
                            <td className="p-2 sm:p-4 text-slate-600 text-xs sm:text-sm">{rec.details.yield_forecast}</td>
                            <td className="p-2 sm:p-4 text-slate-600 text-xs sm:text-sm">{rec.details.profitability}</td>
                            <td className="p-2 sm:p-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${rec.details.oversupply_risk > 70 ? 'bg-red-100 text-red-700' :
                                rec.details.oversupply_risk > 40 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                {rec.details.oversupply_risk}
                              </span>
                            </td>
                            <td className="p-2 sm:p-4 font-bold text-emerald-600 text-base sm:text-lg">{rec.final_score}</td>
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
