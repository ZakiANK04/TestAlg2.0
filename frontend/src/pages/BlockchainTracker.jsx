import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'

function BlockchainTracker() {
    const navigate = useNavigate()
    const { language, setLanguage, t } = useLanguage()
    const [selectedBatch, setSelectedBatch] = useState(null)

    const batches = [
        {
            id: 'BATCH-2024-001',
            crop: 'Tomatoes',
            farmer: 'Ahmed Benali',
            location: 'Mitidja, Algeria',
            quantity: '500 kg',
            date: '2024-01-15',
            status: 'Delivered',
            verified: true
        },
        {
            id: 'BATCH-2024-002',
            crop: 'Wheat',
            farmer: 'Fatima Khelifi',
            location: 'Sétif, Algeria',
            quantity: '2000 kg',
            date: '2024-01-18',
            status: 'In Transit',
            verified: true
        },
        {
            id: 'BATCH-2024-003',
            crop: 'Oranges',
            farmer: 'Mohamed Saidi',
            location: 'Blida, Algeria',
            quantity: '750 kg',
            date: '2024-01-20',
            status: 'Processing',
            verified: false
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
            <nav className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 shadow-xl">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight">Blockchain Tracker</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            {['en', 'fr', 'ar'].map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => setLanguage(lang)}
                                    className={`px-3 py-1 rounded-lg font-medium transition-all ${language === lang
                                            ? 'bg-blue-900 text-white'
                                            : 'bg-blue-800/50 text-blue-100 hover:bg-blue-800'
                                        }`}
                                >
                                    {lang.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-blue-800 px-4 py-2 rounded-lg hover:bg-blue-900 transition-all hover:scale-105"
                        >
                            {t('dashboard')}
                        </button>
                        <button
                            onClick={() => navigate('/analytics')}
                            className="bg-blue-800 px-4 py-2 rounded-lg hover:bg-blue-900 transition-all hover:scale-105"
                        >
                            {t('aiAnalytics')}
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-blue-800 px-4 py-2 rounded-lg hover:bg-blue-900 transition-all hover:scale-105"
                        >
                            {t('home')}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto p-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Supply Chain Transparency</h2>
                    <p className="text-slate-600">Track your produce from farm to market with blockchain verification</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Batch List */}
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Recent Batches</h3>
                        <div className="space-y-4">
                            {batches.map((batch, index) => (
                                <motion.div
                                    key={batch.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => setSelectedBatch(batch)}
                                    className={`bg-white p-6 rounded-xl shadow-md cursor-pointer transition-all hover:shadow-lg ${selectedBatch?.id === batch.id ? 'ring-2 ring-blue-500' : ''
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">{batch.crop}</h4>
                                            <p className="text-sm text-slate-500">{batch.id}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${batch.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                batch.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {batch.status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-500">Quantity</p>
                                            <p className="font-semibold text-slate-800">{batch.quantity}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Date</p>
                                            <p className="font-semibold text-slate-800">{batch.date}</p>
                                        </div>
                                    </div>
                                    {batch.verified && (
                                        <div className="mt-3 flex items-center gap-2 text-green-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm font-medium">{t('verifiedOnBlockchain')}</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Batch Details */}
                    <div>
                        {selectedBatch ? (
                            <motion.div
                                key={selectedBatch.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-xl shadow-xl p-8"
                            >
                                <h3 className="text-2xl font-bold text-slate-800 mb-6">{t('batchDetails')}</h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between py-3 border-b border-slate-100">
                                        <span className="text-slate-600">Batch ID</span>
                                        <span className="font-semibold text-slate-800">{selectedBatch.id}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-slate-100">
                                        <span className="text-slate-600">Crop</span>
                                        <span className="font-semibold text-slate-800">{selectedBatch.crop}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-slate-100">
                                        <span className="text-slate-600">Farmer</span>
                                        <span className="font-semibold text-slate-800">{selectedBatch.farmer}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-slate-100">
                                        <span className="text-slate-600">Location</span>
                                        <span className="font-semibold text-slate-800">{selectedBatch.location}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-slate-100">
                                        <span className="text-slate-600">Quantity</span>
                                        <span className="font-semibold text-slate-800">{selectedBatch.quantity}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-slate-100">
                                        <span className="text-slate-600">Date</span>
                                        <span className="font-semibold text-slate-800">{selectedBatch.date}</span>
                                    </div>
                                    <div className="flex justify-between py-3">
                                        <span className="text-slate-600">Status</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedBatch.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                selectedBatch.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {selectedBatch.status}
                                        </span>
                                    </div>
                                </div>

                                {selectedBatch.verified && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-green-800">{t('verifiedOnBlockchain')}</p>
                                                <p className="text-sm text-green-600">This batch has been verified on the blockchain</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-xl p-12 text-center">
                                <svg className="w-24 h-24 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-slate-500 text-lg">{t('selectBatch')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default BlockchainTracker
