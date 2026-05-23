import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Brain, Shield, Heart, CheckCircle, FileSearch, Stethoscope, LogOut, Crown, FileText, UploadCloud, Video, Sparkles, Image as ImageIcon, X } from 'lucide-react'
import { authAPI } from '../api/authAPI'

export default function UploadReport() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [analysisStage, setAnalysisStage] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      navigate('/')
      return
    }
    setUser(JSON.parse(storedUser))
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    navigate('/')
  }

  // Handle file selection
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadError('Invalid file type. Please select a PDF, JPG, or PNG file.')
      return
    }

    // Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadError('File too large. Maximum size is 10MB.')
      return
    }

    setFile(selectedFile)
    setUploadError('')

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null) // No preview for PDFs
    }
  }

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('border-blue-400', 'bg-blue-50/50', 'shadow-[0_8px_30px_rgb(37,99,235,0.12)]')
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-blue-400', 'bg-blue-50/50', 'shadow-[0_8px_30px_rgb(37,99,235,0.12)]')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-blue-400', 'bg-blue-50/50', 'shadow-[0_8px_30px_rgb(37,99,235,0.12)]')
    }

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  // Handle file input change
  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0]
    handleFileSelect(selectedFile)
  }

  // Handle upload
  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file first.')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setUploadError('')

    try {
      const formData = new FormData()
      formData.append('report', file)

      // Simulate progress (in real implementation, you'd use axios progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await authAPI.uploadReport(formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        }
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      setUploadedFile(response.data.file)
      setUploadSuccess(true)

      // Now analyze the uploaded file with stage tracking
      setIsAnalyzing(true)
      try {
        setAnalysisStage('ocr')
        await new Promise(r => setTimeout(r, 600))
        setAnalysisStage('lab')
        await new Promise(r => setTimeout(r, 600))
        setAnalysisStage('risk')
        await new Promise(r => setTimeout(r, 600))
        setAnalysisStage('lifestyle')

        const analyzeResponse = await authAPI.analyzeReport({
          filePath: response.data.file.path
        })

        setAnalysisStage('safety')
        await new Promise(r => setTimeout(r, 500))

        if (analyzeResponse.data.success) {
          setAnalysisStage('done')
          await new Promise(r => setTimeout(r, 800))
          // Navigate to dashboard — data is now in the DB
          navigate('/dashboard')
          return
        }
      } catch (analyzeError) {
        console.error('Analysis error:', analyzeError)
        setUploadError('Analysis could not be completed, but your file was uploaded successfully.')
      } finally {
        setIsAnalyzing(false)
        setAnalysisStage('')
      }

      // Reset form after successful upload (only if not navigated)
      setTimeout(() => {
        setFile(null)
        setPreview(null)
        setUploadSuccess(false)
        setUploadProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 3000)

    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error.response?.data?.message || 'Upload failed. Please try again.')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  // Remove selected file
  const removeFile = () => {
    setFile(null)
    setPreview(null)
    setUploadError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 font-sans selection:bg-blue-600/20 pt-[80px]">
      
      {/* ───────── Top Navigation (Premium Light) ───────── */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 h-16 transition-all duration-300">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 h-full flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => navigate('/')}>
              <img src="/logo.png" alt="Plumb Health Logo" className="w-8 h-8 object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-500" />
              <span className="text-xl font-bold text-slate-800 hidden sm:block tracking-tight font-['Outfit'] select-none">
                Plumb<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-black ml-0.5">Health</span>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors font-['Outfit'] uppercase tracking-widest px-2"
            >
              Dashboard
            </button>
            <div className="h-5 w-[1px] bg-slate-200/70 hidden sm:block"></div>
            
            {/* User Profile Info Card */}
            <div className="hidden sm:flex items-center gap-3 pl-2 select-none">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-800 font-['Outfit']">{user.name}</span>
                  {user.membershipType === 'pro' && (
                    <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider font-['Outfit'] flex items-center">
                      <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 font-medium tracking-normal font-['Outfit']">ID: {user.id?.substring(0,6) || user._id?.substring(0,6) || 'N/A'}</span>
              </div>
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center font-bold text-sm border border-slate-200/80 font-['Outfit']">
                   {user.name?.charAt(0).toUpperCase()}
                </div>
                {user.membershipType === 'pro' && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 border border-white rounded-full shadow-sm" />
                )}
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-all duration-200"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ───────── Main Content ───────── */}
      <div className="max-w-2xl mx-auto px-4 py-8 relative">
        
        {/* Background glow effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-400/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* AI Analysis Progress Overlay */}
        {isAnalyzing && (
          <div className="bg-white/80 backdrop-blur-2xl rounded-[32px] shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-white/60 p-12 mb-8 text-center relative overflow-hidden">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
            
            <div className="mb-8 relative z-10">
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-50 to-indigo-50 rounded-[24px] shadow-inner border border-blue-100/50 flex items-center justify-center mx-auto mb-8 relative">
                <div className="absolute inset-0 rounded-[24px] bg-blue-400/20 animate-ping opacity-20" />
                <Brain className="h-10 w-10 text-blue-600 animate-pulse" />
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-400 animate-bounce" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mt-4 font-['Outfit'] tracking-tight">AI Agents Analyzing</h3>
              <p className="text-slate-500 text-sm mt-3 font-medium">Running advanced clinical pipeline...</p>
            </div>
            
            <div className="space-y-4 text-left max-w-sm mx-auto relative z-10">
              {[
                { key: 'ocr', icon: FileSearch, label: 'Extracting medical text...' },
                { key: 'lab', icon: Stethoscope, label: 'Identifying test values...' },
                { key: 'risk', icon: Activity, label: 'Evaluating health risks...' },
                { key: 'lifestyle', icon: Heart, label: 'Generating lifestyle guidance...' },
                { key: 'safety', icon: Shield, label: 'Running safety checks...' },
                { key: 'done', icon: CheckCircle, label: 'Analysis complete!' },
              ].map((step) => {
                const stages = ['ocr', 'lab', 'risk', 'lifestyle', 'safety', 'done']
                const current = stages.indexOf(analysisStage)
                const stepIdx = stages.indexOf(step.key)
                const isActive = stepIdx === current
                const isDone = stepIdx < current
                
                return (
                  <div key={step.key} className={`flex items-center space-x-4 p-3 rounded-2xl transition-all duration-500 ${
                    isActive ? 'bg-white shadow-sm border border-blue-100/50 translate-x-2' : isDone ? 'opacity-70' : 'opacity-40'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      isActive ? 'bg-blue-50' : isDone ? 'bg-emerald-50' : 'bg-slate-50'
                    }`}>
                      <step.icon className={`h-4 w-4 flex-shrink-0 ${
                        isDone ? 'text-emerald-500' : isActive ? 'text-blue-600 animate-pulse' : 'text-slate-400'
                      }`} />
                    </div>
                    <span className={`text-sm font-semibold font-['Outfit'] tracking-wide ${
                      isActive ? 'text-blue-700' : isDone ? 'text-emerald-700' : 'text-slate-500'
                    }`}>
                      {step.label}
                    </span>
                    {isDone && <CheckCircle className="h-4 w-4 text-emerald-500 ml-auto" />}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className={`bg-white/70 backdrop-blur-2xl rounded-[32px] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white/60 p-10 lg:p-12 transition-all duration-500 ${isAnalyzing ? 'hidden' : 'opacity-100'}`}>
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight font-['Outfit']">Upload Report</h2>
            <p className="text-slate-500 font-medium text-sm">Provide your medical report (PDF, JPG, PNG) for deep clinical intelligence analysis.</p>
          </div>

          {/* Success Message */}
          {uploadSuccess && uploadedFile && (
            <div className="bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/50 text-emerald-700 p-5 rounded-[20px] mb-8 shadow-sm flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-emerald-100 p-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold font-['Outfit']">Upload Successful!</p>
                <p className="text-sm mt-1 opacity-90">File: {uploadedFile.originalName}</p>
                <p className="text-xs mt-1 font-semibold uppercase tracking-wider text-emerald-600/80">Ready for AI analysis</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="bg-rose-50/80 backdrop-blur-sm border border-rose-200/50 text-rose-700 p-5 rounded-[20px] mb-6 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <Shield className="w-5 h-5 text-rose-500 mt-0.5" />
              <span className="font-medium text-sm">{uploadError}</span>
            </div>
          )}

          {/* File Preview */}
          {file && (
            <div className="mb-8 p-5 bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] group relative overflow-hidden transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-5">
                  {preview ? (
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-slate-200/50">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shadow-inner border border-blue-100/50">
                      <FileText className="w-7 h-7 text-blue-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-800 font-['Outfit'] tracking-tight truncate max-w-[200px] sm:max-w-[300px]">{file.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {file.type.split('/')[1].toUpperCase()}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="mb-8">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 font-['Outfit']">
                <span className="flex items-center gap-2">
                  <UploadCloud className="w-3.5 h-3.5 animate-bounce" />
                  Uploading securely...
                </span>
                <span className="text-blue-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 shadow-inner overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300 relative"
                  style={{ width: `${uploadProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_1s_infinite]" />
                </div>
              </div>
            </div>
          )}

          {/* Upload Area */}
          {!file && (
            <div
              ref={dropZoneRef}
              className="border-[1.5px] border-dashed border-slate-300/80 rounded-[32px] p-12 bg-white/40 backdrop-blur-sm mb-8 hover:border-blue-400/80 hover:bg-blue-50/30 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-[0_8px_30px_rgb(37,99,235,0.08)] relative overflow-hidden"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center relative z-10">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:bg-blue-100">
                  <UploadCloud className="h-10 w-10 text-blue-500 drop-shadow-sm" />
                </div>
                <p className="text-slate-700 font-bold text-lg mb-2 font-['Outfit'] tracking-tight">Drag and drop your report</p>
                <p className="text-slate-400 font-medium text-sm mb-8">or click to browse from your computer</p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                <button
                  type="button"
                  className="bg-slate-900 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-slate-800 transition-all duration-300 shadow-[0_8px_20px_rgba(15,23,42,0.15)] hover:shadow-[0_12px_25px_rgba(15,23,42,0.25)] transform hover:-translate-y-0.5 uppercase tracking-[0.15em] text-[11px] font-['Outfit']"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                >
                  Select File
                </button>
              </div>
            </div>
          )}

          {/* File Requirements */}
          <div className="bg-slate-50/80 backdrop-blur-sm border border-slate-100 rounded-[24px] p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1 font-['Outfit'] tracking-wide">Supported Formats</h4>
              <p className="text-slate-500 text-xs font-medium">Upload high quality scans or images.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200/60 shadow-sm">
                <FileText className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">PDF</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200/60 shadow-sm">
                <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">JPG/PNG</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1 bg-slate-100 px-2 py-1 rounded-md">Max 10MB</span>
            </div>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-5 rounded-[20px] hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_25px_rgba(37,99,235,0.25)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.35)] transform hover:-translate-y-0.5 uppercase tracking-[0.2em] text-xs font-['Outfit'] flex items-center justify-center gap-2 group"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading securely...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Brain className="w-4 h-4 group-hover:animate-pulse" />
                Upload & Analyze Report
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
