import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Shield, TrendingUp, FileText, ArrowRight,
  Sparkles, CheckCircle, Lock,
  Microscope, PlayCircle,
  Crown, Hexagon, Database, LifeBuoy,
  Activity, Zap, Brain
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
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
      <nav className="fixed w-full top-0 z-[100] bg-white/70 backdrop-blur-2xl border-b border-gray-100/50 py-5 transition-all">
        <div className="max-w-[1440px] mx-auto px-8 lg:px-16 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-500">
              <Hexagon className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#0f1f38] font-['Outfit']">
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

          <div className="flex items-center space-x-8">
            <button
              onClick={() => navigate('/login')}
              className="text-[12px] font-bold text-gray-500 hover:text-blue-600 transition-colors uppercase tracking-[0.2em] font-['Outfit']"
            >
              Access Portal
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-3.5 text-[11px] font-bold text-white transition-all duration-300 bg-blue-600 rounded-full shadow-[0_10px_25px_rgba(37,99,235,0.2)] hover:bg-blue-700 hover:shadow-[0_15px_30px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 uppercase tracking-[0.2em] font-['Outfit']"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ────────── 2. Cinematic Hero Section ────────── */}
      <section className="relative pt-48 pb-20 bg-[#fafbfc] overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-blue-50/50 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-50/40 rounded-full blur-[100px]"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        </div>

        <div className="max-w-[1440px] mx-auto px-8 lg:px-16 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-3xl"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center space-x-3 px-5 py-2.5 bg-blue-50/80 backdrop-blur-md border border-blue-100 rounded-full mb-8 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-[0.3em] font-['Outfit']">Clinical Intelligence. Reimagined.</span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-6xl md:text-8xl font-light text-[#0f1f38] mb-8 leading-[1] tracking-tighter font-['Outfit']"
              >
                Decipher your <br />
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">biology.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-xl md:text-2xl text-gray-500 mb-12 leading-relaxed max-w-xl font-light tracking-tight"
              >
                Plumb Health transforms complex medical reports into profound, actionable intelligence. Experience the future of precision medicine today.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row gap-6 mb-16"
              >
                <button
                  onClick={() => navigate('/signup')}
                  className="group inline-flex items-center justify-center px-10 py-5 text-[12px] font-bold text-white transition-all duration-300 bg-blue-600 rounded-full shadow-[0_20px_40px_rgba(37,99,235,0.2)] hover:bg-blue-700 hover:shadow-[0_25px_50px_rgba(37,99,235,0.3)] hover:-translate-y-1 uppercase tracking-[0.2em] font-['Outfit']"
                >
                  Start Analysis 
                  <ArrowRight className="ml-4 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/upload')}
                  className="inline-flex items-center justify-center px-10 py-5 text-[12px] font-bold text-gray-700 transition-all duration-300 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-blue-200 shadow-sm uppercase tracking-[0.2em] font-['Outfit']"
                >
                  <FileText className="mr-3 h-4 w-4 text-blue-600" />
                  Secure Upload
                </button>
              </motion.div>
              
              <motion.div variants={fadeUp} className="flex items-center space-x-12 opacity-60">
                <div className="flex flex-col">
                  <span className="text-3xl font-light text-[#0f1f38] font-['Outfit'] tracking-tighter">99.9%</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Accuracy</span>
                </div>
                <div className="w-[1px] h-8 bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-light text-[#0f1f38] font-['Outfit'] tracking-tighter">1.2k+</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Biomarkers</span>
                </div>
                <div className="w-[1px] h-8 bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-light text-[#0f1f38] font-['Outfit'] tracking-tighter">SECURE</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">HIPAA Vault</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-blue-600/10 rounded-[40px] blur-3xl -z-10 translate-x-10 translate-y-10"></div>
              <img 
                src="/images/hero-dashboard.png" 
                alt="Plumb Health Dashboard" 
                className="w-full rounded-[40px] shadow-2xl border border-white/50 object-cover aspect-[4/3] clinical-shadow"
              />
              <div className="absolute -bottom-8 -left-8 bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-100 max-w-[240px] animate-float">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                    <p className="text-sm font-bold text-gray-900">Optimized</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-green-500"></div>
                  </div>
                  <p className="text-[10px] text-gray-500">Metabolic stability at 85%</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ────────── 3. The Intelligence Engine (Bento) ────────── */}
      <section className="bg-white py-32 relative border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
          <div className="mb-24">
            <h3 className="text-blue-600 font-bold tracking-[0.4em] uppercase text-[11px] mb-6 font-['Outfit'] flex items-center">
              <span className="w-12 h-[1px] bg-blue-600 mr-4"></span> The Core Engine
            </h3>
            <h2 className="text-5xl md:text-7xl font-light text-[#0f1f38] leading-[1.1] tracking-tighter font-['Outfit'] max-w-4xl">
              Precision Intelligence. <br/>
              <span className="text-gray-400">Master your health trajectory.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[400px]">
            {/* AI Analysis Image Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 rounded-[40px] p-12 bg-[#f8fafc] border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl transition-all duration-700"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-600/5 z-0"></div>
              <div className="relative z-10 max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-10 border border-gray-100 shadow-sm text-blue-600 group-hover:scale-110 transition-transform duration-500">
                  <Brain className="h-8 w-8" />
                </div>
                <h4 className="text-4xl font-light text-[#0f1f38] mb-6 tracking-tight font-['Outfit']">Cognitive Extraction</h4>
                <p className="text-gray-500 text-xl leading-relaxed font-light">Our neural engines parse complex pathology reports with clinical-grade fidelity, mapping over 1,200 unique biomarkers.</p>
              </div>
              <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none translate-y-8 group-hover:translate-y-0 transform">
                 <img src="/images/ai-analysis.png" alt="AI Analysis" className="w-full h-full object-cover rounded-tl-[60px]" />
              </div>
            </motion.div>

            {/* Privacy Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, delay: 0.1 }}
              className="rounded-[40px] p-12 bg-gradient-to-br from-[#1e3a8a] to-[#0f1f38] border border-blue-900 flex flex-col justify-between relative overflow-hidden group shadow-xl"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mb-10 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-3xl font-light text-white mb-6 tracking-tight font-['Outfit']">Digital Sanctity</h4>
                <p className="text-blue-100/70 text-lg leading-relaxed font-light">Military-grade, HIPAA-isolated infrastructure. Your clinical data remains your own—always encrypted, always private.</p>
              </div>
            </motion.div>

            {/* Monitoring Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, delay: 0.2 }}
              className="rounded-[40px] p-12 bg-white border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:border-blue-200 clinical-shadow transition-all duration-500"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <h4 className="text-3xl font-light text-[#0f1f38] mb-6 tracking-tight font-['Outfit']">Longitudinal Insights</h4>
                <p className="text-gray-500 text-lg leading-relaxed font-light">Visualize the unseen. Track your metabolic shifts over months and years to anticipate risks before they manifest.</p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
            </motion.div>

            {/* Health Monitoring Image Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, delay: 0.3 }}
              className="md:col-span-2 rounded-[40px] p-12 bg-white border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl transition-all duration-700"
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center h-full">
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-10 text-indigo-600 group-hover:scale-110 transition-transform duration-500">
                    <Zap className="h-8 w-8" />
                  </div>
                  <h4 className="text-4xl font-light text-[#0f1f38] mb-6 tracking-tight font-['Outfit']">Metabolic Future</h4>
                  <p className="text-gray-500 text-xl leading-relaxed font-light">Proactive health management through generative clinical guidance. Not just data—wisdom.</p>
                </div>
                <div className="relative h-full min-h-[300px]">
                   <img src="/images/health-monitoring.png" alt="Health Monitoring" className="w-full h-full object-cover rounded-3xl" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ────────── 4. Strategic Access (Pricing) ────────── */}
      <section className="bg-[#fafbfc] py-32 border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
          <div className="text-center mb-24">
            <h3 className="text-blue-600 font-bold tracking-[0.4em] uppercase text-[11px] mb-6 font-['Outfit']">Membership</h3>
            <h2 className="text-5xl md:text-7xl font-light text-[#0f1f38] tracking-tighter font-['Outfit']">Strategic Intelligence.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Standard Tier */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white border border-gray-200 rounded-[40px] p-16 flex flex-col transition-all duration-500 shadow-sm hover:shadow-xl"
            >
              <h3 className="text-3xl font-light text-[#0f1f38] mb-4 tracking-tight font-['Outfit']">Base</h3>
              <p className="text-gray-400 font-light mb-12 text-lg">Essential tracking for conscious health management.</p>
              <div className="text-6xl font-light text-[#0f1f38] mb-12 tracking-tighter font-['Outfit']">Free</div>
              <ul className="space-y-6 mb-16 flex-grow">
                {['Basic Extraction Protocol', 'Core Risk Indicators', '30-Day History'].map(li => (
                  <li key={li} className="flex items-center text-gray-600 font-light text-lg">
                    <CheckCircle className="h-5 w-5 text-gray-200 mr-4" /> {li}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/signup')} className="w-full py-6 rounded-full bg-gray-50 text-gray-600 font-bold hover:bg-gray-100 transition-all uppercase tracking-[0.2em] text-[12px] font-['Outfit']">
                Initialize Portal
              </button>
            </motion.div>

            {/* Premium Tier */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-blue-600 to-indigo-800 border border-blue-900 rounded-[40px] p-16 flex flex-col relative overflow-hidden transition-all duration-500 shadow-2xl"
            >
              <div className="absolute top-12 right-12">
                 <Crown className="h-8 w-8 text-white/30" />
              </div>
              <h3 className="text-3xl font-light text-white mb-4 tracking-tight font-['Outfit']">Plumb PRO</h3>
              <p className="text-blue-100/60 font-light mb-12 text-lg">The definitive platform for clinical bio-tracking.</p>
              <div className="flex items-end mb-12 tracking-tighter font-['Outfit'] text-white">
                <span className="text-7xl font-light">$19</span>
                <span className="text-xl font-light opacity-60 ml-2 mb-2">/mo</span>
              </div>
              <ul className="space-y-6 mb-16 flex-grow relative z-10">
                {['Unlimited Bio-Trajectory Mapping', 'Deep Generative Summaries', 'Priority Neural Processing', 'Priority Consultation Access'].map(li => (
                  <li key={li} className="flex items-center text-white/90 font-light text-lg">
                    <CheckCircle className="h-5 w-5 text-blue-400 mr-4" /> {li}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/pro')} className="w-full py-6 rounded-full bg-white text-blue-700 font-bold hover:bg-blue-50 transition-all uppercase tracking-[0.2em] text-[12px] font-['Outfit'] shadow-xl">
                Upgrade to PRO
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ────────── 5. Luxury Footer ────────── */}
      <footer className="bg-white pt-40 pb-20 border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
          <div className="grid lg:grid-cols-12 gap-20 mb-32">
            <div className="lg:col-span-6">
               <div className="flex items-center space-x-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Hexagon className="h-5 w-5 text-white" />
                </div>
                <span className="text-3xl font-bold tracking-tight text-[#0f1f38] font-['Outfit']">Plumb <span className="text-blue-600">Health</span></span>
              </div>
              <p className="text-gray-400 text-lg font-light leading-relaxed mb-12 max-w-md">
                Pioneering the intersection of clinical fidelity and artificial intelligence. Built with precision, designed for longevity.
              </p>
              <div className="flex space-x-5">
                 {[1, 2, 3].map(i => (
                    <div key={i} className="w-14 h-14 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer">
                      <LifeBuoy className="h-5 w-5" />
                    </div>
                 ))}
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <h4 className="text-[#0f1f38] font-bold mb-10 uppercase tracking-[0.3em] text-[11px] font-['Outfit']">Architecture</h4>
              <ul className="space-y-6 text-[14px] text-gray-400 font-light">
                <li className="hover:text-blue-600 transition-colors cursor-pointer">Neural Engine</li>
                <li className="hover:text-blue-600 transition-colors cursor-pointer">Biomarker Ontology</li>
                <li className="hover:text-blue-600 transition-colors cursor-pointer">Clinical Documentation</li>
              </ul>
            </div>
            
            <div className="lg:col-span-3">
              <h4 className="text-[#0f1f38] font-bold mb-10 uppercase tracking-[0.3em] text-[11px] font-['Outfit']">Governance</h4>
              <ul className="space-y-6 text-[14px] text-gray-400 font-light">
                <li className="hover:text-blue-600 transition-colors cursor-pointer flex items-center space-x-3"><Shield className="h-4 w-4" /> <span>HIPAA Compliance</span></li>
                <li className="hover:text-blue-600 transition-colors cursor-pointer flex items-center space-x-3"><Lock className="h-4 w-4" /> <span>Privacy Protocol</span></li>
                <li className="hover:text-blue-600 transition-colors cursor-pointer flex items-center space-x-3"><Database className="h-4 w-4" /> <span>Data Ethics</span></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.4em] font-['Outfit']">
              © {new Date().getFullYear()} Plumb Health Enterprise.
            </div>
            <div className="flex space-x-12 text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em] font-['Outfit']">
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