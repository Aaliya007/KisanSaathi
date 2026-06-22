import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  FileImage,
  FileText,
  Leaf,
  LoaderCircle,
  Mic,
  RefreshCcw,
  Sparkles,
  Upload,
  Video,
  Volume2,
  Waves,
  XCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { ApiError, sendImage, sendText, speak } from '../services/api'
import logo from '../assets/logo.png'

function createSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function getCurrentLocation() {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({ latitude: 0, longitude: 0 })
      return
    }

    const timeoutId = window.setTimeout(() => {
      resolve({ latitude: 0, longitude: 0 })
    }, 5000)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        window.clearTimeout(timeoutId)
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => {
        window.clearTimeout(timeoutId)
        resolve({ latitude: 0, longitude: 0 })
      },
      {
        enableHighAccuracy: false,
        maximumAge: 300000,
        timeout: 4500,
      }
    )
  })
}

function buildApiMessage(transcript, additionalInfo) {
  const notes = additionalInfo.trim()

  if (!notes) {
    return transcript
  }

  return `${transcript}\n\nAdditional information: ${notes}`
}

function getFriendlyErrorMessage(error) {
  if (error instanceof ApiError) {
    if (error.status === 422) {
      return 'The diagnosis service could not understand part of the request. Please try again with a short, clear description.'
    }

    if (error.status >= 500) {
      return 'The diagnosis service is temporarily unavailable. Please try again in a moment.'
    }
  }

  return 'I am having trouble reaching the diagnosis service right now. Please check your connection and try again.'
}

const statusConfig = {
  ready: {
    label: 'Ready',
    badge: 'bg-emerald-100/90 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    mic: 'from-[#2d6a4f] via-[#40916c] to-[#52b788]',
  },
  listening: {
    label: 'Listening...',
    badge: 'bg-sky-100/90 text-sky-800 border-sky-200',
    dot: 'bg-sky-500',
    mic: 'from-sky-500 via-cyan-500 to-teal-400',
  },
  thinking: {
    label: 'Thinking...',
    badge: 'bg-amber-100/90 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    mic: 'from-amber-500 via-yellow-500 to-orange-400',
  },
  speaking: {
    label: 'Speaking...',
    badge: 'bg-violet-100/90 text-violet-800 border-violet-200',
    dot: 'bg-violet-500',
    mic: 'from-violet-500 via-fuchsia-500 to-pink-400',
  },
  complete: {
    label: 'Diagnosis Complete',
    badge: 'bg-emerald-100/90 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    mic: 'from-[#1a4a2e] via-[#2d6a4f] to-[#52b788]',
  },
}

const messageVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

function ThinkingDots() {
  return (
    <div className="inline-flex items-center gap-1">
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15 }}
          className="h-1.5 w-1.5 rounded-full bg-amber-500"
        />
      ))}
    </div>
  )
}

function FloatingOrb({ className, duration = 12 }) {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        scale: [1, 1.06, 1],
      }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    />
  )
}

function StatusBadge({ status }) {
  const config = statusConfig[status]

  return (
    <motion.div
      key={status}
      initial={{ opacity: 0, scale: 0.92, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold shadow-sm backdrop-blur ${config.badge}`}
    >
      <motion.span
        animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className={`h-2.5 w-2.5 rounded-full ${config.dot}`}
      />
      {config.label}
    </motion.div>
  )
}

function MessageBubble({ message }) {
  const isFarmer = message.sender === 'farmer'

  return (
    <motion.div
      variants={messageVariants}
      layout
      className={`flex w-full ${isFarmer ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[88%] items-end gap-3 sm:max-w-[72%] ${isFarmer ? 'flex-row-reverse' : ''}`}>
        <motion.div
          whileHover={{ scale: 1.04 }}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
            isFarmer
              ? 'border border-slate-200 bg-white text-slate-700'
              : 'bg-gradient-to-br from-[#2d6a4f] via-[#40916c] to-[#52b788] text-white'
          }`}
        >
          {isFarmer ? <Mic className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
        </motion.div>

        <div
          className={`relative overflow-hidden rounded-[1.4rem] px-4 py-3.5 shadow-sm ${
            isFarmer
              ? 'rounded-br-md border border-slate-200 bg-white text-slate-700'
              : 'rounded-bl-md border border-emerald-100 bg-[linear-gradient(135deg,rgba(240,253,244,0.98),rgba(216,243,220,0.95))] text-[#173620]'
          }`}
        >
          {!isFarmer && (
            <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.55),transparent)] opacity-50" />
          )}
          <div className="relative z-10 whitespace-pre-line text-[15px] leading-7">{message.text}</div>
        </div>
      </div>
    </motion.div>
  )
}

