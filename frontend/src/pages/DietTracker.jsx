import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Upload, Utensils, Activity, TrendingUp, Clock, 
  ChevronRight, ArrowLeft, Brain, Sparkles, AlertCircle, 
  CheckCircle2, Plus, Info, Trash2, PieChart as PieIcon,
  ChevronDown, ChevronUp, Save
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../api/authAPI';

export default function DietTracker() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mealType, setMealType] = useState('Breakfast');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchLogs();
    fetchSummary();
  }, [navigate]);

  const fetchLogs = async () => {
    try {
      const res = await authAPI.getDietLogs();
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await authAPI.getDietSummary();
      setSummary(res.data.summary || {});
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('image', image);
    formData.append('mealType', mealType);

    try {
      const res = await authAPI.analyzeDietPhoto(formData);
      if (res.data.success) {
        setAnalysisResult(res.data.data);
        fetchLogs();
        fetchSummary();
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.response?.data?.message || 'Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetForm = () => {
    setImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setError(null);
  };

  const today = new Date().toISOString().split('T')[0];
  const todaySummary = summary?.[today] || { calories: 0, protein: 0, carbs: 0, fat: 0, meals: [] };
  const dailyTarget = { calories: 2000, protein: 120, carbs: 250, fat: 70 }; // Should be from user profile eventually

  const getProgress = (current, target) => Math.min(Math.round((current / target) * 100), 100);

  const chartData = summary ? Object.entries(summary).map(([date, data]) => ({
    date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    calories: data.calories,
    protein: data.protein,
    carbs: data.carbs,
    fat: data.fat
  })).reverse() : [];

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#0f1f38] font-sans pb-20">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3 border-l border-gray-100 pl-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Utensils className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-[#0f1f38] font-['Outfit'] tracking-tight">
                Food <span className="text-blue-600">Analyzer</span>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
             <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-[#0f1f38] leading-tight font-['Outfit']">{user?.name}</span>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.15em] font-['Outfit']">Clinical Nutrition Panel</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20 px-4 max-w-[1200px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 mt-6">
          
          {/* LEFT COLUMN: Upload & Result */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Upload Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] clinical-shadow border border-gray-100 overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <h2 className="font-bold text-xl flex items-center gap-3 text-[#0f1f38] font-['Outfit'] tracking-tight">
                  <Camera className="h-6 w-6 text-blue-600" /> 
                  Analyze Your Meal
                </h2>
                {imagePreview && !analysisResult && !isAnalyzing && (
                  <button onClick={resetForm} className="text-[10px] text-red-500 font-bold uppercase tracking-widest hover:underline font-['Outfit']">
                    Clear
                  </button>
                )}
              </div>

              <div className="p-8">
                {!imagePreview ? (
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-gray-100 rounded-[24px] py-20 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                  >
                    <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                      <Plus className="h-10 w-10 text-blue-600" />
                    </div>
                    <p className="font-bold text-[#0f1f38] text-lg font-['Outfit']">Tap to upload a meal photo</p>
                    <p className="text-sm text-gray-400 mt-2 font-medium">AI will detect nutrients and calories instantly</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageChange}
                    />
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="relative rounded-[24px] overflow-hidden aspect-video bg-gray-50 border border-gray-100 shadow-inner">
                      <img src={imagePreview} alt="Meal preview" className="w-full h-full object-cover" />
                      {isAnalyzing && (
                        <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-md flex flex-col items-center justify-center text-white p-8 text-center">
                          <motion.div 
                            animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-20 h-20 rounded-full border-4 border-blue-400/30 flex items-center justify-center mb-6 bg-blue-600/20 backdrop-blur-xl shadow-2xl shadow-blue-500/50"
                          >
                            <Brain className="h-10 w-10 text-white" />
                          </motion.div>
                          <p className="font-bold text-2xl font-['Outfit'] tracking-tight mb-2">AI Analyzing Meal...</p>
                          <p className="text-sm text-blue-100 font-medium max-w-[200px]">Identifying ingredients and estimating clinical markers</p>
                        </div>
                      )}
                    </div>

                    {!analysisResult && !isAnalyzing && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-4 gap-3">
                          {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((type) => (
                            <button
                              key={type}
                              onClick={() => setMealType(type)}
                              className={`py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all font-['Outfit'] ${
                                mealType === type 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)]' 
                                : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200 hover:bg-gray-50'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={handleAnalyze}
                          disabled={isAnalyzing}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-full shadow-[0_12px_30px_rgba(37,99,235,0.2)] transition-all flex items-center justify-center gap-3 text-[12px] uppercase tracking-[0.2em] font-['Outfit']"
                        >
                          <Sparkles className="h-5 w-5" />
                          Start AI Analysis
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Analysis Result Card */}
            <AnimatePresence>
              {analysisResult && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-[32px] clinical-shadow border border-gray-100 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-blue-900 to-[#0f1f38] p-8 text-white flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[9px] font-bold bg-blue-500 text-white px-2.5 py-1 rounded-md tracking-widest uppercase font-['Outfit']">Clinical Result</span>
                        <span className="text-[10px] text-blue-200 font-bold uppercase tracking-widest font-['Outfit']">{analysisResult.cuisineType}</span>
                      </div>
                      <h3 className="text-3xl font-bold font-['Outfit'] tracking-tight">{analysisResult.dishName}</h3>
                    </div>
                    <div className="text-right relative z-10">
                      <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest font-['Outfit']">Precision</p>
                      <p className="text-3xl font-bold text-blue-100 font-['Outfit']">{analysisResult.confidenceScore}%</p>
                    </div>
                  </div>

                  <div className="p-10">
                    {/* Primary Macros */}
                    <div className="grid grid-cols-4 gap-4 mb-10">
                      {[
                        { label: 'Calories', value: analysisResult.nutrition.calories.value, unit: 'kcal', color: 'blue' },
                        { label: 'Protein', value: analysisResult.nutrition.protein.value, unit: 'g', color: 'emerald' },
                        { label: 'Carbs', value: analysisResult.nutrition.carbohydrates.value, unit: 'g', color: 'indigo' },
                        { label: 'Fat', value: analysisResult.nutrition.fat.value, unit: 'g', color: 'amber' },
                      ].map((macro) => (
                        <div key={macro.label} className={`text-center p-5 bg-${macro.color}-50/50 rounded-2xl border border-${macro.color}-100/50`}>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-['Outfit']">{macro.label}</p>
                          <p className={`text-2xl font-bold text-${macro.color}-700 font-['Outfit'] tracking-tight`}>{macro.value}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase font-['Outfit']">{macro.unit}</p>
                        </div>
                      ))}
                    </div>

                    {/* Additional Nutrients */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10 border-y border-gray-50 py-8">
                      {[
                        { label: 'Fiber', value: `${analysisResult.nutrition.fiber.value}g` },
                        { label: 'Sugar', value: `${analysisResult.nutrition.sugar.value}g` },
                        { label: 'Sodium', value: `${analysisResult.nutrition.sodium.value}mg` },
                        { label: 'Water Est.', value: `${analysisResult.nutrition.water.value}ml` },
                      ].map(n => (
                        <div key={n.label} className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-['Outfit']">{n.label}</span>
                          <span className="text-lg font-bold text-[#0f1f38] font-['Outfit'] mt-1">{n.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Ingredients */}
                    <div className="mb-10">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 font-['Outfit']">Detected Components</h4>
                      <div className="flex flex-wrap gap-3">
                        {analysisResult.ingredients.map((ing, idx) => (
                          <span key={idx} className="bg-white text-gray-600 text-[11px] font-bold px-5 py-2 rounded-full border border-gray-100 clinical-shadow font-['Outfit']">
                            {ing.name} <span className="text-blue-500 ml-1 opacity-70">({ing.estimatedWeight})</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* AI Insights */}
                    <div className="space-y-4">
                      {analysisResult.healthFlags.map((flag, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-xs font-bold text-emerald-700 bg-emerald-50/50 px-5 py-3 rounded-2xl border border-emerald-100/50 font-['Outfit']">
                          <CheckCircle2 className="h-4 w-4" />
                          {flag}
                        </div>
                      ))}
                      {analysisResult.warningFlags.map((flag, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-xs font-bold text-amber-700 bg-amber-50/50 px-5 py-3 rounded-2xl border border-amber-100/50 font-['Outfit']">
                          <AlertCircle className="h-4 w-4" />
                          {flag}
                        </div>
                      ))}
                      <div className="mt-6 p-6 bg-blue-50/50 rounded-[24px] border border-blue-100/50 relative">
                        <div className="flex items-center gap-2 mb-3">
                          <Brain className="h-4 w-4 text-blue-600" />
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest font-['Outfit']">Clinical Insight</span>
                        </div>
                        <p className="text-sm text-blue-900 font-medium leading-relaxed italic">
                          "{analysisResult.aiSuggestion}"
                        </p>
                      </div>
                    </div>

                    <div className="mt-10">
                      <button 
                        onClick={resetForm}
                        className="w-full bg-blue-600 text-white font-bold py-5 rounded-full shadow-[0_12px_30px_rgba(37,99,235,0.2)] hover:bg-blue-700 transition-all text-[12px] uppercase tracking-[0.2em] font-['Outfit']"
                      >
                        Log Another Meal
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* RIGHT COLUMN: Dashboard & Trends */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Today's Stats */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[32px] clinical-shadow border border-gray-100 p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-bold text-xl flex items-center gap-3 text-[#0f1f38] font-['Outfit'] tracking-tight">
                  <TrendingUp className="h-6 w-6 text-blue-600" /> 
                  Daily Progress
                </h2>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md uppercase tracking-widest font-['Outfit']">Today</span>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-bold font-['Outfit'] uppercase tracking-widest">
                    <span className="text-gray-400">Calories</span>
                    <span className="text-[#0f1f38]">{todaySummary.calories} / {dailyTarget.calories} <span className="text-gray-400">kcal</span></span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-50 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgress(todaySummary.calories, dailyTarget.calories)}%` }}
                      className="h-full bg-blue-600 rounded-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-5 border-t border-gray-50 pt-8">
                  {[
                    { label: 'Protein', value: todaySummary.protein, target: dailyTarget.protein, color: 'emerald' },
                    { label: 'Carbs', value: todaySummary.carbs, target: dailyTarget.carbs, color: 'blue' },
                    { label: 'Fat', value: todaySummary.fat, target: dailyTarget.fat, color: 'amber' },
                  ].map((macro) => (
                    <div key={macro.label} className="space-y-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-['Outfit']">{macro.label}</p>
                      <p className={`text-lg font-bold text-${macro.color}-600 font-['Outfit'] tracking-tight`}>{macro.value}g</p>
                      <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full bg-${macro.color}-500 rounded-full`} style={{ width: `${getProgress(macro.value, macro.target)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Weekly Chart */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[32px] clinical-shadow border border-gray-100 p-8"
            >
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8 font-['Outfit']">Weekly Calorie Trend</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8', fontFamily: 'Outfit' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8', fontFamily: 'Outfit' }} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontFamily: 'Outfit', fontWeight: 'bold' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="calories" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Today's Timeline */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[32px] clinical-shadow border border-gray-100 p-8"
            >
              <h3 className="font-bold text-xl mb-8 flex items-center gap-3 text-[#0f1f38] font-['Outfit'] tracking-tight">
                <Clock className="h-6 w-6 text-blue-600" />
                Today's Log
              </h3>
              
              <div className="space-y-8">
                {logs.filter(log => log.date.split('T')[0] === today).length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-[24px] border border-gray-100 border-dashed">
                    <Utensils className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-bold font-['Outfit'] uppercase tracking-widest">No meals logged today</p>
                  </div>
                ) : (
                  logs.filter(log => log.date.split('T')[0] === today).map((log, idx) => (
                    <div key={log._id} className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-[-32px] before:w-[1px] before:bg-gray-100 last:before:hidden">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center z-10 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.2em] font-['Outfit'] mb-1">{log.mealType}</p>
                          <p className="text-sm font-bold text-[#0f1f38] font-['Outfit']">{log.dishName}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 font-['Outfit']">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#0f1f38] font-['Outfit'] tracking-tight">{log.nutrition.calories.value} <span className="text-[10px] text-gray-400 uppercase ml-0.5">kcal</span></p>
                          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1 font-['Outfit']">Protein: {log.nutrition.protein.value}g</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

          </div>

        </div>
      </main>
    </div>
  );
}
