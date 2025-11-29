import { useState, useEffect } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import axios from 'axios'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1', '#f97316', '#84cc16']

function DatasetDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDatasetStats()
  }, [])

  const fetchDatasetStats = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/dataset/stats/')
      setData(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching dataset stats:', err)
      setError('Failed to load dataset statistics')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error || 'No data available'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-slate-200 widget-3d">
          <p className="text-xs text-slate-500 mb-1">Total Records</p>
          <p className="text-2xl font-bold text-slate-800">{data.stats.total_records.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-slate-200 widget-3d">
          <p className="text-xs text-slate-500 mb-1">Unique Crops</p>
          <p className="text-2xl font-bold text-emerald-600">{data.stats.unique_crops}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-slate-200 widget-3d">
          <p className="text-xs text-slate-500 mb-1">Unique Regions</p>
          <p className="text-2xl font-bold text-blue-600">{data.stats.unique_regions}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-slate-200 widget-3d">
          <p className="text-xs text-slate-500 mb-1">Avg Yield</p>
          <p className="text-2xl font-bold text-purple-600">{data.stats.avg_yield} t/ha</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-slate-200 widget-3d">
          <p className="text-xs text-slate-500 mb-1">Avg Price</p>
          <p className="text-2xl font-bold text-orange-600">{Math.round(data.stats.avg_price).toLocaleString()} DA</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-slate-200 widget-3d">
          <p className="text-xs text-slate-500 mb-1">Avg Risk</p>
          <p className="text-2xl font-bold text-red-600">{data.stats.avg_risk}%</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 widget-3d">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Crop Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.charts.crop_distribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.charts.crop_distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Region Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 widget-3d">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Top Regions by Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.charts.region_distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yield by Crop Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 widget-3d">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Average Yield by Crop (tons/ha)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.charts.yield_by_crop}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Price by Crop Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 widget-3d">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Average Price by Crop (DA/kg)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.charts.price_by_crop}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 widget-3d">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.charts.risk_distribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.charts.risk_distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Soil Type Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 widget-3d">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Soil Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.charts.soil_distribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.charts.soil_distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="bg-gradient-to-br from-emerald-50 to-blue-50 p-6 rounded-xl shadow-lg border border-emerald-200">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Insights & Recommendations
        </h3>
        <div className="space-y-3">
          {data.recommendations && data.recommendations.length > 0 ? (
            data.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.type === 'warning'
                    ? 'bg-red-50 border-red-400'
                    : rec.type === 'best_crop'
                    ? 'bg-green-50 border-green-400'
                    : 'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${
                    rec.type === 'warning' ? 'text-red-600' : rec.type === 'best_crop' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {rec.type === 'warning' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 flex-1">{rec.message}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-600">No recommendations available at this time.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default DatasetDashboard