function UploadBox({
  id,
  title,
  subtitle,
  icon: Icon,
  accept,
  onChange,
  preview,
  filename,
  previewType = 'text',
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
      <label
        htmlFor={id}
        className="group block cursor-pointer rounded-[1.35rem] border-2 border-dashed border-emerald-200 bg-[linear-gradient(135deg,rgba(240,253,244,0.75),rgba(255,255,255,0.94))] p-5 transition hover:border-[#52b788] hover:shadow-[0_18px_36px_rgba(45,106,79,0.08)]"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2d6a4f] via-[#40916c] to-[#52b788] text-white shadow-lg transition group-hover:scale-105">
            <Icon className="h-6 w-6" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-[#173620]">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#2d6a4f] shadow-sm">
            <Upload className="h-4 w-4" />
            Choose file
          </div>
        </div>

        <input id={id} type="file" accept={accept} className="hidden" onChange={onChange} />
      </label>

      <AnimatePresence>
        {(preview || filename) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 overflow-hidden rounded-[1.2rem] border border-emerald-100 bg-[#f8fdf9] p-3"
          >
            {previewType === 'image' && preview ? (
              <div className="flex items-center gap-3">
                <img
                  src={preview}
                  alt="Crop preview"
                  className="h-16 w-16 rounded-xl object-cover shadow-sm"
                />
                <div>
                  <p className="text-sm font-semibold text-[#173620]">Image uploaded</p>
                  <p className="text-xs text-slate-500">{filename}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-[#2d6a4f]">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#173620]">Video uploaded</p>
                  <p className="text-xs text-slate-500">{filename}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function EvidenceRow({ label, active }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
          active
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-slate-100 text-slate-500'
        }`}
      >
        {active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
        {active ? 'Included' : 'Not used'}
      </span>
    </div>
  )
}

function DiagnosisResult({ onHearAgain, onReset, evidence, result }) {
  const safeResult = result || {
    diagnosis: 'Diagnosis unavailable',
    advice: 'Please consult a local agricultural expert for the next best step.',
  }
  const recommendations = safeResult.advice
    .split(/\r?\n|(?<=\.)\s+/)
    .map((item) => item.trim())
    .filter(Boolean)

  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-[0_28px_80px_rgba(24,39,75,0.14)] backdrop-blur-xl sm:p-7"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(82,183,136,0.18),_transparent_25%),radial-gradient(circle_at_bottom_left,_rgba(233,196,106,0.22),_transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.94),rgba(240,253,244,0.82))]" />

      <div className="relative z-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-400 text-white shadow-lg">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Diagnosis Complete
              </p>
              <h2 className="mt-2 font-serif text-3xl text-[#153520] sm:text-4xl">
                {safeResult.diagnosis}
              </h2>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
            <Leaf className="h-4 w-4" />
            Disease Identified
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-[1.5rem] border border-emerald-100 bg-[linear-gradient(135deg,#f0fdf4,#ffffff)] p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Recommendations
            </p>
            <ul className="mt-4 space-y-3 text-[15px] leading-7 text-slate-700">
              {recommendations.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#2d6a4f] to-[#52b788]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.5rem] border border-amber-100 bg-[linear-gradient(135deg,#fff9e8,#ffffff)] p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
              Evidence Used
            </p>
            <div className="mt-4 space-y-3">
              <EvidenceRow label="Voice Conversation" active={true} />
              <EvidenceRow label="Image Uploaded" active={evidence.imageUploaded} />
              <EvidenceRow label="Video Uploaded" active={evidence.videoUploaded} />
              <EvidenceRow label="Additional Information" active={evidence.additionalInfo} />
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2d6a4f]">
              Quick advisory
            </p>
            <p className="mt-4 text-[15px] leading-7 text-slate-700">
              {safeResult.advice}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onHearAgain}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2d6a4f] via-[#40916c] to-[#52b788] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(45,106,79,0.24)]"
              >
                <Volume2 className="h-4 w-4" />
                Hear Again
              </motion.button>

              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onReset}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm"
              >
                <RefreshCcw className="h-4 w-4" />
                Start New Diagnosis
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function DiagnosisPage() {
  const [conversation, setConversation] = useState([])
  const [uiStatus, setUiStatus] = useState('ready')
  const [sessionId, setSessionId] = useState(() => createSessionId())
  const [isThinking, setIsThinking] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)
  const [diagnosisResult, setDiagnosisResult] = useState(null)
  const [isFallbackMode, setIsFallbackMode] = useState(false)

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [additionalInfo, setAdditionalInfo] = useState('')

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition()

  const chatContainerRef = useRef(null)
  const audioRef = useRef(null)
  const audioUrlRef = useRef('')
  const hasStartedListeningRef = useRef(false)
  const hasObservedListeningRef = useRef(false)
  const transcriptTimeoutRef = useRef(null)

  const statusLabel = useMemo(() => statusConfig[uiStatus]?.label ?? 'Ready', [uiStatus])

  const evidence = useMemo(
    () => ({
      imageUploaded: Boolean(imageFile),
      videoUploaded: Boolean(videoFile),
      additionalInfo: additionalInfo.trim().length > 0,
    }),
    [imageFile, videoFile, additionalInfo]
  )

  const scrollToBottom = useCallback(() => {
    const el = chatContainerRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
      })
    })
  }, [])

  const appendMessage = useCallback((sender, text) => {
    setConversation((prev) => [
      ...prev,
      {
        id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sender,
        text,
      },
    ])
  }, [])

  const ensureSessionId = useCallback(() => {
    const nextSessionId = sessionId || createSessionId()
    if (!sessionId) {
      setSessionId(nextSessionId)
    }
    return nextSessionId
  }, [sessionId])

  const stopAiAudio = useCallback(() => {
    audioRef.current?.pause()
    audioRef.current = null

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = ''
    }
  }, [])

  const playAiSpeech = useCallback(
    async (text, onDone, completed = false) => {
      if (!text?.trim()) {
        setUiStatus(completed ? 'complete' : 'ready')
        onDone?.()
        return
      }

      stopAiAudio()
      setUiStatus('speaking')

      try {
        const speechAudio = await speak(text)
        const audioUrl = URL.createObjectURL(speechAudio)
        const audio = new Audio(audioUrl)

        audioRef.current = audio
        audioUrlRef.current = audioUrl

        audio.onended = () => {
          stopAiAudio()
          setUiStatus(completed ? 'complete' : 'ready')
          onDone?.()
        }

        audio.onerror = () => {
          stopAiAudio()
          setUiStatus(completed ? 'complete' : 'ready')
          appendMessage('ai', 'I could not play the voice response, but the text answer is shown here.')
          onDone?.()
        }

        await audio.play()
      } catch (error) {
        stopAiAudio()
        setUiStatus(completed ? 'complete' : 'ready')
        appendMessage('ai', 'I could not play the voice response, but the text answer is shown here.')
        onDone?.()
        console.error(error)
      }
    },
    [appendMessage, stopAiAudio]
  )

  const resetDiagnosis = useCallback(() => {
    hasStartedListeningRef.current = false
    hasObservedListeningRef.current = false
    if (transcriptTimeoutRef.current) {
      window.clearTimeout(transcriptTimeoutRef.current)
      transcriptTimeoutRef.current = null
    }
    SpeechRecognition.abortListening()
    resetTranscript()
    stopAiAudio()

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }

    setConversation([])
    setUiStatus('ready')
    setSessionId(createSessionId())
    setIsThinking(false)
    setHasCompleted(false)
    setDiagnosisResult(null)
    setIsFallbackMode(false)
    setImageFile(null)
    setImagePreview('')
    setVideoFile(null)
    setAdditionalInfo('')
  }, [imagePreview, resetTranscript, stopAiAudio])

  const speakFinalAdvice = useCallback(() => {
    if (!diagnosisResult) return

    playAiSpeech(diagnosisResult.advice, null, true)
  }, [diagnosisResult, playAiSpeech])

  const handleImageChange = useCallback(
    (event) => {
      const file = event.target.files?.[0]
      if (!file) return

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }

      const previewUrl = URL.createObjectURL(file)
      setImageFile(file)
      setImagePreview(previewUrl)
    },
    [imagePreview]
  )

  const handleVideoChange = useCallback((event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setVideoFile(file)
  }, [])

  const handleDiagnosisResponse = useCallback(
    (response, currentSessionId) => {
      setSessionId(response.session_id || currentSessionId)
      setIsThinking(false)

      if (response.source === 'Fallback AI') {
        setIsFallbackMode(true)
      }

      if (response.status === 'asking') {
        const question =
          response.question?.trim() ||
          'Please share a little more about what you are seeing on the crop.'

        appendMessage('ai', question)
        playAiSpeech(question)
        return
      }

      const diagnosis = response.diagnosis?.trim() || 'Diagnosis unavailable'
      const advice =
        response.advice?.trim() ||
        'Please consult a local agricultural expert for the next best step.'
      const finalMessage = `Diagnosis: ${diagnosis}\n\nAdvice:\n${advice}`

      appendMessage('ai', finalMessage)
      setDiagnosisResult({ diagnosis, advice })
      setHasCompleted(true)
      playAiSpeech(advice, null, true)
    },
    [appendMessage, playAiSpeech]
  )

  const handleTranscript = useCallback(
    async (transcript) => {
      const message = transcript.trim()
      console.log('Transcript', message)

      if (!message) {
        appendMessage('ai', 'I could not hear anything clearly. Please tap the microphone and try again.')
        setUiStatus('ready')
        return
      }

      appendMessage('farmer', message)
      setUiStatus('thinking')
      setIsThinking(true)

      try {
        const currentSessionId = ensureSessionId()
        const location = await getCurrentLocation()
        const apiMessage = buildApiMessage(message, additionalInfo)
        console.log('Sending to backend')
        const response = imageFile
          ? await sendImage({
              sessionId: currentSessionId,
              message: apiMessage,
              image: imageFile,
              latitude: location.latitude,
              longitude: location.longitude,
            })
          : await sendText({
              sessionId: currentSessionId,
              message: apiMessage,
              latitude: location.latitude,
              longitude: location.longitude,
            })

        console.log('Response received', response)
        handleDiagnosisResponse(response, currentSessionId)
      } catch (error) {
        setIsThinking(false)
        setUiStatus('ready')
        appendMessage('ai', getFriendlyErrorMessage(error))
        console.error(error)
      }
    },
    [additionalInfo, appendMessage, ensureSessionId, handleDiagnosisResponse, imageFile]
  )

  const startDiagnosisFlow = useCallback(async () => {
    if (isThinking || uiStatus === 'speaking' || uiStatus === 'listening' || hasCompleted) return
    console.log('Mic clicked')

    if (!browserSupportsSpeechRecognition) {
      appendMessage(
        'ai',
        'Speech recognition is not available in this browser. Please try Chrome or another supported browser.'
      )
      return
    }

    try {
      resetTranscript()
      hasStartedListeningRef.current = true
      hasObservedListeningRef.current = false
      setUiStatus('listening')
      await SpeechRecognition.startListening({
        continuous: false,
        language: 'hi-IN',
      })
    } catch (error) {
      hasStartedListeningRef.current = false
      hasObservedListeningRef.current = false
      setUiStatus('ready')
      appendMessage(
        'ai',
        'I could not start voice recognition. Please check microphone permission and try again.'
      )
      console.error(error)
    }
  }, [
    appendMessage,
    browserSupportsSpeechRecognition,
    hasCompleted,
    isThinking,
    resetTranscript,
    uiStatus,
  ])

  useEffect(() => {
    scrollToBottom()
  }, [conversation, isThinking, scrollToBottom])

  useEffect(() => {
    if (!hasStartedListeningRef.current) return

    if (listening) {
      if (!hasObservedListeningRef.current) {
        hasObservedListeningRef.current = true
        console.log('Listening started')
      }
      return
    }

    if (!hasObservedListeningRef.current) return

    hasStartedListeningRef.current = false
    hasObservedListeningRef.current = false
    transcriptTimeoutRef.current = window.setTimeout(() => {
      transcriptTimeoutRef.current = null
      const finalTranscript = transcript
      resetTranscript()
      handleTranscript(finalTranscript)
    }, 250)
  }, [handleTranscript, listening, resetTranscript, transcript])

  useEffect(() => {
    return () => {
      hasStartedListeningRef.current = false
      hasObservedListeningRef.current = false
      if (transcriptTimeoutRef.current) {
        window.clearTimeout(transcriptTimeoutRef.current)
        transcriptTimeoutRef.current = null
      }
      SpeechRecognition.abortListening()
      stopAiAudio()
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview, stopAiAudio])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8fdf9] text-[#1b1b1b]">
      <div className="pointer-events-none absolute inset-0">
        <FloatingOrb
          duration={14}
          className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-emerald-200/35 blur-3xl"
        />
        <FloatingOrb
          duration={17}
          className="absolute right-[-5rem] top-44 h-80 w-80 rounded-full bg-yellow-200/30 blur-3xl"
        />
        <FloatingOrb
          duration={13}
          className="absolute left-[25%] bottom-20 h-64 w-64 rounded-full bg-teal-200/25 blur-3xl"
        />
        <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(45,106,79,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(45,106,79,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl space-y-8 px-4 pb-16 pt-6 sm:px-6 sm:space-y-10 lg:space-y-12">
        {/* SECTION 1 — Page Header */}
        <motion.header
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[1.8rem] border-2 border-emerald-200/70 shadow-[0_24px_60px_rgba(45,106,79,0.14)] ring-1 ring-white/80"
        >
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center"
            style={{
              backgroundImage:
                'url(https://tse2.mm.bing.net/th/id/OIP.UCGOfvncsUCdzo6AnK9p8wHaEJ?pid=Api&P=0&h=180)',
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_0%,rgba(240,253,244,0.88)_45%,rgba(255,255,255,0.92)_100%)] backdrop-blur-[2px]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(82,183,136,0.22),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(233,196,106,0.18),transparent_38%)]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-[10px] rounded-[1.35rem] border border-emerald-100/80 sm:inset-[12px]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent"
            aria-hidden="true"
          />

          <div className="relative z-10 px-5 py-6 sm:px-8 sm:py-8">
            <Link
              to="/"
              className="group mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/85 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-md transition hover:border-[#52b788] hover:bg-white hover:text-[#2d6a4f] hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
              Back to Home
            </Link>

            <div className="flex flex-col items-center rounded-[1.5rem] border border-white/70 bg-white/55 px-6 py-7 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl sm:px-10 sm:py-8">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[20px] sm:h-16 sm:w-16 sm:rounded-[24px] lg:h-20 lg:w-20 lg:rounded-[28px]">
                  <img
                    src={logo}
                    alt="KisanSaathi Logo"
                    className="h-full w-full object-cover object-center scale-105"
                    draggable={false}
                  />
                </div>

                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h1 className="font-serif text-3xl text-[#173620] sm:text-4xl">KisanSaathi</h1>
                    <Sparkles className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="mt-1 max-w-md text-[15px] leading-7 text-slate-600">
                    Voice-powered assistant for identifying crop issues and getting actionable advice.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 rounded-full border border-emerald-100/80 bg-white/70 px-4 py-2.5 shadow-sm backdrop-blur-sm">
                <StatusBadge status={uiStatus} />
                {isFallbackMode && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100/90 px-3.5 py-2 text-xs font-semibold text-amber-800 shadow-sm">
                    ⚠ Fallback AI
                  </span>
                )}
              </div>

              {isFallbackMode && (
                <p className="mt-4 max-w-lg rounded-[1rem] border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-900/85">
                  This diagnosis was generated using the local offline fallback engine because the cloud
                  AI is temporarily unavailable.
                </p>
              )}
            </div>
          </div>
        </motion.header>

        {/* SECTION 2 — Conversation Card (Primary) */}
        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex h-[min(600px,calc(100vh-12rem))] min-h-[500px] w-full flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white/72 shadow-[0_30px_80px_rgba(24,39,75,0.10)] backdrop-blur-2xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(82,183,136,0.18),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(233,196,106,0.2),_transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(248,253,249,0.86))]" />

          <div className="relative z-10 flex items-center justify-between border-b border-emerald-50/80 px-5 py-4 sm:px-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Conversation
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Voice-first interaction with AI follow-up questions
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <Waves className="h-4 w-4" />
              <span className="hidden sm:inline">{statusLabel}</span>
            </div>
          </div>

          <div
            ref={chatContainerRef}
            className="relative z-10 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6"
          >
            <AnimatePresence mode="popLayout">
              {conversation.length === 0 && !isThinking && (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex h-full items-center justify-center"
                >
                  <div className="w-full max-w-lg rounded-[2rem] border border-emerald-100/70 bg-[linear-gradient(135deg,rgba(240,253,244,0.92),rgba(255,255,255,0.95))] p-8 text-center shadow-[0_18px_50px_rgba(45,106,79,0.08)]">
                    <motion.div
                      animate={{ scale: [1, 1.06, 1], rotate: [0, 4, 0] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.6rem] bg-gradient-to-br from-[#2d6a4f] via-[#40916c] to-[#52b788] text-white shadow-[0_18px_40px_rgba(45,106,79,0.24)]"
                    >
                      <Mic className="h-7 w-7" />
                    </motion.div>

                    <h2 className="mt-5 font-serif text-3xl text-[#173620] sm:text-4xl">
                      Start your crop diagnosis
                    </h2>
                    <p className="mx-auto mt-3 max-w-sm text-[15px] leading-7 text-slate-600">
                      Tap the microphone below and describe what you see on your crop.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {(conversation.length > 0 || isThinking) && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-4 pb-4"
              >
                {conversation.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}

                <AnimatePresence>
                  {isThinking && (
                    <motion.div
                      key="thinking"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex justify-start"
                    >
                      <div className="flex max-w-[85%] items-end gap-3 sm:max-w-[70%]">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-400 text-white shadow-sm">
                          <LoaderCircle className="h-4.5 w-4.5 animate-spin" />
                        </div>
                        <div className="rounded-[1.4rem] rounded-bl-md border border-amber-100 bg-white px-4 py-3.5 text-[15px] text-slate-700 shadow-sm">
                          <div className="flex items-center gap-2">
                            <span>AI is thinking</span>
                            <ThinkingDots />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            <AnimatePresence>
              {uiStatus === 'listening' && transcript && (
                <motion.div
                  key="live-transcript"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-4 rounded-[1.25rem] border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm italic text-sky-800"
                >
                  {transcript}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative z-10 border-t border-emerald-50/80 bg-white/60 px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-5">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={startDiagnosisFlow}
                  disabled={isThinking || uiStatus === 'speaking' || uiStatus === 'listening' || hasCompleted}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  animate={
                    uiStatus === 'listening'
                      ? {
                          boxShadow: [
                            '0 0 0 0 rgba(14,165,233,0.28)',
                            '0 0 0 18px rgba(14,165,233,0)',
                          ],
                          scale: [1, 1.04, 1],
                        }
                      : uiStatus === 'speaking'
                      ? {
                          boxShadow: [
                            '0 0 0 0 rgba(168,85,247,0.25)',
                            '0 0 0 16px rgba(168,85,247,0)',
                          ],
                        }
                      : {}
                  }
                  transition={{
                    duration: 1.8,
                    repeat: uiStatus === 'listening' || uiStatus === 'speaking' ? Infinity : 0,
                    ease: 'easeOut',
                  }}
                  className={`group relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${statusConfig[uiStatus].mic} text-white shadow-[0_20px_40px_rgba(45,106,79,0.28)] disabled:cursor-not-allowed disabled:opacity-70 sm:h-[4.5rem] sm:w-[4.5rem]`}
                >
                  <div className="absolute inset-[6px] rounded-full border border-white/25" />
                  <Mic className="relative z-10 h-7 w-7" />
                  <div className="absolute inset-0 rounded-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.24),transparent)] opacity-0 transition duration-500 group-hover:opacity-100" />
                </motion.button>

                <div className="text-left">
                  <p className="text-base font-semibold text-[#2d6a4f]">{statusLabel}</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {uiStatus === 'ready' && 'Tap to speak'}
                    {uiStatus === 'listening' && 'Listening...'}
                    {uiStatus === 'thinking' && 'Processing...'}
                    {uiStatus === 'speaking' && 'Speaking...'}
                    {uiStatus === 'complete' && 'Diagnosis complete'}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={startDiagnosisFlow}
                disabled={isThinking || uiStatus === 'speaking' || uiStatus === 'listening' || hasCompleted}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2d6a4f] via-[#40916c] to-[#52b788] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(45,106,79,0.24)] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                <Mic className="h-4 w-4" />
                Start Voice Interaction
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* SECTION 3 — Optional Enhancements */}
        {!hasCompleted && (
          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-white/65 p-5 shadow-[0_20px_60px_rgba(24,39,75,0.07)] backdrop-blur-2xl sm:p-7"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(233,196,106,0.12),_transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,253,249,0.88))]" />

            <div className="relative z-10">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
                Optional Enhancements
              </p>
              <h2 className="mt-2 font-serif text-2xl text-[#173620] sm:text-3xl">
                Provide additional information for more accurate diagnosis.
              </h2>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                <UploadBox
                  id="crop-image"
                  title="Upload Crop Image"
                  subtitle="Supports PNG, JPG, JPEG • Optional"
                  icon={FileImage}
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  onChange={handleImageChange}
                  preview={imagePreview}
                  filename={imageFile?.name}
                  previewType="image"
                />

                <UploadBox
                  id="crop-video"
                  title="Upload Crop Video"
                  subtitle="Supports MP4, MOV, AVI • Optional"
                  icon={Video}
                  accept=".mp4,.mov,.avi,video/mp4,video/quicktime,video/x-msvideo"
                  onChange={handleVideoChange}
                  filename={videoFile?.name}
                  previewType="video"
                />

                <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur-xl md:col-span-2">
                  <label className="block">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-300 text-white shadow-sm">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-[#173620]">
                          Additional Problem Description
                        </p>
                        <p className="text-sm text-slate-500">
                          Share extra context about symptoms, timing, or conditions. (Optional)
                        </p>
                      </div>
                    </div>

                    <textarea
                      rows={4}
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      placeholder='Example: "My crop has been wilting after heavy rainfall."'
                      className="w-full rounded-[1.25rem] border border-emerald-100 bg-[#f8fdf9] px-4 py-3 text-[15px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#52b788] focus:ring-4 focus:ring-emerald-100"
                    />
                  </label>
                </div>
              </div>

              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={startDiagnosisFlow}
                disabled={isThinking || uiStatus === 'speaking' || uiStatus === 'listening'}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-6 py-3 text-sm font-semibold text-[#2d6a4f] shadow-sm transition hover:bg-emerald-50 disabled:opacity-70 md:w-auto"
              >
                <Leaf className="h-4 w-4" />
                Start AI Diagnosis
              </motion.button>
            </div>
          </motion.section>
        )}

        {/* SECTION 4 — Diagnosis Summary */}
        {hasCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <DiagnosisResult
              onHearAgain={speakFinalAdvice}
              onReset={resetDiagnosis}
              evidence={evidence}
              result={diagnosisResult}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}
