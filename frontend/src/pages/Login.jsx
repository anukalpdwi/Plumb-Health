import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, Loader2, Lock, ShieldCheck, Hexagon } from 'lucide-react'
import { authAPI } from '../api/authAPI'

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.email || !formData.password) {
        setError('Please fill in all diagnostic fields')
        setLoading(false)
        return
      }

      const response = await authAPI.login({
        email: formData.email,
        password: formData.password
      })

      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError(err.response?.data?.message || 'Authentication failed. Internal clinical record mismatch.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-6 lg:px-8 bg-[#fafbfc] font-sans selection:bg-blue-600/20 relative overflow-hidden">
      
      {/* Clinical Light Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-50 rounded-full blur-[120px] mix-blend-multiply opacity-60"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[100px] mix-blend-multiply opacity-50"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMzcsIDk5LCAyMzUsIDAuMDQpIi8+PC9zdmc+')] opacity-60"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-8">
           <Link to="/" className="group flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
                <Hexagon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#0f1f38] font-['Outfit']">Plumb <span className="text-blue-600">Health</span></span>
           </Link>
        </div>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#0f1f38] tracking-tight font-['Outfit']">
            Secure Portal
          </h2>
          <p className="mt-3 text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px] font-['Outfit']">
            Enterprise Clinical Access Required
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white/90 backdrop-blur-xl py-12 px-8 clinical-shadow rounded-[32px] border border-white relative overflow-hidden group">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 -mr-16 -mt-16 rounded-full transition-transform duration-700 group-hover:scale-150"></div>
          
          {error && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-8 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start relative z-10"
            >
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-xs font-medium text-red-700 leading-relaxed">{error}</p>
            </motion.div>
          )}
          
          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1 font-['Outfit']">
                Clinical Identifier (Email)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
                placeholder="name@clinical.edu"
                className="block w-full bg-gray-50/50 border border-gray-200 rounded-xl px-5 py-3.5 text-[#0f1f38] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] font-['Outfit']">
                  Security Access Key
                </label>
                <Link to="#" className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-[0.1em] font-['Outfit']">Recovery</Link>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="block w-full bg-gray-50/50 border border-gray-200 rounded-xl px-5 py-3.5 text-[#0f1f38] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-mono tracking-[0.3em] text-sm"
                disabled={loading}
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_12px_25px_rgba(37,99,235,0.3)] transition-shadow"
              >
                <div className="absolute inset-0 bg-blue-600 group-hover:bg-blue-700 transition-colors duration-300"></div>
                <div className="relative flex justify-center items-center py-4 px-6 font-bold text-white uppercase tracking-[0.2em] text-[11px] font-['Outfit']">
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-3" />
                      Decrypting...
                    </>
                  ) : (
                    'Authenticate Access'
                  )}
                </div>
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center relative z-10">
            <span className="text-gray-500 text-[10px] font-medium uppercase tracking-widest font-['Outfit']">No existing protocol? </span>
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-bold text-[10px] uppercase tracking-widest border-b border-blue-200 hover:border-blue-400 pb-0.5 ml-2 transition-colors font-['Outfit']">
              Initiate Enrollment
            </Link>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-10 space-y-4"
        >
          <div className="flex items-center justify-center space-x-6">
             <div className="flex items-center space-x-2 opacity-60">
                <Lock className="h-3 w-3 text-gray-500" />
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.25em] font-['Outfit']">256-Bit SSL</span>
             </div>
             <div className="flex items-center space-x-2 opacity-60">
               <ShieldCheck className="h-3.5 w-3.5 text-gray-500" />
               <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.25em] font-['Outfit']">HIPAA Secure</span>
             </div>
          </div>
          <p className="text-[9px] font-medium text-gray-400 uppercase tracking-[0.2em] max-w-[280px] mx-auto leading-relaxed font-['Outfit']">
            Authorized Personnel Only. Unauthorized access is monitored.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
