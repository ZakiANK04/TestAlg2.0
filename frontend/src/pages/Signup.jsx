import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'

export default function Signup() {
    const navigate = useNavigate()
    const { language, setLanguage, t } = useLanguage()
    const { login } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/auth/register/', {
                email: formData.email,
                password: formData.password,
                first_name: formData.firstName,
                last_name: formData.lastName
            })

            // Use auth context to login
            login(response.data.access, response.data.refresh, response.data.user)

            navigate('/dashboard')
        } catch (err) {
            console.error('Registration error:', err)
            let errorMessage = 'Registration failed. Please try again.'
            
            if (err.response) {
                // Server responded with error
                const data = err.response.data
                if (data.email && Array.isArray(data.email)) {
                    errorMessage = data.email[0]
                } else if (data.username && Array.isArray(data.username)) {
                    errorMessage = `Username: ${data.username[0]}`
                } else if (data.password && Array.isArray(data.password)) {
                    errorMessage = `Password: ${data.password[0]}`
                } else if (data.detail) {
                    errorMessage = data.detail
                } else if (typeof data === 'object') {
                    // Try to extract first error message from any field
                    const firstError = Object.values(data).find(val => Array.isArray(val) && val.length > 0)
                    if (firstError) {
                        errorMessage = firstError[0]
                    } else {
                        errorMessage = JSON.stringify(data)
                    }
                }
            } else if (err.request) {
                // Request was made but no response received
                errorMessage = 'Unable to connect to server. Please make sure the backend is running.'
            } else {
                // Error setting up request
                errorMessage = err.message || 'An error occurred. Please try again.'
            }
            
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4 sm:p-6 relative">
            {/* Language Selector */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex gap-1 sm:gap-2">
                {['en', 'fr', 'ar'].map((lang) => (
                    <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium transition-all text-xs sm:text-sm ${language === lang
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
                className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md"
            >
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">{t('createAccount')}</h1>
                    <p className="text-sm sm:text-base text-slate-600">{t('joinToday')}</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                {t('firstName')}
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                placeholder="Ahmed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                {t('lastName')}
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder="Benali"
                            />
                        </div>
                    </div>

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

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            {t('confirmPassword')}
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                            value={formData.confirmPassword}
                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                                {t('creatingAccount')}
                            </span>
                        ) : (
                            t('createAccount')
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-slate-600">
                        {t('alreadyHaveAccount')}{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-emerald-600 font-semibold hover:text-emerald-700 transition"
                        >
                            {t('signIn')}
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
