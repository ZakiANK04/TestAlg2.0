import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useLanguage } from '../contexts/LanguageContext'

export default function Login() {
    const navigate = useNavigate()
    const { language, setLanguage, t } = useLanguage()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
                username: formData.email,
                password: formData.password
            })

            localStorage.setItem('access_token', response.data.access)
            localStorage.setItem('refresh_token', response.data.refresh)

            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid email or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-6 relative">
            {/* Language Selector */}
            <div className="absolute top-6 right-6 flex gap-2">
                {['en', 'fr', 'ar'].map((lang) => (
                    <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all ${language === lang
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
                            }`}
                    >
                        {lang.toUpperCase()}
                    </button>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">{t('welcomeBack')}</h1>
                    <p className="text-slate-600">{t('signInToAccount')}</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            {t('emailAddress')}
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="farmer@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            {t('password')}
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-lg font-bold text-lg hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-50 shadow-lg"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                {t('signingIn')}
                            </span>
                        ) : (
                            t('signIn')
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-slate-600">
                        {t('dontHaveAccount')}{' '}
                        <button
                            onClick={() => navigate('/signup')}
                            className="text-emerald-600 font-semibold hover:text-emerald-700 transition"
                        >
                            {t('signUp')}
                        </button>
                    </p>
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-slate-500 hover:text-slate-700 transition"
                    >
                        ← {t('backToHome')}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
