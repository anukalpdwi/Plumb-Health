import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity, User as UserIcon, Mail, Calendar, Crown, Shield,
  FileText, Clock, ChevronRight, LogOut, Settings, Star,
  Heart, TrendingUp
} from 'lucide-react'
import { authAPI } from '../api/authAPI'

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [reportStats, setReportStats] = useState({ total: 0, recentRisk: null })
  const [consultations, setConsultations] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      navigate('/')
      return
    }
    setUser(JSON.parse(storedUser))
    fetchProfileData()
  }, [navigate])

  const fetchProfileData = async () => {
    setIsLoading(true)
    try {
      // Fetch fresh profile
      const profileRes = await authAPI.getProfile()
      const updatedUser = profileRes.data.user
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))

      // Fetch report stats
      const reportsRes = await authAPI.getReports()
      const reports = reportsRes.data.reports || []
      setReportStats({
        total: reports.length,
        recentRisk: reports.length > 0 ? reports[0].overallRisk : null
      })

      // Fetch consultations
      try {
        const consRes = await authAPI.getConsultations()
        setConsultations(consRes.data.consultations || [])
      } catch {
        // Consultations endpoint might not exist or user might not be PRO
      }
    } catch (err) {
      console.error('Error fetching profile data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    navigate('/')
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : ''

  const handleResetPro = async () => {
    if (!window.confirm('Reset account to FREE for testing?')) return
    try {
      await authAPI.resetPro()
      await fetchProfileData()
      alert('Account reset to FREE successfully!')
    } catch (err) {
      alert('Reset failed: ' + (err.response?.data?.message || err.message))
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafbfc]">
        <div className="animate-pulse flex flex-col items-center space-x-2">
          <Activity className="h-8 w-8 text-blue-600 animate-spin mb-4" />
          <span className="text-blue-800 text-sm font-bold uppercase tracking-[0.2em] font-['Outfit']">Loading Profile...</span>
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
            <button onClick={() => navigate('/history')} className="text-gray-500 hover:text-blue-600 transition-colors">History</button>
            <button onClick={() => navigate('/upload')} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-4 py-2 rounded-full transition-all duration-200 shadow-[0_8px_20px_rgba(37,99,235,0.2)]">
              + Upload
            </button>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">

        {/* Profile Header Card */}
        <div className="relative bg-white clinical-shadow rounded-[32px] border border-gray-100 overflow-hidden mb-8">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-50/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative p-8 md:p-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-28 h-28 rounded-[24px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-blue-500/20 font-['Outfit']">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                {user.membershipType === 'pro' && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-900 to-blue-800 rounded-full p-2.5 shadow-lg shadow-blue-900/30">
                    <Crown className="h-5 w-5 text-blue-300" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="text-center sm:text-left flex-1 mt-2">
                <h1 className="text-3xl font-bold text-[#0f1f38] mb-2 font-['Outfit'] tracking-tight">{user.name}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-500 mb-5 font-medium">
                  <span className="flex items-center gap-2 justify-center sm:justify-start"><Mail className="h-4 w-4 text-gray-400" /> {user.email}</span>
                  <span className="hidden sm:block text-gray-300">•</span>
                  <span className="flex items-center gap-2 justify-center sm:justify-start"><Calendar className="h-4 w-4 text-gray-400" /> Member since {memberSince}</span>
                </div>

                {/* Membership Badge */}
                <div className="inline-flex items-center gap-3">
                  {user.membershipType === 'pro' ? (
                    <span className="inline-flex items-center gap-2 px-5 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs uppercase tracking-widest font-bold font-['Outfit']">
                      <Star className="h-4 w-4" /> PRO Member
                    </span>
                  ) : (
                    <>
                      <span className="inline-flex items-center gap-2 px-5 py-2 bg-gray-50 border border-gray-200 rounded-full text-gray-600 text-xs uppercase tracking-widest font-bold font-['Outfit']">
                        Free Plan
                      </span>
                      <button
                        onClick={() => navigate('/pro')}
                        className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-900 text-white text-xs uppercase tracking-widest font-bold rounded-full hover:bg-blue-800 transition-all shadow-[0_8px_20px_rgba(30,58,138,0.2)] font-['Outfit']"
                      >
                        <Crown className="h-3.5 w-3.5 text-blue-300" /> Upgrade
                      </button>
                    </>
                  )}
                </div>
                {user.membershipType === 'pro' && (
                  <div className="mt-6 sm:mt-5">
                    <button
                      onClick={() => navigate('/consultation')}
                      className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase tracking-[0.1em] font-bold rounded-full transition-all shadow-[0_8px_20px_rgba(37,99,235,0.2)] font-['Outfit']"
                    >
                      <Heart className="h-4 w-4" /> Request Doctor Consultation
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {/* Reports Stat */}
          <div
            className="bg-white rounded-[24px] clinical-shadow border border-gray-100 p-6 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/history')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300" />
            </div>
            <p className="text-4xl font-bold text-[#0f1f38] font-['Outfit'] tracking-tight">{reportStats.total}</p>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1 font-['Outfit']">Total Reports</p>
          </div>

          {/* Consultations Stat */}
          <div
            className="bg-white rounded-[24px] clinical-shadow border border-gray-100 p-6 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={() => user.membershipType === 'pro' ? navigate('/consultation') : navigate('/pro')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Heart className="h-5 w-5" />
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300" />
            </div>
            <p className="text-4xl font-bold text-[#0f1f38] font-['Outfit'] tracking-tight">{user.consultationsAvailable || 0}</p>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1 font-['Outfit']">Consultations</p>
          </div>

          {/* Latest Risk Stat */}
          <div
            className="bg-white rounded-[24px] clinical-shadow border border-gray-100 p-6 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300" />
            </div>
            <p className="text-3xl font-bold text-[#0f1f38] font-['Outfit'] tracking-tight capitalize mt-1">
              {reportStats.recentRisk?.level || 'N/A'}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1 font-['Outfit']">Latest Risk Level</p>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-[32px] clinical-shadow border border-gray-100 p-8 md:p-10 mb-10">
          <h2 className="text-xl font-bold text-[#0f1f38] mb-6 flex items-center gap-3 font-['Outfit']">
            <Settings className="h-6 w-6 text-blue-600" />
            Account Details
          </h2>
          <div className="space-y-1">
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest font-['Outfit']">Full Name</span>
              </div>
              <span className="text-sm text-[#0f1f38] font-bold">{user.name}</span>
            </div>
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest font-['Outfit']">Email</span>
              </div>
              <span className="text-sm text-[#0f1f38] font-bold">{user.email}</span>
            </div>
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <Crown className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest font-['Outfit']">Plan</span>
              </div>
              <span className={`text-sm font-bold uppercase tracking-widest font-['Outfit'] ${user.membershipType === 'pro' ? 'text-blue-600' : 'text-gray-500'}`}>
                {user.membershipType === 'pro' ? 'PRO' : 'Free'}
              </span>
            </div>
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest font-['Outfit']">Joined</span>
              </div>
              <span className="text-sm text-[#0f1f38] font-bold">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Consultation History */}
        {consultations.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-emerald-400" />
              Consultation History
            </h2>
            <div className="space-y-3">
              {consultations.map((c) => (
                <div key={c._id} className="flex items-start justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex-1">
                    <p className="text-sm text-slate-200 line-clamp-2">{c.message}</p>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`ml-3 px-2 py-1 text-[10px] font-bold uppercase rounded-lg border ${
                    c.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : c.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    {c.status || 'pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {user.membershipType === 'pro' && (
            <button
              onClick={handleResetPro}
              className="p-6 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl transition-all duration-300 text-left group sm:col-span-2"
            >
              <Activity className="h-6 w-6 text-blue-600 mb-3" />
              <h3 className="text-sm font-bold text-[#0f1f38] mb-1 font-['Outfit']">Reset Account (Test)</h3>
              <p className="text-xs text-gray-500 font-medium">Revert membership to FREE to test the upgrade flow again</p>
            </button>
          )}
          <button
            onClick={() => navigate('/upload')}
            className="p-6 bg-white hover:bg-gray-50 clinical-shadow border border-gray-100 rounded-[24px] transition-all duration-300 text-left group"
          >
            <FileText className="h-6 w-6 text-blue-600 mb-3" />
            <h3 className="text-sm font-bold text-[#0f1f38] mb-1 font-['Outfit']">Upload New Report</h3>
            <p className="text-xs text-gray-500 font-medium">Analyze a new health report with Clinical AI</p>
          </button>
          <button
            onClick={handleLogout}
            className="p-6 bg-white hover:bg-red-50 clinical-shadow border border-gray-100 hover:border-red-100 rounded-[24px] transition-all duration-300 text-left group"
          >
            <LogOut className="h-6 w-6 text-red-500 mb-3" />
            <h3 className="text-sm font-bold text-red-600 mb-1 font-['Outfit']">Sign Out</h3>
            <p className="text-xs text-gray-500 font-medium group-hover:text-red-500/70">Log out of your secure portal</p>
          </button>
        </div>

      </div>
    </div>
  )
}
