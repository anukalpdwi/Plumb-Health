import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown, Check, Shield, Star, CreditCard, Lock, Activity, ArrowLeft, Sparkles, Zap, Heart } from 'lucide-react'
import { authAPI } from '../api/authAPI'

export default function ProMembership() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [step, setStep] = useState('plan') // plan | checkout | processing | success
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: ''
  })

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      navigate('/')
      return
    }
    const parsed = JSON.parse(storedUser)
    if (parsed.membershipType === 'pro') {
      navigate('/dashboard')
      return
    }
    setUser(parsed)
  }, [navigate])

  const handleInputChange = (e) => {
    let { name, value } = e.target

    if (name === 'number') {
      value = value.replace(/\D/g, '').slice(0, 16)
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ')
    }
    if (name === 'expiry') {
      value = value.replace(/\D/g, '').slice(0, 4)
      if (value.length >= 3) value = value.slice(0, 2) + '/' + value.slice(2)
    }
    if (name === 'cvc') {
      value = value.replace(/\D/g, '').slice(0, 3)
    }

    setCardData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckout = async (e) => {
    e.preventDefault()
    setStep('processing')

    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 2500))

    try {
      const res = await authAPI.upgradeToPro()
      if (res.data.success) {
        // Update local storage with new membership
        const updatedUser = res.data.user
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        setStep('success')
      }
    } catch (err) {
      console.error('Upgrade error:', err)
      setStep('checkout')
    }
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
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
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
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* ───── Plan Selection ───── */}
        {step === 'plan' && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-blue-50 text-blue-700 text-[10px] font-bold px-4 py-1.5 rounded-full mb-6 border border-blue-100 uppercase tracking-widest font-['Outfit']">
              <Crown className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> UPGRADE TO PRO
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#0f1f38] font-['Outfit'] tracking-tight">
              Unlock{' '}
              <span className="text-blue-600">
                Premium Clinical Intelligence
              </span>
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto font-medium">
              Get a free doctor consultation, priority analysis, and advanced health insights.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mt-14 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 text-left clinical-shadow relative opacity-90 scale-95 origin-right">
                <h3 className="text-xl font-bold text-gray-500 mb-1 font-['Outfit']">Free</h3>
                <p className="text-4xl font-bold text-[#0f1f38] mb-6 font-['Outfit'] tracking-tighter">₹0<span className="text-sm font-medium text-gray-400 ml-1">/forever</span></p>
                <ul className="space-y-4 mb-8">
                  {[
                    'Upload health reports',
                    'AI-powered analysis',
                    'Lab value interpretation',
                    'Basic risk assessment',
                    'Limited report history',
                  ].map((f, i) => (
                    <li key={i} className="flex items-center text-sm font-medium text-gray-600">
                      <div className="p-1 rounded-full bg-green-50 mr-3">
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-4 rounded-full border border-gray-200 text-gray-500 font-bold text-[11px] uppercase tracking-widest cursor-default font-['Outfit']">
                  Current Plan
                </button>
              </div>

              {/* PRO Plan */}
              <div className="relative bg-blue-600 border border-blue-500 rounded-[32px] p-8 md:p-10 text-left shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] z-10 text-white overflow-hidden group">
                <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-blue-500 rounded-full blur-[80px] mix-blend-screen opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-900 text-blue-200 text-[10px] font-bold px-5 py-1.5 rounded-full uppercase tracking-widest border border-blue-800 shadow-xl font-['Outfit']">
                  MOST POPULAR
                </div>
                <h3 className="text-xl font-bold text-blue-200 mb-1 flex items-center font-['Outfit'] relative z-10">
                  <Crown className="h-5 w-5 mr-2" /> PRO
                </h3>
                <p className="text-5xl font-bold text-white mb-6 font-['Outfit'] tracking-tighter relative z-10">₹499<span className="text-sm font-medium text-blue-200 ml-1">/one-time</span></p>
                <ul className="space-y-4 mb-8 relative z-10">
                  {[
                    { text: 'Everything in Free', icon: Check },
                    { text: '1 Free Doctor Consultation', icon: Heart },
                    { text: 'Priority AI Analysis', icon: Zap },
                    { text: 'Unlimited Report History', icon: Sparkles },
                    { text: 'Downloadable PDF Reports', icon: Shield },
                    { text: 'Advanced Trend Analysis', icon: Star },
                  ].map((f, i) => (
                    <li key={i} className="flex items-center text-sm font-medium text-blue-50">
                      <div className="p-1 rounded-full bg-blue-500/30 mr-3 border border-blue-400/30">
                        <f.icon className="h-3.5 w-3.5 text-blue-200" />
                      </div>
                      {f.text}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full py-4 rounded-full bg-white text-blue-700 font-bold text-[11px] uppercase tracking-widest transition-all duration-300 shadow-[0_8px_20px_rgba(255,255,255,0.2)] hover:shadow-[0_12px_25px_rgba(255,255,255,0.3)] transform hover:-translate-y-0.5 relative z-10 font-['Outfit']"
                >
                  Upgrade Now — ₹499
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ───── Checkout Form ───── */}
        {step === 'checkout' && (
          <div className="max-w-md mx-auto">
            <button
              onClick={() => setStep('plan')}
              className="flex items-center text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-blue-600 transition-colors mb-6 font-['Outfit']"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to plans
            </button>

            <div className="bg-white clinical-shadow border border-gray-100 rounded-[32px] p-8 md:p-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#0f1f38] font-['Outfit']">Checkout</h2>
                <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1.5 rounded-md border border-green-100">
                  <Lock className="h-3 w-3 mr-1" /> Secure
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8 flex items-center justify-between shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-xl mr-3 text-blue-600">
                    <Crown className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0f1f38] font-['Outfit']">PRO Membership</p>
                    <p className="text-xs font-medium text-blue-600">One-time payment</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-700 tracking-tight font-['Outfit']">₹499</p>
              </div>

              <form onSubmit={handleCheckout} className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 font-['Outfit']">Card Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="number"
                      value={cardData.number}
                      onChange={handleInputChange}
                      placeholder="4242 4242 4242 4242"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm text-[#0f1f38] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-mono tracking-widest font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 font-['Outfit']">Cardholder Name</label>
                  <input
                    type="text"
                    name="name"
                    value={cardData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-sm text-[#0f1f38] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 font-['Outfit']">Expiry</label>
                    <input
                      type="text"
                      name="expiry"
                      value={cardData.expiry}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-sm text-[#0f1f38] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-mono tracking-widest font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 font-['Outfit']">CVC</label>
                    <input
                      type="text"
                      name="cvc"
                      value={cardData.cvc}
                      onChange={handleInputChange}
                      placeholder="123"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-sm text-[#0f1f38] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-mono tracking-widest font-bold"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] uppercase tracking-widest transition-all duration-300 shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_12px_25px_rgba(37,99,235,0.3)] transform hover:-translate-y-0.5 mt-6 font-['Outfit']"
                >
                  Pay ₹499 Securely
                </button>

                <p className="text-[10px] text-gray-400 text-center mt-4 font-medium uppercase tracking-widest font-['Outfit']">
                  Simulated checkout. No real payment processed.
                </p>
              </form>
            </div>
          </div>
        )}

        {/* ───── Processing ───── */}
        {step === 'processing' && (
          <div className="max-w-md mx-auto text-center py-20 bg-white clinical-shadow rounded-[32px] border border-gray-100 p-10">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-8 animate-pulse shadow-inner border border-blue-100">
              <CreditCard className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-[#0f1f38] mb-3 font-['Outfit']">Processing Payment...</h2>
            <p className="text-gray-500 font-medium">Please wait while we securely verify your access token.</p>
            <div className="mt-8 w-64 mx-auto h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-blue-600 rounded-full animate-[loading_2s_ease-in-out_infinite]" style={{
                animation: 'loading 2s ease-in-out infinite',
              }} />
            </div>
            <style>{`
              @keyframes loading {
                0% { width: 0% }
                50% { width: 80% }
                100% { width: 100% }
              }
            `}</style>
          </div>
        )}

        {/* ───── Success ───── */}
        {step === 'success' && (
          <div className="max-w-md mx-auto text-center py-16 bg-white clinical-shadow rounded-[32px] border border-gray-100 p-10">
            <div className="w-24 h-24 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-8 shadow-sm">
              <Check className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-[#0f1f38] mb-4 font-['Outfit'] tracking-tight">Welcome to PRO! 🎉</h2>
            <p className="text-gray-500 mb-10 font-medium">
              You now have access to all premium clinical features including 1 free doctor consultation.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-4 rounded-full border border-gray-200 text-[#0f1f38] font-bold text-[11px] uppercase tracking-widest hover:bg-gray-50 transition-all font-['Outfit']"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/consultation')}
                className="w-full py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] uppercase tracking-widest transition-all duration-300 shadow-[0_8px_20px_rgba(37,99,235,0.2)] font-['Outfit']"
              >
                <Heart className="h-4 w-4 inline mr-2" /> Request Doctor Consultation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
