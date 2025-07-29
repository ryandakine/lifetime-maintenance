import React, { useState, useEffect, useRef } from 'react'
import { supabase, TABLES, API_KEYS } from '../lib/supabase'
import { 
  Camera, 
  Upload, 
  Check, 
  X, 
  Brain,
  RotateCcw,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Video,
  Image,
  HelpCircle,
  ArrowRight,
  Shield,
  Mic,
  Square,
  MessageSquare,
  Star,
  Tag,
  Folder,
  Search,
  Filter
} from 'lucide-react'

const Photos = () => {
  console.log('Rendering Photos')
  const [photos, setPhotos] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  
  const [photoUpload, setPhotoUpload] = useState({
    photo: null,
    photoUrl: '',
    selectedTaskId: '',
    purpose: 'clarification', // 'clarification', 'next_steps', 'verify_done', 'enhanced_analysis'
    analysis: '',
    loading: false,
    showForm: false,
    cameraMode: false,
    cameraAvailable: false,
    stream: null,
    uploadMode: 'file', // 'camera' or 'file'
    uploadType: 'file' // 'camera' or 'file' for database
  })

  // Voice input state
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [listeningTimeout, setListeningTimeout] = useState(null)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [voiceModalText, setVoiceModalText] = useState('')
  const [voiceModalListening, setVoiceModalListening] = useState(false)
  const [voiceModalRecognitionRef, setVoiceModalRecognitionRef] = useState(null)

  // AI features state
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [photoTags, setPhotoTags] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredPhotos, setFilteredPhotos] = useState([])
  const [showAnalytics, setShowAnalytics] = useState(false)

  // Check camera availability on mount
  useEffect(() => {
    checkCameraAvailability()
  }, [])

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load photos and tasks on component mount
  useEffect(() => {
    loadPhotos()
    loadTasks()
  }, [])

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (photoUpload.stream) {
        photoUpload.stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [photoUpload.stream])

  const checkCameraAvailability = () => {
    const hasMediaDevices = navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    const cameraAvailable = hasMediaDevices && navigator.mediaDevices.enumerateDevices
    
    console.log('Camera access: ' + (hasMediaDevices ? 'available' : 'not available'))
    
    setPhotoUpload(prev => ({ ...prev, cameraAvailable }))
    
    if (!hasMediaDevices) {
      showMessage('warning', 'Camera not available, upload from files')
    }
  }

  const handleUploadModeChange = (mode) => {
    console.log('Upload mode: ' + mode)
    
    // Stop camera if switching from camera mode
    if (photoUpload.cameraMode && mode === 'file') {
      stopCamera()
    }
    
    setPhotoUpload(prev => ({ 
      ...prev, 
      uploadMode: mode,
      uploadType: mode,
      cameraMode: mode === 'camera',
      photo: null,
      photoUrl: '',
      analysis: ''
    }))
  }

  const getPurposeLabel = (purpose) => {
    switch (purpose) {
      case 'clarification': return 'Clarification'
      case 'next_steps': return 'Next Steps'
      case 'verify_done': return 'Verify Done'
      case 'enhanced_analysis': return 'Enhanced AI Analysis'
      default: return 'Clarification'
    }
  }

  const getPurposeIcon = (purpose) => {
    switch (purpose) {
      case 'clarification': return <HelpCircle size={16} />
      case 'next_steps': return <ArrowRight size={16} />
      case 'verify_done': return <Shield size={16} />
      case 'enhanced_analysis': return <Brain size={16} />
      default: return <HelpCircle size={16} />
    }
  }

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported')
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      setPhotoUpload(prev => ({ 
        ...prev, 
        cameraMode: true, 
        stream,
        showForm: true 
      }))
      
      console.log('Camera started successfully')
      
    } catch (error) {
      console.error('Camera access error:', error)
      showMessage('error', 'Camera access failed, using file upload instead')
      setPhotoUpload(prev => ({ 
        ...prev, 
        cameraMode: false, 
        uploadMode: 'file',
        uploadType: 'file',
        showForm: true 
      }))
    }
  }

  const stopCamera = () => {
    if (photoUpload.stream) {
      photoUpload.stream.getTracks().forEach(track => track.stop())
    }
    
    setPhotoUpload(prev => ({ 
      ...prev, 
      cameraMode: false, 
      stream: null,
      showForm: false,
      photo: null,
      photoUrl: '',
      analysis: '',
      selectedTaskId: '',
      uploadMode: 'file',
      uploadType: 'file'
    }))
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
        setPhotoUpload(prev => ({ ...prev, photo: file }))
        
        // Stop camera after capture
        stopCamera()
        
        // Process the captured photo
        processPhotoFile(file, 'camera')
      }
    }, 'image/jpeg', 0.8)
  }

  const processPhotoFile = async (file, type = 'file') => {
    try {
      setPhotoUpload(prev => ({ ...prev, loading: true }))
      
      // Upload to Supabase Storage
      const fileName = `project-photos/${Date.now()}_${file.name}`
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName)

      setPhotoUpload(prev => ({ ...prev, photoUrl: publicUrl }))
      
      // Analyze photo based on purpose
      if (photoUpload.purpose === 'enhanced_analysis') {
        // Use enhanced AI analysis for equipment recognition and damage detection
        const enhancedResult = await analyzePhotoWithEnhancedAI(publicUrl, type)
        setPhotoUpload(prev => ({ 
          ...prev, 
          analysis: JSON.stringify(enhancedResult, null, 2),
          loading: false 
        }))
        showMessage('success', 'Enhanced AI analysis completed successfully')
      } else {
        // Use standard analysis for other purposes
        await analyzePhotoWithGrok(publicUrl, type, photoUpload.purpose)
      }
      
    } catch (error) {
      console.error('Error processing photo:', error)
      showMessage('error', 'Failed to process photo')
      setPhotoUpload(prev => ({ ...prev, loading: false }))
    }
  }

  const loadPhotos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', 'current-user') // Replace with actual user ID
        .order('created_at', { ascending: false })

      if (error) throw error
      setPhotos(data || [])
      console.log('Photos loaded:', data?.length || 0)
    } catch (error) {
      console.error('Error loading photos:', error)
      showMessage('error', 'Failed to load photos')
    } finally {
      setLoading(false)
    }
  }

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .select('id, task_list, status')
        .eq('user_id', 'current-user')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    await processPhotoFile(file, 'file')
  }

  const analyzePhotoWithGrok = async (photoUrl, type = 'file', purpose = 'clarification') => {
    try {
      const grokApiKey = API_KEYS.GROK_PRO
      
      if (!grokApiKey || grokApiKey === 'your-grok-key') {
        console.warn('Grok Pro API key not configured, using fallback analysis')
        setPhotoUpload({ 
          ...photoUpload, 
          analysis: 'Photo analysis requires Grok Pro API key configuration.',
          loading: false 
        })
        return
      }

      // Get task context if selected
      let taskContext = ''
      if (photoUpload.selectedTaskId) {
        const task = tasks.find(t => t.id === photoUpload.selectedTaskId)
        if (task) {
          taskContext = `\n\nRelated Task: ${task.task_list}`
        }
      }

      // Enhanced AI Analysis with Equipment Recognition & Damage Detection
      let prompt = ''
      switch (purpose) {
        case 'clarification':
          prompt = `🔍 ENHANCED AI ANALYSIS - Equipment Recognition & Damage Detection

Analyze this maintenance/repair photo with advanced computer vision capabilities.

${taskContext}

## EQUIPMENT RECOGNITION
1. Identify the type of fitness equipment (treadmill, elliptical, weight machine, etc.)
2. Determine the brand and model if visible
3. Assess confidence level in equipment identification (0-100%)
4. Identify specific components visible in the photo

## DAMAGE DETECTION & ASSESSMENT
1. Detect any visible damage (cracks, rust, wear, loose parts, frayed cables)
2. Assess damage severity: LOW, MEDIUM, HIGH, CRITICAL
3. Identify affected components (belts, motors, bearings, cables, structural parts)
4. Detect safety hazards or potential failure points

## DETAILED ANALYSIS
1. Describe what you see in the photo
2. Identify the main issue or maintenance need
3. Explain what might be causing the problem
4. Provide context about the situation
5. Highlight any safety concerns

Format your response as:
## 🏋️ Equipment Identification
- **Type**: [Equipment type with confidence %]
- **Brand/Model**: [If identifiable]
- **Components Visible**: [List visible components]

## ⚠️ Damage Assessment
- **Severity Level**: [LOW/MEDIUM/HIGH/CRITICAL]
- **Damage Types**: [List detected damage]
- **Affected Components**: [Specific components with issues]
- **Safety Hazards**: [Any safety concerns]

## 🔍 Issue Analysis
[Describe what you see and identify the main issue]

## 📋 Problem Description
[Explain what might be causing the problem]

## 🛡️ Safety Notes
[Highlight any safety concerns or considerations]

## ❓ Questions for Clarification
[Ask specific questions to better understand the situation]`
          break

        case 'next_steps':
          prompt = `🔍 ENHANCED AI ANALYSIS - Equipment Recognition & Damage Detection

Analyze this maintenance/repair photo and provide specific next steps based on equipment type and damage assessment.

${taskContext}

## EQUIPMENT RECOGNITION
1. Identify the type of fitness equipment
2. Determine brand and model if visible
3. Assess confidence level in equipment identification
4. Identify specific components that need attention

## DAMAGE ASSESSMENT
1. Evaluate damage severity and type
2. Identify critical vs. non-critical issues
3. Assess safety implications
4. Determine repair priority

## NEXT STEPS ANALYSIS
1. Identify what needs to be done next
2. Provide step-by-step instructions specific to the equipment type
3. List required tools and supplies
4. Include safety precautions
5. Estimate time and difficulty

Format your response as:
## 🏋️ Equipment Context
- **Type**: [Equipment type with confidence %]
- **Brand/Model**: [If identifiable]
- **Components Involved**: [Components needing attention]

## ⚠️ Damage Assessment
- **Severity**: [LOW/MEDIUM/HIGH/CRITICAL]
- **Issues**: [List of detected problems]
- **Safety Level**: [Safe/Moderate/Unsafe]

## 📋 Next Steps Required
[Identify what needs to be done next]

## 🔧 Step-by-Step Instructions
1. [First step - equipment specific]
2. [Second step - equipment specific]
3. [Continue as needed]

## 🛠️ Required Tools & Supplies
[List all tools and supplies needed for this equipment type]

## 🛡️ Safety Precautions
[Include safety measures specific to this equipment]

## ⏱️ Time & Difficulty Estimate
[Estimate time required and difficulty level]

## 📝 Additional Notes
[Any other important information]`
          break

        case 'verify_done':
          prompt = `🔍 ENHANCED AI ANALYSIS - Equipment Recognition & Damage Detection

Analyze this maintenance/repair photo and verify if the work has been completed correctly for the specific equipment type.

${taskContext}

## EQUIPMENT VERIFICATION
1. Confirm equipment type and components
2. Verify that the correct components were addressed
3. Check for any missed areas or components

## QUALITY ASSESSMENT
1. Assess if the work appears complete and correct
2. Evaluate workmanship quality
3. Check for proper installation/repair
4. Verify safety standards compliance

## DAMAGE RESOLUTION
1. Confirm that identified damage has been addressed
2. Check for any remaining issues
3. Assess if repairs are adequate
4. Verify no new damage was introduced

Format your response as:
## 🏋️ Equipment Verification
- **Type**: [Equipment type]
- **Components Addressed**: [List components that were worked on]
- **Work Scope**: [What was supposed to be done]

## ✅ Work Verification
[Assess if the work appears complete and correct]

## 🎯 Quality Assessment
[Evaluate the quality of workmanship]

## ⚠️ Issues Found (if any)
[List any issues or incomplete work]

## 🔧 Suggested Fixes (if needed)
[Provide specific fixes for any issues]

## 🛡️ Safety Compliance
[Verify safety standards and compliance]

## 📊 Final Status
✅ Work Complete and Correct
⚠️ Work Needs Attention
❌ Work Incomplete

## 📋 Recommendations
[Final recommendations and next actions]`
          break

        default:
          prompt = `🔍 ENHANCED AI ANALYSIS - Equipment Recognition & Damage Detection

Analyze this maintenance/repair photo with advanced computer vision capabilities.

${taskContext}

## EQUIPMENT RECOGNITION
1. Identify the type of fitness equipment
2. Determine brand and model if visible
3. Assess confidence level in equipment identification
4. Identify specific components visible

## DAMAGE DETECTION
1. Detect any visible damage or wear
2. Assess damage severity
3. Identify affected components
4. Detect safety hazards

## GENERAL ANALYSIS
Provide comprehensive analysis of the photo including equipment context, damage assessment, and maintenance recommendations.`
      }

      console.log(`Photo analyzed for ${purpose}`)

      const response = await fetch('https://api.grok.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${grokApiKey}`
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: photoUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Grok Pro API error:', response.status, errorText)
        throw new Error(`Grok Pro API error: ${response.status}`)
      }

      const result = await response.json()
      const analysis = result.choices[0].message.content

      // Save to Supabase photos table with purpose and upload type
      const { error: saveError } = await supabase
        .from('photos')
        .insert({
          user_id: 'current-user',
          photo_url: photoUrl,
          task_id: photoUpload.selectedTaskId || null,
          response: analysis,
          purpose: purpose,
          upload_type: type,
          created_at: new Date().toISOString()
        })

      if (saveError) {
        console.error('Error saving photo analysis:', saveError)
      }

      setPhotoUpload({ 
        ...photoUpload, 
        analysis, 
        loading: false 
      })
      
      console.log(`Photo uploaded and analyzed with Grok Pro (type: ${type}, purpose: ${purpose})`)
      showMessage('success', 'Photo uploaded and analyzed successfully')
      
      // Reload photos list
      await loadPhotos()
      
    } catch (error) {
      console.error('Error analyzing photo:', error)
      showMessage('error', 'Failed to analyze photo')
      setPhotoUpload({ ...photoUpload, loading: false })
    }
  }

  // Enhanced AI Analysis - Equipment Recognition & Damage Detection
  const analyzePhotoWithEnhancedAI = async (photoUrl, type = 'file') => {
    try {
      const grokApiKey = API_KEYS.GROK_PRO
      
      if (!grokApiKey || grokApiKey === 'your-grok-key') {
        console.warn('Grok Pro API key not configured, using fallback analysis')
        return {
          equipment: { type: 'Unknown', confidence: 0, brand: 'Unknown', model: 'Unknown' },
          damage: { severity: 'UNKNOWN', types: [], components: [], safetyHazards: [] },
          analysis: 'Enhanced AI analysis requires Grok Pro API key configuration.'
        }
      }

      const enhancedPrompt = `🔍 ADVANCED COMPUTER VISION ANALYSIS - Equipment Recognition & Damage Detection

Analyze this fitness equipment photo with specialized computer vision capabilities for maintenance and safety assessment.

## EQUIPMENT RECOGNITION REQUIREMENTS
1. Identify the specific type of fitness equipment (treadmill, elliptical, weight machine, exercise bike, etc.)
2. Determine the brand and model if visible or identifiable
3. Assess confidence level in equipment identification (0-100%)
4. Identify all visible components and parts
5. Classify equipment category (cardio, strength, flexibility, etc.)

## DAMAGE DETECTION REQUIREMENTS
1. Detect any visible damage types:
   - Structural damage (cracks, bends, breaks)
   - Wear and tear (frayed cables, worn belts, rust)
   - Loose or missing parts
   - Electrical issues (exposed wires, damaged connectors)
   - Safety hazards (sharp edges, unstable parts)

2. Assess damage severity levels:
   - LOW: Minor cosmetic issues, no safety concerns
   - MEDIUM: Functional issues, some safety concerns
   - HIGH: Significant damage, safety concerns
   - CRITICAL: Severe damage, immediate safety hazard

3. Identify affected components:
   - Belts, motors, bearings, cables
   - Structural components, safety features
   - Electrical components, control systems

## SAFETY ASSESSMENT
1. Identify any immediate safety hazards
2. Assess equipment stability and structural integrity
3. Check for electrical safety issues
4. Evaluate user safety risks

## MAINTENANCE PRIORITY
1. Determine maintenance urgency
2. Assess repair complexity
3. Estimate repair costs and time
4. Recommend immediate actions

Please provide your analysis in the following JSON format:
{
  "equipment": {
    "type": "string",
    "confidence": number,
    "brand": "string",
    "model": "string",
    "category": "string",
    "components": ["array of visible components"]
  },
  "damage": {
    "severity": "LOW|MEDIUM|HIGH|CRITICAL",
    "types": ["array of damage types"],
    "components": ["array of affected components"],
    "safetyHazards": ["array of safety hazards"]
  },
  "analysis": {
    "description": "detailed description of what you see",
    "mainIssue": "main problem identified",
    "causes": ["potential causes"],
    "safetyLevel": "SAFE|MODERATE|UNSAFE",
    "maintenancePriority": "LOW|MEDIUM|HIGH|CRITICAL",
    "immediateActions": ["list of immediate actions needed"],
    "repairEstimate": {
      "time": "estimated repair time",
      "complexity": "LOW|MEDIUM|HIGH",
      "cost": "estimated cost range"
    }
  }
}`

      console.log('Starting enhanced AI analysis for equipment recognition and damage detection')

      const response = await fetch('https://api.grok.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${grokApiKey}`
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: enhancedPrompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: photoUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Enhanced AI analysis error:', response.status, errorText)
        throw new Error(`Enhanced AI analysis error: ${response.status}`)
      }

      const result = await response.json()
      const analysisText = result.choices[0].message.content

      // Try to parse JSON response
      let enhancedAnalysis = null
      try {
        // Extract JSON from the response (it might be wrapped in markdown)
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          enhancedAnalysis = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found in response')
        }
      } catch (parseError) {
        console.warn('Failed to parse JSON response, using text analysis:', parseError)
        enhancedAnalysis = {
          equipment: { type: 'Unknown', confidence: 0, brand: 'Unknown', model: 'Unknown' },
          damage: { severity: 'UNKNOWN', types: [], components: [], safetyHazards: [] },
          analysis: { description: analysisText, mainIssue: 'Analysis completed', safetyLevel: 'UNKNOWN' }
        }
      }

      // Save enhanced analysis to database
      const { error: saveError } = await supabase
        .from('photos')
        .insert({
          user_id: 'current-user',
          photo_url: photoUrl,
          task_id: photoUpload.selectedTaskId || null,
          response: JSON.stringify(enhancedAnalysis),
          purpose: 'enhanced_analysis',
          upload_type: type,
          created_at: new Date().toISOString()
        })

      if (saveError) {
        console.error('Error saving enhanced analysis:', saveError)
      }

      console.log('Enhanced AI analysis completed:', enhancedAnalysis)
      return enhancedAnalysis

    } catch (error) {
      console.error('Error in enhanced AI analysis:', error)
      throw error
    }
  }

  const deletePhoto = async (photoId) => {
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId)

      if (error) throw error

      setPhotos(photos.filter(photo => photo.id !== photoId))
      console.log(`Photo ${photoId} deleted`)
      showMessage('success', 'Photo deleted')
    } catch (error) {
      console.error('Error deleting photo:', error)
      showMessage('error', 'Failed to delete photo')
    }
  }

  const getStatusIcon = (analysis) => {
    if (analysis.includes('✅ Work Complete and Correct') || analysis.includes('✅ Complete and Correct')) {
      return <CheckCircle size={16} style={{ color: 'var(--success-color)' }} />
    } else if (analysis.includes('⚠️ Work Needs Attention') || analysis.includes('⚠️ Needs Attention')) {
      return <AlertCircle size={16} style={{ color: 'var(--warning-text)' }} />
    } else if (analysis.includes('❌ Work Incomplete') || analysis.includes('🔄 In Progress')) {
      return <Clock size={16} style={{ color: 'var(--primary-color)' }} />
    }
    return <FileText size={16} />
  }

  const getStatusColor = (analysis) => {
    if (analysis.includes('✅ Work Complete and Correct') || analysis.includes('✅ Complete and Correct')) {
      return 'var(--success-color)'
    } else if (analysis.includes('⚠️ Work Needs Attention') || analysis.includes('⚠️ Needs Attention')) {
      return 'var(--warning-color)'
    } else if (analysis.includes('❌ Work Incomplete') || analysis.includes('🔄 In Progress')) {
      return 'var(--primary-color)'
    }
    return 'var(--secondary-color)'
  }

  const getUploadTypeIcon = (type) => {
    return type === 'camera' ? <Camera size={14} /> : <Upload size={14} />
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  // Voice Input Functions
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showMessage('error', 'Speech recognition not supported')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }
      if (finalTranscript) {
        setTranscript(finalTranscript)
        // Process voice command for photo description
        processVoiceCommand(finalTranscript)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    // Auto-stop after 30 seconds
    const timeout = setTimeout(() => {
      recognition.stop()
      recognition.abort()
    }, 30000)
    setListeningTimeout(timeout)

    recognition.start()
  }

  const stopListening = () => {
    if (listeningTimeout) {
      clearTimeout(listeningTimeout)
      setListeningTimeout(null)
    }
    try {
      // Stop any active recognition
      if (window.speechRecognition) {
        window.speechRecognition.stop()
        window.speechRecognition.abort()
      }
    } catch (error) {
      console.log('Recognition already stopped')
    }
    
    setIsListening(false)
    showMessage('info', 'Voice input stopped.')
  }

  const processVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase()
    
    // Voice commands for photo descriptions
    if (lowerCommand.includes('describe') || lowerCommand.includes('analyze')) {
      // Add voice description to photo analysis
      setPhotoUpload(prev => ({
        ...prev,
        analysis: prev.analysis + '\n\nVoice Description: ' + command
      }))
    } else if (lowerCommand.includes('tag') || lowerCommand.includes('label')) {
      // Extract tags from voice command
      const tags = command.match(/(?:tag|label)\s+(.+)/i)?.[1]?.split(/\s+and\s+|\s*,\s*/) || []
      setPhotoTags(prev => [...prev, ...tags])
    } else if (lowerCommand.includes('purpose')) {
      // Set photo purpose
      if (lowerCommand.includes('clarification')) {
        setPhotoUpload(prev => ({ ...prev, purpose: 'clarification' }))
      } else if (lowerCommand.includes('next steps') || lowerCommand.includes('next step')) {
        setPhotoUpload(prev => ({ ...prev, purpose: 'next_steps' }))
      } else if (lowerCommand.includes('verify') || lowerCommand.includes('done')) {
        setPhotoUpload(prev => ({ ...prev, purpose: 'verify_done' }))
      }
    }
  }

  // Voice Modal Functions
  const openVoiceModal = () => {
    setShowVoiceModal(true)
    setVoiceModalText('')
  }

  const closeVoiceModal = () => {
    setShowVoiceModal(false)
    setVoiceModalText('')
    if (voiceModalRecognitionRef) {
      voiceModalRecognitionRef.stop()
      voiceModalRecognitionRef.abort()
    }
  }

  const startVoiceModalListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showMessage('error', 'Speech recognition not supported')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setVoiceModalListening(true)
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }
      if (finalTranscript) {
        setVoiceModalText(prev => prev + finalTranscript + ' ')
      }
    }

    recognition.onend = () => {
      setVoiceModalListening(false)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setVoiceModalListening(false)
    }

    recognition.start()
    setVoiceModalRecognitionRef(recognition)
  }

  const stopVoiceModalListening = () => {
    if (voiceModalRecognitionRef) {
      voiceModalRecognitionRef.stop()
      voiceModalRecognitionRef.abort()
      setVoiceModalListening(false)
    }
  }

  const applyVoiceModalText = () => {
    if (voiceModalText.trim()) {
      setPhotoUpload(prev => ({
        ...prev,
        analysis: prev.analysis + '\n\nVoice Description: ' + voiceModalText.trim()
      }))
      closeVoiceModal()
    }
  }

  // AI Suggestions
  const generateAiSuggestions = async () => {
    try {
      const perplexityApiKey = import.meta.env.VITE_PERPLEXITY_API_KEY
      if (!perplexityApiKey) {
        console.log('Perplexity API key not configured')
        return
      }

      const photoSummary = photos.map(photo => ({
        purpose: photo.purpose,
        analysis: photo.analysis,
        created_at: photo.created_at,
        task_id: photo.task_id
      }))

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${perplexityApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: `Analyze this photo collection and provide 3-5 suggestions for improving photo organization, analysis, or workflow. Return as JSON array with 'suggestion' and 'reason' fields. Photos: ${JSON.stringify(photoSummary)}`
            }
          ]
        })
      })

      if (response.ok) {
        const data = await response.json()
        const messageContent = data.choices[0].message.content
        const suggestions = JSON.parse(messageContent)
        setAiSuggestions(suggestions)
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error)
    }
  }

  // Search and Filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPhotos(photos)
    } else {
      const filtered = photos.filter(photo => 
        photo.analysis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.purpose?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredPhotos(filtered)
    }
  }, [searchQuery, photos])

  return (
    <div className="container">
      {!isOnline && (
        <div className="offline-alert">
          ⚠️ You are currently offline. Some features may not work properly.
        </div>
      )}

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Photo Upload Section */}
      <div className="card">
        <h3>Upload Photo for Project Analysis</h3>
        <p style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
          Upload a photo to get clarification, next steps, or verify if work is done correctly.
        </p>
        
        {!photoUpload.showForm ? (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {photoUpload.cameraAvailable && (
              <button
                className="btn"
                onClick={() => {
                  handleUploadModeChange('camera')
                  startCamera()
                }}
                title="Use camera to take photo"
                aria-label="Use camera to take photo"
              >
                <Camera size={16} style={{ marginRight: '0.5rem' }} aria-hidden="true" />
                Use Camera
              </button>
            )}
            <button
              className="btn"
              onClick={() => {
                handleUploadModeChange('file')
                setPhotoUpload(prev => ({ ...prev, showForm: true }))
              }}
              title="Upload photo from file"
              aria-label="Upload photo from file"
            >
              <Upload size={16} style={{ marginRight: '0.5rem' }} aria-hidden="true" />
              Upload File
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  stopCamera()
                  setPhotoUpload({ 
                    ...photoUpload, 
                    showForm: false, 
                    photo: null, 
                    photoUrl: '', 
                    analysis: '',
                    selectedTaskId: '',
                    uploadMode: 'file',
                    uploadType: 'file',
                    purpose: 'clarification'
                  })
                }}
              >
                <X size={16} style={{ marginRight: '0.5rem' }} />
                Cancel
              </button>
            </div>

            {/* Upload Mode Selection */}
            <fieldset className="form-group" style={{ marginBottom: '1rem', border: 'none', padding: '0' }}>
              <legend className="form-label" style={{ padding: '0', marginBottom: '0.5rem' }}>Upload Method</legend>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: `2px solid ${photoUpload.uploadMode === 'camera' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  backgroundColor: photoUpload.uploadMode === 'camera' ? 'var(--primary-color)' : 'transparent',
                  color: photoUpload.uploadMode === 'camera' ? 'white' : 'var(--text-color)',
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="radio"
                    name="uploadMode"
                    value="camera"
                    checked={photoUpload.uploadMode === 'camera'}
                    onChange={(e) => handleUploadModeChange(e.target.value)}
                    style={{ display: 'none' }}
                    aria-labelledby="camera-option"
                  />
                  <Camera size={16} aria-hidden="true" />
                  <span id="camera-option">Use Camera</span>
                </label>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: `2px solid ${photoUpload.uploadMode === 'file' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  backgroundColor: photoUpload.uploadMode === 'file' ? 'var(--primary-color)' : 'transparent',
                  color: photoUpload.uploadMode === 'file' ? 'white' : 'var(--text-color)',
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="radio"
                    name="uploadMode"
                    value="file"
                    checked={photoUpload.uploadMode === 'file'}
                    onChange={(e) => handleUploadModeChange(e.target.value)}
                    style={{ display: 'none' }}
                    aria-labelledby="file-option"
                  />
                  <Upload size={16} aria-hidden="true" />
                  <span id="file-option">Upload File</span>
                </label>
              </div>
            </fieldset>

            {/* Purpose Selection */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="analysis-purpose">Analysis Purpose</label>
              <select
                id="analysis-purpose"
                name="analysis-purpose"
                className="form-input"
                value={photoUpload.purpose}
                onChange={(e) => setPhotoUpload({...photoUpload, purpose: e.target.value})}
              >
                <option value="clarification">
                  🔍 Clarification - Describe the issue
                </option>
                <option value="next_steps">
                  ➡️ Next Steps - Give instructions
                </option>
                <option value="verify_done">
                  ✅ Verify Done - Confirm if work is correct
                </option>
              </select>
            </div>
            
            {/* Camera Mode */}
            {photoUpload.cameraMode && (
              <div style={{ marginBottom: '1rem' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ 
                    width: '100%', 
                    maxWidth: '400px', 
                    borderRadius: '8px',
                    border: '2px solid var(--border-color)'
                  }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div style={{ marginTop: '1rem' }}>
                  <button
                    className="btn"
                    onClick={capturePhoto}
                    style={{ marginRight: '1rem' }}
                    title="Capture photo with camera"
                    aria-label="Capture photo with camera"
                  >
                    <Camera size={16} style={{ marginRight: '0.5rem' }} aria-hidden="true" />
                    Capture Photo
                  </button>
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label" htmlFor="task-select-photos">Link to Task (optional)</label>
              <select
                id="task-select-photos"
                name="task-select-photos"
                className="form-input"
                value={photoUpload.selectedTaskId}
                onChange={(e) => setPhotoUpload({...photoUpload, selectedTaskId: e.target.value})}
              >
                <option value="">Select a task...</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.task_list} ({task.status})
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload Mode */}
            {!photoUpload.cameraMode && (
              <div className="form-group">
                <label className="form-label" htmlFor="photo-file-upload">Upload Photo</label>
                <input
                  id="photo-file-upload"
                  name="photo-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="form-input"
                  disabled={photoUpload.loading}
                />
              </div>
            )}

            {photoUpload.photo && (
              <div style={{ marginTop: '1rem' }}>
                <img 
                  src={URL.createObjectURL(photoUpload.photo)} 
                  alt="Uploaded" 
                  style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                />
              </div>
            )}

            {photoUpload.loading && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Brain size={20} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
                Analyzing photo for {getPurposeLabel(photoUpload.purpose)}...
              </div>
            )}

            {photoUpload.analysis && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ 
                  backgroundColor: 'var(--light-color)', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  border: '2px solid var(--primary-color)'
                }}>
                  {photoUpload.analysis}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Photos List */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Project Photos</h3>
          <button
            className="btn btn-secondary"
            onClick={loadPhotos}
            disabled={loading}
            title="Refresh photos"
            aria-label="Refresh photos"
          >
            <RotateCcw size={16} style={{ marginRight: '0.5rem' }} aria-hidden="true" />
            Refresh
          </button>
        </div>
        
        {loading && photos.length === 0 ? (
          <div className="loading">Loading photos...</div>
        ) : photos.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--secondary-color)' }}>
            No photos uploaded yet. Upload a photo above to get started!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {photos.map(photo => {
              const linkedTask = tasks.find(t => t.id === photo.task_id)
              
              return (
                <div key={photo.id} style={{ 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  padding: '1rem',
                  backgroundColor: 'var(--light-color)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {getStatusIcon(photo.response)}
                        <span style={{ 
                          fontWeight: '600',
                          color: getStatusColor(photo.response)
                        }}>
                          Project Photo
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--secondary-color)' }}>
                          {new Date(photo.created_at).toLocaleDateString()}
                        </span>
                        {photo.purpose && (
                          <span style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.25rem',
                            fontSize: '0.8rem', 
                            marginLeft: '0.5rem',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            borderRadius: '4px'
                          }}>
                            {getPurposeIcon(photo.purpose)}
                            {getPurposeLabel(photo.purpose)}
                          </span>
                        )}
                        {photo.upload_type && (
                          <span style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.25rem',
                            fontSize: '0.8rem', 
                            color: 'var(--primary-color)',
                            marginLeft: '0.5rem'
                          }}>
                            {getUploadTypeIcon(photo.upload_type)}
                            {photo.upload_type}
                          </span>
                        )}
                      </div>
                      
                      {linkedTask && (
                        <div style={{ 
                          fontSize: '0.9rem', 
                          color: 'var(--primary-color)',
                          marginBottom: '0.5rem'
                        }}>
                          📋 Linked to: {linkedTask.task_list}
                        </div>
                      )}
                    </div>
                    
                    <button
                      className="btn btn-danger"
                      onClick={() => deletePhoto(photo.id)}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      title="Delete photo"
                      aria-label="Delete photo"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <img 
                      src={photo.photo_url} 
                      alt="Project" 
                      style={{ 
                        width: '120px', 
                        height: '120px', 
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: '2px solid var(--border-color)'
                      }}
                    />
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        backgroundColor: 'white', 
                        padding: '0.75rem', 
                        borderRadius: '6px',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        maxHeight: '120px',
                        overflow: 'auto',
                        border: '2px solid var(--primary-color)'
                      }}>
                        {photo.response}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Voice Input Section */}
      <div style={{ 
        marginTop: '1rem', 
        padding: '1rem', 
        backgroundColor: isListening ? 'var(--warning-color)' : 'var(--light-color)', 
        borderRadius: '8px',
        border: isListening ? '2px solid var(--warning-color)' : '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <h4 style={{ 
          marginBottom: '0.5rem', 
          color: isListening ? 'white' : 'var(--primary-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <Mic size={20} />
          Voice Photo Description
        </h4>
        
        {/* Voice Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
          <button
            onClick={isListening ? stopListening : startListening}
            style={{
              padding: '1rem 2rem',
              borderRadius: '50px',
              border: 'none',
              backgroundColor: isListening ? '#dc3545' : 'var(--primary-color)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
              boxShadow: isListening ? '0 0 20px rgba(220, 53, 69, 0.5)' : '0 2px 8px rgba(0,0,0,0.1)',
              animation: isListening ? 'pulse 2s infinite' : 'none'
            }}
          >
            {isListening ? (
              <>
                <Square size={20} />
                STOP LISTENING
              </>
            ) : (
              <>
                <Mic size={20} />
                Quick Voice
              </>
            )}
          </button>
          
          <button
            onClick={openVoiceModal}
            style={{
              padding: '1rem 2rem',
              borderRadius: '50px',
              border: '2px solid var(--primary-color)',
              backgroundColor: 'white',
              color: 'var(--primary-color)',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            <MessageSquare size={20} />
            Voice Modal
          </button>
        </div>
        
        {/* Voice Status */}
        {isListening && (
          <div style={{ 
            color: 'white', 
            fontSize: '0.9rem',
            marginBottom: '0.5rem',
            textAlign: 'center',
            fontWeight: '600'
          }}>
            🎤 LISTENING - Click "STOP LISTENING" to stop
          </div>
        )}
        
        {/* Voice Transcript */}
        {transcript && (
          <div style={{ 
            marginTop: '0.5rem',
            padding: '0.5rem',
            backgroundColor: 'white',
            borderRadius: '4px',
            fontSize: '0.9rem',
            color: 'var(--text-color)',
            minHeight: '40px'
          }}>
            <strong>You said:</strong> {transcript}
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--light-color)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ color: 'var(--primary-color)', margin: 0 }}>🔍 Search Photos</h4>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Search size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search photos by analysis or purpose..."
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                minWidth: '200px'
              }}
            />
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--light-color)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ color: 'var(--primary-color)', margin: 0 }}>🤖 AI Photo Suggestions</h4>
          <button
            onClick={generateAiSuggestions}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Brain size={16} />
            Get AI Suggestions
          </button>
        </div>
        
        {aiSuggestions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} style={{ 
                padding: '0.75rem', 
                backgroundColor: 'white', 
                borderRadius: '6px',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{suggestion.suggestion}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary-color)' }}>{suggestion.reason}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Voice Modal */}
      {showVoiceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>🎤 Voice Photo Description</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <textarea
                value={voiceModalText}
                onChange={(e) => setVoiceModalText(e.target.value)}
                placeholder="Your voice input will appear here..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                onClick={voiceModalListening ? stopVoiceModalListening : startVoiceModalListening}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: voiceModalListening ? '#dc3545' : 'var(--primary-color)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {voiceModalListening ? <Square size={16} /> : <Mic size={16} />}
                {voiceModalListening ? 'Stop' : 'Start'} Recording
              </button>
              
              <button
                onClick={applyVoiceModalText}
                disabled={!voiceModalText.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: voiceModalText.trim() ? 'var(--success-color)' : 'var(--secondary-color)',
                  color: 'white',
                  cursor: voiceModalText.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Add Description
              </button>
              
              <button
                onClick={closeVoiceModal}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'white',
                  color: 'var(--text-color)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Photos 