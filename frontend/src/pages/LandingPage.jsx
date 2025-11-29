import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

export default function LandingPage() {
    const navigate = useNavigate()
    const { language, setLanguage, t } = useLanguage()
    const [currentBg, setCurrentBg] = useState(0)

    // Modern, stylish agriculture-related background images
    const backgrounds = [
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&q=80', // Modern farm with technology
        'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80', // Green fields with drone
        'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&q=80', // Smart agriculture technology
        'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&q=80'  // Modern greenhouse
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % backgrounds.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    // Parallax scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.pageYOffset
            const parallaxElements = document.querySelectorAll('.parallax-layer, .parallax-overlay')
            const parallaxContent = document.querySelectorAll('.parallax-content, .parallax-text')
            const parallaxFeatures = document.querySelectorAll('.parallax-feature-card, .parallax-feature-title')
            
            parallaxElements.forEach((element) => {
                const speed = 0.5
                const yPos = -(scrolled * speed)
                element.style.transform = `translate3d(0, ${yPos}px, 0)`
            })
            
            parallaxContent.forEach((element) => {
                const speed = 0.3
                const yPos = scrolled * speed
                element.style.transform = `translate3d(0, ${yPos}px, 0)`
            })
            
            parallaxFeatures.forEach((element, index) => {
                const rect = element.getBoundingClientRect()
                const windowHeight = window.innerHeight
                const elementTop = rect.top
                const elementVisible = 150
                
                if (elementTop < windowHeight - elementVisible && elementTop > -rect.height) {
                    const scrollProgress = (windowHeight - elementTop) / (windowHeight + rect.height)
                    const speed = 0.2 + (index * 0.05)
                    const yPos = scrollProgress * 50 * speed
                    element.style.transform = `translate3d(0, ${yPos}px, 0)`
                    element.style.opacity = Math.min(1, scrollProgress * 2)
                }
            })
        }
        
        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll() // Initial call
        
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    const features = [
        {
            title: t('smartCropRec'),
            description: t('smartCropRecDesc'),
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            )
        },
        {
            title: t('marketPrice'),
            description: t('marketPriceDesc'),
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            )
        },
        {
            title: t('riskWarnings'),
            description: t('riskWarningsDesc'),
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        },
        {
            title: t('weatherAnalysis'),
            description: t('weatherAnalysisDesc'),
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
            )
        },
        {
            title: t('realtimeMonitoring'),
            description: t('realtimeMonitoringDesc'),
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        }
    ]

    return (
        <div className="min-h-screen bg-slate-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Navigation with Enhanced Animations */}
            <motion.nav
                className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-emerald-100/50"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                    <motion.div
                        className="flex items-center gap-2 sm:gap-3 cursor-pointer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.img
                            src="/logo.png"
                            alt="AgroVisor Logo"
                            className="h-8 sm:h-10 md:h-12 w-auto object-contain"
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 0.5 }}
                        />
                        <motion.h1
                            className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent"
                            whileHover={{ scale: 1.05 }}
                        >
                            AgroVisor
                        </motion.h1>
                    </motion.div>
                    <motion.div
                        className="flex items-center gap-1 sm:gap-2 md:gap-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        {/* Language Switcher */}
                        <div className="flex gap-0.5 sm:gap-1 md:gap-2">
                            {['en', 'fr', 'ar'].map((lang, index) => (
                                <motion.button
                                    key={lang}
                                    onClick={() => setLanguage(lang)}
                                    className={`px-1.5 sm:px-2 md:px-3 py-1 text-xs sm:text-sm rounded-lg font-medium transition-all ${language === lang
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {lang.toUpperCase()}
                                </motion.button>
                            ))}
                        </div>
                        <motion.button
                            onClick={() => navigate('/login')}
                            className="px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-emerald-700 hover:text-emerald-800 font-medium transition"
                            whileHover={{ scale: 1.05, x: 2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="hidden sm:inline">{t('login')}</span>
                            <span className="sm:hidden">Login</span>
                        </motion.button>
                        <motion.button
                            onClick={() => navigate('/signup')}
                            className="px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:shadow-lg transition-all"
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 10px 25px rgba(16, 185, 129, 0.4)"
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="hidden sm:inline">{t('getStarted')}</span>
                            <span className="sm:hidden">Start</span>
                        </motion.button>
                    </motion.div>
                </div>
            </motion.nav>

            {/* Hero Section with Background Images and Parallax */}
            <section className="relative min-h-[400px] sm:min-h-[500px] md:min-h-[600px] flex items-center overflow-hidden parallax-container">
                {/* Background Images with Instant Switch (No Fade) */}
                <div className="absolute inset-0 parallax-bg">
                    <div
                        key={currentBg}
                        className="absolute inset-0 bg-cover bg-center parallax-layer transition-none"
                        style={{ backgroundImage: `url(${backgrounds[currentBg]})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent parallax-overlay" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 relative z-10 parallax-content">
                    <div className="max-w-3xl">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            className="parallax-text"
                        >
                            {/* Animated Title with Word-by-Word Effect */}
                            <motion.h2 
                                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 sm:mb-8 leading-tight drop-shadow-2xl"
                                initial="hidden"
                                animate="visible"
                            >
                                {t('heroTitle').split(' ').map((word, index) => (
                                    <motion.span
                                        key={index}
                                        className="inline-block mr-2 sm:mr-3"
                                        initial={{ opacity: 0, y: 50, rotateX: -90 }}
                                        animate={{ 
                                            opacity: 1, 
                                            y: 0, 
                                            rotateX: 0,
                                            transition: {
                                                delay: index * 0.15,
                                                duration: 0.8,
                                                ease: [0.6, -0.05, 0.01, 0.99]
                                            }
                                        }}
                                        whileHover={{ 
                                            scale: 1.1,
                                            y: -5,
                                            textShadow: "0 10px 30px rgba(0,0,0,0.5)",
                                            transition: { duration: 0.2 }
                                        }}
                                        style={{
                                            display: 'inline-block',
                                            transformStyle: 'preserve-3d',
                                            perspective: '1000px'
                                        }}
                                    >
                                        <span className="bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent animate-gradient-x">
                                            {word}
                                        </span>
                                    </motion.span>
                                ))}
                            </motion.h2>

                            {/* Animated Subtitle with Typewriter-like Effect */}
                            <motion.p 
                                className="text-lg sm:text-xl md:text-2xl text-white/95 mb-8 sm:mb-10 leading-relaxed drop-shadow-lg font-medium"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ 
                                    opacity: 1, 
                                    y: 0,
                                    transition: {
                                        delay: 0.8,
                                        duration: 0.8,
                                        ease: "easeOut"
                                    }
                                }}
                            >
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.2, duration: 0.5 }}
                                    className="inline-block"
                                >
                                    {t('heroSubtitle')}
                                </motion.span>
                                <motion.span
                                    animate={{ opacity: [1, 0, 1] }}
                                    transition={{ 
                                        duration: 1,
                                        repeat: Infinity,
                                        repeatDelay: 0.5
                                    }}
                                    className="inline-block ml-1 text-emerald-300"
                                >
                                    |
                                </motion.span>
                            </motion.p>

                            {/* Animated Buttons with Stagger Effect */}
                            <motion.div 
                                className="flex flex-col sm:flex-row gap-4 sm:gap-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ 
                                    opacity: 1, 
                                    y: 0,
                                    transition: {
                                        delay: 1.5,
                                        duration: 0.6
                                    }
                                }}
                            >
                                <motion.button
                                    onClick={() => navigate('/signup')}
                                    className="group relative px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-700 text-white rounded-xl font-bold text-lg sm:text-xl hover:shadow-2xl transition-all overflow-hidden"
                                    whileHover={{ 
                                        scale: 1.05,
                                        boxShadow: "0 20px 40px rgba(16, 185, 129, 0.4)"
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ 
                                        opacity: 1, 
                                        x: 0,
                                        transition: { delay: 1.6, duration: 0.5 }
                                    }}
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {t('startFreeTrial')}
                                        <motion.svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            animate={{ x: [0, 5, 0] }}
                                            transition={{ 
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </motion.svg>
                                    </span>
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        initial={{ x: '-100%' }}
                                        whileHover={{ x: '100%' }}
                                        transition={{ duration: 0.6 }}
                                    />
                                </motion.button>
                                
                                <motion.button
                                    onClick={() => {
                                        const featuresSection = document.querySelector('.features-section')
                                        if (featuresSection) {
                                            featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                        }
                                    }}
                                    className="px-8 sm:px-10 py-4 sm:py-5 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-bold text-lg sm:text-xl hover:bg-white/20 transition-all relative overflow-hidden group"
                                    whileHover={{ 
                                        scale: 1.05,
                                        borderColor: "rgba(255, 255, 255, 0.6)"
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ 
                                        opacity: 1, 
                                        x: 0,
                                        transition: { delay: 1.8, duration: 0.5 }
                                    }}
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {t('learnMore')}
                                        <motion.svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            animate={{ y: [0, 5, 0] }}
                                            transition={{ 
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </motion.svg>
                                    </span>
                                    <motion.div
                                        className="absolute inset-0 bg-white/10"
                                        initial={{ scale: 0, opacity: 0 }}
                                        whileHover={{ scale: 1.5, opacity: 1 }}
                                        transition={{ duration: 0.4 }}
                                    />
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Animated Slide Indicators */}
                <motion.div
                    className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2, duration: 0.6 }}
                >
                    {backgrounds.map((_, index) => (
                        <motion.button
                            key={index}
                            onClick={() => setCurrentBg(index)}
                            className={`h-2 rounded-full transition-all ${currentBg === index ? 'bg-white w-6 sm:w-8' : 'bg-white/50 w-2'
                                }`}
                            whileHover={{ scale: 1.3 }}
                            whileTap={{ scale: 0.9 }}
                            animate={{
                                width: currentBg === index ? '2rem' : '0.5rem',
                                opacity: currentBg === index ? 1 : 0.5
                            }}
                            transition={{ duration: 0.3 }}
                        />
                    ))}
                </motion.div>
            </section>

            {/* Features Section with Enhanced Animations */}
            <section className="features-section relative bg-gradient-to-b from-white via-emerald-50/30 to-white py-16 sm:py-20 md:py-24 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                            x: [0, 50, 0],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div
                        className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl"
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 0.5, 0.3],
                            x: [0, -50, 0],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        }}
                    />
                </div>

                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    {/* Animated Section Title */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-center mb-12 sm:mb-16 md:mb-20"
                    >
                        <motion.h2
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-800 mb-4 sm:mb-6"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ 
                                opacity: 1, 
                                y: 0,
                                transition: { duration: 0.8, ease: "easeOut" }
                            }}
                            viewport={{ once: true }}
                        >
                            {t('featuresTitle').split(' ').map((word, index) => (
                                <motion.span
                                    key={index}
                                    className="inline-block mr-2 sm:mr-3"
                                    initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                                    whileInView={{
                                        opacity: 1,
                                        scale: 1,
                                        rotateY: 0,
                                        transition: {
                                            delay: index * 0.1,
                                            duration: 0.6,
                                            ease: "easeOut"
                                        }
                                    }}
                                    viewport={{ once: true }}
                                    whileHover={{
                                        scale: 1.1,
                                        color: "#10b981",
                                        transition: { duration: 0.2 }
                                    }}
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    {word}
                                </motion.span>
                            ))}
                        </motion.h2>
                        <motion.p
                            className="text-lg sm:text-xl md:text-2xl text-slate-600 px-4 max-w-3xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{
                                opacity: 1,
                                y: 0,
                                transition: { delay: 0.5, duration: 0.6 }
                            }}
                            viewport={{ once: true }}
                        >
                            {t('featuresSubtitle')}
                        </motion.p>
                    </motion.div>

                    {/* Feature Cards with Staggered Animations */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                                whileInView={{
                                    opacity: 1,
                                    y: 0,
                                    rotateX: 0,
                                    transition: {
                                        delay: index * 0.15,
                                        duration: 0.8,
                                        ease: [0.6, -0.05, 0.01, 0.99]
                                    }
                                }}
                                viewport={{ once: true, margin: "-50px" }}
                                whileHover={{
                                    y: -10,
                                    rotateY: 5,
                                    scale: 1.02,
                                    transition: { duration: 0.3 }
                                }}
                                className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-slate-200/50 hover:border-emerald-300 overflow-hidden"
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                {/* Animated background gradient on hover */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-emerald-100/0 group-hover:from-emerald-50/50 group-hover:to-emerald-100/30 transition-all duration-500"
                                    initial={{ opacity: 0 }}
                                    whileHover={{ opacity: 1 }}
                                />
                                
                                {/* Icon with 3D rotation effect */}
                                <motion.div
                                    className="relative z-10 w-16 h-16 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-2xl mb-6 flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/50"
                                    whileHover={{
                                        rotateY: 360,
                                        scale: 1.1,
                                        transition: { duration: 0.6 }
                                    }}
                                    animate={{
                                        boxShadow: [
                                            "0 10px 25px rgba(16, 185, 129, 0.3)",
                                            "0 15px 35px rgba(16, 185, 129, 0.5)",
                                            "0 10px 25px rgba(16, 185, 129, 0.3)"
                                        ]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <motion.div
                                        className="text-white"
                                        whileHover={{ scale: 1.2, rotate: 5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {feature.icon}
                                    </motion.div>
                                </motion.div>

                                {/* Title with word animation */}
                                <motion.h3
                                    className="relative z-10 text-2xl font-bold text-slate-800 mb-4 group-hover:text-emerald-700 transition-colors"
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{
                                        opacity: 1,
                                        x: 0,
                                        transition: { delay: index * 0.15 + 0.3, duration: 0.5 }
                                    }}
                                    viewport={{ once: true }}
                                >
                                    {feature.title}
                                </motion.h3>

                                {/* Description with fade-in */}
                                <motion.p
                                    className="relative z-10 text-slate-600 leading-relaxed"
                                    initial={{ opacity: 0 }}
                                    whileInView={{
                                        opacity: 1,
                                        transition: { delay: index * 0.15 + 0.5, duration: 0.5 }
                                    }}
                                    viewport={{ once: true }}
                                >
                                    {feature.description}
                                </motion.p>

                                {/* Decorative corner accent */}
                                <motion.div
                                    className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-bl-full"
                                    initial={{ scale: 0, rotate: -90 }}
                                    whileInView={{
                                        scale: 1,
                                        rotate: 0,
                                        transition: { delay: index * 0.15 + 0.4, duration: 0.5 }
                                    }}
                                    viewport={{ once: true }}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section with Enhanced Animations */}
            <section className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700 py-16 sm:py-20 md:py-24 overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute top-0 left-0 w-full h-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <motion.div
                            className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                            animate={{
                                scale: [1, 1.5, 1],
                                x: [0, 100, 0],
                                y: [0, 50, 0],
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        <motion.div
                            className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
                            animate={{
                                scale: [1, 1.3, 1],
                                x: [0, -80, 0],
                                y: [0, -40, 0],
                            }}
                            transition={{
                                duration: 10,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1
                            }}
                        />
                    </motion.div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {/* Animated Title */}
                        <motion.h2
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 sm:mb-8 px-4"
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            whileInView={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                transition: { duration: 0.8, ease: "easeOut" }
                            }}
                            viewport={{ once: true }}
                        >
                            {t('ctaTitle').split(' ').map((word, index) => (
                                <motion.span
                                    key={index}
                                    className="inline-block mr-2 sm:mr-3"
                                    initial={{ opacity: 0, y: 50, rotateX: -90 }}
                                    whileInView={{
                                        opacity: 1,
                                        y: 0,
                                        rotateX: 0,
                                        transition: {
                                            delay: index * 0.12,
                                            duration: 0.7,
                                            ease: [0.6, -0.05, 0.01, 0.99]
                                        }
                                    }}
                                    viewport={{ once: true }}
                                    whileHover={{
                                        scale: 1.15,
                                        y: -5,
                                        textShadow: "0 10px 30px rgba(0,0,0,0.3)",
                                        transition: { duration: 0.2 }
                                    }}
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    {word}
                                </motion.span>
                            ))}
                        </motion.h2>

                        {/* Animated Subtitle */}
                        <motion.p
                            className="text-lg sm:text-xl md:text-2xl text-emerald-50 mb-10 sm:mb-12 max-w-3xl mx-auto px-4 leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{
                                opacity: 1,
                                y: 0,
                                transition: { delay: 0.5, duration: 0.6 }
                            }}
                            viewport={{ once: true }}
                        >
                            {t('ctaSubtitle')}
                        </motion.p>

                        {/* Animated CTA Button */}
                        <motion.button
                            onClick={() => navigate('/signup')}
                            className="group relative px-10 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 bg-white text-emerald-700 rounded-2xl font-bold text-lg sm:text-xl md:text-2xl hover:bg-emerald-50 transition-all shadow-2xl hover:shadow-emerald-900/50 overflow-hidden"
                            whileHover={{
                                scale: 1.08,
                                boxShadow: "0 25px 50px rgba(0,0,0,0.3)"
                            }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            whileInView={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                transition: { delay: 0.8, duration: 0.6, type: "spring", stiffness: 200 }
                            }}
                            viewport={{ once: true }}
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {t('getStartedNow')}
                                <motion.svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    animate={{ x: [0, 8, 0] }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </motion.svg>
                            </span>
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-white opacity-0 group-hover:opacity-100"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.6 }}
                            />
                        </motion.button>

                        {/* Decorative elements */}
                        <motion.div
                            className="absolute top-10 left-10 w-20 h-20 border-2 border-white/20 rounded-full"
                            animate={{
                                rotate: 360,
                                scale: [1, 1.2, 1]
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                        <motion.div
                            className="absolute bottom-10 right-10 w-16 h-16 border-2 border-white/20 rounded-full"
                            animate={{
                                rotate: -360,
                                scale: [1, 1.3, 1]
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                    </motion.div>
                </div>
            </section>

            {/* Footer with Animations */}
            <footer className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-12 sm:py-16 overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <motion.div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                            backgroundSize: '40px 40px'
                        }}
                        animate={{
                            x: [0, 40, 0],
                            y: [0, 40, 0]
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                </div>

                <div className="container mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col items-center gap-4"
                    >
                        {/* Logo and Brand */}
                        <motion.div
                            className="flex items-center gap-3 mb-2"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        >
                            <motion.img
                                src="/logo.png"
                                alt="AgroVisor Logo"
                                className="h-10 sm:h-12 w-auto object-contain"
                                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 0.5 }}
                            />
                            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                                AgroVisor
                            </h3>
                        </motion.div>

                        {/* Footer Text */}
                        <motion.p
                            className="text-slate-400 text-sm sm:text-base"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            © 2025 AgroVisor. {t('footerText')}
                        </motion.p>

                        {/* Decorative line */}
                        <motion.div
                            className="w-24 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mt-2"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        />
                    </motion.div>
                </div>
            </footer>
        </div>
    )
}
