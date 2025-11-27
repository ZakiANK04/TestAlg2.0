import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

export default function FarmForm({ onFarmCreated }) {
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        size_hectares: '',
        soil_type: 'Loam'
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const { t } = useLanguage()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setSuccess(false)
        try {
            const res = await fetch('http://127.0.0.1:8000/api/farms/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
            if (res.ok) {
                const data = await res.json()
                console.log('Farm created:', data)
                onFarmCreated(data)
                setSuccess(true)
                // Clear form
                setFormData({
                    name: '',
                    location: '',
                    size_hectares: '',
                    soil_type: 'Loam'
                })
                setTimeout(() => setSuccess(false), 3000)
            } else {
                console.error('Failed to create farm')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-emerald-100 card-hover">
            <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
                {t('updateFarmDetails')}
            </h2>
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 animate-fade-in">
                    Farm updated successfully! Recommendations refreshed.
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                        {t('location')}
                    </label>
                    <input
                        type="text"
                        required
                        className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Mitidja"
                    />
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
                        {t('soilType')}
                    </label>
                    <select
                        className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                        value={formData.soil_type}
                        onChange={e => setFormData({ ...formData, soil_type: e.target.value })}
                    >
                        <option value="Loam">Loam (Balanced)</option>
                        <option value="Clay">Clay (Heavy)</option>
                        <option value="Sand">Sand (Draining)</option>
                        <option value="Silt">Silt (Fertile)</option>
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-lg font-bold hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            {t('updating')}
                        </span>
                    ) : (
                        t('updateAnalysis')
                    )}
                </button>
            </form>
        </div>
    )
}
