import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  Shield, TrendingUp, FileText, ArrowRight,
  Sparkles, CheckCircle, Lock,
  Microscope, PlayCircle,
  Crown, Hexagon, Database, LifeBuoy,
  Activity, Zap, Brain, Menu, X,
  ChevronDown, Clock, Users, Target, MessageSquare
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const { scrollYProgress } = useScroll()
  const yImage = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#0f1f38] selection:bg-blue-600/20 overflow-x-hidden font-sans">
      
      {/* ────────── 1. Premium Navbar ────────── */}
      <nav className="fixed w-full top-0 z-[100] bg-white/70 backdrop-blur-2xl border-b border-gray-100/50 py-4 lg:py-5 transition-all">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-500">
              <Hexagon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <span className="text-xl lg:text-2xl font-bold tracking-tight text-[#0f1f38] font-['Outfit']">
              Plumb <span className="text-blue-600">Health</span>
            </span>
          </div>
          
          <div className="hidden lg:flex items-center space-x-12 text-[12px] font-bold text-gray-400 uppercase tracking-[0.25em] font-['Outfit']">
            {['Intelligence', 'Precision', 'Security', 'Enterprise'].map((item) => (
              <span key={item} className="cursor-pointer hover:text-blue-600 transition-colors py-2 relative group">
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-4 lg:space-x-8">
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:block text-[12px] font-bold text-gray-500 hover:text-blue-600 transition-colors uppercase tracking-[0.2em] font-['Outfit']"
            >
              Access Portal
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-6 lg:px-8 py-2.5 lg:py-3.5 text-[10px] lg:text-[11px] font-bold text-white transition-all duration-300 bg-blue-600 rounded-full shadow-[0_10px_25px_rgba(37,99,235,0.2)] hover:bg-blue-700 hover:shadow-[0_15px_30px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 uppercase tracking-[0.2em] font-['Outfit']"
            >
              Get Started
            </button>
            <button 
              className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-b border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-8 space-y-6">
                {['Intelligence', 'Precision', 'Security', 'Enterprise'].map((item) => (
                  <div key={item} className="text-[14px] font-bold text-gray-400 uppercase tracking-[0.2em] font-['Outfit'] hover:text-blue-600 cursor-pointer">
                    {item}
                  </div>
                ))}
                <div className="pt-6 border-t border-gray-50 flex flex-col space-y-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-4 text-[12px] font-bold text-gray-500 uppercase tracking-[0.2em] font-['Outfit'] border border-gray-100 rounded-xl"
                  >
                    Access Portal
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ────────── 2. Cinematic Hero Section ────────── */}
      <section className="relative pt-48 pb-20 bg-[#fafbfc] overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-blue-50/50 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-50/40 rounded-full blur-[100px]"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-3xl text-center lg:text-left"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center space-x-3 px-4 lg:px-5 py-2 lg:py-2.5 bg-blue-50/80 backdrop-blur-md border border-blue-100 rounded-full mb-6 lg:mb-8 shadow-sm">
                <Sparkles className="h-3 w-3 lg:h-3.5 lg:w-3.5 text-blue-600" />
                <span className="text-[9px] lg:text-[11px] font-bold text-blue-700 uppercase tracking-[0.3em] font-['Outfit']">Clinical Intelligence. Reimagined.</span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-5xl md:text-7xl lg:text-8xl font-light text-[#0f1f38] mb-6 lg:mb-8 leading-[1.1] lg:leading-[1] tracking-tighter font-['Outfit']"
              >
                Decipher your <br />
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">biology.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-lg lg:text-2xl text-gray-500 mb-10 lg:mb-12 leading-relaxed max-w-xl mx-auto lg:mx-0 font-light tracking-tight"
              >
                Plumb Health transforms complex medical reports into profound, actionable intelligence. Experience the future of precision medicine today.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 lg:gap-6 mb-12 lg:mb-16"
              >
                <button
                  onClick={() => navigate('/signup')}
                  className="group inline-flex items-center justify-center px-8 lg:px-10 py-4 lg:py-5 text-[11px] lg:text-[12px] font-bold text-white transition-all duration-300 bg-blue-600 rounded-full shadow-[0_20px_40px_rgba(37,99,235,0.2)] hover:bg-blue-700 hover:shadow-[0_25px_50px_rgba(37,99,235,0.3)] hover:-translate-y-1 uppercase tracking-[0.2em] font-['Outfit']"
                >
                  Start Analysis 
                  <ArrowRight className="ml-3 lg:ml-4 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/upload')}
                  className="inline-flex items-center justify-center px-8 lg:px-10 py-4 lg:py-5 text-[11px] lg:text-[12px] font-bold text-gray-700 transition-all duration-300 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-blue-200 shadow-sm uppercase tracking-[0.2em] font-['Outfit']"
                >
                  <FileText className="mr-2 lg:mr-3 h-4 w-4 text-blue-600" />
                  Secure Upload
                </button>
              </motion.div>
              
              <motion.div variants={fadeUp} className="flex flex-wrap justify-center lg:justify-start items-center gap-8 lg:gap-12 opacity-60">
                <div className="flex flex-col">
                  <span className="text-2xl lg:text-3xl font-light text-[#0f1f38] font-['Outfit'] tracking-tighter">99.9%</span>
                  <span className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Accuracy</span>
                </div>
                <div className="hidden sm:block w-[1px] h-8 bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="text-2xl lg:text-3xl font-light text-[#0f1f38] font-['Outfit'] tracking-tighter">1.2k+</span>
                  <span className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Biomarkers</span>
                </div>
                <div className="hidden sm:block w-[1px] h-8 bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="text-2xl lg:text-3xl font-light text-[#0f1f38] font-['Outfit'] tracking-tighter">SECURE</span>
                  <span className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">HIPAA Vault</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="absolute inset-0 bg-blue-600/10 rounded-[30px] lg:rounded-[40px] blur-3xl -z-10 translate-x-6 lg:translate-x-10 translate-y-6 lg:translate-y-10"></div>
              <img 
                src="/images/hero-dashboard.png" 
                alt="Plumb Health Dashboard" 
                className="w-full rounded-[30px] lg:rounded-[40px] shadow-2xl border border-white/50 object-cover aspect-[4/3] clinical-shadow"
              />
              <div className="absolute -bottom-6 lg:-bottom-8 -left-4 lg:-left-8 bg-white/90 backdrop-blur-xl p-5 lg:p-8 rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 max-w-[180px] lg:max-w-[240px] animate-float">
                <div className="flex items-center space-x-3 lg:space-x-4 mb-3 lg:mb-4">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Activity className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[8px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                    <p className="text-xs lg:text-sm font-bold text-gray-900">Optimized</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-1 lg:h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-green-500"></div>
                  </div>
                  <p className="text-[9px] lg:text-[10px] text-gray-500">Metabolic stability at 85%</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ────────── 3. The Intelligence Engine (Bento) ────────── */}
      <section className="bg-white py-32 relative border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
          <div className="mb-16 lg:mb-24 text-center lg:text-left">
            <h3 className="text-blue-600 font-bold tracking-[0.4em] uppercase text-[9px] lg:text-[11px] mb-4 lg:mb-6 font-['Outfit'] flex items-center justify-center lg:justify-start">
              <span className="hidden lg:block w-12 h-[1px] bg-blue-600 mr-4"></span> The Core Engine
            </h3>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-[#0f1f38] leading-[1.2] lg:leading-[1.1] tracking-tighter font-['Outfit'] max-w-4xl">
              Precision Intelligence. <br/>
              <span className="text-gray-400">Master your health trajectory.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 auto-rows-[auto] md:auto-rows-[400px]">
            {/* AI Analysis Image Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 rounded-[30px] lg:rounded-[40px] p-8 lg:p-12 bg-[#f8fafc] border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl transition-all duration-700"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-600/5 z-0"></div>
              <div className="relative z-10 max-w-md">
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-white flex items-center justify-center mb-6 lg:mb-10 border border-gray-100 shadow-sm text-blue-600 group-hover:scale-110 transition-transform duration-500">
                  <Brain className="h-6 w-6 lg:h-8 lg:w-8" />
                </div>
                <h4 className="text-2xl lg:text-4xl font-light text-[#0f1f38] mb-4 lg:mb-6 tracking-tight font-['Outfit']">Cognitive Extraction</h4>
                <p className="text-gray-500 text-base lg:text-xl leading-relaxed font-light">Our neural engines parse complex pathology reports with clinical-grade fidelity, mapping over 1,200 unique biomarkers.</p>
              </div>
              <div className="mt-8 lg:mt-0 relative lg:absolute right-0 bottom-0 lg:w-1/2 h-[200px] lg:h-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-700 pointer-events-none lg:translate-y-8 lg:group-hover:translate-y-0 transform">
                 <img src="/images/ai-analysis.png" alt="AI Analysis" className="w-full h-full object-cover rounded-2xl lg:rounded-tl-[60px]" />
              </div>
            </motion.div>

            {/* Privacy Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, delay: 0.1 }}
              className="rounded-[30px] lg:rounded-[40px] p-8 lg:p-12 bg-gradient-to-br from-[#1e3a8a] to-[#0f1f38] border border-blue-900 flex flex-col justify-between relative overflow-hidden group shadow-xl"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-blue-600 flex items-center justify-center mb-6 lg:mb-10 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                  <Shield className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <h4 className="text-2xl lg:text-3xl font-light text-white mb-4 lg:mb-6 tracking-tight font-['Outfit']">Digital Sanctity</h4>
                <p className="text-blue-100/70 text-base lg:text-lg leading-relaxed font-light">Military-grade, HIPAA-isolated infrastructure. Your clinical data remains your own—always encrypted, always private.</p>
              </div>
            </motion.div>

            {/* Monitoring Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, delay: 0.2 }}
              className="rounded-[30px] lg:rounded-[40px] p-8 lg:p-12 bg-white border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:border-blue-200 clinical-shadow transition-all duration-500 min-h-[300px] lg:min-h-0"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 lg:mb-10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8" />
                </div>
                <h4 className="text-2xl lg:text-3xl font-light text-[#0f1f38] mb-4 lg:mb-6 tracking-tight font-['Outfit']">Longitudinal Insights</h4>
                <p className="text-gray-500 text-base lg:text-lg leading-relaxed font-light">Visualize the unseen. Track your metabolic shifts over months and years to anticipate risks before they manifest.</p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
            </motion.div>

            {/* Health Monitoring Image Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, delay: 0.3 }}
              className="md:col-span-2 rounded-[30px] lg:rounded-[40px] p-8 lg:p-12 bg-white border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl transition-all duration-700"
            >
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center h-full">
                <div className="relative z-10">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 lg:mb-10 text-indigo-600 group-hover:scale-110 transition-transform duration-500">
                    <Zap className="h-6 w-6 lg:h-8 lg:w-8" />
                  </div>
                  <h4 className="text-2xl lg:text-4xl font-light text-[#0f1f38] mb-4 lg:mb-6 tracking-tight font-['Outfit']">Metabolic Future</h4>
                  <p className="text-gray-500 text-base lg:text-xl leading-relaxed font-light">Proactive health management through generative clinical guidance. Not just data—wisdom.</p>
                </div>
                <div className="relative h-full min-h-[250px] lg:min-h-[300px]">
                   <img src="/images/health-monitoring.png" alt="Health Monitoring" className="w-full h-full object-cover rounded-2xl lg:rounded-3xl shadow-lg" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ────────── 4. How It Works (Visual Guide) ────────── */}
      <section className="bg-white py-32 relative border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
          <div className="text-center mb-24">
            <h3 className="text-blue-600 font-bold tracking-[0.4em] uppercase text-[9px] lg:text-[11px] mb-4 lg:mb-6 font-['Outfit']">The Protocol</h3>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-[#0f1f38] tracking-tighter font-['Outfit']">Intelligence in 3 Steps.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {[
              { 
                icon: <FileText className="h-8 w-8" />, 
                title: "Secure Upload", 
                desc: "Upload your clinical reports to our HIPAA-isolated environment. Data is immediately encrypted at rest." 
              },
              { 
                icon: <Brain className="h-8 w-8" />, 
                title: "Neural Extraction", 
                desc: "Our medical-grade AI parses thousands of biomarkers, identifying patterns invisible to the human eye." 
              },
              { 
                icon: <Target className="h-8 w-8" />, 
                title: "Strategic Insights", 
                desc: "Receive a comprehensive, actionable health trajectory mapping with precise recommendations." 
              }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2">
                  {step.icon}
                </div>
                <h4 className="text-2xl font-bold text-[#0f1f38] mb-4 font-['Outfit']">{step.title}</h4>
                <p className="text-gray-500 font-light leading-relaxed max-w-[280px]">{step.desc}</p>
                {i < 2 && (
                  <div className="hidden lg:block absolute top-10 -right-8 w-16 h-[1px] bg-gray-100"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── 5. Professional Network (Consultation) ────────── */}
      <section className="bg-[#fafbfc] py-32 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-blue-600/5 rounded-[40px] blur-3xl -z-10 translate-x-10 translate-y-10"></div>
              <img 
                src="/images/consultation.png" 
                alt="Professional Consultation" 
                className="w-full rounded-[40px] shadow-2xl border border-white/50 object-cover aspect-[4/3] clinical-shadow"
              />
              <div className="absolute top-10 -right-10 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-gray-100 hidden md:block animate-float">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available</p>
                    <p className="text-sm font-bold text-gray-900">Expert Clinicians</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div>
              <h3 className="text-blue-600 font-bold tracking-[0.4em] uppercase text-[9px] lg:text-[11px] mb-6 font-['Outfit']">Human Intelligence</h3>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-[#0f1f38] leading-[1.1] tracking-tighter font-['Outfit'] mb-8">
                Beyond Algorithms. <br/>
                <span className="text-gray-400">Clinical Expertise.</span>
              </h2>
              <p className="text-xl text-gray-500 font-light leading-relaxed mb-12 max-w-xl">
                Plumb PRO members gain priority access to our network of elite clinicians. Translate your AI-driven insights into a personalized, medically-supervised longevity strategy.
              </p>
              <ul className="space-y-6 mb-12">
                {[
                  { icon: <Clock className="h-5 w-5" />, text: "Priority Consultation Scheduling" },
                  { icon: <Shield className="h-5 w-5" />, text: "Medically Verified Recommendations" },
                  { icon: <MessageSquare className="h-5 w-5" />, text: "Direct Specialist Communication" }
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-4 text-[#0f1f38] font-medium">
                    <div className="text-blue-600 bg-blue-50 p-2 rounded-lg">{item.icon}</div>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/pro')}
                className="group inline-flex items-center px-10 py-5 text-[12px] font-bold text-white bg-[#0f1f38] rounded-full hover:bg-blue-600 transition-all duration-300 uppercase tracking-[0.2em] font-['Outfit'] shadow-xl"
              >
                Learn About Consultations
                <ArrowRight className="ml-4 h-4 w-4 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── 6. FAQ Section (Sleek Accordion) ────────── */}
      <section className="bg-white py-32 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 lg:px-16">
          <div className="text-center mb-20">
            <h3 className="text-blue-600 font-bold tracking-[0.4em] uppercase text-[9px] lg:text-[11px] mb-6 font-['Outfit']">Insights</h3>
            <h2 className="text-4xl md:text-5xl font-light text-[#0f1f38] tracking-tighter font-['Outfit']">Clarifying the Future.</h2>
          </div>

          <div className="space-y-4">
            {[
              { 
                q: "How accurate is the AI analysis?", 
                a: "Our clinical neural engine maintains a 99.9% accuracy rate across standardized pathology reports, mapping over 1,200 unique biomarkers with medical-grade precision." 
              },
              { 
                q: "Is my medical data secure?", 
                a: "Absolutely. All data is processed within HIPAA-isolated environments and encrypted using military-grade AES-256 protocols. We never share your data with third parties." 
              },
              { 
                q: "Can I use this for diagnostic purposes?", 
                a: "Plumb Health provides advanced health trajectory mapping and insights. While highly precise, it is designed to augment—not replace—professional medical diagnosis." 
              },
              { 
                q: "What types of reports can I upload?", 
                a: "We support a wide range of reports including blood work, metabolic panels, lipid profiles, and more. Most PDF and high-quality image formats are supported." 
              }
            ].map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-3xl overflow-hidden bg-[#f8fafc]/50 transition-all">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-8 py-8 flex items-center justify-between text-left hover:bg-blue-50/50 transition-colors"
                >
                  <span className="text-lg font-bold text-[#0f1f38] font-['Outfit'] pr-8">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-500 ${openFaq === i ? 'rotate-180 text-blue-600' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-8 text-gray-500 font-light leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── 7. Strategic Access (Pricing) ────────── */}
      <section className="bg-[#fafbfc] py-32 border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
          <div className="text-center mb-16 lg:mb-24">
            <h3 className="text-blue-600 font-bold tracking-[0.4em] uppercase text-[9px] lg:text-[11px] mb-4 lg:mb-6 font-['Outfit']">Membership</h3>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-[#0f1f38] tracking-tighter font-['Outfit']">Strategic Intelligence.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 max-w-5xl mx-auto">
            {/* Standard Tier */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white border border-gray-200 rounded-[30px] lg:rounded-[40px] p-8 lg:p-16 flex flex-col transition-all duration-500 shadow-sm hover:shadow-xl"
            >
              <h3 className="text-2xl lg:text-3xl font-light text-[#0f1f38] mb-3 lg:mb-4 tracking-tight font-['Outfit']">Base</h3>
              <p className="text-gray-400 font-light mb-8 lg:mb-12 text-base lg:text-lg">Essential tracking for conscious health management.</p>
              <div className="text-5xl lg:text-6xl font-light text-[#0f1f38] mb-8 lg:mb-12 tracking-tighter font-['Outfit']">Free</div>
              <ul className="space-y-4 lg:space-y-6 mb-10 lg:mb-16 flex-grow">
                {['Basic Extraction Protocol', 'Core Risk Indicators', '30-Day History'].map(li => (
                  <li key={li} className="flex items-center text-gray-600 font-light text-base lg:text-lg">
                    <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-gray-200 mr-3 lg:mr-4" /> {li}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/signup')} className="w-full py-4 lg:py-6 rounded-full bg-gray-50 text-gray-600 font-bold hover:bg-gray-100 transition-all uppercase tracking-[0.2em] text-[10px] lg:text-[12px] font-['Outfit']">
                Initialize Portal
              </button>
            </motion.div>

            {/* Premium Tier */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-blue-600 to-indigo-800 border border-blue-900 rounded-[30px] lg:rounded-[40px] p-8 lg:p-16 flex flex-col relative overflow-hidden transition-all duration-500 shadow-2xl"
            >
              <div className="absolute top-8 lg:top-12 right-8 lg:right-12">
                 <Crown className="h-6 w-6 lg:h-8 lg:w-8 text-white/30" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-light text-white mb-3 lg:mb-4 tracking-tight font-['Outfit']">Plumb PRO</h3>
              <p className="text-blue-100/60 font-light mb-8 lg:mb-12 text-base lg:text-lg">The definitive platform for clinical bio-tracking.</p>
              <div className="flex items-end mb-8 lg:mb-12 tracking-tighter font-['Outfit'] text-white">
                <span className="text-5xl lg:text-7xl font-light">$19</span>
                <span className="text-lg lg:text-xl font-light opacity-60 ml-2 mb-1 lg:mb-2">/mo</span>
              </div>
              <ul className="space-y-4 lg:space-y-6 mb-10 lg:mb-16 flex-grow relative z-10">
                {['Unlimited Bio-Trajectory Mapping', 'Deep Generative Summaries', 'Priority Neural Processing', 'Priority Consultation Access'].map(li => (
                  <li key={li} className="flex items-center text-white/90 font-light text-base lg:text-lg">
                    <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-blue-400 mr-3 lg:mr-4" /> {li}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/pro')} className="w-full py-4 lg:py-6 rounded-full bg-white text-blue-700 font-bold hover:bg-blue-50 transition-all uppercase tracking-[0.2em] text-[10px] lg:text-[12px] font-['Outfit'] shadow-xl">
                Upgrade to PRO
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ────────── 8. High-Impact CTA ────────── */}
      <section className="bg-white py-32">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[60px] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] -mr-40 -mt-40"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-900/20 rounded-full blur-[80px] -ml-20 -mb-20"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <Sparkles className="h-12 w-12 text-blue-300 mx-auto mb-10 animate-pulse" />
              <h2 className="text-5xl md:text-7xl font-light mb-10 leading-tight tracking-tighter font-['Outfit']">
                Ready to master <br/>
                <span className="font-bold">your longevity?</span>
              </h2>
              <p className="text-xl md:text-2xl text-blue-100/70 font-light mb-16 leading-relaxed">
                Join thousands of health-conscious individuals using Plumb Health to decipher their biological destiny.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <button 
                  onClick={() => navigate('/signup')}
                  className="px-12 py-6 bg-white text-blue-700 font-bold rounded-full hover:bg-blue-50 transition-all uppercase tracking-[0.2em] text-[12px] font-['Outfit'] shadow-xl"
                >
                  Get Started Now
                </button>
                <button 
                  onClick={() => navigate('/pro')}
                  className="px-12 py-6 bg-blue-700/30 backdrop-blur-md border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-all uppercase tracking-[0.2em] text-[12px] font-['Outfit']"
                >
                  Explore PRO Features
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ────────── 9. Luxury Footer ────────── */}
      <footer className="bg-white pt-40 pb-20 border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-20 mb-20 lg:mb-32">
            <div className="lg:col-span-6">
               <div className="flex items-center space-x-3 mb-6 lg:mb-10">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Hexagon className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl lg:text-3xl font-bold tracking-tight text-[#0f1f38] font-['Outfit']">Plumb <span className="text-blue-600">Health</span></span>
              </div>
              <p className="text-gray-400 text-base lg:text-lg font-light leading-relaxed mb-8 lg:mb-12 max-w-md">
                Pioneering the intersection of clinical fidelity and artificial intelligence. Built with precision, designed for longevity.
              </p>
              <div className="flex space-x-4 lg:space-x-5">
                 {[1, 2, 3].map(i => (
                    <div key={i} className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer">
                      <LifeBuoy className="h-5 w-5" />
                    </div>
                 ))}
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <h4 className="text-[#0f1f38] font-bold mb-6 lg:mb-10 uppercase tracking-[0.3em] text-[10px] lg:text-[11px] font-['Outfit']">Architecture</h4>
              <ul className="space-y-4 lg:space-y-6 text-[13px] lg:text-[14px] text-gray-400 font-light">
                <li className="hover:text-blue-600 transition-colors cursor-pointer">Neural Engine</li>
                <li className="hover:text-blue-600 transition-colors cursor-pointer">Biomarker Ontology</li>
                <li className="hover:text-blue-600 transition-colors cursor-pointer">Clinical Documentation</li>
              </ul>
            </div>
            
            <div className="lg:col-span-3">
              <h4 className="text-[#0f1f38] font-bold mb-6 lg:mb-10 uppercase tracking-[0.3em] text-[10px] lg:text-[11px] font-['Outfit']">Governance</h4>
              <ul className="space-y-4 lg:space-y-6 text-[13px] lg:text-[14px] text-gray-400 font-light">
                <li className="hover:text-blue-600 transition-colors cursor-pointer flex items-center space-x-3"><Shield className="h-4 w-4" /> <span>HIPAA Compliance</span></li>
                <li className="hover:text-blue-600 transition-colors cursor-pointer flex items-center space-x-3"><Lock className="h-4 w-4" /> <span>Privacy Protocol</span></li>
                <li className="hover:text-blue-600 transition-colors cursor-pointer flex items-center space-x-3"><Database className="h-4 w-4" /> <span>Data Ethics</span></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 lg:pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 lg:gap-8 text-center md:text-left">
            <div className="text-[9px] lg:text-[11px] text-gray-400 font-bold uppercase tracking-[0.4em] font-['Outfit']">
              © {new Date().getFullYear()} Plumb Health Enterprise.
            </div>
            <div className="flex flex-wrap justify-center gap-6 lg:gap-12 text-[9px] lg:text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em] font-['Outfit']">
               <span className="hover:text-blue-600 transition-colors cursor-pointer">Terms of Service</span>
               <span className="hover:text-blue-600 transition-colors cursor-pointer">Privacy Policy</span>
               <span className="hover:text-blue-600 transition-colors cursor-pointer">Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}