import { useState, useEffect, useRef } from 'react'
import { Video } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, AlertTriangle, CheckCircle, XCircle, TrendingUp,
  Activity, Heart, Shield, Lightbulb, Download, Trash2,
  Clock, ChevronRight, Crown, Star, Menu, X, Sparkles, Zap, Brain, Users,
  ExternalLink, Play,
  PieChart as PieChartIcon, BarChart as BarChartIcon, Utensils, ArrowLeft
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
  ReferenceLine, ReferenceArea
} from 'recharts'

import { motion, AnimatePresence } from 'framer-motion'
import { authAPI } from '../api/authAPI'
import html2pdf from 'html2pdf.js'

export default function Dashboard() {
  const navigate = useNavigate()
  const [videoLoading, setVideoLoading] = useState(false)
  const handleVideoConsultation = async () => {
    setVideoLoading(true)
    try {
      const res = await authAPI.requestVideoConsultation()
      if (res.data && res.data.url) {
        window.open(res.data.url, '_blank')
      }
    } catch (err) {
      alert('Could not start video consultation. Please try again.')
    } finally {
      setVideoLoading(false)
    }
  }
  const [user, setUser] = useState(null)
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [labResults, setLabResults] = useState([])
  const [riskAssessment, setRiskAssessment] = useState({})
  const [overallRisk, setOverallRisk] = useState({})
  const [recommendations, setRecommendations] = useState([])
  const [lifestyleRecommendations, setLifestyleRecommendations] = useState({})
  const [precautions, setPrecautions] = useState([])
  const [comparisonSummary, setComparisonSummary] = useState(null)
  const [exerciseRecommendations, setExerciseRecommendations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  // ── Health Timeline state ──
  const [trendsData, setTrendsData] = useState(null)
  const [trendsLoading, setTrendsLoading] = useState(false)
  const [selectedBiomarker, setSelectedBiomarker] = useState(null)
  const [timeRange, setTimeRange] = useState('all') // 'last3' | 'last6' | 'all'
  const [activeView, setActiveView] = useState('home') // 'home' | 'report'
  const [dietSummary, setDietSummary] = useState(null)
  const [recentDietLogs, setRecentDietLogs] = useState([])
  const reportContentRef = useRef(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      navigate('/')
      return
    }
    const parsedUser = JSON.parse(storedUser)
    setUser(parsedUser)
    fetchReports()
    fetchProfile(parsedUser)
    fetchTrends()
    fetchDietData()
  }, [navigate])

  const fetchDietData = async () => {
    try {
      const summaryRes = await authAPI.getDietSummary(1)
      const logsRes = await authAPI.getDietLogs()
      setDietSummary(summaryRes.data.summary || {})
      setRecentDietLogs((logsRes.data.logs || []).slice(0, 3))
    } catch (err) {
      console.error('Error fetching diet data for dashboard:', err)
    }
  }

  const fetchProfile = async (fallbackUser) => {
    try {
      const res = await authAPI.getProfile()
      const updatedUser = res.data.user
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    } catch (err) {
      console.error('Could not fetch profile:', err)
    }
  }

  const fetchReports = async () => {
    setIsLoading(true)
    try {
      const res = await authAPI.getReports()
      const fetchedReports = res.data.reports || []
      setReports(fetchedReports)
      // Removed auto-load to allow Home Overview to show
    } catch (err) {
      console.error('Error fetching reports:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTrends = async () => {
    setTrendsLoading(true)
    try {
      const res = await authAPI.getReportTrends()
      const data = res.data
      setTrendsData(data)
      if (data.trends?.length > 0 && !selectedBiomarker) {
        setSelectedBiomarker(data.trends[0].biomarker)
      }
    } catch (err) {
      console.error('Error fetching trends:', err)
    } finally {
      setTrendsLoading(false)
    }
  }

  const loadReport = async (report) => {
    try {
      const res = await authAPI.getReport(report._id)
      const r = res.data.report
      setSelectedReport(r)
      setLabResults(r.labResults || [])
      setRiskAssessment(r.riskAssessment || {})
      setOverallRisk(r.overallRisk || {})
      setRecommendations(r.recommendations || [])
      setLifestyleRecommendations(r.lifestyleRecommendations || {})
      setPrecautions(r.precautions || [])
      setComparisonSummary(r.comparisonSummary || null)
      setExerciseRecommendations(r.exerciseRecommendations || [])
      setActiveView('report')
    } catch (err) {
      console.error('Error loading report:', err)
    }
  }

  const handleDelete = async (reportId) => {
    try {
      await authAPI.deleteReport(reportId)
      setDeleteConfirm(null)
      const updated = reports.filter(r => r._id !== reportId)
      setReports(updated)
      if (selectedReport?._id === reportId) {
        if (updated.length > 0) {
          loadReport(updated[0])
        } else {
          setSelectedReport(null)
          setLabResults([])
          setRiskAssessment({})
          setOverallRisk({})
          setRecommendations([])
          setLifestyleRecommendations({})
          setPrecautions([])
          setComparisonSummary(null)
          setExerciseRecommendations([])
        }
      }
    } catch (err) {
      console.error('Error deleting report:', err)
    }
  }

  const handleDownloadPDF = async () => {
    const element = reportContentRef.current
    if (!element) return

    try {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Clinical_Report_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }
      html2pdf().set(opt).from(element).save()
    } catch (err) {
      console.error('PDF download error:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('analysisResults')
    navigate('/')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Normal': case 'normal':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'High': case 'high':
        return 'text-red-700 bg-red-50 border-red-200'
      case 'Low': case 'low':
        return 'text-orange-700 bg-orange-50 border-orange-200'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getRiskMeterColor = () => {
    const level = overallRisk?.level;
    if (level === 'high') return 'bg-red-500';
    if (level === 'moderate') return 'bg-orange-500';
    return 'bg-green-500';
  }

  const buildTrendData = () => {
    if (reports.length < 2) return []
    const recent = [...reports].reverse().slice(0, 5)
    const firstReport = recent[0]
    if (!firstReport?.labResults?.length) return []
    const testName = firstReport.labResults[0]?.test_name
    if (!testName) return []

    return recent.map(r => {
      const match = r.labResults?.find(lr => lr.test_name === testName)
      return {
        date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        [testName]: match?.numeric_value || 0
      }
    }).filter(d => d[testName] > 0)
  }

  const getQuickTakeaways = () => {
    const takeaways = []

    labResults.forEach((result) => {
      const name = (result.test_name || '').toLowerCase()
      const status = (result.status || riskAssessment[result.test_name]?.status || '').toLowerCase()
      if (!status || status === 'normal') return

      if (name.includes('hemoglobin')) {
        takeaways.push(`Your hemoglobin is ${status}.`)
      }
      if (name.includes('rbc')) {
        takeaways.push(`Your red blood cell count is ${status}.`)
      }
      if (name.includes('ldl') && status === 'high') {
        takeaways.push('Your LDL cholesterol is high.')
      }
      if (name.includes('hdl') && status === 'low') {
        takeaways.push('Your HDL cholesterol is low.')
      }
      if (name.includes('triglyceride') && status === 'high') {
        takeaways.push('Your triglycerides are high.')
      }
      if (name.includes('hba1c') && status === 'high') {
        takeaways.push('Your average blood sugar (HbA1c) is elevated.')
      }
      if (name.includes('fbs') && status === 'high') {
        takeaways.push('Your fasting blood sugar is high.')
      }
      if (name.includes('cholesterol') && status === 'high') {
        takeaways.push('Your total cholesterol is high.')
      }
      if (name.includes('wbc')) {
        takeaways.push(`Your white blood cell count is ${status}.`)
      }
    })

    return [...new Set(takeaways)].slice(0, 5)
  }

  const quickTakeaways = getQuickTakeaways()
  const trendData = buildTrendData()
  const trendTestName = trendData.length > 0 ? Object.keys(trendData[0]).find(k => k !== 'date') : null

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-lg">
            <Activity className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          <span className="text-blue-900 text-sm font-bold uppercase tracking-widest">Loading Clinical Data...</span>
        </div>
      </div>
    )
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#0f1f38] font-sans selection:bg-blue-600/20">
      
      {/* ───────── Top Navigation (Clinical Light) ───────── */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors border border-transparent"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shadow-inner">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#0f1f38] hidden sm:block tracking-tight font-['Outfit']">
                Plumb <span className="text-blue-600">Health</span>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-5">
            {user.membershipType === 'pro' && (
              <>
                <button
                  onClick={() => navigate('/consultation')}
                  className="hidden sm:inline-flex items-center gap-2 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-full transition-colors shadow-lg shadow-amber-500/20 mr-2"
                >
                  <Heart className="h-4 w-4" /> Request Doctor Consultation
                </button>
                <button
                  onClick={handleVideoConsultation}
                  disabled={videoLoading}
                  className="hidden sm:inline-flex items-center gap-2 text-sm font-bold bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-full transition-colors shadow-lg shadow-blue-500/20"
                >
                  <Video className="h-4 w-4" /> {videoLoading ? 'Starting...' : 'Video Consult'}
                </button>
              </>
            )}
            {user.membershipType === 'pro' ? (
              <span className="hidden sm:inline-flex items-center text-[10px] font-black bg-blue-500 text-white px-2 py-1 rounded">
                PRO PLAN
              </span>
            ) : null}
            
            <button
              onClick={() => navigate('/upload')}
              className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 text-sm font-bold px-5 py-2 rounded-full transition-colors flex items-center shadow-[0_8px_20px_rgba(37,99,235,0.2)] font-['Outfit'] uppercase tracking-[0.1em] text-[10px]"></button>
            <button
              onClick={() => navigate('/upload')}
              className="hidden sm:flex bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-5 py-2.5 rounded-full transition-all items-center shadow-lg shadow-blue-500/20 font-['Outfit'] uppercase tracking-[0.15em]"
            >
              <FileText className="h-3.5 w-3.5 mr-2" /> Upload Report
            </button>
            <button
              onClick={() => navigate('/diet')}
              className="hidden sm:flex bg-white hover:bg-gray-50 text-blue-600 border border-gray-100 text-[10px] font-bold px-5 py-2.5 rounded-full transition-all items-center shadow-sm font-['Outfit'] uppercase tracking-[0.15em]"
            >
              <Utensils className="h-3.5 w-3.5 mr-2" /> Food Analyzer
            </button>
            <div className="h-6 w-[1px] bg-gray-100 hidden sm:block"></div>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-[#0f1f38] leading-tight font-['Outfit']">{user.name}</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest font-['Outfit']">ID: {user.id?.substring(0,6) || user._id?.substring(0,6) || 'N/A'}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shadow-sm font-['Outfit']">
               {user.name?.charAt(0).toUpperCase()}
            </div>
            
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 text-[10px] font-bold transition-colors ml-2 uppercase tracking-[0.2em] font-['Outfit']"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-[64px] flex max-w-[1600px] mx-auto h-screen">

        {/* ───────── Sidebar (Light Corporate) ───────── */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:static inset-y-0 left-0 z-40 w-72 lg:w-[320px]
          bg-[#f8fafc] border-r border-gray-200
          transition-transform duration-300 ease-in-out
          pt-[64px] lg:pt-0 overflow-y-auto h-full lg:shadow-none shadow-2xl
        `}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-2" /> Document History
              </h3>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse bg-white rounded-lg h-24 border border-gray-200 shadow-sm" />
                ))}
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-[#0f1f38] font-bold">No records found</p>
                <p className="text-xs text-gray-500 font-medium mt-1 mb-4">You have no analysis history.</p>
                <button
                  onClick={() => navigate('/upload')}
                  className="mt-2 text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded border border-blue-100 font-bold hover:bg-blue-100"
                >
                  Upload First Report
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {reports.map((report) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={report._id}
                      className={`
                        group relative p-4 rounded-lg cursor-pointer transition-all duration-200 shadow-sm
                        ${selectedReport?._id === report._id
                          ? 'bg-blue-600 border border-blue-600 text-white'
                          : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md'
                        }
                      `}
                      onClick={() => loadReport(report)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className={`text-sm font-bold truncate ${selectedReport?._id === report._id ? 'text-white' : 'text-[#0f1f38]'}`}>
                            {report.fileName}
                          </p>
                          <p className={`text-xs font-medium mt-1 ${selectedReport?._id === report._id ? 'text-blue-200' : 'text-gray-500'}`}>
                            {new Date(report.createdAt).toLocaleDateString('en-US', {
                              month: 'long', day: 'numeric', year: 'numeric'
                            })}
                          </p>
                          <div className="flex items-center mt-4 space-x-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              selectedReport?._id === report._id 
                              ? 'bg-blue-500 text-white' 
                              : report.overallRisk?.level === 'high' ? 'bg-red-50 text-red-700 border border-red-100' :
                              report.overallRisk?.level === 'moderate' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                              'bg-green-50 text-green-700 border border-green-100'
                            }`}>
                              {report.overallRisk?.level || 'N/A'} RISK
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteConfirm(report._id)
                          }}
                          className={`p-1.5 rounded transition-colors ${selectedReport?._id === report._id ? 'hover:bg-red-500/20 text-white/50 hover:text-white' : 'opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-400 hover:text-red-500'}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {deleteConfirm === report._id && (
                        <div className={`mt-4 pt-4 border-t flex items-center justify-between ${selectedReport?._id === report._id ? 'border-blue-500/50' : 'border-gray-100'}`}>
                          <span className={`text-xs font-bold ${selectedReport?._id === report._id ? 'text-white' : 'text-red-600'}`}>Delete permanently?</span>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(report._id) }}
                              className={`text-xs px-3 py-1.5 rounded font-bold transition-colors ${selectedReport?._id === report._id ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null) }}
                              className={`text-xs px-3 py-1.5 rounded font-bold transition-colors ${selectedReport?._id === report._id ? 'bg-blue-700 hover:bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
            
            <div className="mt-8 border-t border-gray-100 pt-8 space-y-4">
                <button
                  onClick={() => setActiveView('home')}
                  className={`w-full p-4 rounded-2xl flex items-center space-x-3 transition-all font-['Outfit'] ${
                    activeView === 'home' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white border border-gray-100 text-[#0f1f38] hover:border-blue-200 clinical-shadow'
                  }`}
                >
                  <Sparkles className={`flex-shrink-0 h-5 w-5 ${activeView === 'home' ? 'text-white' : 'text-blue-500'}`} />
                  <span className="text-sm font-bold tracking-tight">Health Intelligence</span>
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full bg-white border border-gray-100 text-[#0f1f38] p-4 rounded-2xl flex items-center space-x-3 transition-all font-['Outfit'] hover:border-blue-200 clinical-shadow"
                >
                  <Users className="flex-shrink-0 h-5 w-5 text-gray-400" />
                  <span className="text-sm font-bold tracking-tight">Patient Profile</span>
                </button>
                <button
                  onClick={() => navigate('/history')}
                  className="w-full bg-white border border-gray-100 text-[#0f1f38] p-4 rounded-2xl flex items-center space-x-3 transition-all font-['Outfit'] hover:border-blue-200 clinical-shadow"
                >
                  <Activity className="flex-shrink-0 h-5 w-5 text-gray-400" />
                  <span className="text-sm font-bold tracking-tight">Diagnostic History</span>
                </button>
                <button
                  onClick={() => navigate('/diet')}
                  className="w-full bg-white border border-gray-100 text-[#0f1f38] p-4 rounded-2xl flex items-center space-x-3 transition-all font-['Outfit'] hover:border-blue-200 clinical-shadow"
                >
                  <Utensils className="flex-shrink-0 h-5 w-5 text-blue-500" />
                  <span className="text-sm font-bold tracking-tight">Food Analyzer</span>
                </button>
                
                {user.membershipType !== 'pro' ? (
                  <button
                    onClick={() => navigate('/pro')}
                    className="w-full bg-gradient-to-br from-blue-900 to-[#0f1f38] text-white p-5 rounded-2xl flex items-start space-x-4 shadow-xl hover:scale-[1.02] transition-all border border-blue-800/50 mt-4 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors" />
                    <Crown className="flex-shrink-0 h-6 w-6 text-blue-400 relative z-10" />
                    <div className="text-left relative z-10">
                      <p className="text-sm font-bold text-white mb-1 font-['Outfit'] tracking-tight">Unlock PRO</p>
                      <p className="text-[10px] text-blue-200 font-medium leading-relaxed font-['Outfit'] uppercase tracking-widest">Get doctor analysis</p>
                    </div>
                  </button>
                ) : (
                  <div className="w-full bg-blue-50 border border-blue-100 p-5 rounded-2xl flex items-start space-x-4 shadow-sm mt-4">
                    <Star className="flex-shrink-0 h-6 w-6 text-blue-600" />
                    <div className="text-left">
                      <p className="text-sm font-bold text-[#0f1f38] mb-1 font-['Outfit'] tracking-tight">PRO Member</p>
                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest font-['Outfit']">Premium Clinical Access</p>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </aside>

        {/* ───────── Main Dashboard Content ───────── */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">

          {activeView === 'home' ? (
            /* 🏠 Home Overview Mode */
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-[1200px] mx-auto space-y-10 pb-20"
            >
              {/* Row 1: Hero Welcome */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-black text-[#0f1f38] mb-2">
                    Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user.name.split(' ')[0]}
                  </h1>
                  <p className="text-gray-500 font-medium">Your health intelligence is up to date.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Health Score</p>
                      <p className="text-xl font-black text-blue-900">{reports.length > 0 ? reports[0].overallRisk?.score || 0 : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Diet Streak</p>
                      <p className="text-xl font-black text-emerald-900">3 Days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Feature Hub */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: <FileText className="h-6 w-6" />, label: 'Reports', sub: reports.length + ' Analyzed', color: 'blue', action: () => navigate('/history') },
                  { icon: <Utensils className="h-6 w-6" />, label: 'Diet', sub: 'Today: ' + (dietSummary?.[new Date().toISOString().split('T')[0]]?.calories || 0) + ' kcal', color: 'emerald', action: () => navigate('/diet') },
                  { icon: <Users className="h-6 w-6" />, label: 'Consult', sub: 'Book a Doctor', color: 'amber', action: () => navigate('/consultation') },
                  { icon: <TrendingUp className="h-6 w-6" />, label: 'Trends', sub: 'Progress Tracker', color: 'purple', action: () => fetchTrends() },
                ].map((hub, i) => (
                  <button 
                    key={i}
                    onClick={hub.action}
                    className={`p-6 bg-white border border-gray-200 rounded-2xl text-left hover:shadow-lg transition-all active:scale-95 group overflow-hidden relative`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-${hub.color}-50 flex items-center justify-center mb-4 text-${hub.color}-600 group-hover:scale-110 transition-transform`}>
                      {hub.icon}
                    </div>
                    <p className="font-black text-[#0f1f38]">{hub.label}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter mt-1">{hub.sub}</p>
                    <div className={`absolute -right-2 -bottom-2 w-12 h-12 bg-${hub.color}-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </button>
                ))}
              </div>

              {/* Row 3: Split Panels */}
              <div className="grid lg:grid-cols-12 gap-8">
                {/* Left: Recent Reports */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-[#0f1f38] text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      Recent Health Records
                    </h3>
                    <button onClick={() => navigate('/history')} className="text-sm font-bold text-blue-600 hover:underline">View All</button>
                  </div>
                  
                  {reports.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-100 rounded-2xl p-20 text-center">
                      <FileText className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                      <p className="font-bold text-gray-400">No clinical records yet</p>
                      <button onClick={() => navigate('/upload')} className="mt-4 text-blue-600 font-bold text-sm">Upload first report →</button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {reports.slice(0, 3).map((report) => (
                        <div 
                          key={report._id}
                          onClick={() => loadReport(report)}
                          className="bg-white border border-gray-200 p-5 rounded-2xl flex items-center justify-between hover:border-blue-400 cursor-pointer transition-all shadow-sm group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                              <FileText className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="font-bold text-[#0f1f38]">{report.fileName}</p>
                              <p className="text-xs text-gray-400 font-medium">{new Date(report.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              report.overallRisk?.level === 'high' ? 'bg-red-50 text-red-700' :
                              report.overallRisk?.level === 'moderate' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
                            }`}>
                              {report.overallRisk?.level || 'N/A'} Risk
                            </span>
                            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Nutrition Snapshot */}
                <div className="lg:col-span-4 space-y-6">
                   <h3 className="font-bold text-[#0f1f38] text-xl flex items-center gap-3 font-['Outfit'] tracking-tight">
                      <Utensils className="h-6 w-6 text-blue-600" />
                      Nutrition Insights
                    </h3>
                    <div className="bg-white border border-gray-100 rounded-[32px] p-8 clinical-shadow space-y-8">
                      {(() => {
                        const today = new Date().toISOString().split('T')[0];
                        const data = dietSummary?.[today] || { calories: 0, protein: 0, carbs: 0, fat: 0 };
                        return (
                          <>
                            <div className="text-center relative">
                              <p className="text-5xl font-bold text-[#0f1f38] font-['Outfit'] tracking-tighter">{data.calories}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2 font-['Outfit']">Daily Calorie Intake</p>
                              <div className="mt-6 h-3 w-full bg-gray-50 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-blue-600 rounded-full shadow-[0_0_12px_rgba(37,99,235,0.3)]" style={{ width: `${Math.min((data.calories / 2000) * 100, 100)}%` }} />
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              {[
                                { label: 'Protein', value: data.protein, unit: 'g', color: 'emerald' },
                                { label: 'Carbs', value: data.carbs, unit: 'g', color: 'blue' },
                                { label: 'Fat', value: data.fat, unit: 'g', color: 'amber' },
                              ].map(m => (
                                <div key={m.label} className={`bg-${m.color}-50/50 rounded-2xl p-4 text-center border border-${m.color}-100/50 transition-all hover:scale-[1.05]`}>
                                  <p className={`text-sm font-bold text-${m.color}-700 font-['Outfit']`}>{m.value}{m.unit}</p>
                                  <p className={`text-[8px] font-bold text-${m.color}-500 uppercase tracking-widest font-['Outfit'] mt-1`}>{m.label}</p>
                                </div>
                              ))}
                            </div>
                            <button 
                              onClick={() => navigate('/diet')}
                              className="w-full py-4 bg-blue-600 text-white rounded-full text-[11px] font-bold uppercase tracking-widest shadow-[0_12px_30px_rgba(37,99,235,0.2)] hover:bg-blue-700 transition-all font-['Outfit']"
                            >
                              Log Food Intake
                            </button>
                          </>
                        )
                      })()}
                    </div>
                </div>
              </div>
            </motion.div>
          ) : selectedReport ? (
            /* 📄 Report View Mode */
            <div
              ref={reportContentRef}
              className="max-w-[1200px] mx-auto pb-20 animate-[fadeIn_0.5s_ease-out]"
            >
              {/* Back to Overview Button */}
              <button 
                onClick={() => setActiveView('home')}
                className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-6 hover:translate-x-[-4px] transition-transform"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Health Overview
              </button>

              {/* Header */}
              <div className="bg-white p-10 rounded-[32px] border border-gray-100 clinical-shadow mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-8 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="bg-blue-600 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-md shadow-lg shadow-blue-500/20 font-['Outfit']">Clinical Analysis</span>
                    <span className="text-gray-400 text-[10px] font-bold flex items-center uppercase tracking-widest font-['Outfit']"><Clock className="h-3.5 w-3.5 mr-2 text-blue-500"/> Processed: {new Date(selectedReport.analysisTimestamp || selectedReport.createdAt).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-[#0f1f38] font-['Outfit'] tracking-tight">{selectedReport.fileName}</h2>
                </div>
                <div className="flex items-center space-x-4 relative z-10">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 border border-gray-200 text-[#0f1f38] text-[11px] font-bold uppercase tracking-widest px-8 py-4 rounded-full transition-all shadow-sm font-['Outfit']"
                  >
                    <Download className="h-4 w-4 text-blue-600" />
                    <span>Export Data</span>
                  </button>
                </div>
              </div>

              {/* Advanced Corporate Risk Meter */}
              {overallRisk?.score !== undefined && (
                <div className="mb-8">
                  <div className="bg-gradient-to-br from-blue-900 to-[#0f1f38] rounded-[32px] p-10 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between relative overflow-hidden border border-blue-800/50">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse" />
                    
                    <div className="relative z-10 lg:w-2/5 mb-8 lg:mb-0">
                       <p className="text-blue-300 text-[10px] font-bold uppercase tracking-[0.25em] mb-3 font-['Outfit']">Clinical Index Score</p>
                       <h3 className="text-3xl font-bold text-white mb-4 font-['Outfit'] tracking-tight">Diagnostic Risk Profile</h3>
                       <p className="text-blue-100/70 text-sm font-medium leading-relaxed pr-8 font-['Outfit']">{overallRisk.summary}</p>
                    </div>

                    <div className="relative z-10 lg:w-3/5 flex items-center lg:justify-end">
                      <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl p-8 rounded-[24px] border border-white/10 shadow-2xl">
                        <div className="flex items-end justify-between mb-6">
                          <p className="text-6xl font-bold text-white leading-none tracking-tighter font-['Outfit']">{overallRisk.score}<span className="text-xl text-blue-400 tracking-widest uppercase ml-2 font-bold opacity-70">pts</span></p>
                          <span className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-['Outfit'] ${
                             overallRisk?.level === 'high' ? 'bg-red-500 text-white' :
                             overallRisk?.level === 'moderate' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
                          } shadow-lg shadow-black/20`}>
                            {overallRisk.level} Priority
                          </span>
                        </div>
                        {/* Meter Bar */}
                        <div className="w-full h-4 bg-black/30 rounded-full overflow-hidden shadow-inner border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${overallRisk.score}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                            className={`h-full ${getRiskMeterColor()} rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)]`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">Total Biomarkers</p>
                    <Activity className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-3xl font-black text-[#0f1f38]">{labResults.length}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">Within Range</p>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-3xl font-black text-green-700">
                    {labResults.filter(t => (t.status || riskAssessment[t.test_name]?.status || '').toLowerCase() === 'normal').length}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">Flagged Results</p>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-3xl font-black text-red-600">
                    {labResults.filter(t => {
                      const s = (t.status || riskAssessment[t.test_name]?.status || '').toLowerCase()
                      return s && s !== 'normal'
                    }).length}
                  </p>
                </div>
              </div>

              {/* Data Visualization Section */}
              {labResults.length > 0 && (
                <div className="grid lg:grid-cols-2 gap-8 mb-10">
                  
                  {/* Distribution Analysis (Replaced Donut) */}
                  <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                    <h3 className="text-sm font-extrabold text-[#0f1f38] mb-8 uppercase tracking-widest flex items-center">
                      <Activity className="h-5 w-5 mr-3 text-blue-600" /> Biomarker Distribution
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <span>Health Overview</span>
                        <span>{labResults.length} Total</span>
                      </div>
                      <div className="h-10 w-full flex rounded-xl overflow-hidden shadow-inner bg-gray-100">
                        {(() => {
                          const normalCount = labResults.filter(t => (t.status || riskAssessment[t.test_name]?.status || '').toLowerCase() === 'normal').length;
                          const highCount = labResults.filter(t => (t.status || riskAssessment[t.test_name]?.status || '').toLowerCase() === 'high').length;
                          const lowCount = labResults.filter(t => (t.status || riskAssessment[t.test_name]?.status || '').toLowerCase() === 'low').length;
                          const flaggedCount = highCount + lowCount;
                          
                          const normalPct = (normalCount / labResults.length) * 100;
                          const highPct = (highCount / labResults.length) * 100;
                          const lowPct = (lowCount / labResults.length) * 100;

                          return (
                            <>
                              <div style={{ width: `${normalPct}%` }} className="bg-emerald-500 h-full flex items-center justify-center text-[10px] text-white font-black">{normalCount > 0 ? 'NORMAL' : ''}</div>
                              <div style={{ width: `${highPct}%` }} className="bg-rose-500 h-full flex items-center justify-center text-[10px] text-white font-black">{highCount > 0 ? 'HIGH' : ''}</div>
                              <div style={{ width: `${lowPct}%` }} className="bg-amber-500 h-full flex items-center justify-center text-[10px] text-white font-black">{lowCount > 0 ? 'LOW' : ''}</div>
                            </>
                          )
                        })()}
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-center">
                          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Normal</p>
                          <p className="text-xl font-black text-emerald-800">{labResults.filter(t => (t.status || riskAssessment[t.test_name]?.status || '').toLowerCase() === 'normal').length}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-center">
                          <p className="text-[10px] font-black text-rose-700 uppercase tracking-widest mb-1">Flagged</p>
                          <p className="text-xl font-black text-rose-800">{labResults.filter(t => {
                            const s = (t.status || riskAssessment[t.test_name]?.status || '').toLowerCase();
                            return s && s !== 'normal' && s !== 'unknown';
                          }).length}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-center">
                          <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1">Efficiency</p>
                          <p className="text-xl font-black text-blue-800">{Math.round((labResults.filter(t => (t.status || riskAssessment[t.test_name]?.status || '').toLowerCase() === 'normal').length / labResults.length) * 100)}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Biomarker Health Strips (Replaced Bar Chart) */}
                  <div className="bg-white border border-gray-100 rounded-[32px] p-10 clinical-shadow overflow-hidden">
                     <h3 className="text-sm font-bold text-[#0f1f38] mb-10 uppercase tracking-[0.25em] flex items-center font-['Outfit']">
                      <Sparkles className="h-5 w-5 mr-4 text-blue-600" /> Physiological Markers
                    </h3>
                    <div className="space-y-8">
                      {labResults.slice(0, 4).map((result, idx) => {
                        const status = (result.status || riskAssessment[result.test_name]?.status || '').toLowerCase();
                        const isNormal = status === 'normal';
                        const colorClass = status === 'high' ? 'bg-rose-500' : status === 'low' ? 'bg-amber-500' : 'bg-blue-600';
                        const textClass = status === 'high' ? 'text-rose-600' : status === 'low' ? 'text-amber-600' : 'text-blue-600';
                        
                        return (
                          <div key={idx} className="relative group">
                            <div className="flex justify-between items-end mb-3">
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-['Outfit'] mb-1">{result.test_name}</p>
                                <p className="text-lg font-bold text-[#0f1f38] font-['Outfit'] tracking-tight">{result.value} <span className="text-[10px] text-gray-400 uppercase ml-1 font-bold">{result.unit}</span></p>
                              </div>
                              <span className={`text-[9px] font-bold uppercase tracking-[0.2em] font-['Outfit'] px-3 py-1 rounded-md border ${isNormal ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                                {status.toUpperCase()}
                              </span>
                            </div>
                            <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden shadow-inner">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: isNormal ? '70%' : '95%' }}
                                className={`h-full ${colorClass} shadow-[0_0_12px_rgba(37,99,235,0.2)]`}
                              />
                            </div>
                            {/* Range Indicator */}
                            <div className="flex justify-between mt-2 px-1">
                              <span className="text-[8px] font-bold text-gray-300 font-['Outfit'] uppercase tracking-widest">Baseline: {result.reference_range?.split('-')[0] || '0'}</span>
                              <span className="text-[8px] font-bold text-gray-300 font-['Outfit'] uppercase tracking-widest">Upper: {result.reference_range?.split('-')[1] || '100'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}


              {quickTakeaways.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 mb-10">
                  <h3 className="text-sm font-extrabold text-[#0f1f38] mb-4 uppercase tracking-widest flex items-center">
                    <Heart className="h-4 w-4 mr-2 text-rose-500" /> Quick Takeaway
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-700 font-medium">
                    {quickTakeaways.map((takeaway, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mt-1 mr-3 h-2.5 w-2.5 rounded-full bg-blue-600 flex-shrink-0" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs text-slate-500">These simple points are based on the current panel results. For a full diagnosis, review the complete summary with a healthcare provider.</p>
                </div>
              )}

              {/* ═══ Health Timeline / Progress Tracker ═══ */}
              {(trendsData || trendsLoading) && (() => {
                const allTrends = trendsData?.trends || []
                const biggestChanges = trendsData?.biggestChanges || []

                // Apply time-range filter to the selected biomarker's data points
                const activeTrend = allTrends.find(t => t.biomarker === selectedBiomarker)
                const filterPoints = (pts) => {
                  if (!pts) return []
                  if (timeRange === 'last3') return pts.slice(-3)
                  if (timeRange === 'last6') return pts.slice(-6)
                  return pts
                }
                const chartPoints = filterPoints(activeTrend?.dataPoints || [])

                // Parse reference range from most recent point ("12.0-16.0" → [12, 16])
                const parseRefRange = (rangeStr) => {
                  if (!rangeStr) return null
                  const m = rangeStr.match(/([\d.]+)\s*[-–]\s*([\d.]+)/)
                  if (m) return { low: parseFloat(m[1]), high: parseFloat(m[2]) }
                  return null
                }
                const latestRefRange = parseRefRange(
                  chartPoints.length > 0
                    ? chartPoints[chartPoints.length - 1].reference_range
                    : activeTrend?.latestReferenceRange
                )

                // Map for Recharts — format date as short label
                const chartData = chartPoints.map(dp => ({
                  date: new Date(dp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
                  fullDate: new Date(dp.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                  value: dp.value,
                  displayValue: dp.displayValue,
                  status: dp.status,
                  reference_range: dp.reference_range,
                  fileName: dp.fileName
                }))

                const hasSufficientData = chartData.length >= 2
                const unit = activeTrend?.unit || ''

                // Status → colour for the dot
                const statusDotColor = (status) => {
                  if (status === 'High') return '#f43f5e'
                  if (status === 'Low') return '#f59e0b'
                  return '#10b981'
                }

                // Custom tooltip
                const CustomTooltip = ({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0].payload
                  const color = statusDotColor(d.status)
                  return (
                    <div className="bg-[#0f1f38] border border-[#1e3a8a] rounded-xl px-4 py-3 shadow-2xl text-white text-sm min-w-[180px]">
                      <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-1">{d.fullDate}</p>
                      <p className="text-2xl font-black" style={{ color }}>{d.displayValue || d.value} <span className="text-sm font-bold text-blue-300">{unit}</span></p>
                      <p className="text-[10px] font-bold mt-1" style={{ color }}>{d.status}</p>
                      {d.reference_range && (
                        <p className="text-[10px] text-blue-400 mt-1">Range: {d.reference_range}</p>
                      )}
                      <p className="text-[10px] text-blue-500 mt-1 truncate">{d.fileName}</p>
                    </div>
                  )
                }

                // Custom dot — coloured by status
                const CustomDot = (props) => {
                  const { cx, cy, payload } = props
                  const color = statusDotColor(payload.status)
                  return <circle cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2} />
                }

                return (
                  <motion.div
                    variants={cardVariants}
                    initial="hidden" animate="visible"
                    className="mb-10"
                  >
                    {/* Section header */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-extrabold text-[#0f1f38] uppercase tracking-widest flex items-center">
                        <TrendingUp className="h-5 w-5 mr-3 text-blue-600" /> Health Timeline
                        <span className="ml-3 text-[10px] font-black text-blue-500 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">PROGRESS TRACKER</span>
                      </h3>
                      {/* Time-range toggle */}
                      {hasSufficientData && (
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                          {[['last3','Last 3'], ['last6','Last 6'], ['all','All Time']].map(([val, label]) => (
                            <button
                              key={val}
                              onClick={() => setTimeRange(val)}
                              className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded transition-all ${
                                timeRange === val
                                  ? 'bg-[#0f1f38] text-white shadow'
                                  : 'text-gray-500 hover:text-gray-800'
                              }`}
                            >{label}</button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Biggest-change summary cards (server-computed) */}
                    {biggestChanges.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {biggestChanges.map((change, i) => {
                          const isUp = change.direction === 'increased'
                          const isBad = (isUp && change.currentStatus === 'High') || (!isUp && change.currentStatus === 'Low')
                          const bgClass = isBad ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
                          const textClass = isBad ? 'text-rose-700' : 'text-emerald-700'
                          const numClass = isBad ? 'text-rose-800' : 'text-emerald-800'
                          const icon = isUp ? '↑' : '↓'
                          return (
                            <button
                              key={i}
                              onClick={() => setSelectedBiomarker(change.biomarker)}
                              className={`rounded-xl border p-4 text-left transition-all hover:shadow-md ${bgClass} ${
                                selectedBiomarker === change.biomarker ? 'ring-2 ring-blue-400' : ''
                              }`}
                            >
                              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${textClass}`}>
                                {change.biomarker}
                              </p>
                              <p className={`text-xl font-black ${numClass}`}>
                                {icon} {change.percentChange}%
                                <span className="text-xs font-bold ml-1">{change.unit}</span>
                              </p>
                              <p className="text-[10px] text-gray-500 font-medium mt-1">
                                {change.prevValue} → {change.currValue} since {change.prevDate}
                              </p>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Biomarker selector pills */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                      {trendsLoading ? (
                        <div className="p-8 flex items-center justify-center">
                          <Activity className="h-6 w-6 text-blue-500 animate-spin mr-3" />
                          <span className="text-sm font-bold text-gray-500">Loading biomarker history...</span>
                        </div>
                      ) : allTrends.length === 0 ? (
                        <div className="p-10 text-center">
                          <TrendingUp className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm font-bold text-gray-400">Upload at least 2 reports to see trends</p>
                          <p className="text-[11px] text-gray-400 mt-1">The timeline will appear automatically once you have multiple reports.</p>
                        </div>
                      ) : (
                        <>
                          {/* Pill tabs */}
                          <div className="flex flex-wrap gap-2 p-4 border-b border-gray-100 bg-gray-50">
                            {allTrends.map(t => (
                              <button
                                key={t.biomarker}
                                onClick={() => setSelectedBiomarker(t.biomarker)}
                                className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full transition-all ${
                                  selectedBiomarker === t.biomarker
                                    ? 'bg-[#0f1f38] text-white shadow-md'
                                    : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300'
                                }`}
                              >
                                {t.biomarker}
                              </button>
                            ))}
                          </div>

                          {/* Chart area */}
                          <div className="p-6">
                            {!hasSufficientData ? (
                              <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                                  <TrendingUp className="h-6 w-6 text-blue-400" />
                                </div>
                                <p className="text-sm font-bold text-gray-600">Not enough data for {selectedBiomarker}</p>
                                <p className="text-xs text-gray-400 mt-1 max-w-xs">Upload more reports to see this biomarker's trend. At least 2 data points are needed to draw a meaningful line.</p>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <p className="text-lg font-extrabold text-[#0f1f38]">{selectedBiomarker}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                      {chartData.length} data points · {unit && `Unit: ${unit}`}
                                      {latestRefRange && ` · Normal: ${latestRefRange.low}–${latestRefRange.high}`}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-wider">
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Normal</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> High</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Low</span>
                                  </div>
                                </div>
                                <ResponsiveContainer width="100%" height={260}>
                                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                    <defs>
                                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis
                                      dataKey="date"
                                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                      axisLine={false} tickLine={false}
                                    />
                                    <YAxis
                                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                      axisLine={false} tickLine={false}
                                      domain={['auto', 'auto']}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    {/* Normal range band from most-recent reference range */}
                                    {latestRefRange && (
                                      <ReferenceArea
                                        y1={latestRefRange.low}
                                        y2={latestRefRange.high}
                                        fill="#10b981"
                                        fillOpacity={0.07}
                                        ifOverflow="visible"
                                      />
                                    )}
                                    {latestRefRange && (
                                      <ReferenceLine y={latestRefRange.high} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1.5}
                                        label={{ value: 'Max', position: 'right', fontSize: 9, fill: '#10b981', fontWeight: 700 }} />
                                    )}
                                    {latestRefRange && (
                                      <ReferenceLine y={latestRefRange.low} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1.5}
                                        label={{ value: 'Min', position: 'right', fontSize: 9, fill: '#10b981', fontWeight: 700 }} />
                                    )}
                                    <Line
                                      type="monotone"
                                      dataKey="value"
                                      stroke="#3b82f6"
                                      strokeWidth={2.5}
                                      dot={<CustomDot />}
                                      activeDot={{ r: 7, stroke: 'white', strokeWidth: 2 }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )
              })()}

              {/* Core Intelligence Text */}
              <div className="grid lg:grid-cols-2 gap-8 mb-10">
                {selectedReport?.clinicalSummary && (
                  <div className="bg-white border-l-4 border-blue-600 rounded-r-xl shadow-sm p-8">
                    <h3 className="text-sm font-extrabold text-[#0f1f38] mb-4 flex items-center uppercase tracking-widest">
                      <Activity className="h-4 w-4 mr-2 text-blue-600" /> Synthesis Notes
                    </h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line font-medium">
                      {selectedReport.clinicalSummary}
                    </p>
                  </div>
                )}

                {comparisonSummary && (comparisonSummary.improved?.length > 0 || comparisonSummary.worsened?.length > 0 || comparisonSummary.needsAttention?.length > 0) ? (
                  <div className="bg-blue-900 border-l-4 border-blue-400 rounded-r-xl shadow-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <h3 className="text-sm font-extrabold text-white mb-4 flex items-center uppercase tracking-widest">
                      <TrendingUp className="h-4 w-4 mr-2 text-blue-400" /> Delta Summary
                    </h3>
                    {comparisonSummary.overallDelta && (
                      <p className="text-blue-100 font-medium text-sm mb-4">
                        {comparisonSummary.overallDelta}
                      </p>
                    )}
                    <div className="space-y-4">
                      {comparisonSummary.needsAttention?.length > 0 && (
                        <div className="bg-rose-500/20 border border-rose-500/30 p-3 rounded-lg">
                          <p className="text-xs font-black text-rose-300 uppercase tracking-widest mb-2 flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> Needs Attention</p>
                          <ul className="list-disc pl-4 space-y-1 text-rose-100 text-sm">
                            {comparisonSummary.needsAttention.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      )}
                      {comparisonSummary.improved?.length > 0 && (
                        <div>
                          <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Improved</p>
                          <ul className="list-disc pl-4 space-y-1 text-emerald-100 text-sm">
                            {comparisonSummary.improved.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      )}
                      {comparisonSummary.worsened?.length > 0 && (
                        <div>
                          <p className="text-xs font-black text-orange-400 uppercase tracking-widest mb-1">Worsened</p>
                          <ul className="list-disc pl-4 space-y-1 text-orange-100 text-sm">
                            {comparisonSummary.worsened.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : selectedReport?.trendInsight ? (
                  <div className="bg-blue-900 border-l-4 border-blue-400 rounded-r-xl shadow-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <h3 className="text-sm font-extrabold text-white mb-4 flex items-center uppercase tracking-widest">
                      <TrendingUp className="h-4 w-4 mr-2 text-blue-400" /> Comparative Trend Analysis
                    </h3>
                    <p className="text-blue-100 leading-relaxed whitespace-pre-line font-bold text-sm">
                      {selectedReport.trendInsight}
                    </p>
                    <div className="mt-6 flex items-center text-[10px] font-black text-blue-300 uppercase tracking-widest border-t border-white/10 pt-4">
                      <Sparkles className="h-3 w-3 mr-2" /> Automated Progression Tracking Active
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                    <TrendingUp className="h-8 w-8 text-gray-300 mb-3" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Baseline Established</p>
                    <p className="text-[10px] text-gray-400 mt-1">Upload another report to unlock trend analysis.</p>
                  </div>
                )}
              </div>



              {/* Detailed Tables and Lists */}
              <div className="grid lg:grid-cols-3 gap-8">
                
                {/* Lab Results Table */}
                {labResults.length > 0 && (
                  <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-200 bg-gray-50/80">
                       <h3 className="text-sm font-extrabold text-[#0f1f38] uppercase tracking-widest flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-600" /> Extracted Panel Data
                      </h3>
                    </div>
                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white border-b border-gray-200">
                            <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Biomarker Identification</th>
                            <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Recorded Value</th>
                            <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">System Flag</th>
                            <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Threshold Range</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-100">
                          {labResults.map((result, index) => {
                            const riskData = riskAssessment[result.test_name] || {}
                            const displayStatus = result.status || riskData.status || 'Normal'
                            return (
                              <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-6 font-bold text-[#0f1f38]">{result.test_name}</td>
                                <td className="py-4 px-6">
                                  <span className="font-mono text-[#0f1f38] font-bold text-base">{result.value}</span>
                                  <span className="text-xs text-gray-500 ml-1.5 font-bold uppercase">{result.unit}</span>
                                </td>
                                <td className="py-4 px-6">
                                  <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getStatusColor(displayStatus)}`}>
                                    {displayStatus}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-gray-500 font-mono text-xs">{result.reference_range || riskData.reference_range || 'N/A'}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Recommendations Sidebar */}
                <div className="space-y-8 flex flex-col">
                  {recommendations.length > 0 && (
                     <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
                      <h3 className="text-xs font-extrabold text-[#0f1f38] mb-6 uppercase tracking-widest flex items-center">
                        <Lightbulb className="h-4 w-4 mr-2" /> Directives
                      </h3>
                      <div className="space-y-4">
                        {recommendations.map((rec, index) => {
                          const isUrgent = rec.toLowerCase().includes('urgent') || rec.toLowerCase().includes('immediate') || rec.toLowerCase().includes('endocrinologist');
                          const isRecommended = rec.toLowerCase().includes('recommend') || rec.toLowerCase().includes('consider');
                          
                          return (
                            <div key={index} className={`p-3 rounded-lg border flex items-start transition-all ${
                              isUrgent ? 'bg-rose-50 border-rose-100 shadow-sm' : 
                              isRecommended ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'
                            }`}>
                               <div className={`rounded p-1 mr-3 mt-0.5 ${
                                 isUrgent ? 'bg-rose-200 text-rose-700' :
                                 isRecommended ? 'bg-blue-200 text-blue-700' : 'bg-gray-200 text-gray-600'
                               }`}>
                                <ChevronRight className="h-3 w-3" />
                              </div>
                              <div>
                                {isUrgent && <span className="text-[8px] font-black uppercase tracking-tighter text-rose-600 block mb-1">URGENT PRIORITY</span>}
                                <p className={`text-sm font-bold leading-relaxed ${isUrgent ? 'text-rose-900' : 'text-gray-700'}`}>{rec}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}


                  {precautions.length > 0 && (
                    <div className="bg-[#fff1f2] border border-red-200 rounded-xl p-6 shadow-sm">
                      <h3 className="text-xs font-extrabold text-red-700 mb-4 uppercase tracking-widest flex items-center">
                        <Shield className="h-4 w-4 mr-2" /> Critical Advisories
                      </h3>
                      <ul className="space-y-3">
                        {precautions.map((precaution, index) => (
                          <li key={index} className="flex items-start bg-white p-3 rounded shadow-sm border border-red-100">
                            <AlertTriangle className="h-4 w-4 text-red-500 mr-3 flex-shrink-0" />
                            <span className="text-sm text-red-900 font-bold leading-relaxed">{precaution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Lifestyle Recommendations */}
              {Object.keys(lifestyleRecommendations).length > 0 && (
                <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm p-8">
                  <h3 className="text-sm font-extrabold text-[#0f1f38] mb-8 uppercase tracking-widest flex items-center border-b border-gray-100 pb-4">
                    <Heart className="h-4 w-4 mr-2 text-rose-500" /> Specialized Guidance
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {Object.entries(lifestyleRecommendations).map(([testName, recs]) => (
                      <div key={testName} className="bg-gray-50/50 p-5 rounded-lg border border-gray-100">
                        <h4 className="text-xs font-black text-blue-700 mb-4 uppercase tracking-widest">
                           {testName}
                        </h4>
                        <ul className="space-y-3">
                          {(Array.isArray(recs) ? recs : []).map((rec, index) => (
                            <li key={index} className="flex items-start text-sm text-gray-700 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 mr-3 flex-shrink-0" />
                              <span className="leading-relaxed">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exercise Recommendations */}
              {exerciseRecommendations?.length > 0 && (
                <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm p-8">
                  <h3 className="text-sm font-extrabold text-[#0f1f38] mb-8 uppercase tracking-widest flex items-center border-b border-gray-100 pb-4">
                    <Activity className="h-4 w-4 mr-2 text-emerald-500" /> Prescribed Exercises
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exerciseRecommendations.map((exercise, idx) => (
                      <div key={idx} className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-6 hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                        
                        <div className="mb-4 relative z-10">
                          <h4 className="text-lg font-black text-[#0f1f38] mb-2">{exercise.name}</h4>
                          <div className="flex flex-wrap gap-3 mb-4">
                            <span className="flex items-center text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded uppercase tracking-widest">
                              <Clock className="w-3 h-3 mr-1" /> {exercise.duration}
                            </span>
                            <span className="flex items-center text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded uppercase tracking-widest">
                              <TrendingUp className="w-3 h-3 mr-1" /> {exercise.frequency}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 font-medium leading-relaxed">{exercise.reason}</p>
                        </div>

                        {exercise.youtubeVideoId ? (
                          <div className="mt-auto pt-4 relative z-10">
                            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg border border-emerald-100/50 bg-black">
                              <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${exercise.youtubeVideoId}`}
                                title={exercise.name}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            </div>
                            <div className="mt-3 flex justify-end">
                              <a 
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + ' instructional exercise')}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center transition-colors"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" /> Alternative Videos
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-auto pt-6 relative z-10">
                            <a 
                              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + ' instructional exercise')}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-center w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                            >
                              <Play className="w-4 h-4 mr-2" /> Watch Instructional Video
                            </a>
                            <p className="text-[10px] text-center text-gray-400 mt-2 font-medium uppercase tracking-widest">Opens in YouTube</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lab Value Guide (Contextual) */}
              <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm p-8">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                  <h3 className="text-sm font-extrabold text-[#0f1f38] uppercase tracking-widest flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-slate-600" /> Contextual Lab Value Guide
                  </h3>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Tailored to your report</span>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { id: 'HDL', name: 'HDL', def: 'High-Density Lipoprotein. Known as “good cholesterol,” it helps carry excess cholesterol away from arteries.' },
                    { id: 'LDL', name: 'LDL', def: 'Low-Density Lipoprotein. Known as “bad cholesterol,” higher amounts can increase risk for heart and artery disease.' },
                    { id: 'TRIG', name: 'Triglycerides', def: 'A common blood fat. High levels may raise cardiovascular risk and are often linked to diet and metabolic health.' },
                    { id: 'FBS', name: 'FBS', def: 'Fasting Blood Sugar. Measures blood glucose after not eating, used to check diabetes risk.' },
                    { id: 'HBA1C', name: 'HBA1C', def: 'Hemoglobin A1c. Shows average blood sugar level over the past 2–3 months.' },
                    { id: 'CHOL', name: 'Cholesterol', def: 'Total cholesterol refers to all cholesterol types in your blood, including HDL and LDL.' },
                    { id: 'RBC', name: 'RBC', def: 'Red Blood Cell. Carries oxygen from lungs to tissues and supports energy and organ function.' },
                    { id: 'WBC', name: 'WBC', def: 'White Blood Cell. Part of your immune system; helps fight infections and inflammation.' },
                    { id: 'HB', name: 'Hemoglobin', def: 'A protein in red blood cells that carries oxygen. Important for energy and overall health.' },
                    { id: 'T3', name: 'T3', def: 'Triiodothyronine. A thyroid hormone that plays a vital role in the body\'s metabolic rate and heart functions.' },
                    { id: 'T4', name: 'T4', def: 'Thyroxine. The main hormone secreted into the bloodstream by the thyroid gland. It plays a vital role in digestion, heart and muscle function, and brain development.' },
                    { id: 'TSH', name: 'TSH', def: 'Thyroid Stimulating Hormone. A pituitary hormone that stimulates the thyroid gland to produce thyroxine.' }
                  ].filter(guide => {
                    // Show if biomarker exists in results or if it's one of the basic ones
                    const exists = labResults.some(lr => lr.test_name?.toUpperCase().includes(guide.id) || lr.test_name?.toUpperCase().includes(guide.name.toUpperCase()));
                    return exists;
                  }).map((guide, idx) => {
                    const isFlagged = labResults.some(lr => (lr.test_name?.toUpperCase().includes(guide.id) || lr.test_name?.toUpperCase().includes(guide.name.toUpperCase())) && (lr.status || riskAssessment[lr.test_name]?.status || '').toLowerCase() !== 'normal');
                    return (
                      <div key={idx} className={`rounded-2xl border p-5 transition-all ${isFlagged ? 'bg-rose-50 border-rose-200 ring-2 ring-rose-100 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <p className={`text-xs font-black uppercase tracking-widest ${isFlagged ? 'text-rose-600' : 'text-slate-500'}`}>{guide.name}</p>
                          {isFlagged && <span className="text-[8px] font-black text-rose-500 bg-white px-2 py-0.5 rounded border border-rose-100 uppercase">Attention</span>}
                        </div>
                        <p className={`text-sm leading-relaxed ${isFlagged ? 'text-rose-900 font-bold' : 'text-slate-700 font-medium'}`}>{guide.def}</p>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-6 text-xs text-slate-500 leading-relaxed italic">The guide above has been dynamically filtered to show only information relevant to your current clinical results.</p>
              </div>


              {/* Disclaimer */}
              <div className="mt-16 text-center pb-8 border-t border-gray-200 pt-8">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
                  Confidential Document. Artificially generated via Medical AI Processor. For informational utility only. Do not interpret as formal medical diagnosis. Verify all findings with a licensed healthcare provider.
                </p>
              </div>

            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
