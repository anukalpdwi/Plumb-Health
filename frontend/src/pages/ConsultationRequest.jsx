import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity, ArrowLeft, Crown, Star, Send, CheckCircle,
  Clock, MessageSquare, AlertTriangle, FileText
} from 'lucide-react'
import { authAPI } from '../api/authAPI'

export default function ConsultationRequest() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [reports, setReports] = useState([])
  const [consultations, setConsultations] = useState([])
  const [formData, setFormData] = useState({
    message: '',
    symptoms: '',
    reportId: '',
    priority: 'medium'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      navigate('/')
      return
    }
    const parsed = JSON.parse(storedUser)
    setUser(parsed)

    if (parsed.membershipType !== 'pro') {
      navigate('/pro')
      return
    }

    fetchData()
  }, [navigate])

  const fetchData = async () => {
    try {
      const [reportsRes, consultsRes, profileRes] = await Promise.all([
        authAPI.getReports(),
        authAPI.getConsultations(),
        authAPI.getProfile()
      ])
      setReports(reportsRes.data.reports || [])
      setConsultations(consultsRes.data.consultations || [])
      // Update user from profile to get latest consultationsAvailable
      const updatedUser = profileRes.data.user
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.message.trim()) {
      setError('Please describe your concern.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await authAPI.requestConsultation(formData)
      if (res.data.success) {
        setSubmitSuccess(true)
        // Refresh data
        await fetchData()
      }
    } catch (err) {
      console.error('Consultation error:', err)
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status) => {
    const map = {
      pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      in_review: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      cancelled: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    }
    return map[status] || map.pending
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-[#fafbfc]">
      <Activity className="h-8 w-8 text-blue-600 animate-spin" />
    </div>
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#0f1f38] font-sans">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0f1f38] font-['Outfit'] tracking-tight">
              Plumb <span className="text-blue-600">Health</span>
            </span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors font-bold uppercase tracking-widest font-['Outfit']"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-4 mb-10">
          <div className="p-3 bg-blue-50 rounded-[16px] shadow-sm border border-blue-100">
            <Star className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#0f1f38] font-['Outfit'] tracking-tight">Doctor Consultation</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">PRO Feature — Get professional medical guidance directly from specialists.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* ───── Request Form ───── */}
          <div className="lg:col-span-3">
            {submitSuccess ? (
              <div className="bg-white clinical-shadow border border-gray-100 rounded-[32px] p-10 text-center">
                <div className="w-20 h-20 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-[#0f1f38] mb-3 font-['Outfit']">Request Submitted!</h2>
                <p className="text-gray-500 text-sm mb-8 font-medium">
                  Your consultation request has been sent. A clinical specialist will review your case and respond shortly.
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold uppercase tracking-widest px-8 py-3.5 rounded-full transition-all shadow-[0_8px_20px_rgba(37,99,235,0.2)] font-['Outfit']"
                >
                  Back to Dashboard
                </button>
              </div>
            ) : (
              <div className="bg-white clinical-shadow border border-gray-100 rounded-[32px] p-8 md:p-10">
                <h2 className="text-xl font-bold text-[#0f1f38] mb-2 font-['Outfit']">New Consultation Request</h2>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-8 font-['Outfit']">
                  {user.consultationsAvailable > 0
                    ? `You have ${user.consultationsAvailable} free consultation(s) remaining.`
                    : 'You have no consultations remaining.'
                  }
                </p>

                {user.consultationsAvailable <= 0 ? (
                  <div className="bg-orange-50 border border-orange-100 rounded-[24px] p-8 text-center">
                    <AlertTriangle className="h-10 w-10 text-orange-500 mx-auto mb-4" />
                    <p className="text-sm text-[#0f1f38] font-bold font-['Outfit']">You have used your free consultation.</p>
                    <p className="text-xs font-medium text-gray-500 mt-2">Additional consultations coming soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 text-sm font-bold text-red-600 font-['Outfit']">
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 font-['Outfit']">
                        Describe Your Concern *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Describe your health concern or question for the doctor..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-5 py-4 text-sm text-[#0f1f38] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 font-['Outfit']">
                        Symptoms (Optional)
                      </label>
                      <input
                        type="text"
                        name="symptoms"
                        value={formData.symptoms}
                        onChange={handleChange}
                        placeholder="e.g., fatigue, headache, chest pain..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-5 py-3.5 text-sm text-[#0f1f38] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 font-['Outfit']">
                          Link Report (Optional)
                        </label>
                        <select
                          name="reportId"
                          value={formData.reportId}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-5 py-3.5 text-sm text-[#0f1f38] focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium cursor-pointer"
                        >
                          <option value="">None</option>
                          {reports.map(r => (
                            <option key={r._id} value={r._id}>
                              {r.fileName} ({new Date(r.createdAt).toLocaleDateString()})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 font-['Outfit']">
                          Priority
                        </label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-5 py-3.5 text-sm text-[#0f1f38] focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium cursor-pointer"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] uppercase tracking-widest transition-all duration-300 shadow-[0_8px_20px_rgba(37,99,235,0.2)] disabled:opacity-50 flex items-center justify-center mt-2 font-['Outfit']"
                    >
                      {isSubmitting ? (
                        <Activity className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {isSubmitting ? 'Submitting...' : 'Submit Consultation Request'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* ───── Past Consultations ───── */}
          <div className="lg:col-span-2">
            <div className="bg-white clinical-shadow border border-gray-100 rounded-[32px] p-8 h-full">
              <h3 className="text-lg font-bold text-[#0f1f38] mb-6 flex items-center font-['Outfit']">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-600" /> Past Consultations
              </h3>

              {consultations.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-[24px] border border-gray-100">
                  <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">No consultations yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {consultations.map((c) => (
                    <div key={c._id} className="bg-gray-50 border border-gray-100 rounded-[20px] p-4 hover:border-blue-200 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${getStatusBadge(c.status)}`}>
                          {c.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest font-['Outfit']">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[#0f1f38] line-clamp-2 leading-relaxed">{c.message}</p>
                      {c.report && (
                        <div className="flex items-center mt-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest font-['Outfit']">
                          <FileText className="h-3.5 w-3.5 mr-1.5 text-blue-500" /> {c.report.fileName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
