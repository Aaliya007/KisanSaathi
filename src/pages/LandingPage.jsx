import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  AudioLines,
  Brain,
  Mic,
  MessageCircleQuestion,
  Sparkles,
  Sprout,
  Volume2,
  Waves,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import logo from '../assets/logo.png'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
]

const steps = [
  {
    number: '01',
    icon: Mic,
    title: 'Speak',
    description: 'Describe your crop problem by voice, in your own language.',
    tint: 'from-emerald-100 via-white to-lime-100',
  },
  {
    number: '02',
    icon: MessageCircleQuestion,
    title: 'Question',
    description: 'AI asks 2–3 targeted follow-ups, the way an expert would.',
    tint: 'from-teal-100 via-white to-emerald-100',
  },
  {
    number: '03',
    icon: Brain,
    title: 'Diagnose',
    description: 'Pinpoints the exact cause — pest, deficiency, or weather risk.',
    tint: 'from-yellow-100 via-white to-emerald-100',
  },
  {
    number: '04',
    icon: Volume2,
    title: 'Act',
    description: 'Delivers clear next steps in plain local language. In time to matter.',
    tint: 'from-green-100 via-white to-amber-100',
  },
]

const features = [
  {
    icon: '🎙️',
    title: 'Voice First',
    description: 'No typing, no app literacy needed. Just speak — in any regional language.',
    glow: 'from-emerald-400/30 to-lime-300/20',
  },
  {
    icon: '🧠',
    title: 'AI Diagnosis',
    description: 'Guided diagnostic conversation. Finds the problem before you can name it.',
    glow: 'from-teal-400/30 to-cyan-300/20',
  },
  {
    icon: '🌾',
    title: 'Crop Advisory',
    description: 'Pest, deficiency, or weather risk — identified and explained clearly.',
    glow: 'from-yellow-300/30 to-amber-300/20',
  },
  {
    icon: '🔊',
    title: 'Spoken Response',
    description: 'Advisory delivered back as natural speech. Warm, clear, local language voice output.',
    glow: 'from-green-400/30 to-emerald-300/20',
  },
]

const stats = [
  { value: 140, suffix: 'M', label: "Farmers We're Building For" },
  { value: 92000, prefix: '₹', suffix: 'Cr', label: 'Lost Annually to Preventable Crop Damage' },
  { value: 72, suffix: '%', label: 'Of Crop Loss Is Preventable With Timely Advisory' },
]

const sectionReveal = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
}

const staggerWrap = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
}

