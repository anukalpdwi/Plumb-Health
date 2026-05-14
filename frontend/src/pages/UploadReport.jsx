import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Brain, Shield, Heart, CheckCircle, FileSearch, Stethoscope } from 'lucide-react'
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
      dropZoneRef.current.classList.add('border-blue-500', 'bg-blue-100')
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-blue-500', 'bg-blue-100')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-blue-500', 'bg-blue-100')
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
        await new Promise(r => setTimeout(r, 500))
        setAnalysisStage('lab')
        await new Promise(r => setTimeout(r, 500))
        setAnalysisStage('risk')
        await new Promise(r => setTimeout(r, 500))
        setAnalysisStage('lifestyle')

        const analyzeResponse = await authAPI.analyzeReport({
          filePath: response.data.file.path
        })

        setAnalysisStage('safety')
        await new Promise(r => setTimeout(r, 400))

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
    return <div className="text-center mt-20">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#0f1f38] font-sans">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0f1f38] font-['Outfit'] tracking-tight">Plumb <span className="text-blue-600">Health</span></span>
          </div>
          <div className="space-x-6 flex items-center text-sm font-bold uppercase tracking-[0.1em] font-['Outfit']">
            <a href="/dashboard" className="text-gray-500 hover:text-blue-600 transition-colors">Dashboard</a>
            <a href="/history" className="text-gray-500 hover:text-blue-600 transition-colors">History</a>
            <a href="/profile" className="text-gray-500 hover:text-blue-600 transition-colors">Profile</a>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* AI Analysis Progress Overlay */}
        {isAnalyzing && (
          <div className="bg-white/90 backdrop-blur-xl rounded-[32px] clinical-shadow border border-white p-10 mb-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="h-10 w-10 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-3xl font-bold text-[#0f1f38] mt-4 font-['Outfit'] tracking-tight">AI Agents Analyzing Your Report</h3>
              <p className="text-gray-500 text-sm mt-2 font-medium">Running clinical pipeline...</p>
            </div>
            <div className="space-y-3 text-left max-w-sm mx-auto">
              {[
                { key: 'ocr', icon: FileSearch, label: 'OCR Agent: Extracting text from report...' },
                { key: 'lab', icon: Stethoscope, label: 'Lab Agent: Identifying test values & ranges...' },
                { key: 'risk', icon: Activity, label: 'Risk Agent: Evaluating health risks...' },
                { key: 'lifestyle', icon: Heart, label: 'Lifestyle Agent: Generating guidance...' },
                { key: 'safety', icon: Shield, label: 'Safety Agent: Ensuring safe output...' },
                { key: 'done', icon: CheckCircle, label: 'Analysis complete! Redirecting...' },
              ].map((step) => {
                const stages = ['ocr', 'lab', 'risk', 'lifestyle', 'safety', 'done']
                const current = stages.indexOf(analysisStage)
                const stepIdx = stages.indexOf(step.key)
                const isActive = stepIdx === current
                const isDone = stepIdx < current
                return (
                  <div key={step.key} className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-300 ${
                    isActive ? 'bg-blue-50 border border-blue-200' : isDone ? 'opacity-60' : 'opacity-30'
                  }`}>
                    <step.icon className={`h-5 w-5 flex-shrink-0 ${
                      isDone ? 'text-green-500' : isActive ? 'text-blue-600 animate-pulse' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${isActive ? 'text-blue-700' : isDone ? 'text-green-700' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                    {isDone && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className={`bg-white/90 backdrop-blur-xl rounded-[32px] clinical-shadow border border-white p-10 ${isAnalyzing ? 'hidden' : ''}`}>
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-[#0f1f38] mb-3 tracking-tight font-['Outfit']">Upload Health Report</h2>
            <p className="text-gray-500 font-medium">Upload your medical report (PDF, JPG, PNG) for clinical intelligence analysis.</p>
          </div>

          {/* Success Message */}
          {uploadSuccess && uploadedFile && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl mb-8">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold">Upload Successful!</p>
                  <p className="text-sm">File: {uploadedFile.originalName}</p>
                  <p className="text-sm">Ready for AI analysis</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-300 text-red-700 px-4 py-3 rounded-2xl mb-6">
              {uploadError}
            </div>
          )}

          {/* File Preview */}
          {file && (
            <div className="mb-6 p-4 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded mr-4" />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded flex items-center justify-center mr-4">
                      <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[1].toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700 p-1"
                  disabled={uploading}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Upload Area */}
          {!file && (
            <div
              ref={dropZoneRef}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-12 bg-gray-50/80 backdrop-blur-sm mb-6 hover:border-blue-400 hover:bg-blue-50/80 transition-all duration-200 cursor-pointer"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-14-8v12m0 0l4-4m-4 4l-4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-gray-700 font-semibold mb-2">Drag and drop your report here</p>
                <p className="text-gray-600 mb-4">or click to select a file</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <button
                  type="button"
                  className="bg-blue-600 text-white font-bold py-4 px-8 rounded-full hover:bg-blue-700 transition-all duration-300 shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_12px_25px_rgba(37,99,235,0.3)] transform hover:-translate-y-0.5 uppercase tracking-[0.2em] text-[10px] font-['Outfit']"
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
          <div className="bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">Supported Formats</h4>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>✓ PDF files</li>
              <li>✓ JPG/JPEG images</li>
              <li>✓ PNG images</li>
              <li>✓ Max file size: 10MB</li>
            </ul>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-blue-600 text-white font-bold py-5 rounded-full hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_25px_rgba(37,99,235,0.25)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.35)] transform hover:-translate-y-0.5 uppercase tracking-[0.2em] text-[11px] font-['Outfit'] mt-6"
          >
            {uploading ? 'Uploading securely...' : 'Upload & Analyze Report'}
          </button>
        </div>
      </div>
    </div>
  )
}
