import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Shield, TrendingUp, FileText, ArrowRight,
  Sparkles, CheckCircle, Lock,
  Microscope, PlayCircle,
  Crown, Hexagon, Database, LifeBuoy
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const { scrollYProgress } = useScroll()
  const yImage = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])

  const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#0f1f38] selection:bg-blue-600/20 overflow-x-hidden font-sans">
      
      {/* ────────── 1. Sticky Clinical Navbar ────────── */}
      <nav className="fixed w-full top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-gray-100 py-4 transition-all">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-500">
              <Hexagon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0f1f38] font-['Outfit']">
              Plumb <span className="text-blue-600">Health</span>
            </span>
          </div>
          
          <div className="hidden lg:flex items-center space-x-12 text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] font-['Outfit']">
            {['Platform', 'Intelligence', 'Security', 'Enterprise'].map((item) => (
              <span key={item} className="cursor-pointer hover:text-blue-600 transition-colors py-2 relative group">
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigate('/login')}
              className="text-[11px] font-bold text-gray-600 hover:text-blue-600 transition-colors uppercase tracking-[0.2em] font-['Outfit']"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-3 text-[10px] font-bold text-white transition-all duration-300 bg-blue-600 rounded-full shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:bg-blue-700 hover:shadow-[0_12px_25px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 uppercase tracking-[0.2em] font-['Outfit']"
            >
              Initialize Profile
            </button>
          </div>
        </div>
      </nav>

      {/* ────────── 2. Clinical Hero Section ────────── */}
      <section className="relative pt-48 pb-32 bg-[#fafbfc] overflow-hidden min-h-screen flex items-center">
        {/* Clean Abstract Medical Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-blue-50 rounded-full blur-[100px] mix-blend-multiply opacity-70"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[80px] mix-blend-multiply opacity-60"></div>
          
          {/* Subtle Grid Pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMzcsIDk5LCAyMzUsIDAuMDgpIi8+PC9zdmc+')] opacity-50"></div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10 w-full mb-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-5xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center space-x-3 px-5 py-2 bg-blue-50 border border-blue-100 rounded-full mb-10 shadow-sm">
              <Sparkles className="h-3 w-3 text-blue-600" />
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-[0.3em] font-['Outfit']">Clinical Intelligence. Redefined.</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-6xl md:text-[90px] lg:text-[110px] font-light text-[#0f1f38] mb-8 leading-[0.9] tracking-tighter font-['Outfit']"
            >
              Master your <br />
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">metabolic future.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg md:text-2xl text-gray-500 mb-16 leading-relaxed max-w-3xl mx-auto font-light tracking-tight"
            >
              Upload any complex blood test or pathology report. Our enterprise-grade AI instantly translates medical jargon into profound, actionable intelligence.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-6 justify-center mb-32"
            >
              <button
                onClick={() => navigate('/signup')}
                className="group inline-flex items-center justify-center px-10 py-5 text-[11px] font-bold text-white transition-all duration-300 bg-blue-600 rounded-full shadow-[0_15px_30px_rgba(37,99,235,0.2)] hover:bg-blue-700 hover:shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:-translate-y-1 uppercase tracking-[0.2em] font-['Outfit']"
              >
                Commence Analysis 
                <ArrowRight className="ml-4 h-4 w-4 group-hover:translate-x-2 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/upload')}
                className="inline-flex items-center justify-center px-10 py-5 text-[11px] font-bold text-gray-700 transition-all duration-300 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-blue-200 shadow-sm uppercase tracking-[0.2em] font-['Outfit']"
              >
                <FileText className="mr-3 h-4 w-4 text-blue-600" />
                Secure Upload
              </button>
            </motion.div>
            
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-16 lg:gap-32 pt-12 border-t border-gray-200/60">
              <div className="flex flex-col items-center">
                <span className="text-5xl font-light text-[#0f1f38] tracking-tighter font-['Outfit']">99.9<span className="text-blue-600 text-3xl">%</span></span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-3 font-['Outfit']">Extraction Fidelity</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-light text-[#0f1f38] tracking-tighter font-['Outfit']">1,200<span className="text-blue-600 text-3xl">+</span></span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-3 font-['Outfit']">Biomarkers Mapped</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-light text-[#0f1f38] tracking-tighter font-['Outfit']">0.8<span className="text-blue-600 text-3xl">s</span></span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-3 font-['Outfit']">Inference Latency</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ────────── 3. High-End Clean Bento Box Features ────────── */}
      <section className="bg-white py-32 relative border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="mb-24">
            <h3 className="text-blue-600 font-bold tracking-[0.4em] uppercase text-[10px] mb-6 font-['Outfit'] flex items-center">
              <span className="w-8 h-[2px] bg-blue-600 mr-4"></span> Diagnostic Vanguard
            </h3>
            <h2 className="text-4xl md:text-[60px] font-light text-[#0f1f38] leading-[1] tracking-tighter font-['Outfit']">
              Precision Intelligence.<br/>Zero Compromise.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[350px]">
            {/* Large Bento Item */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 rounded-[32px] p-10 bg-gray-50/50 border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:bg-white hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.1)] hover:border-blue-100 transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-blue-100/50 transition-colors duration-1000"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-8 border border-gray-100 shadow-sm text-blue-600 group-hover:scale-110 transition-transform duration-500">
                  <Microscope className="h-6 w-6" />
                </div>
                <h4 className="text-3xl font-light text-[#0f1f38] mb-4 tracking-tight font-['Outfit']">Deep Biomarker Mining</h4>
                <p className="text-gray-500 text-lg leading-relaxed max-w-md font-light">Granular extraction and contextual analysis of complex metabolic traces across Lipid, Renal, Liver, and Endocrine panels.</p>
              </div>
            </motion.div>

            {/* Small Bento Item */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, delay: 0.1 }}
              className="rounded-[32px] p-10 bg-gradient-to-b from-blue-50 to-white border border-blue-100 flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] transition-all duration-500"
            >
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center mb-8 shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-2xl font-light text-[#0f1f38] mb-4 tracking-tight font-['Outfit']">Vault Privacy</h4>
                <p className="text-gray-600 text-sm leading-relaxed font-light">Military-grade, HIPAA-isolated infrastructure. End-to-end encryption by default.</p>
              </div>
            </motion.div>

            {/* Small Bento Item */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, delay: 0.2 }}
              className="rounded-[32px] p-10 bg-gray-50/50 border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:bg-white hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.1)] hover:border-blue-100 transition-all duration-500"
            >
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-8 border border-gray-100 shadow-sm text-blue-600 group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h4 className="text-2xl font-light text-[#0f1f38] mb-4 tracking-tight font-['Outfit']">Trajectory Analysis</h4>
                <p className="text-gray-500 text-sm leading-relaxed font-light">Visual tracking of biomarker shifts over time with automated, predictive threshold alerts.</p>
              </div>
            </motion.div>

             {/* Large Bento Item */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, delay: 0.3 }}
              className="md:col-span-2 rounded-[32px] p-10 bg-gray-50/50 border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:bg-white hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.1)] hover:border-blue-100 transition-all duration-500"
            >
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-8 border border-gray-100 shadow-sm text-blue-600 group-hover:scale-110 transition-transform duration-500">
                  <PlayCircle className="h-6 w-6" />
                </div>
                <h4 className="text-3xl font-light text-[#0f1f38] mb-4 tracking-tight font-['Outfit']">Prescriptive Media</h4>
                <p className="text-gray-500 text-lg leading-relaxed max-w-md font-light">Generative guidance on lifestyle modifications, paired with high-quality, verified instructional video embeds tailored specifically to your clinical data.</p>
              </div>
              <div className="absolute bottom-0 right-10 translate-y-1/3 opacity-40 group-hover:opacity-100 group-hover:-translate-y-10 transition-all duration-700">
                {/* Replaced dark abstract with clean bright medical image */}
                <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80" alt="Medical Visual" className="w-64 h-64 object-cover rounded-2xl shadow-2xl border border-white" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ────────── 4. Workflow (Minimalist Light) ────────── */}
      <section className="bg-[#fafbfc] py-32 border-t border-gray-100">
         <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="mb-24 flex flex-col items-center justify-center text-center">
            <h3 className="text-blue-600 font-bold tracking-[0.4em] uppercase text-[10px] mb-6 flex items-center font-['Outfit']">
               Workflow
            </h3>
            <h2 className="text-4xl md:text-[60px] font-light text-[#0f1f38] tracking-tighter leading-[1] font-['Outfit']">Elegantly Simple.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative max-w-5xl mx-auto">
            <div className="hidden md:block absolute top-[40px] left-[20%] right-[20%] h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent -z-10"></div>
            
            {[
              { num: "01", title: "Ingest", desc: "Securely upload your PDF or image-based pathology report to the encrypted vault." },
              { num: "02", title: "Process", desc: "Our neural engines extract, normalize, and cross-reference every data point in milliseconds." },
              { num: "03", title: "Illuminate", desc: "Access a stunning, interactive dashboard detailing your clinical health trajectory." }
            ].map((step, i) => (
              <motion.div whileHover={{ y: -5 }} key={i} className="flex flex-col items-center text-center group cursor-default">
                <div className="w-20 h-20 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-8 transition-all duration-500 group-hover:border-blue-400 group-hover:shadow-[0_10px_30px_rgba(37,99,235,0.15)] shadow-sm">
                  <span className="text-xl font-light text-gray-300 group-hover:text-blue-600 transition-colors font-['Outfit']">{step.num}</span>
                </div>
                <h4 className="text-2xl font-light text-[#0f1f38] mb-4 tracking-tight font-['Outfit']">{step.title}</h4>
                <p className="text-gray-500 font-light leading-relaxed max-w-xs">{step.desc}</p>
              </motion.div>
            ))}
          </div>
         </div>
      </section>

      {/* ────────── 5. Luxury Healthtech Pricing Table ────────── */}
      <section className="bg-white py-32 relative border-t border-gray-100 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-24">
             <h3 className="text-blue-600 font-bold tracking-[0.4em] uppercase text-[10px] mb-6 font-['Outfit']">Membership</h3>
             <h2 className="text-4xl md:text-[60px] font-light text-[#0f1f38] tracking-tighter leading-none font-['Outfit']">Strategic Access.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Standard Tier */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-gray-50 border border-gray-200 rounded-[32px] p-12 flex flex-col transition-all duration-500 shadow-sm hover:shadow-md"
            >
              <h3 className="text-2xl font-light text-[#0f1f38] mb-2 tracking-tight font-['Outfit']">Base</h3>
              <p className="text-gray-500 font-light mb-12 text-sm">Essential health tracking for digital record storage.</p>
              <div className="text-5xl font-light text-[#0f1f38] mb-12 tracking-tighter font-['Outfit']">Free</div>
              <ul className="space-y-6 mb-16 text-left w-full flex-grow">
                {['Basic OCR extraction', 'Core risk indicators', '30-day historical archive'].map(li => (
                  <li key={li} className="flex items-center text-gray-600 font-light text-sm">
                    <CheckCircle className="h-4 w-4 text-gray-300 mr-4 flex-shrink-0" /> {li}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/signup')} className="w-full py-5 rounded-full bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 transition-colors uppercase tracking-[0.2em] text-[10px] font-['Outfit'] shadow-sm">
                Initialize Base
              </button>
            </motion.div>

            {/* Premium Tier */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-gradient-to-b from-[#1e3a8a] to-[#0f1f38] border border-blue-900 rounded-[32px] p-12 flex flex-col relative overflow-hidden transition-all duration-500 shadow-[0_30px_60px_-15px_rgba(30,58,138,0.5)]"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -mr-20 -mt-20"></div>
              <div className="absolute top-10 right-10">
                 <Crown className="h-6 w-6 text-blue-300 opacity-80" />
              </div>
              
              <h3 className="text-2xl font-light text-white mb-2 tracking-tight font-['Outfit']">Plumb PRO</h3>
              <p className="text-blue-200 font-light mb-12 text-sm">Clinical-grade summaries and priority intelligence.</p>
              <div className="flex items-end mb-12 tracking-tighter font-['Outfit']">
                <span className="text-6xl font-light text-white leading-[0.8]">$19</span>
                <span className="text-lg font-light text-blue-300 ml-2 mb-1">/mo</span>
              </div>
              <ul className="space-y-6 mb-16 text-left w-full flex-grow relative z-10">
                {['Unlimited longitudinal tracking', 'Deep clinical delta summaries', 'Priority AI processing queue', 'Lifetime secure cloud vault'].map(li => (
                  <li key={li} className="flex items-center text-white/90 font-light text-sm">
                    <CheckCircle className="h-4 w-4 text-blue-400 mr-4 flex-shrink-0" /> {li}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/pro')} className="w-full py-5 rounded-full bg-white text-[#1e3a8a] font-bold hover:bg-gray-100 transition-colors uppercase tracking-[0.2em] text-[10px] font-['Outfit'] shadow-[0_10px_25px_rgba(255,255,255,0.2)] hover:shadow-[0_15px_30px_rgba(255,255,255,0.3)] hover:-translate-y-0.5">
                Upgrade to PRO
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ────────── 6. Ultra-Premium Crisp Footer ────────── */}
      <footer className="bg-white pt-32 pb-16 border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-12 gap-y-20 mb-32">
            
            <div className="col-span-2 lg:col-span-6 pr-10">
               <div className="flex items-center space-x-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Hexagon className="h-4 w-4 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-[#0f1f38] font-['Outfit']">Plumb <span className="text-blue-600">Health</span></span>
              </div>
              <p className="text-gray-500 text-sm font-light leading-relaxed mb-12 max-w-sm">
                Redefining clinical analysis through high-fidelity artificial intelligence. Designed with precision, built for scale.
              </p>
              <div className="flex space-x-4">
                 {[1, 2, 3].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all cursor-pointer">
                      <LifeBuoy className="h-4 w-4" />
                    </div>
                 ))}
              </div>
            </div>
            
            <div className="col-span-1 lg:col-span-3">
              <h4 className="text-[#0f1f38] font-bold mb-8 uppercase tracking-[0.2em] text-[9px] font-['Outfit']">Platform</h4>
              <ul className="space-y-4 text-[11px] text-gray-500 font-light tracking-wide">
                <li className="hover:text-blue-600 transition-colors cursor-pointer">Extraction Engine</li>
                <li className="hover:text-blue-600 transition-colors cursor-pointer">Risk Matrices</li>
                <li className="hover:text-blue-600 transition-colors cursor-pointer">API Documentation</li>
              </ul>
            </div>
            
            <div className="col-span-1 lg:col-span-3">
              <h4 className="text-[#0f1f38] font-bold mb-8 uppercase tracking-[0.2em] text-[9px] font-['Outfit']">Compliance</h4>
              <ul className="space-y-4 text-[11px] text-gray-500 font-light tracking-wide">
                <li className="hover:text-blue-600 transition-colors cursor-pointer flex items-center space-x-3"><Shield className="h-3 w-3 text-gray-400" /> <span>HIPAA Protocol</span></li>
                <li className="hover:text-blue-600 transition-colors cursor-pointer flex items-center space-x-3"><Lock className="h-3 w-3 text-gray-400" /> <span>E2E Encryption</span></li>
                <li className="hover:text-blue-600 transition-colors cursor-pointer flex items-center space-x-3"><Database className="h-3 w-3 text-gray-400" /> <span>Data Sovereignty</span></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em] font-['Outfit']">
              © {new Date().getFullYear()} Plumb Health Enterprise. All rights reserved.
            </div>
            <div className="flex space-x-10 text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] font-['Outfit']">
               <span className="hover:text-blue-600 transition-colors cursor-pointer">Terms</span>
               <span className="hover:text-blue-600 transition-colors cursor-pointer">Privacy</span>
               <span className="hover:text-blue-600 transition-colors cursor-pointer">Ethics</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}