function SplashScreen({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2600)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } }}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#1a4a2e]"
    >
      <motion.div
        animate={{ scale: [1, 1.04, 1], opacity: [0.28, 0.42, 0.24] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,_rgba(149,213,178,0.55)_0%,_rgba(149,213,178,0.08)_45%,_transparent_70%)] blur-3xl"
      />
      <motion.div
        animate={{ y: [-10, 10, -10], opacity: [0.22, 0.35, 0.22] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(233,196,106,0.10),transparent)]"
      />
      <div className="relative text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 18 }}
          animate={{
            opacity: [0, 1, 1],
            scale: [0.88, 1.02, 1],
            y: [18, 0, 0],
          }}
          transition={{
            duration: 2.2,
            times: [0, 0.45, 1],
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: ['0%', '100%', '100%'] }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mb-6 h-px bg-gradient-to-r from-transparent via-[#95d5b2] to-transparent"
          />
          <h1 className="font-display text-5xl font-bold tracking-[0.15em] text-white drop-shadow-[0_10px_40px_rgba(255,255,255,0.12)] sm:text-7xl md:text-8xl">
            KisanSaathi
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0.75] }}
            transition={{ delay: 0.55, duration: 1.2 }}
            className="mt-5 text-xs uppercase tracking-[0.55em] text-[#d8f3dc] sm:text-sm"
          >
            Voice-first crop intelligence
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: ['0%', '65%', '70%'] }}
            transition={{ duration: 1.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-6 h-px bg-gradient-to-r from-transparent via-[#e9c46a] to-transparent"
          />
        </motion.div>
      </div>
    </motion.div>
  )
}

function FloatingOrb({ className, duration = 10 }) {
  return (
    <motion.div
      animate={{
        y: [0, -18, 0],
        x: [0, 8, 0],
        scale: [1, 1.06, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    />
  )
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleAnchor = (href) => {
    if (location.pathname !== '/') {
      navigate(`/${href}`)
      return
    }
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-emerald-100/60 bg-white/70 shadow-[0_10px_40px_rgba(16,24,40,0.08)] backdrop-blur-2xl'
          : 'bg-black/10 border-b border-white/10 backdrop-blur-md'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[20px] sm:h-16 sm:w-16 sm:rounded-[24px] lg:h-20 lg:w-20 lg:rounded-[28px]">
            <img
              src={logo}
              alt="KisanSaathi Logo"
              className="h-full w-full object-cover object-center scale-105"
              draggable={false}
            />
          </div>
          <div>
            <div className={`text-xl font-extrabold tracking-tight transition-colors duration-300 ${scrolled ? 'text-[#1b4332]' : 'text-white'}`}>
              KisanSaathi
            </div>
            <div className={`text-[11px] uppercase tracking-[0.3em] transition-colors duration-300 ${scrolled ? 'text-emerald-700/70' : 'text-[#d8f3dc]/90'}`}>
              Bharat-ready AI
            </div>
          </div>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleAnchor(link.href)}
              className={`relative text-sm font-medium transition-colors duration-300 ${
                scrolled ? 'text-slate-700 hover:text-[#2d6a4f]' : 'text-white/90 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => navigate('/diagnosis')}
            className={`group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] ${
              scrolled
                ? 'bg-gradient-to-r from-[#2d6a4f] via-[#40916c] to-[#52b788] shadow-[0_14px_28px_rgba(45,106,79,0.25)]'
                : 'bg-white/20 hover:bg-white/30 border border-white/20 backdrop-blur'
            }`}
          >
            Try Now
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>
        </div>
      </nav>
    </motion.header>
  )
}

function SectionHeading({ eyebrow, title, subtitle, invert = false }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && (
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`mb-3 text-sm font-semibold uppercase tracking-[0.3em] ${
            invert ? 'text-[#d8f3dc]' : 'text-[#2d6a4f]'
          }`}
        >
          {eyebrow}
        </motion.p>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`font-display text-4xl leading-tight sm:text-5xl ${
          invert ? 'text-white' : 'text-[#16351f]'
        }`}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className={`mt-4 text-base leading-7 sm:text-lg ${
            invert ? 'text-white/80' : 'text-slate-600'
          }`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}

function HeroPanel() {
  const chips = [
    { icon: <Mic className="h-4 w-4" />, text: 'Voice input' },
    { icon: <Brain className="h-4 w-4" />, text: 'AI diagnosis' },
    { icon: <Volume2 className="h-4 w-4" />, text: 'Spoken guidance' },
    { icon: <Waves className="h-4 w-4" />, text: 'Live follow-up flow' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto mt-12 w-full max-w-4xl"
    >
      <FloatingOrb
        duration={8}
        className="absolute -left-12 top-8 h-32 w-32 rounded-full bg-emerald-300/40 blur-3xl"
      />
      <FloatingOrb
        duration={11}
        className="absolute -right-8 top-24 h-44 w-44 rounded-full bg-yellow-300/30 blur-3xl"
      />
      <FloatingOrb
        duration={9}
        className="absolute bottom-6 left-20 h-28 w-28 rounded-full bg-teal-300/30 blur-3xl"
      />

      <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-black/20 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(82,183,136,0.15),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(233,196,106,0.12),_transparent_28%)]" />

        <div className="relative z-10">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner backdrop-blur-md">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#95d5b2]">
                Live advisory preview
              </p>
              <p className="mt-1 text-sm text-white/70">A conversation, not a form.</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2d6a4f] to-[#52b788] text-white shadow-lg">
              <Waves className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="ml-auto max-w-[85%] rounded-[1.4rem] rounded-tr-md bg-gradient-to-r from-[#2d6a4f] to-[#40916c] px-4 py-3 text-sm leading-6 text-white shadow-lg border border-white/10"
            >
              Namaste. Tell me what you are seeing on the crop.
            </motion.div>

            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
              className="max-w-[82%] rounded-[1.4rem] rounded-tl-md border border-white/10 bg-white/10 px-4 py-3 text-sm leading-6 text-white/90 shadow-md"
            >
              Leaves are turning yellow and curling after the last rain.
            </motion.div>

            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}
              className="ml-auto max-w-[88%] rounded-[1.4rem] rounded-tr-md bg-gradient-to-r from-[#e9c46a] to-[#f4d58d] px-4 py-3 text-sm font-medium leading-6 text-[#4d3b10] shadow-lg border border-yellow-300/10"
            >
              Likely nutrient stress with moisture-triggered spread. Let me ask 2 quick follow-ups.
            </motion.div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {chips.map((chip, index) => (
              <motion.div
                key={chip.text}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.08, duration: 0.5 }}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 shadow-sm backdrop-blur-sm"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-[#95d5b2]">
                  {chip.icon}
                </span>
                <span>{chip.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      const timer = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 120)
      return () => clearTimeout(timer)
    }
  }, [location])

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-x-hidden bg-[#f8fdf9] text-[#1b1b1b]"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <FloatingOrb
            duration={14}
            className="absolute left-[-8rem] top-[12rem] h-[24rem] w-[24rem] rounded-full bg-emerald-200/35 blur-3xl"
          />
          <FloatingOrb
            duration={18}
            className="absolute right-[-8rem] top-[36rem] h-[22rem] w-[22rem] rounded-full bg-yellow-200/30 blur-3xl"
          />
          <FloatingOrb
            duration={15}
            className="absolute left-[20%] top-[68rem] h-[18rem] w-[18rem] rounded-full bg-teal-200/25 blur-3xl"
          />
        </div>

        <Navbar />

        <main className="relative z-10">
          <section
            className="relative isolate flex min-h-screen items-center overflow-hidden px-5 pb-16 pt-28 sm:px-6 lg:px-8"
            style={{
              backgroundImage: `
                linear-gradient(rgba(12, 36, 24, 0.72), rgba(22, 60, 38, 0.75)),
                url("https://images2.alphacoders.com/110/1106333.jpg")
              `,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(149,213,178,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(233,196,106,0.18),_transparent_28%)]" />
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />

            <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center text-center">
              <motion.div
                initial="hidden"
                animate="show"
                variants={staggerWrap}
                className="w-full max-w-4xl"
              >
                <motion.div
                  variants={staggerItem}
                  className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-[#d8f3dc] shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur"
                >
                  <AudioLines className="h-4 w-4" />
                  Voice-first AI crop advisory for Bharat
                </motion.div>

                <motion.div
                  variants={staggerItem}
                  className="mb-5 text-center font-display text-3xl font-bold tracking-wide text-[#95d5b2] sm:text-4xl lg:text-5xl"
                >
                  KisanSaathi
                </motion.div>

                <motion.div variants={staggerItem} className="mb-6 flex flex-wrap justify-center gap-3">
                  <span className="rounded-full bg-gradient-to-r from-emerald-200/85 to-lime-200/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-900 shadow-sm backdrop-blur">
                    Regional Languages
                  </span>
                  <span className="rounded-full bg-gradient-to-r from-yellow-200/85 to-amber-200/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-900 shadow-sm backdrop-blur">
                    Instant clarity
                  </span>
                </motion.div>

                <motion.h1
                  variants={staggerItem}
                  className="font-display text-5xl leading-[0.92] text-white sm:text-6xl lg:text-7xl"
                >
                  Diagnose Crop Problems
                  <span className="mt-2 block bg-gradient-to-r from-[#95d5b2] via-[#ffffff] to-[#e9c46a] bg-clip-text text-transparent">
                    Using Your Voice
                  </span>
                </motion.h1>

                <motion.p
                  variants={staggerItem}
                  className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/85 sm:text-xl"
                >
                  Speak naturally in your regional language.
                  KisanSaathi asks the right questions and gives you an instant,
                  clear diagnosis — before the wrong decision costs a season.
                </motion.p>

                <motion.div
                  variants={staggerItem}
                  className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      boxShadow: [
                        '0 0 0 rgba(45,106,79,0.14)',
                        '0 0 0 16px rgba(45,106,79,0)',
                      ],
                    }}
                    transition={{ duration: 2.3, repeat: Infinity, ease: 'easeOut' }}
                    onClick={() => navigate('/diagnosis')}
                    className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#2d6a4f] via-[#40916c] to-[#52b788] px-7 py-4 text-base font-semibold text-white shadow-[0_20px_40px_rgba(45,106,79,0.24)] transition"
                  >
                    <Mic className="h-5 w-5" />
                    Start Diagnosis
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </motion.button>

                  <p className="text-sm text-white/75">
                    No typing. No app literacy required.
                  </p>
                </motion.div>

                <motion.div
                  variants={staggerItem}
                  className="mt-10 grid w-full gap-4 sm:grid-cols-3"
                >
                  {[
                    ['100%', 'Voice First'],
                    ['2G', 'Low-bandwidth friendly'],
                    ['24/7', 'Always available'],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl"
                    >
                      <div className="font-display text-3xl text-white">{value}</div>
                      <div className="mt-1 text-sm text-white/80">{label}</div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              <HeroPanel />
            </div>
          </section>

          <motion.section
            id="how-it-works"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.16 }}
            variants={sectionReveal}
            className="relative px-5 py-20 sm:px-6 lg:px-8 lg:py-24"
          >
            <div className="mx-auto max-w-7xl">
              <SectionHeading
                eyebrow="How it works"
                title="How KisanSaathi Works"
                subtitle="Four steps. One conversation. One season saved."
              />

              <motion.div
                variants={staggerWrap}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.12 }}
                className="relative mt-14 grid gap-6 lg:grid-cols-4 lg:gap-5"
              >
                <div className="absolute left-[12.5%] right-[12.5%] top-14 hidden border-t border-dashed border-[#52b788]/40 lg:block" />

                {steps.map((step, index) => {
                  const Icon = step.icon

                  return (
                    <motion.div
                      key={step.number}
                      variants={staggerItem}
                      whileHover={{ y: -10, rotateX: 2, rotateY: index % 2 === 0 ? 2 : -2 }}
                      className={`group relative overflow-hidden rounded-[1.8rem] border border-white/70 bg-gradient-to-br ${step.tint} p-6 shadow-[0_24px_60px_rgba(45,106,79,0.10)]`}
                    >
                      <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.65),transparent)]" />
                      <div className="relative z-10">
                        <div className="mb-5 flex items-center justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#1a4a2e] to-[#52b788] text-sm font-bold text-white shadow-lg">
                            {step.number}
                          </div>
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/75 text-[#2d6a4f] shadow-sm">
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-[#173620]">{step.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          {step.description}
                        </p>

                        {index < steps.length - 1 && (
                          <ArrowRight className="absolute -right-2 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-[#52b788] lg:block" />
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>
          </motion.section>

          <section id="features" className="relative px-5 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <SectionHeading
                eyebrow="Built for Bharat"
                title="Built for Bharat"
                subtitle="Designed for voice, speed, clarity, and trust — not for perfect typing or smartphone fluency."
              />

              <motion.div
                variants={staggerWrap}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4"
              >
                {features.map((feature) => (
                  <motion.article
                    key={feature.title}
                    variants={staggerItem}
                    whileHover={{ y: -10 }}
                    className="group relative overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/80 p-6 shadow-[0_24px_60px_rgba(45,106,79,0.08)] backdrop-blur-xl"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.glow} opacity-70`} />
                    <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.8),transparent)]" />
                    <div className="relative z-10">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/85 text-3xl shadow-sm">
                        {feature.icon}
                      </div>
                      <h3 className="mt-5 text-xl font-bold text-[#173620]">
                        {feature.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {feature.description}
                      </p>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </div>
          </section>

          <section className="px-5 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.2rem] border border-white/60 bg-[linear-gradient(135deg,_#d8f3dc_0%,_#edf8f1_45%,_#fff7df_100%)] px-6 py-10 shadow-[0_24px_80px_rgba(45,106,79,0.10)] sm:px-10 lg:px-12 lg:py-12">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2d6a4f] to-[#52b788] text-white shadow-lg">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
                    Impact numbers
                  </p>
                  <p className="text-sm text-slate-600">Urgency, scale, and why timing matters.</p>
                </div>
              </div>

              <motion.div
                variants={staggerWrap}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid gap-5 md:grid-cols-3"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    variants={staggerItem}
                    whileHover={{ y: -8 }}
                    className={`rounded-[1.6rem] border p-6 backdrop-blur-sm ${
                      index === 1
                        ? 'border-amber-200 bg-white/70 shadow-[0_22px_50px_rgba(233,196,106,0.14)]'
                        : 'border-white/70 bg-white/65 shadow-[0_22px_50px_rgba(45,106,79,0.08)]'
                    }`}
                  >
                    <div className="font-display text-4xl text-[#1b4332] sm:text-5xl">
                      {stat.prefix}
                      {stat.value.toLocaleString('en-IN')}
                      {stat.suffix}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          <section className="px-5 pb-20 sm:px-6 lg:px-8 lg:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.3rem] bg-[linear-gradient(135deg,#163c26_0%,#1a4a2e_45%,#2d6a4f_100%)] px-6 py-16 text-center text-white shadow-[0_24px_80px_rgba(26,74,46,0.28)] sm:px-10"
            >
              <motion.div
                animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.08, 1] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(233,196,106,0.20),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(149,213,178,0.18),_transparent_28%)]"
              />
              <div className="relative z-10">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d8f3dc]">
                  Start now
                </p>

                <h2 className="mx-auto mt-4 max-w-4xl font-display text-4xl leading-tight sm:text-5xl">
                  The farmer doesn't get a second season. KisanSaathi makes sure he doesn't need one.
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/75">
                  A faster diagnosis means fewer wrong sprays, fewer delayed decisions, and more confidence in the field.
                </p>

                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/diagnosis')}
                  className="group mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-[#2d6a4f] shadow-[0_20px_40px_rgba(255,255,255,0.18)] transition hover:bg-[#eef8f1]"
                >
                  <Mic className="h-5 w-5" />
                  Start Your Diagnosis
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </motion.button>
              </div>
            </motion.div>
          </section>
        </main>

        <footer className="relative bg-[linear-gradient(180deg,#163c26_0%,#102d1d_100%)] px-5 py-14 text-white sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2d6a4f] to-[#52b788] text-white shadow-lg">
                  <Sprout className="h-5 w-5" />
                </div>
                <div className="text-xl font-extrabold tracking-tight text-white">
                  KisanSaathi
                </div>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-7 text-white/75">
                Voice-first crop advisory for every farmer in Bharat.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#95d5b2]">
                Explore
              </h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-white/80">
                <a href="#features">Features</a>
                <a href="#how-it-works">How It Works</a>
                <a href="#about">About</a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#95d5b2]">
                Mission
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/75">
                Built for farmers. Built for Bharat. Ready for the next hackathon demo and the field beyond it.
              </p>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-5 text-sm text-white/55">
            © 2026 KisanSaathi. Made with 🌱 for India's farmers.
          </div>
        </footer>
      </motion.div>
    </>
  )
}