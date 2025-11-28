import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

export default function LandingPage() {
    const navigate = useNavigate()
    const { language, setLanguage, t } = useLanguage()
    const [currentBg, setCurrentBg] = useState(0)

    const backgrounds = [
        '/agriculture_field_1_1764285615381.png',
        '/agriculture_field_2_1764285629416.png',
        '/agriculture_field_3_1764285642910.png'
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % backgrounds.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    const features = [
        {
            title: t('smartCropRec'),
            description: t('smartCropRecDesc')
        },
        {
            title: t('marketPrice'),
            description: t('marketPriceDesc')
        },
        {
            title: t('riskWarnings'),
            description: t('riskWarningsDesc')
        },
        {
            title: t('weatherAnalysis'),
            description: t('weatherAnalysisDesc')
        },
        {
            title: t('realtimeMonitoring'),
            description: t('realtimeMonitoringDesc')
        }
    ]

    return (
        <div className="min-h-screen bg-slate-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Navigation */}
            <nav className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                    <motion.div
                        className="flex items-center gap-2 sm:gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <img src="/logo.png" alt="AgroVisor Logo" className="h-8 sm:h-10 md:h-12 w-auto object-contain" />
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                            AgroVisor
                        </h1>
                    </motion.div>
                    <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
                        {/* Language Switcher */}
                        <div className="flex gap-0.5 sm:gap-1 md:gap-2">
                            {['en', 'fr', 'ar'].map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => setLanguage(lang)}
                                    className={`px-1.5 sm:px-2 md:px-3 py-1 text-xs sm:text-sm rounded-lg font-medium transition-all ${language === lang
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    {lang.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-emerald-700 hover:text-emerald-800 font-medium transition"
                        >
                            <span className="hidden sm:inline">{t('login')}</span>
                            <span className="sm:hidden">Login</span>
                        </button>
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:shadow-lg transition-all"
                        >
                            <span className="hidden sm:inline">{t('getStarted')}</span>
                            <span className="sm:hidden">Start</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section with Background Images */}
            <section className="relative min-h-[400px] sm:min-h-[500px] md:min-h-[600px] flex items-center overflow-hidden">
                {/* Background Images with Fade Effect */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentBg}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${backgrounds[currentBg]})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                    </motion.div>
                </AnimatePresence>

                <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 relative z-10">
                    <div className="max-w-2xl">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeIn}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg">
                                {t('heroTitle')}
                            </h2>
                            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed drop-shadow">
                                {t('heroSubtitle')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <motion.button
                                    onClick={() => navigate('/signup')}
                                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-semibold text-base sm:text-lg hover:shadow-2xl transition-all"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {t('startFreeTrial')}
                                </motion.button>
                                <motion.button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-lg font-semibold text-base sm:text-lg hover:bg-white/20 transition-all"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {t('watchDemo')}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Slide Indicators */}
                <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                    {backgrounds.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentBg(index)}
                            className={`h-2 rounded-full transition-all ${currentBg === index ? 'bg-white w-6 sm:w-8' : 'bg-white/50 w-2'
                                }`}
                        />
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-white py-12 sm:py-16 md:py-20">
                <div className="container mx-auto px-4 sm:px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                        className="text-center mb-8 sm:mb-12 md:mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">
                            {t('featuresTitle')}
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl text-slate-600 px-4">
                            {t('featuresSubtitle')}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group bg-gradient-to-br from-slate-50 to-white p-8 rounded-xl shadow-md hover:shadow-2xl transition-all border border-slate-100 hover:border-emerald-200"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-emerald-600 to-emerald-700 py-12 sm:py-16 md:py-20">
                <div className="container mx-auto px-4 sm:px-6 text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 px-4">
                            {t('ctaTitle')}
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl text-emerald-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                            {t('ctaSubtitle')}
                        </p>
                        <motion.button
                            onClick={() => navigate('/signup')}
                            className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-white text-emerald-700 rounded-lg font-bold text-base sm:text-lg hover:bg-emerald-50 transition-all shadow-xl hover:shadow-2xl"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {t('getStartedNow')}
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-12">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-slate-400">
                        © 2025 AgroVisor. {t('footerText')}
                    </p>
                </div>
            </footer>
        </div>
    )
}
