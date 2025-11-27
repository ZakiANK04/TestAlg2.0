key = { sensor }
onClick = {() => setSelectedSensor(sensor)}
className = {`px-6 py-3 rounded-lg font-semibold transition-all ${selectedSensor === sensor
    ? 'bg-purple-600 text-white shadow-lg'
    : 'bg-white text-slate-700 hover:bg-purple-50'
    }`}
                        >
    { t(selectedSensor + 'Sensors')}
                        </button >
                    ))}
                </div >

    {/* Sensor Data Display */ }
    < motion.div
key = { selectedSensor }
initial = {{ opacity: 0, x: -20 }}
animate = {{ opacity: 1, x: 0 }}
className = "grid md:grid-cols-3 gap-6 mb-8"
    >
    { selectedSensor === 'soil' && (
        <>
            {renderGauge(sensorData.soil.moisture, 100, 'Soil Moisture', '%', '#10b981')}
            {renderGauge(sensorData.soil.temperature, 40, 'Temperature', '°C', '#f59e0b')}
            {renderGauge(sensorData.soil.ph, 14, 'pH Level', 'pH', '#3b82f6')}
        </>
    )}
{
    selectedSensor === 'weather' && (
        <>
            {renderGauge(sensorData.weather.temperature, 50, 'Temperature', '°C', '#ef4444')}
            {renderGauge(sensorData.weather.humidity, 100, 'Humidity', '%', '#06b6d4')}
            {renderGauge(sensorData.weather.sunlight, 12, 'Sunlight', 'hrs', '#eab308')}
        </>
    )
}
{
    selectedSensor === 'irrigation' && (
        <>
            {renderGauge(sensorData.irrigation.waterUsage, 1000, 'Water Usage', 'L', '#0ea5e9')}
            {renderGauge(sensorData.irrigation.efficiency, 100, 'Efficiency', '%', '#22c55e')}
            {renderGauge(sensorData.irrigation.pressure, 5, 'Pressure', 'bar', '#8b5cf6')}
        </>
    )
}
                </motion.div >

    {/* Detailed Metrics */ }
    < div className = "grid md:grid-cols-2 gap-8 mb-8" >
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">{t('sensorDetails')}</h3>
                        <div className="space-y-3">
                            {Object.entries(sensorData[selectedSensor]).map(([key, value]) => {
                                if (key === 'status' || key === 'lastUpdate') return null
                                return (
                                    <div key={key} className="flex justify-between items-center py-2 border-b border-slate-100">
                                        <span className="text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                        <span className="font-semibold text-slate-800">{value}</span>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600">{t('status')}</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${sensorData[selectedSensor].status === 'Optimal' || sensorData[selectedSensor].status === 'Good'
                                        ? 'bg-green-100 text-green-700'
                                        : sensorData[selectedSensor].status === 'Active'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {sensorData[selectedSensor].status}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">{t('lastUpdated')}: {sensorData[selectedSensor].lastUpdate}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">{t('historicalTrend')}</h3>
                        <div className="h-48 flex items-end justify-between gap-2">
                            {[45, 52, 48, 55, 62, 58, 65, 63, 68, 65].map((height, index) => (
                                <div key={index} className="flex-1 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-lg transition-all hover:opacity-75" style={{ height: `${height}%` }}></div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-400">
                            <span>10 days ago</span>
                            <span>Today</span>
                        </div>
                    </div>
                </div >

    {/* AI Insights */ }
    < div className = "bg-white rounded-xl shadow-lg p-6" >
                    <h3 className="text-lg font-bold text-slate-800 mb-4">{t('aiInsights')}</h3>
                    <div className="space-y-4">
                        {aiInsights.map((insight, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-4 rounded-lg border-l-4 ${insight.priority === 'high' ? 'bg-red-50 border-red-500' :
                                        insight.priority === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                                            'bg-green-50 border-green-500'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-slate-800">{insight.title}</h4>
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                                            insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-green-100 text-green-700'
                                        }`}>
                                        {insight.priority.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm mb-3">{insight.message}</p>
                                <button className="text-purple-600 hover:text-purple-700 font-semibold text-sm">
                                    {insight.action} →
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div >
            </main >
        </div >
    )
}
