import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
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

const farmerReplies = [
  'My tomato leaves are turning yellow.',
  'For around one week.',
  'Yes.',
]

const mockedApiResponses = [
  {
    status: 'asking',
    question: 'How long has this been happening?',
    diagnosis: null,
    advice: null,
  },
  {
    status: 'asking',
    question: 'Do you notice brown spots?',
    diagnosis: null,
    advice: null,
  },
  {
    status: 'diagnosed',
    question: null,
    diagnosis: 'Early Blight',
    advice: 'Remove infected leaves and apply Mancozeb.',
  },
]

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

function speakText(text, onStart, onEnd) {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.()
    return null
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.95
  utterance.pitch = 1
  utterance.volume = 1

  utterance.onstart = () => onStart?.()
  utterance.onend = () => onEnd?.()
  utterance.onerror = () => onEnd?.()

  window.speechSynthesis.speak(utterance)
  return utterance
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

function DiagnosisResult({ onHearAgain, onReset, evidence }) {
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
                Early Blight
              </h2>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
            <Leaf className="h-4 w-4" />
            Disease Identified
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[1.5rem] border border-emerald-100 bg-[linear-gradient(135deg,#f0fdf4,#ffffff)] p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Recommendations
              </p>
              <ul className="mt-4 space-y-3 text-[15px] leading-7 text-slate-700">
                {[
                  'Remove infected leaves',
                  'Apply Mancozeb fungicide',
                  'Avoid overhead watering',
                  'Monitor for one week',
                ].map((item) => (
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
          </div>

          <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2d6a4f]">
              Quick advisory
            </p>
            <p className="mt-4 text-[15px] leading-7 text-slate-700">
              Remove infected leaves and apply Mancozeb. Keep foliage dry, avoid overhead watering, and observe disease spread over the next week.
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
  const [responseIndex, setResponseIndex] = useState(0)
  const [isThinking, setIsThinking] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [additionalInfo, setAdditionalInfo] = useState('')

  const chatContainerRef = useRef(null)
  const timeoutRefs = useRef([])

  const statusLabel = useMemo(() => statusConfig[uiStatus]?.label ?? 'Ready', [uiStatus])

  const evidence = useMemo(
    () => ({
      imageUploaded: Boolean(imageFile),
      videoUploaded: Boolean(videoFile),
      additionalInfo: additionalInfo.trim().length > 0,
    }),
    [imageFile, videoFile, additionalInfo]
  )

  const clearAllTimers = useCallback(() => {
    timeoutRefs.current.forEach((timer) => clearTimeout(timer))
    timeoutRefs.current = []
  }, [])

  const addTimer = useCallback((callback, delay) => {
    const timer = setTimeout(callback, delay)
    timeoutRefs.current.push(timer)
  }, [])

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

  const playAiSpeech = useCallback((text, onDone, completed = false) => {
    speakText(
      text,
      () => setUiStatus('speaking'),
      () => {
        setUiStatus(completed ? 'complete' : 'ready')
        onDone?.()
      }
    )
  }, [])

  const resetDiagnosis = useCallback(() => {
    clearAllTimers()
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }

    setConversation([])
    setUiStatus('ready')
    setResponseIndex(0)
    setIsThinking(false)
    setHasCompleted(false)
    setImageFile(null)
    setImagePreview('')
    setVideoFile(null)
    setAdditionalInfo('')
  }, [clearAllTimers, imagePreview])

  const speakFinalAdvice = useCallback(() => {
    const finalText =
      'Diagnosis complete. Early Blight. Remove infected leaves, apply Mancozeb fungicide, avoid overhead watering, and monitor for one week.'

    playAiSpeech(finalText, null, true)
  }, [playAiSpeech])

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

  const startDiagnosisFlow = useCallback(() => {
    if (isThinking || uiStatus === 'speaking' || hasCompleted) return
    if (responseIndex >= mockedApiResponses.length || responseIndex >= farmerReplies.length) return

    setUiStatus('listening')

    addTimer(() => {
      appendMessage('farmer', farmerReplies[responseIndex])
      setUiStatus('thinking')
      setIsThinking(true)

      addTimer(() => {
        const currentResponse = mockedApiResponses[responseIndex]
        setIsThinking(false)

        if (currentResponse.status === 'asking') {
          appendMessage('ai', currentResponse.question)
          setResponseIndex((prev) => prev + 1)
          playAiSpeech(currentResponse.question)
        }

        if (currentResponse.status === 'diagnosed') {
          const finalMessage = `Diagnosis: ${currentResponse.diagnosis}\n\nAdvice:\nRemove infected leaves.\nApply Mancozeb fungicide.\nAvoid overhead watering.\nMonitor for one week.`
          appendMessage('ai', finalMessage)
          setResponseIndex((prev) => prev + 1)
          setHasCompleted(true)
          playAiSpeech(
            'Diagnosis complete. Early Blight. Remove infected leaves. Apply Mancozeb fungicide. Avoid overhead watering. Monitor for one week.',
            null,
            true
          )
        }
      }, 1000)
    }, 650)
  }, [
    addTimer,
    appendMessage,
    hasCompleted,
    isThinking,
    playAiSpeech,
    responseIndex,
    uiStatus,
  ])

  useEffect(() => {
    scrollToBottom()
  }, [conversation, isThinking, scrollToBottom])

  useEffect(() => {
    return () => {
      clearAllTimers()
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [clearAllTimers, imagePreview])

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

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="sticky top-4 z-40 mb-6 rounded-[1.8rem] border border-white/60 bg-white/75 px-5 py-4 shadow-[0_20px_50px_rgba(16,24,40,0.08)] backdrop-blur-2xl"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="group flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#2d6a4f] via-[#40916c] to-[#52b788] text-white shadow-[0_12px_28px_rgba(45,106,79,0.24)]">
                  <Leaf className="h-5 w-5" />
                  <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.3),transparent)] opacity-0 transition duration-500 group-hover:opacity-100" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold tracking-tight text-[#173620]">
                      KisanSaathi
                    </span>
                    <Sparkles className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-sm text-slate-500">Voice-powered crop diagnosis</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  AI Crop Diagnosis
                </p>
                <p className="mt-1 text-sm text-slate-500">Realtime mock interaction</p>
              </div>
              <StatusBadge status={uiStatus} />
            </div>
          </div>
        </motion.header>

        <div className="grid flex-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex min-h-[42rem] flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white/72 shadow-[0_30px_80px_rgba(24,39,75,0.10)] backdrop-blur-2xl"
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

              <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm text-emerald-700 sm:flex">
                <Waves className="h-4 w-4" />
                {statusLabel}
              </div>
            </div>

            <div
              ref={chatContainerRef}
              className="relative z-10 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6"
            >
              <div className="mx-auto flex h-full max-w-4xl flex-col">
                <AnimatePresence mode="popLayout">
                  {conversation.length === 0 && !isThinking && (
                    <motion.div
                      key="empty-state"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-1 items-center justify-center"
                    >
                      <div className="w-full max-w-2xl rounded-[2rem] border border-emerald-100/70 bg-[linear-gradient(135deg,rgba(240,253,244,0.92),rgba(255,255,255,0.95))] p-8 text-center shadow-[0_18px_50px_rgba(45,106,79,0.08)]">
                        <motion.div
                          animate={{ scale: [1, 1.06, 1], rotate: [0, 4, 0] }}
                          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                          className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-gradient-to-br from-[#2d6a4f] via-[#40916c] to-[#52b788] text-white shadow-[0_18px_40px_rgba(45,106,79,0.24)]"
                        >
                          <Mic className="h-8 w-8" />
                        </motion.div>

                        <h2 className="mt-6 font-serif text-4xl text-[#173620]">
                          Start your crop diagnosis
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-slate-600">
                          Voice is the primary interaction. You can also optionally add crop images, video, or extra context to help improve diagnosis quality.
                        </p>

                        <div className="mt-8 grid gap-3 sm:grid-cols-3">
                          {[
                            ['Voice-first', 'Natural farmer interaction'],
                            ['Optional inputs', 'Image, video, and notes'],
                            ['Fast outcome', 'Clear guidance and next steps'],
                          ].map(([title, text]) => (
                            <div
                              key={title}
                              className="rounded-[1.4rem] border border-white/70 bg-white/80 p-4 shadow-sm"
                            >
                              <p className="font-semibold text-[#173620]">{title}</p>
                              <p className="mt-1 text-sm text-slate-500">{text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {(conversation.length > 0 || isThinking) && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-4 pb-10"
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
              </div>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6"
          >
            {!hasCompleted ? (
              <>
                <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/78 p-5 shadow-[0_24px_70px_rgba(24,39,75,0.10)] backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(82,183,136,0.18),_transparent_25%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,253,244,0.88))]" />
                  <div className="relative z-10">
                    <div className="mb-4">
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                        Primary Voice Input
                      </p>
                      <h3 className="mt-2 font-serif text-3xl text-[#173620]">Tap to Speak</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Voice is the default way to interact with KisanSaathi.
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-4 py-4">
                      <motion.button
                        onClick={startDiagnosisFlow}
                        disabled={isThinking || uiStatus === 'speaking'}
                        whileHover={{ scale: 1.04, y: -3 }}
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
                          repeat:
                            uiStatus === 'listening' || uiStatus === 'speaking'
                              ? Infinity
                              : 0,
                          ease: 'easeOut',
                        }}
                        className={`group relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${statusConfig[uiStatus].mic} text-white shadow-[0_24px_50px_rgba(45,106,79,0.28)] disabled:cursor-not-allowed disabled:opacity-70`}
                      >
                        <div className="absolute inset-[7px] rounded-full border border-white/25" />
                        <Mic className="relative z-10 h-9 w-9" />
                        <div className="absolute inset-0 rounded-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.24),transparent)] opacity-0 transition duration-500 group-hover:opacity-100" />
                      </motion.button>

                      <div className="text-center">
                        <p className="text-base font-semibold text-[#2d6a4f]">{statusLabel}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {uiStatus === 'ready' && 'Tap to speak'}
                          {uiStatus === 'listening' && 'Listening...'}
                          {uiStatus === 'thinking' && 'Processing...'}
                          {uiStatus === 'speaking' && 'Speaking...'}
                          {uiStatus === 'complete' && 'Diagnosis complete'}
                        </p>
                      </div>

                      <motion.button
                        whileHover={{ y: -2, scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={startDiagnosisFlow}
                        disabled={isThinking || uiStatus === 'speaking'}
                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2d6a4f] via-[#40916c] to-[#52b788] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(45,106,79,0.24)] disabled:opacity-70"
                      >
                        <Mic className="h-4 w-4" />
                        Start Voice Interaction
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 px-1">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
                  <div className="rounded-full bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 shadow-sm">
                    OR
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
                </div>

                <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/78 p-5 shadow-[0_24px_70px_rgba(24,39,75,0.10)] backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(233,196,106,0.16),_transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,253,249,0.9))]" />
                  <div className="relative z-10">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
                        Optional Enhancements
                      </p>
                      <h3 className="mt-2 font-serif text-3xl text-[#173620]">
                        Provide Additional Information
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        These inputs are optional and help improve diagnosis accuracy.
                      </p>
                    </div>

                    <div className="mt-6 space-y-4">
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

                      <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
                        <label className="block">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-300 text-white shadow-sm">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-base font-semibold text-[#173620]">
                                Anything else you'd like the AI to know?
                              </p>
                              <p className="text-sm text-slate-500">(Optional)</p>
                            </div>
                          </div>

                          <textarea
                            rows={5}
                            value={additionalInfo}
                            onChange={(e) => setAdditionalInfo(e.target.value)}
                            placeholder='Example: "My crop has been wilting after heavy rainfall."'
                            className="w-full rounded-[1.25rem] border border-emerald-100 bg-[#f8fdf9] px-4 py-3 text-[15px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#52b788] focus:ring-4 focus:ring-emerald-100"
                          />
                        </label>
                      </div>

                      <motion.button
                        whileHover={{ y: -2, scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={startDiagnosisFlow}
                        disabled={isThinking || uiStatus === 'speaking'}
                        className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2d6a4f] via-[#40916c] to-[#52b788] px-6 py-4 text-base font-semibold text-white shadow-[0_22px_36px_rgba(45,106,79,0.24)] disabled:opacity-70"
                      >
                        <Leaf className="h-5 w-5" />
                        Start AI Diagnosis
                      </motion.button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <DiagnosisResult
                onHearAgain={speakFinalAdvice}
                onReset={resetDiagnosis}
                evidence={evidence}
              />
            )}
          </motion.aside>
        </div>
      </div>
    </div>
  )
}