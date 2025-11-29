import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import FarmForm from '../components/FarmForm'
import AddFarmForm from '../components/AddFarmForm'
import FloatingChatbot from '../components/FloatingChatbot'
import Toast from '../components/Toast'
import FarmMap from '../components/FarmMap'
import axios from 'axios'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

function Dashboard() {
  const [recommendations, setRecommendations] = useState([])
  const [intendedCropAnalysis, setIntendedCropAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentFarmId, setCurrentFarmId] = useState(null)
  const [farmDetails, setFarmDetails] = useState(null)
  const [farms, setFarms] = useState([])
  const navigate = useNavigate()
  const { language, setLanguage, t, translateCrop, translateRegion, translateSoil, translateConfidence, translateRecommendation } = useLanguage()
  const { user, logout } = useAuth()

  // Fetch user's farms
  const fetchFarms = () => {
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
  }

  useEffect(() => {
    fetchFarms()
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

  // Reset alreadySaved when recommendations change (new crop analysis)
  useEffect(() => {
    setAlreadySaved(false)
    setSaveSuccess(false)
  }, [intendedCropAnalysis?.crop_name, currentFarmId])

  const handleFarmCreated = (newFarm) => {
    console.log('New farm created/updated, updating ID to:', newFarm.id)
    
    // Refresh farms list first
    fetchFarms()
    
    // Update current farm ID and details
    setCurrentFarmId(newFarm.id)
    setFarmDetails(newFarm)
    setShowFarmForm(false) // Close the form after successful creation
    
    // Show success notification
    setToast({
      message: t('farmSavedSuccessfully'),
      type: 'success'
    })
    
    // Automatically fetch recommendations for the new/updated farm
    // Use setTimeout to ensure state is updated
    setTimeout(() => {
      if (newFarm.id) {
        console.log('Fetching recommendations for farm:', newFarm.id)
        fetchRecommendations(newFarm.id)
      }
    }, 100)
  }

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [alreadySaved, setAlreadySaved] = useState(false)
  const [showFarmForm, setShowFarmForm] = useState(false)
  const [showAddFarmForm, setShowAddFarmForm] = useState(false)
  const [showCharts, setShowCharts] = useState(false)
  const [toast, setToast] = useState(null)

  const handleSaveModelResult = async (cropName, priceForecast, yieldPerHa, oversupplyRisk) => {
    if (!currentFarmId || alreadySaved) return
    
    setSaving(true)
    setSaveSuccess(false)
    const token = localStorage.getItem('access_token')
    
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/save-model-result/${currentFarmId}/`,
        {
          crop_name: cropName,
          price_forecast: priceForecast,
          yield_per_ha: yieldPerHa,
          oversupply_risk: oversupplyRisk
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      // If saved successfully or duplicate detected, mark as already saved
      if (response.data.duplicate || response.status === 201) {
        setSaveSuccess(true)
        setAlreadySaved(true)
        // Keep success state visible but don't reset it
      }
    } catch (error) {
      console.error('Error saving model result:', error)
      
      // If it's a duplicate, show success message and mark as already saved
      if (error.response?.data?.duplicate) {
        setSaveSuccess(true)
        setAlreadySaved(true)
      } else {
        const errorMessage = error.response?.data?.error || error.response?.data?.details || error.response?.data?.message || error.message || 'Failed to save model result. Please try again.'
        alert(`Error: ${errorMessage}`)
      }
    } finally {
      setSaving(false)
    }
  }

  const topRec = recommendations.length > 0 ? recommendations[0] : null

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-3 sm:p-4 shadow-xl">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/logo.png" alt="AgroVisor Logo" className="h-8 sm:h-10 md:h-12 w-auto object-contain" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">AgroVisor</h1>
          </div>
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
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-emerald-100 card-hover">
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
            
            {/* Add New Farm Button */}
            <div className="mb-4 sm:mb-6">
              <button
                onClick={() => {
                  setShowAddFarmForm(!showAddFarmForm)
                  setShowFarmForm(false) // Close update form when opening add form
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>{t('addNewFarm')}</span>
              </button>
            </div>

            {/* Add Farm Form - Conditionally Rendered */}
            {showAddFarmForm && (
              <div className="mb-4 sm:mb-6">
                <AddFarmForm onFarmCreated={handleFarmCreated} />
              </div>
            )}

            {/* Update Farm Details Button */}
            <div className="mb-4 sm:mb-6">
              <button
                onClick={() => {
                  setShowFarmForm(!showFarmForm)
                  setShowAddFarmForm(false) // Close add form when opening update form
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>{t('updateFarmDetails')}</span>
              </button>
            </div>

            {/* Update Farm Form - Conditionally Rendered */}
            {showFarmForm && (
              <div className="mb-4 sm:mb-6">
                <FarmForm onFarmCreated={handleFarmCreated} currentFarm={farmDetails} />
              </div>
            )}

            {/* Farm Map Widget */}
            {currentFarmId && farmDetails && (
              <div className="mb-4 sm:mb-6">
                <FarmMap farmDetails={farmDetails} farms={farms} />
              </div>
            )}

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
                  <span className="font-medium text-emerald-700">{t('soilType')}:</span> {farmDetails ? translateSoil(farmDetails.soil_type) : translateSoil('Loam')}
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
                          <p className="text-xs sm:text-sm text-slate-600 mt-1">{translateRecommendation(intendedCropAnalysis.recommendation)}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        {intendedCropAnalysis.confidence && (
                          <p className="text-xs text-slate-500 capitalize">{t('confidence')}: {translateConfidence(intendedCropAnalysis.confidence)}</p>
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

                    {/* Save Model Result Button */}
                    {intendedCropAnalysis.details && (
                      <div className="mb-4 sm:mb-6">
                        <button
                          onClick={() => handleSaveModelResult(
                            intendedCropAnalysis.crop_name,
                            intendedCropAnalysis.details.price_forecast,
                            intendedCropAnalysis.details.yield_per_ha,
                            intendedCropAnalysis.details.oversupply_risk
                          )}
                          disabled={saving || alreadySaved}
                          className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2 ${
                            saving
                              ? 'bg-slate-400 cursor-not-allowed'
                              : saveSuccess
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-blue-600 hover:bg-blue-700'
                          } text-white`}
                        >
                          {saving ? (
                            <>
                              <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>{t('saving')}</span>
                            </>
                          ) : alreadySaved || saveSuccess ? (
                            <>
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{t('savedSuccessfully')}</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                              </svg>
                              <span>{t('acceptSuggestion')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Advice for Intended Crop */}
                    {intendedCropAnalysis.advice && intendedCropAnalysis.advice.length > 0 && (
                      <div className="mb-4 sm:mb-6">
                        <h4 className="font-bold text-slate-800 mb-2 sm:mb-3 text-sm sm:text-base">{t('aiAdvice')}</h4>
                        <div className="space-y-2">
                          {intendedCropAnalysis.advice.slice(0, 3).map((advice, index) => {
                            // Translate crop names and soil types in the advice text
                            const translateAdviceText = (text) => {
                              if (!text || typeof text !== 'string') return text
                              let translatedText = text
                              
                              // Translate crop names - process multi-word crops first, then single words
                              const cropNames = [
                                'Date Palm', // Multi-word first
                                'Potato', 'Carrot', 'Onion', 'Tomato', 'Wheat', 'Barley', 'Corn', 
                                'Lettuce', 'Pepper', 'Eggplant', 'Cucumber', 'Zucchini', 'Beans', 
                                'Peas', 'Cabbage', 'Broccoli', 'Cauliflower', 'Spinach', 'Radish', 
                                'Beetroot', 'Strawberry', 'Apple', 'Chickpea', 'Citrus', 'Dates', 
                                'Garlic', 'Lentils', 'Melon', 'Olive', 'Peanut', 'Rice', 'Watermelon'
                              ]
                              
                              cropNames.forEach(crop => {
                                const translatedCrop = translateCrop(crop)
                                if (translatedCrop !== crop) {
                                  // Escape special regex characters
                                  const escapedCrop = crop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                                  // Replace crop name (case insensitive, whole word)
                                  const regex = new RegExp(`\\b${escapedCrop}\\b`, 'gi')
                                  translatedText = translatedText.replace(regex, (match) => {
                                    // Preserve original case pattern
                                    if (match === match.toUpperCase()) return translatedCrop.toUpperCase()
                                    if (match[0] === match[0].toUpperCase()) {
                                      return translatedCrop.charAt(0).toUpperCase() + translatedCrop.slice(1)
                                    }
                                    return translatedCrop.toLowerCase()
                                  })
                                }
                              })
                              
                              // Translate soil types - process multi-word first
                              const soilTypes = [
                                'Semi-arid Soil', 'Desert Soil', 'Oasis Soil', 'Sandy-Loam', 'Clay-Loam', // Multi-word first
                                'Loam', 'Clay', 'Sandy', 'Silty'
                              ]
                              
                              soilTypes.forEach(soil => {
                                const translatedSoil = translateSoil(soil)
                                if (translatedSoil !== soil) {
                                  // Escape special regex characters
                                  const escapedSoil = soil.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                                  // Replace soil type (case insensitive, whole word)
                                  const regex = new RegExp(`\\b${escapedSoil}\\b`, 'gi')
                                  translatedText = translatedText.replace(regex, translatedSoil)
                                }
                              })
                              
                              return translatedText
                            }
                            
                            const adviceText = typeof advice === 'object' ? advice.message : advice
                            const translatedAdvice = translateAdviceText(adviceText)
                            
                            return (
                              <div key={index} className="bg-white rounded-lg p-2 sm:p-3 border-l-4 border-emerald-500">
                                <p className="text-xs sm:text-sm text-slate-700">
                                  {translatedAdvice}
                                </p>
                              </div>
                            )
                          })}
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

                {/* Charts & Analysis Button */}
                <div className="mb-4 sm:mb-6">
                  <button
                    onClick={() => setShowCharts(!showCharts)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>{t('chartsAndAnalysis')}</span>
                  </button>
                </div>

                {/* Charts & Detailed Analysis Section - Conditionally Rendered */}
                {showCharts && recommendations.length > 0 && (
                  <div className="space-y-4 sm:space-y-6 mb-4 sm:mb-6">
                    {/* Grid Layout for Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Crop Scores Pie Chart */}
                      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-slate-200 card-hover">
                        <h3 className="font-bold text-slate-800 text-base sm:text-lg mb-4">{t('cropScores') || 'Crop Scores'}</h3>
                        {recommendations.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={(() => {
                                  // Get all crops with scores
                                  const allCrops = recommendations.map(rec => {
                                    const score = Number(rec.final_score) || Number(rec.details?.final_score) || 0
                                    return {
                                      name: translateCrop(rec.crop),
                                      value: score,
                                      originalCrop: rec.crop
                                    }
                                  }).filter(item => item.value > 0).sort((a, b) => b.value - a.value)
                                  
                                  // Top 3 crops
                                  const top3 = allCrops.slice(0, 3)
                                  
                                  // Sum of remaining crops
                                  const rest = allCrops.slice(3).reduce((sum, item) => sum + item.value, 0)
                                  
                                  // Combine top 3 + rest
                                  const chartData = [...top3]
                                  if (rest > 0) {
                                    chartData.push({
                                      name: t('rest') || 'Rest',
                                      value: rest,
                                      originalCrop: 'rest'
                                    })
                                  }
                                  
                                  return chartData
                                })()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {(() => {
                                  const allCrops = recommendations.map(rec => {
                                    const score = Number(rec.final_score) || Number(rec.details?.final_score) || 0
                                    return { value: score }
                                  }).filter(item => item.value > 0).sort((a, b) => b.value - a.value)
                                  
                                  const top3 = allCrops.slice(0, 3)
                                  const rest = allCrops.slice(3).reduce((sum, item) => sum + item.value, 0)
                                  
                                  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']
                                  const cellCount = top3.length + (rest > 0 ? 1 : 0)
                                  
                                  return Array.from({ length: cellCount }, (_, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                  ))
                                })()}
                              </Pie>
                              <Tooltip formatter={(value) => [`${t('finalScore')}: ${Number(value).toFixed(1)}`, '']} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-[300px] text-slate-500">
                            {t('noData') || 'No data available'}
                          </div>
                        )}
                      </div>

                      {/* Price Comparison Bar Chart */}
                      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-slate-200 card-hover">
                        <h3 className="font-bold text-slate-800 text-base sm:text-lg mb-4">{t('priceComparison')}</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={recommendations.slice(0, 10).map(rec => ({
                            crop: translateCrop(rec.crop),
                            price: Number(rec.details.price_forecast).toFixed(1)
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="crop" angle={-45} textAnchor="end" height={100} fontSize={12} />
                            <YAxis label={{ value: t('daPerKg'), angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="price" fill="#10b981" name={t('pricePredictor')} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Detailed Analysis Table */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 card-hover">
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
                            {recommendations.map((rec, i) => {
                              // If this crop matches the intended crop, use values from intendedCropAnalysis
                              const isIntendedCrop = intendedCropAnalysis && 
                                intendedCropAnalysis.crop_name && 
                                intendedCropAnalysis.crop_name.toLowerCase() === rec.crop.toLowerCase()
                              
                              // Use intended crop analysis values if it matches, otherwise use recommendation values
                              const priceForecast = isIntendedCrop && intendedCropAnalysis.details?.price_forecast !== undefined
                                ? intendedCropAnalysis.details.price_forecast
                                : rec.details.price_forecast
                              
                              const yieldPerHa = isIntendedCrop && intendedCropAnalysis.details?.yield_per_ha !== undefined
                                ? intendedCropAnalysis.details.yield_per_ha
                                : (rec.details.yield_per_ha || 0)
                              
                              const oversupplyRisk = isIntendedCrop && intendedCropAnalysis.details?.oversupply_risk !== undefined
                                ? intendedCropAnalysis.details.oversupply_risk
                                : rec.details.oversupply_risk
                              
                              return (
                                <tr key={i} className="hover:bg-emerald-50 transition-colors duration-200">
                                  <td className="p-2 sm:p-4 font-semibold text-slate-800 text-sm sm:text-base">{translateCrop(rec.crop)}</td>
                                  <td className="p-2 sm:p-4 text-slate-600 text-xs sm:text-sm">{Number(priceForecast).toFixed(1)} {t('daPerKg')}</td>
                                  <td className="p-2 sm:p-4 text-slate-600 text-xs sm:text-sm">{Number(yieldPerHa).toFixed(1)} {t('tonsPerHa')}</td>
                                  <td className="p-2 sm:p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${oversupplyRisk > 70 ? 'bg-red-100 text-red-700' :
                                      oversupplyRisk > 40 ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                      }`}>
                                      {Number(oversupplyRisk).toFixed(1)}%
                                    </span>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Floating Chatbot */}
      <FloatingChatbot />
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default Dashboard
