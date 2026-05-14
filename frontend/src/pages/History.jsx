import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity, Clock, FileText, AlertTriangle, CheckCircle,
  Trash2, ChevronRight, Crown, Search, Filter,
  Calendar, TrendingUp, Shield, X
} from 'lucide-react'
import { authAPI } from '../api/authAPI'

export default function History() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [stats, setStats] = useState({ total: 0, lowRisk: 0, modRisk: 0, highRisk: 0 })

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      navigate('/')
      return
    }
    setUser(JSON.parse(storedUser))
    fetchReports()
  }, [navigate])

  useEffect(() => {
    let filtered = [...reports]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(r =>
        r.fileName?.toLowerCase().includes(q) ||
        r.patientInfo?.name?.toLowerCase().includes(q)
      )
    }
    if (riskFilter !== 'all') {
      filtered = filtered.filter(r => r.overallRisk?.level === riskFilter)
    }
    setFilteredReports(filtered)
  }, [searchQuery, riskFilter, reports])

  const fetchReports = async () => {
    setIsLoading(true)
    try {
      const res = await authAPI.getReports()
      const fetched = res.data.reports || []
      setReports(fetched)
      setFilteredReports(fetched)
      // compute stats
      const s = { total: fetched.length, lowRisk: 0, modRisk: 0, highRisk: 0 }
      fetched.forEach(r => {
        const lvl = r.overallRisk?.level
        if (lvl === 'low') s.lowRisk++
        else if (lvl === 'moderate') s.modRisk++
        else if (lvl === 'high' || lvl === 'critical') s.highRisk++
      })
      setStats(s)
    } catch (err) {
      console.error('Error fetching reports:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (reportId) => {
    try {
      await authAPI.deleteReport(reportId)
      setDeleteConfirm(null)
      setReports(prev => prev.filter(r => r._id !== reportId))
    } catch (err) {
      console.error('Error deleting report:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    navigate('/')
  }

  const getRiskPillStyle = (level) => {
    switch (level) {
      case 'low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'moderate': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'high': return 'bg-rose-500/20 text-rose-400 border-rose-500/30'
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getRiskIcon = (level) => {
    switch (level) {
      case 'low': return <CheckCircle className="h-4 w-4" />
      case 'moderate': return <AlertTriangle className="h-4 w-4" />
      case 'high': case 'critical': return <Shield className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafbfc]">
        <div className="animate-pulse flex flex-col items-center space-x-2">
          <Activity className="h-8 w-8 text-blue-600 animate-spin mb-4" />
          <span className="text-blue-800 text-sm font-bold uppercase tracking-[0.2em] font-['Outfit']">Loading Records...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#0f1f38] font-sans">

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0f1f38] font-['Outfit'] tracking-tight">
              Plumb <span className="text-blue-600">Health</span>
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm font-bold uppercase tracking-[0.1em] font-['Outfit']">
            <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-blue-600 transition-colors">Dashboard</button>
            <button onClick={() => navigate('/upload')} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-4 py-2 rounded-full transition-all duration-200 shadow-[0_8px_20px_rgba(37,99,235,0.2)]">
              + Upload
            </button>
            <button onClick={() => navigate('/profile')} className="text-gray-500 hover:text-blue-600 transition-colors">Profile</button>
            {user.membershipType !== 'pro' && (
              <button onClick={() => navigate('/pro')} className="bg-gradient-to-r from-blue-900 to-blue-800 text-white text-[10px] font-bold px-4 py-2 rounded-full transition-all duration-200 shadow-lg shadow-blue-900/20 flex items-center">
                <Crown className="h-3 w-3 mr-1 text-blue-300" /> PRO
              </button>
            )}
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">

        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-bold mb-2 text-[#0f1f38] font-['Outfit'] tracking-tight">
            Report History
          </h1>
          <p className="text-gray-500 font-medium">View and manage all your past clinical reports</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Reports', value: stats.total, icon: FileText, color: 'from-blue-600 to-indigo-600' },
            { label: 'Low Risk', value: stats.lowRisk, icon: CheckCircle, color: 'from-emerald-500 to-green-600' },
            { label: 'Moderate Risk', value: stats.modRisk, icon: AlertTriangle, color: 'from-amber-500 to-orange-500' },
            { label: 'High Risk', value: stats.highRisk, icon: Shield, color: 'from-rose-500 to-red-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-[24px] clinical-shadow border border-gray-100 p-6 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-['Outfit']">{stat.label}</span>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} shadow-sm`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-4xl font-bold text-[#0f1f38] tracking-tighter font-['Outfit']">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by file name or patient name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-[#0f1f38] placeholder-gray-400 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-600 transition-all shadow-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            {['all', 'low', 'moderate', 'high'].map(f => (
              <button
                key={f}
                onClick={() => setRiskFilter(f)}
                className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-xl border transition-all ${
                  riskFilter === f
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-blue-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-[24px] h-48 border border-gray-100" />
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-20 bg-white clinical-shadow rounded-[32px] border border-gray-100">
            <FileText className="h-16 w-16 text-blue-200 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-[#0f1f38] mb-2 font-['Outfit']">
              {reports.length === 0 ? 'No reports yet' : 'No matching reports'}
            </h3>
            <p className="text-gray-500 mb-8 font-medium">
              {reports.length === 0
                ? 'Upload your first health report to get started with AI analysis.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {reports.length === 0 && (
              <button
                onClick={() => navigate('/upload')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-full transition-all shadow-[0_8px_20px_rgba(37,99,235,0.2)] text-[11px] uppercase tracking-[0.2em] font-['Outfit']"
              >
                Upload Report
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => {
              const risk = report.overallRisk || {}
              const date = new Date(report.createdAt)
              return (
                <div
                  key={report._id}
                  className="group bg-white rounded-[24px] border border-gray-100 overflow-hidden hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.1)] cursor-pointer"
                  onClick={() => navigate('/dashboard', { state: { reportId: report._id } })}
                >
                  {/* Colored top accent */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${
                    risk.level === 'high' || risk.level === 'critical' ? 'from-rose-500 to-red-500' :
                    risk.level === 'moderate' ? 'from-amber-400 to-orange-500' : 'from-blue-500 to-blue-600'
                  }`} />

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2.5 rounded-xl ${
                          report.fileType === 'pdf' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#0f1f38] truncate max-w-[180px]">
                            {report.fileName}
                          </p>
                          <div className="flex items-center space-x-1.5 mt-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">
                              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteConfirm(report._id)
                        }}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Risk Pill & Score */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg border ${getRiskPillStyle(risk.level)}`}>
                        {getRiskIcon(risk.level)}
                        {risk.level || 'unknown'} risk
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{risk.score ?? 0}/100</span>
                      </div>
                    </div>

                    {/* Test count & Summary */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{report.totalTestsFound || 0} tests found</span>
                      </div>
                      {risk.summary && (
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{risk.summary}</p>
                      )}
                    </div>

                    {/* Patient info if available */}
                    {report.patientInfo?.name && (
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-t border-gray-100 pt-3">
                        Patient: {report.patientInfo.name}
                        {report.patientInfo.age && ` • Age ${report.patientInfo.age}`}
                      </div>
                    )}

                    {/* View CTA */}
                    <div className="flex items-center justify-end mt-4">
                      <span className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.1em] flex items-center gap-1 group-hover:gap-2 transition-all bg-blue-50 px-3 py-1.5 rounded-lg">
                        View Report <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f1f38]/60 backdrop-blur-sm px-4">
          <div className="bg-white border border-gray-100 rounded-[32px] p-8 w-full max-w-sm clinical-shadow">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-2xl font-bold text-[#0f1f38] font-['Outfit']">Delete Report?</h3>
              <button onClick={() => setDeleteConfirm(null)} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-8 font-medium leading-relaxed">
              This action cannot be undone. The report and all its associated clinical analysis data will be permanently erased.
            </p>
            <div className="flex space-x-4">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-3.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all text-xs font-bold uppercase tracking-widest font-['Outfit']">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-[0_8px_20px_rgba(220,38,38,0.2)] font-['Outfit']">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
