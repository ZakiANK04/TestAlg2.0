import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import axios from 'axios'

export default function FarmForm({ onFarmCreated, currentFarm }) {
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        region: null,
        size_hectares: '',
        soil_type: 'Loam',
        intended_crop: null
    })
    const [regions, setRegions] = useState([])
    const [crops, setCrops] = useState([])
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [isUpdated, setIsUpdated] = useState(false)
    const [error, setError] = useState(null)
    const [existingFarms, setExistingFarms] = useState([])
    const { t, language, translateCrop, translateRegion } = useLanguage()

    // Fetch regions, crops, and existing farms on component mount
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/regions/')
            .then(res => {
                setRegions(res.data)
            })
            .catch(err => {
                console.error('Error fetching regions:', err)
            })
        
        axios.get('http://127.0.0.1:8000/api/crops/')
            .then(res => {
                setCrops(res.data)
            })
            .catch(err => {
                console.error('Error fetching crops:', err)
            })
        
        // Fetch existing farms to check for duplicates
        const token = localStorage.getItem('access_token')
        if (token) {
            axios.get('http://127.0.0.1:8000/api/farms/', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(res => {
                    setExistingFarms(res.data)
                })
                .catch(err => {
                    console.error('Error fetching farms:', err)
                })
        }
    }, [])

    // Populate form when currentFarm changes
    useEffect(() => {
        if (currentFarm) {
            setFormData({
                name: currentFarm.name || '',
                location: currentFarm.location || '',
                region: currentFarm.region || null,
                size_hectares: currentFarm.size_hectares || '',
                soil_type: currentFarm.soil_type || 'Loam',
                intended_crop: currentFarm.intended_crop || null
            })
        }
    }, [currentFarm])

    // Auto-fill soil type when region is selected
    const handleRegionChange = (regionId) => {
        const selectedRegion = regions.find(r => r.id === parseInt(regionId))
        if (selectedRegion) {
            setFormData({
                ...formData,
                region: selectedRegion.id,
                location: selectedRegion.name,
                soil_type: selectedRegion.soil_type
            })
        }
    }

    const handleUpdateFarm = async (e) => {
        e.preventDefault()
        if (!currentFarm || !currentFarm.id) {
            alert(t('noFarmSelected') || 'Please select a farm to update')
            return
        }
        
        setLoading(true)
        setSuccess(false)
        setError(null)
        
        // Check for duplicate farm name on frontend (excluding current farm)
        const duplicateFarm = existingFarms.find(farm => 
            farm.id !== currentFarm.id && 
            farm.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
        )
        
        if (duplicateFarm) {
            setError(t('farmNameExists'))
            setLoading(false)
            return
        }
        
        try {
            const token = localStorage.getItem('access_token')
            const res = await fetch(`http://127.0.0.1:8000/api/farms/${currentFarm.id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    location: formData.location,
                    region: formData.region,
                    size_hectares: formData.size_hectares,
                    soil_type: formData.soil_type,
                    intended_crop: formData.intended_crop
                }),
            })
            
            if (res.ok) {
                const data = await res.json()
                console.log('Farm updated:', data)
                setIsUpdated(true)
                
                onFarmCreated(data)
                setSuccess(true)
                setTimeout(() => {
                    setSuccess(false)
                    setIsUpdated(false)
                }, 3000)
                // Reload page to refresh farms list
                window.location.reload()
            } else {
                console.error('Failed to update farm')
                const errorData = await res.json().catch(() => ({}))
                const errorTitle = t('error') || 'Error'
                let errorBody = t('farmSaveError') || 'Failed to update farm. Please try again.'
                
                // Extract error message from backend response
                if (errorData.name && Array.isArray(errorData.name)) {
                    errorBody = errorData.name[0]
                } else if (errorData.detail) {
                    errorBody = errorData.detail
                } else if (errorData.message) {
                    errorBody = errorData.message
                }
                
                setError(errorBody)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (!currentFarm) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-emerald-100 card-hover">
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-slate-800 flex items-center gap-2">
                    {t('updateFarmDetails')}
                </h2>
                <p className="text-slate-600">{t('noFarmSelected') || 'Please select a farm to update'}</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-emerald-100 card-hover">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-slate-800 flex items-center gap-2">
                {t('updateFarmDetails')}
            </h2>
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-3 sm:mb-4 animate-fade-in text-sm sm:text-base">
                    {t('farmUpdatedSuccess') || 'Farm updated successfully!'}
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-3 sm:mb-4 animate-fade-in text-sm sm:text-base">
                    {error}
                </div>
            )}
            <form onSubmit={handleUpdateFarm} className="space-y-3 sm:space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {t('farmName')}
                    </label>
                    <input
                        type="text"
                        required
                        className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. My Sunny Plot"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {t('location')} / {t('region')}
                    </label>
                    <select
                        required
                        className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                        value={formData.region || ''}
                        onChange={e => handleRegionChange(e.target.value)}
                    >
                        <option value="">{t('selectRegion')}</option>
                        {regions.map(region => (
                            <option key={region.id} value={region.id}>
                                {translateRegion(region.name)}
                            </option>
                        ))}
                    </select>
                    {formData.location && (
                        <p className="text-xs text-slate-500 mt-1">
                            {t('selectedRegion')}: {translateRegion(formData.location)}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {t('size')}
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        required
                        className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        value={formData.size_hectares}
                        onChange={e => setFormData({ ...formData, size_hectares: e.target.value })}
                        placeholder="e.g. 5.5"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {t('soilType')} {formData.soil_type && <span className="text-emerald-600">({t('autoDetected')})</span>}
                    </label>
                    <select
                        className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                        value={formData.soil_type}
                        onChange={e => setFormData({ ...formData, soil_type: e.target.value })}
                    >
                        <option value="Loam">{t('soilLoam')}</option>
                        <option value="Clay">{t('soilClay')}</option>
                        <option value="Clay-Loam">{t('soilClayLoam')}</option>
                        <option value="Sandy">{t('soilSandy')}</option>
                        <option value="Sandy-Loam">{t('soilSandyLoam')}</option>
                        <option value="Silty">{t('soilSilt')}</option>
                        <option value="Semi-arid Soil">{t('soilSemiArid')}</option>
                        <option value="Desert Soil">{t('soilDesert')}</option>
                        <option value="Oasis Soil">{t('soilOasis')}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {t('intendedCrop')} ({t('optional')})
                    </label>
                    <select
                        className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                        value={formData.intended_crop || ''}
                        onChange={e => setFormData({ ...formData, intended_crop: e.target.value ? parseInt(e.target.value) : null })}
                    >
                        <option value="">{t('selectIntendedCrop')}</option>
                        {crops.map(crop => (
                            <option key={crop.id} value={crop.id}>
                                {translateCrop(crop.name)}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                        {t('intendedCropHelp')}
                    </p>
                </div>
                <button
                    type="submit"
                    disabled={loading || !currentFarm}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-lg font-bold hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            {t('updating')}
                        </span>
                    ) : (
                        t('updateFarmDetails')
                    )}
                </button>
            </form>
        </div>
    )
}
