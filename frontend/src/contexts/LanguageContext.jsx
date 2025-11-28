import { createContext, useContext, useState } from 'react'

const translations = {
    en: {
        // Common
        home: 'Home',
        login: 'Login',
        getStarted: 'Get Started',
        blockchainTracker: 'Blockchain Tracker',
        aiAnalytics: 'AI Analytics',
        backToDashboard: 'Back to Dashboard',

        // Auth
        welcomeBack: 'Welcome Back',
        signInToAccount: 'Sign in to your AgriData account',
        emailAddress: 'Email Address',
        password: 'Password',
        signIn: 'Sign In',
        signingIn: 'Signing in...',
        dontHaveAccount: "Don't have an account?",
        signUp: 'Sign up',
        backToHome: 'Back to home',
        createAccount: 'Create Account',
        joinToday: 'Join AgriData Insight today',
        firstName: 'First Name',
        lastName: 'Last Name',
        confirmPassword: 'Confirm Password',
        creatingAccount: 'Creating account...',
        alreadyHaveAccount: 'Already have an account?',

        // Dashboard
        updateFarmDetails: 'Update Farm Details',
        farmName: 'Farm Name',
        location: 'Location',
        size: 'Size (Hectares)',
        soilType: 'Soil Type',
        updateAnalysis: 'Update Analysis',
        updating: 'Updating...',
        topRecommendation: 'Top Recommendation',
        recommendedArea: 'Recommended Area',
        expectedYield: 'Expected Yield',
        expectedRevenue: 'Expected Revenue',
        ofYourFarm: 'of your farm',
        totalHarvest: 'total harvest',
        estimatedIncome: 'estimated income',
        score: 'Score',

        // Analytics
        precisionAnalytics: 'Precision Analytics',
        realtimeFarmMonitoring: 'Real-Time Farm Monitoring',
        aiPoweredInsights: 'AI-powered insights from IoT sensors across your farm',
        soilSensors: 'Soil Sensors',
        weatherSensors: 'Weather Sensors',
        irrigationSensors: 'Irrigation Sensors',
        sensorDetails: 'Sensor Details',
        status: 'Status',
        lastUpdated: 'Last updated',
        historicalTrend: 'Historical Trend',
        aiInsights: 'AI-Powered Insights',

        // Blockchain
        cropTracking: 'Crop Tracking',
        secureTracking: 'Secure tracking from farm to market',
        recentBatches: 'Recent Batches',
        batchDetails: 'Batch Details',
        selectBatch: 'Select a batch to view details',
        verifiedOnBlockchain: 'Verified on Blockchain',

        // Landing
        heroTitle: 'Make Smarter Farming Decisions',
        heroSubtitle: 'Stop guessing what to plant. Use data and AI to choose the right crops, avoid oversupply, and increase your profits.',
        startFreeTrial: 'Start Free Trial',
        watchDemo: 'Watch Demo',
        featuresTitle: 'Everything You Need to Succeed',
        featuresSubtitle: 'Simple tools designed for farmers, powered by advanced technology',
        smartCropRec: 'Smart Crop Recommendations',
        smartCropRecDesc: 'Get personalized advice on what to plant based on your soil and local market conditions',
        marketPrice: 'Market Price Predictions',
        marketPriceDesc: 'Know the expected prices before you plant to maximize your profit',
        riskWarnings: 'Risk Warnings',
        riskWarningsDesc: 'Avoid planting crops that might have too much supply and low prices',
        weatherAnalysis: 'Weather Analysis',
        weatherAnalysisDesc: 'Understand how weather will affect your crop yields this season',
        blockchainTracking: 'Blockchain Tracking',
        blockchainTrackingDesc: 'Track your crops from farm to market with secure digital records',
        realtimeMonitoring: 'Real-time Monitoring',
        realtimeMonitoringDesc: 'Monitor soil moisture, temperature, and other important factors',
        ctaTitle: 'Ready to Transform Your Farm?',
        ctaSubtitle: 'Join thousands of farmers who are making better decisions with AgriData Insight',
        getStartedNow: 'Get Started Now',
        footerText: 'Helping farmers make smarter decisions.'
    },
    fr: {
        // Common
        home: 'Accueil',
        login: 'Connexion',
        getStarted: 'Commencer',
        blockchainTracker: 'Suivi Blockchain',
        aiAnalytics: 'Analyses IA',
        backToDashboard: 'Retour au Tableau de Bord',

        // Auth
        welcomeBack: 'Bon Retour',
        signInToAccount: 'Connectez-vous à votre compte AgriData',
        emailAddress: 'Adresse Email',
        password: 'Mot de passe',
        signIn: 'Se Connecter',
        signingIn: 'Connexion...',
        dontHaveAccount: "Vous n'avez pas de compte ?",
        signUp: "S'inscrire",
        backToHome: "Retour à l'accueil",
        createAccount: 'Créer un Compte',
        joinToday: "Rejoignez AgriData Insight aujourd'hui",
        firstName: 'Prénom',
        lastName: 'Nom',
        confirmPassword: 'Confirmer le Mot de Passe',
        creatingAccount: 'Création du compte...',
        alreadyHaveAccount: 'Vous avez déjà un compte ?',

        // Dashboard
        updateFarmDetails: 'Mettre à Jour les Détails de la Ferme',
        farmName: 'Nom de la Ferme',
        location: 'Emplacement',
        size: 'Taille (Hectares)',
        soilType: 'Type de Sol',
        updateAnalysis: 'Mettre à Jour l\'Analyse',
        updating: 'Mise à jour...',
        topRecommendation: 'Meilleure Recommandation',
        recommendedArea: 'Surface Recommandée',
        expectedYield: 'Rendement Attendu',
        expectedRevenue: 'Revenu Estimé',
        ofYourFarm: 'de votre ferme',
        totalHarvest: 'récolte totale',
        estimatedIncome: 'revenu estimé',
        score: 'Score',

        // Analytics
        precisionAnalytics: 'Analyses de Précision',
        realtimeFarmMonitoring: 'Surveillance de Ferme en Temps Réel',
        aiPoweredInsights: 'Informations alimentées par l\'IA à partir de capteurs IoT sur votre ferme',
        soilSensors: 'Capteurs de Sol',
        weatherSensors: 'Capteurs Météo',
        irrigationSensors: 'Capteurs d\'Irrigation',
        sensorDetails: 'Détails du Capteur',
        status: 'Statut',
        lastUpdated: 'Dernière mise à jour',
        historicalTrend: 'Tendance Historique',
        aiInsights: 'Informations IA',

        // Blockchain
        cropTracking: 'Suivi des Cultures',
        secureTracking: 'Suivi sécurisé de la ferme au marché',
        recentBatches: 'Lots Récents',
        batchDetails: 'Détails du Lot',
        selectBatch: 'Sélectionnez un lot pour voir les détails',
        verifiedOnBlockchain: 'Vérifié sur Blockchain',

        // Landing
        heroTitle: 'Prenez des Décisions Agricoles Plus Intelligentes',
        heroSubtitle: 'Arrêtez de deviner quoi planter. Utilisez les données et l\'IA pour choisir les bonnes cultures.',
        startFreeTrial: 'Essai Gratuit',
        watchDemo: 'Voir la Démo',
        featuresTitle: 'Tout ce Dont Vous Avez Besoin',
        featuresSubtitle: 'Outils simples pour les agriculteurs',
        smartCropRec: 'Recommandations Intelligentes',
        smartCropRecDesc: 'Conseils personnalisés sur quoi planter',
        marketPrice: 'Prévisions des Prix',
        marketPriceDesc: 'Connaissez les prix avant de planter',
        riskWarnings: 'Avertissements de Risque',
        riskWarningsDesc: 'Évitez les cultures à risque',
        weatherAnalysis: 'Analyse Météo',
        weatherAnalysisDesc: 'Impact de la météo sur vos rendements',
        blockchainTracking: 'Suivi Blockchain',
        blockchainTrackingDesc: 'Suivez vos cultures',
        realtimeMonitoring: 'Surveillance Temps Réel',
        realtimeMonitoringDesc: 'Surveillez votre ferme',
        ctaTitle: 'Prêt à Transformer Votre Ferme?',
        ctaSubtitle: 'Rejoignez des milliers d\'agriculteurs',
        getStartedNow: 'Commencer Maintenant',
        footerText: 'Aider les agriculteurs.'
    },
    ar: {
        // Common
        home: 'الرئيسية',
        login: 'تسجيل الدخول',
        getStarted: 'ابدأ الآن',
        blockchainTracker: 'تتبع البلوكشين',
        aiAnalytics: 'تحليلات الذكاء الاصطناعي',
        backToDashboard: 'العودة إلى لوحة التحكم',

        // Auth
        welcomeBack: 'مرحبًا بعودتك',
        signInToAccount: 'سجل الدخول إلى حسابك',
        emailAddress: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        signIn: 'تسجيل الدخول',
        signingIn: 'جاري تسجيل الدخول...',
        dontHaveAccount: 'ليس لديك حساب؟',
        signUp: 'إنشاء حساب',
        backToHome: 'العودة للرئيسية',
        createAccount: 'إنشاء حساب جديد',
        joinToday: 'انضم إلى AgriData Insight اليوم',
        firstName: 'الاسم الأول',
        lastName: 'اسم العائلة',
        confirmPassword: 'تأكيد كلمة المرور',
        creatingAccount: 'جاري إنشاء الحساب...',
        alreadyHaveAccount: 'لديك حساب بالفعل؟',

        // Dashboard
        updateFarmDetails: 'تحديث تفاصيل المزرعة',
        farmName: 'اسم المزرعة',
        location: 'الموقع',
        size: 'الحجم (هكتار)',
        soilType: 'نوع التربة',
        updateAnalysis: 'تحديث التحليل',
        updating: 'جاري التحديث...',
        topRecommendation: 'أفضل توصية',
        recommendedArea: 'المساحة الموصى بها',
        expectedYield: 'الإنتاج المتوقع',
        expectedRevenue: 'الإيرادات المتوقعة',
        ofYourFarm: 'من مزرعتك',
        totalHarvest: 'إجمالي الحصاد',
        estimatedIncome: 'الدخل المقدر',
        score: 'النتيجة',

        // Analytics
        precisionAnalytics: 'تحليلات الدقة',
        realtimeFarmMonitoring: 'مراقبة المزرعة في الوقت الفعلي',
        aiPoweredInsights: 'رؤى مدعومة بالذكاء الاصطناعي من أجهزة الاستشعار',
        soilSensors: 'مستشعرات التربة',
        weatherSensors: 'مستشعرات الطقس',
        irrigationSensors: 'مستشعرات الري',
        sensorDetails: 'تفاصيل المستشعر',
        status: 'الحالة',
        lastUpdated: 'آخر تحديث',
        historicalTrend: 'الاتجاه التاريخي',
        aiInsights: 'رؤى الذكاء الاصطناعي',

        // Blockchain
        cropTracking: 'تتبع المحاصيل',
        secureTracking: 'تتبع آمن من المزرعة إلى السوق',
        recentBatches: 'الدفعات الأخيرة',
        batchDetails: 'تفاصيل الدفعة',
        selectBatch: 'حدد دفعة لعرض التفاصيل',
        verifiedOnBlockchain: 'تم التحقق على البلوكشين',

        // Landing
        heroTitle: 'اتخذ قرارات زراعية أذكى',
        heroSubtitle: 'توقف عن التخمين. استخدم البيانات والذكاء الاصطناعي.',
        startFreeTrial: 'ابدأ تجربة مجانية',
        watchDemo: 'شاهد العرض',
        featuresTitle: 'كل ما تحتاجه للنجاح',
        featuresSubtitle: 'أدوات بسيطة للمزارعين',
        smartCropRec: 'توصيات ذكية',
        smartCropRecDesc: 'نصائح مخصصة للزراعة',
        marketPrice: 'توقعات الأسعار',
        marketPriceDesc: 'اعرف الأسعار قبل الزراعة',
        riskWarnings: 'تحذيرات المخاطر',
        riskWarningsDesc: 'تجنب المحاصيل عالية المخاطر',
        weatherAnalysis: 'تحليل الطقس',
        weatherAnalysisDesc: 'تأثير الطقس على المحصول',
        blockchainTracking: 'تتبع البلوكشين',
        blockchainTrackingDesc: 'تتبع محاصيلك',
        realtimeMonitoring: 'المراقبة الفورية',
        realtimeMonitoringDesc: 'راقب مزرعتك',
        ctaTitle: 'هل أنت مستعد؟',
        ctaSubtitle: 'انضم إلى آلاف المزارعين',
        getStartedNow: 'ابدأ الآن',
        footerText: 'مساعدة المزارعين.'
    }
}

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en')

    const t = (key) => {
        return translations[language][key] || key
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
