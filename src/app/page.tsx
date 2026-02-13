'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  Brain, 
  Users, 
  Target, 
  TrendingUp, 
  Zap, 
  Clock, 
  Shield, 
  Sparkles, 
  Menu, 
  X, 
  CheckCircle, 
  BarChart3, 
  MessageSquare, 
  Calculator, 
  Play,
  Bot,
  Database,
  Workflow,
  Star,
  ChevronRight,
  Globe,
  CalendarDays,
  Layers,
  Activity
} from "lucide-react"
import Link from "next/link"
import EmailModal from "@/components/ui/EmailModal"

// Floating Task Card Component
const FloatingTaskCard = ({ delay = 0, className = "" }: { delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
    className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 ${className}`}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-[#C9F223] rounded-full"></div>
        <span className="text-white/80 text-sm font-medium">AI Suggestion</span>
      </div>
      <span className="text-[#C9F223] text-xs font-semibold">HIGH ROI</span>
    </div>
    <h4 className="text-white font-semibold text-sm mb-2">
      [Task Title]
    </h4>
    <p className="text-white/60 text-xs mb-3">
      [Task Description]
    </p>
    <div className="flex items-center justify-between">
      <span className="text-[#C9F223] text-xs font-medium">ROI: +27%</span>
      <div className="flex space-x-2">
        <button className="bg-[#C9F223] text-[#142E24] px-3 py-1 rounded text-xs font-medium">
          Approve
        </button>
        <button className="bg-white/10 text-white/80 px-3 py-1 rounded text-xs font-medium">
          Reject
        </button>
      </div>
    </div>
  </motion.div>
)

// Subtle grid texture for premium hero background
const HeroTexture = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0" style={{
      backgroundImage: `radial-gradient(circle at 1px 1px, rgba(201, 242, 35, 0.04) 1px, transparent 0)`,
      backgroundSize: '32px 32px'
    }} />
    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0F2119] to-transparent" />
  </div>
)

// Live Demo Card Component
const LiveDemoCard = ({ 
  title, 
  type, 
  status, 
  delay = 0, 
  className = "" 
}: { 
  title: string; 
  type: string; 
  status: string; 
  delay?: number; 
  className?: string; 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30, rotateX: 10 }}
    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
    whileHover={{ y: -5, scale: 1.02 }}
    className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${
          status === 'approved' ? 'bg-green-500' : 
          status === 'pending' ? 'bg-yellow-500' : 
          'bg-blue-500'
        }`}></div>
        <span className="text-gray-600 text-sm font-medium">{type}</span>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
        status === 'approved' ? 'bg-green-100 text-green-700' : 
        status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
        'bg-blue-100 text-blue-700'
      }`}>
        {status.toUpperCase()}
      </span>
    </div>
    <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
    <p className="text-gray-600 text-sm mb-4">[AI Analysis Details]</p>
         <div className="flex items-center justify-between">
       <span className="text-[#9b0e8d] text-sm font-semibold">ROI: +{Math.floor(Math.random() * 80 + 15)}%</span>
       <ChevronRight className="h-4 w-4 text-gray-400" />
     </div>
  </motion.div>
)

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [footerEmail, setFooterEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)
  const [submitErrorMessage, setSubmitErrorMessage] = useState('')
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    type: 'get_demo' | 'book_demo' | 'subscription'
    title: string
    description: string
  }>({
    isOpen: false,
    type: 'get_demo',
    title: '',
    description: ''
  })
  const { scrollYProgress } = useScroll()
  // Removed problematic scroll transforms that were causing text to disappear

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const openGetDemoModal = () => {
    setModalState({
      isOpen: true,
      type: 'get_demo',
      title: 'Get a Demo',
      description: 'Enter your email to schedule a personalized demo of Ventry\'s AI operations platform.'
    })
  }

  const openBookDemoModal = () => {
    setModalState({
      isOpen: true,
      type: 'book_demo',
      title: 'Book a Demo',
      description: 'Get the latest Ventry company updates and schedule a demo with our team.'
    })
  }

  const handleFooterDemoSubmit = async () => {
    const email = footerEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitStatus('error');
      setSubmitErrorMessage('Please enter a valid email address.');
      setTimeout(() => {
        setSubmitStatus(null);
        setSubmitErrorMessage('');
      }, 3000);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitErrorMessage('');
    try {
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'book_demo' })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFooterEmail('');
      } else {
        // Try to get error message from response
        try {
          const errorData = await response.json();
          setSubmitErrorMessage(errorData.error || 'Failed to submit demo request. Please try again later.');
        } catch {
          setSubmitErrorMessage('Failed to submit demo request. Please try again later.');
        }
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitErrorMessage('Network error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSubmitStatus(null);
        setSubmitErrorMessage('');
      }, 5000);
    }
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 w-full z-[9999] transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-sm' : 'bg-transparent'
        }`}
        style={{ position: 'fixed', top: 0, left: 0, right: 0 }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <img 
                src="/ventry-logo.png" 
                alt="Ventry Logo" 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <span className={`text-2xl font-bold transition-colors ${
                isScrolled ? 'text-[#142E24]' : 'text-white'
              }`}>
                Ventry
              </span>
            </motion.div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className={`transition-colors text-sm font-medium ${
                isScrolled ? 'text-gray-600 hover:text-[#142E24]' : 'text-white/80 hover:text-[#C9F223]'
              }`}>
                Features
              </a>
              <a href="#how-it-works" className={`transition-colors text-sm font-medium ${
                isScrolled ? 'text-gray-600 hover:text-[#142E24]' : 'text-white/80 hover:text-[#C9F223]'
              }`}>
                How it Works
              </a>
              <a href="#demo" className={`transition-colors text-sm font-medium ${
                isScrolled ? 'text-gray-600 hover:text-[#142E24]' : 'text-white/80 hover:text-[#C9F223]'
              }`}>
                Demo
              </a>
              <Link href="/auth/signin">
                <Button variant="ghost" className={`text-sm ${
                  isScrolled ? 'text-gray-600 hover:text-[#142E24]' : 'text-white/80 hover:text-[#C9F223]'
                }`}>
                  Login
                </Button>
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={openGetDemoModal}
                  className="bg-[#C9F223] hover:bg-[#b8e01f] text-[#142E24] px-6 py-2 text-sm font-semibold rounded-md"
                >
                  Get Demo
                </Button>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className={`md:hidden p-2 ${isScrolled ? 'text-[#142E24]' : 'text-white'}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100"
            >
              <div className="px-6 py-4 space-y-4">
                <a href="#features" className="block text-gray-600 hover:text-[#142E24] text-sm font-medium">
                  Features
                </a>
                <a href="#how-it-works" className="block text-gray-600 hover:text-[#142E24] text-sm font-medium">
                  How it Works
                </a>
                <a href="#demo" className="block text-gray-600 hover:text-[#142E24] text-sm font-medium">
                  Demo
                </a>
                <Link href="/auth/signin" className="block text-gray-600 hover:text-[#142E24] text-sm font-medium">
                  Login
                </Link>
                <Button 
                  onClick={openGetDemoModal}
                  className="w-full bg-[#C9F223] hover:bg-[#b8e01f] text-[#142E24] text-sm font-semibold"
                >
                  Get Demo
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="min-h-[85vh] bg-[#142E24] relative overflow-hidden flex items-center">
        {/* Subtle texture background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#142E24] via-[#1A3A2D] to-[#142E24]" />
        <HeroTexture />
        
        <motion.div 
          className="max-w-5xl mx-auto px-6 lg:px-8 py-32 relative z-10 w-full"
        >
          <div className="text-center space-y-8">
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 text-sm text-white/70 font-medium tracking-wide"
            >
              <span className="w-1.5 h-1.5 bg-[#C9F223] rounded-full"></span>
              AI-powered operations for small businesses
            </motion.div>
            
            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight"
            >
              Stop Guessing.
              <br />
              <span className="text-[#C9F223]">Start Growing.</span>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg lg:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto"
            >
              Ventry connects to your Shopify and QuickBooks data, then uses reinforcement learning to surface the decisions that actually move your margins.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-row gap-4 justify-center"
            >
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={openGetDemoModal}
                className="bg-[#C9F223] hover:bg-[#b8e01f] text-[#142E24] px-8 py-3.5 font-semibold rounded-lg cursor-pointer inline-flex items-center justify-center transition-all"
              >
                <CalendarDays className="h-5 w-5 mr-2" />
                Get a Demo
              </motion.div>
              <Link href="/auth/signin">
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-white/[0.06] border border-white/15 text-white px-8 py-3.5 font-semibold rounded-lg cursor-pointer inline-flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  Start Free
                  <ArrowRight className="h-4 w-4 ml-2" />
                </motion.div>
              </Link>
            </motion.div>

            {/* Minimal trust line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-sm text-white/40 pt-4"
            >
              Currently in early access — built for Shopify & QuickBooks merchants
            </motion.p>
          </div>
        </motion.div>

      </section>

      {/* Key Metrics Section */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="grid md:grid-cols-3 gap-8"
          >
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-[#142E24] mb-2">3</div>
              <p className="text-gray-600">Live integrations — Shopify, QuickBooks, Slack</p>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-[#142E24] mb-2">RL + LLM</div>
              <p className="text-gray-600">Reinforcement learning paired with RAG for task generation</p>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-[#142E24] mb-2">100%</div>
              <p className="text-gray-600">Human-in-the-loop — every action requires your approval</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Performance Metrics Dashboard Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Real Results, Measured Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Track your business transformation with comprehensive analytics and ROI insights
            </p>
          </motion.div>

          {/* Dashboard Mock-up */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Dashboard Header */}
            <div className="bg-[#142E24] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-white font-semibold">Ventry Analytics</div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="text-[#C9F223] text-sm font-medium">Live Dashboard</div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6">
              {/* Top Metrics Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="bg-gradient-to-br from-[#142E24] to-[#2D5A44] rounded-xl p-4 text-white"
                >
                  <div className="text-2xl font-bold text-[#C9F223]">24</div>
                  <div className="text-sm text-white/80">Tasks Generated</div>
                  <div className="text-xs text-[#C9F223] font-semibold">This week</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="bg-white border-2 border-[#C9F223]/20 rounded-xl p-4"
                >
                  <div className="text-2xl font-bold text-[#142E24]">3</div>
                  <div className="text-sm text-gray-600">Integrations Active</div>
                  <div className="text-xs text-green-600 font-semibold">Shopify · QB · Slack</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="bg-white border-2 border-[#C9F223]/20 rounded-xl p-4"
                >
                  <div className="text-2xl font-bold text-[#142E24]">RL</div>
                  <div className="text-sm text-gray-600">Decision Engine</div>
                  <div className="text-xs text-green-600 font-semibold">Active</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="bg-gradient-to-br from-[#9b0e8d] to-[#c41e3a] rounded-xl p-4 text-white"
                >
                  <div className="text-2xl font-bold">ROI</div>
                  <div className="text-sm text-white/80">Per-Task Prediction</div>
                  <div className="text-xs text-yellow-300 font-semibold">Enabled</div>
                </motion.div>
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Revenue Chart Mock */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="bg-gray-50 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Task Generation Trend</h3>
                    <div className="text-sm text-green-600 font-semibold">Growing weekly</div>
                  </div>
                  <div className="h-32 flex items-end space-x-2">
                    {[40, 65, 45, 80, 60, 95, 75, 120, 85, 140, 110, 180].map((height, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height/2}px` }}
                        transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                        className={`flex-1 rounded-t ${
                          i >= 8 ? 'bg-[#C9F223]' : 'bg-[#142E24]'
                        }`}
                      ></motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Task Success Rate */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="bg-gray-50 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Approval Rate</h3>
                    <div className="text-sm text-green-600 font-semibold">Sample data</div>
                  </div>
                  <div className="relative h-32 flex items-center justify-center">
                    <div className="relative w-24 h-24">
                      <motion.div
                        initial={{ rotate: 0 }}
                        whileInView={{ rotate: 331 }} // 92% of 360 degrees
                        transition={{ delay: 1.0, duration: 1.5, ease: "easeOut" }}
                        className="absolute inset-0 rounded-full border-8 border-gray-200"
                        style={{
                          background: `conic-gradient(from 0deg, #C9F223 0deg, #C9F223 331deg, #e5e7eb 331deg)`
                        }}
                      ></motion.div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-[#142E24]">—</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
          
          </motion.div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center group"
            >
                             <div className="bg-[#9b0e8d]/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#9b0e8d]/20 transition-colors">
                 <Database className="h-10 w-10 text-[#9b0e8d]" />
               </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Analyze Ops Data</h3>
              <p className="text-gray-600 mb-6">
                Analyzes your sales, inventory, and customer trends from Shopify and QuickBooks to surface the most impactful business decisions.
              </p>
              <div className="bg-gray-50 rounded-xl p-6 group-hover:bg-gray-100 transition-colors">
                <div className="text-sm text-gray-500 mb-2">Live Data Sources</div>
                <div className="flex justify-center space-x-4 text-xs font-semibold text-gray-700">
                  <span>SHOPIFY</span>
                  <span>QUICKBOOKS</span>
                  <span>SLACK</span>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center group"
            >
                             <div className="bg-[#C9F223]/90 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#C9F223]/90 transition-colors">
                             <TrendingUp className="h-10 w-10 text-[#A7C700] drop-shadow-md" />
               </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Creates Strategic Tasks</h3>
              <p className="text-gray-600 mb-6">
              RL engine simulates operational decisions and generates actions with predicted ROI—prioritizing the ones most likely to drive growth and efficiency.
              </p>
              <div className="bg-gray-50 rounded-xl p-6 group-hover:bg-gray-100 transition-colors">
                <div className="text-sm text-gray-500 mb-2">AI Capabilities</div>
                <div className="flex justify-center space-x-4 text-xs font-semibold text-gray-700">
                  <span>RL OPTIMIZATION</span>
                  <span>ROI PREDICTION</span>
                </div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-center group"
            >
                             <div className="bg-[#9b0e8d]/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#9b0e8d]/20 transition-colors">
                 <Workflow className="h-10 w-10 text-[#9b0e8d]" />
               </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Execute via Integrations</h3>
              <p className="text-gray-600 mb-6">
              Tasks are sent through Slack for your approval before anything happens—you're always in control, and auto-execution can be turned off anytime. Approved actions are then carried out via QuickBooks, seamlessly.
              </p>
              <div className="bg-gray-50 rounded-xl p-6 group-hover:bg-gray-100 transition-colors">
                <div className="text-sm text-gray-500 mb-2">Execution Channels</div>
                <div className="flex justify-center space-x-4 text-xs font-semibold text-gray-700">
                  <span>SLACK APPROVAL</span>
                  <span>AUTO EXECUTE</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Demo UI Cards Section */}
      <section id="demo" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              See It In Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch Ventry analyze your operations data and generate high-ROI recommendations in real-time
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
                         <div className="space-y-6">
               <motion.div
                 initial={{ opacity: 0, y: 30, rotateX: 10 }}
                 whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                 transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                 whileHover={{ y: -5, scale: 1.02 }}
                 className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
               >
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center space-x-3">
                     <div className="w-3 h-3 rounded-full bg-green-500"></div>
                     <span className="text-gray-600 text-sm font-medium">Inventory Task</span>
                   </div>
                   <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700">
                     APPROVED
                   </span>
                 </div>
                 <h4 className="font-semibold text-gray-900 mb-2">Restock Smart Light Bulbs</h4>
                 <p className="text-gray-600 text-sm mb-4">Current inventory at 12 units. Demand forecasting shows 85% probability of stockout within 5 days. Optimal reorder point triggered.</p>
                 <div className="flex items-center justify-between">
                   <span className="text-[#9b0e8d] text-sm font-semibold">ROI: +32%</span>
                   <ChevronRight className="h-4 w-4 text-gray-400" />
                 </div>
               </motion.div>
               
               <motion.div
                 initial={{ opacity: 0, y: 30, rotateX: 10 }}
                 whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                 transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                 whileHover={{ y: -5, scale: 1.02 }}
                 className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
               >
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center space-x-3">
                     <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                     <span className="text-gray-600 text-sm font-medium">Marketing Task</span>
                   </div>
                   <span className="text-xs px-2 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700">
                     PENDING
                   </span>
                 </div>
                 <h4 className="font-semibold text-gray-900 mb-2">Optimize Email Campaign ROI</h4>
                 <p className="text-gray-600 text-sm mb-4">A/B testing reveals personalized subject lines increase open rates by 34%. Segmentation analysis identifies high-value customer clusters for targeted campaigns.</p>
                 <div className="flex items-center justify-between">
                   <span className="text-[#9b0e8d] text-sm font-semibold">ROI: +27%</span>
                   <ChevronRight className="h-4 w-4 text-gray-400" />
                 </div>
               </motion.div>
               
               <motion.div
                 initial={{ opacity: 0, y: 30, rotateX: 10 }}
                 whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                 transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
                 whileHover={{ y: -5, scale: 1.02 }}
                 className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
               >
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center space-x-3">
                     <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                     <span className="text-gray-600 text-sm font-medium">Finance Task</span>
                   </div>
                   <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                     ANALYZING
                   </span>
                 </div>
                 <h4 className="font-semibold text-gray-900 mb-2">Review Q3 Cash Flow</h4>
                 <p className="text-gray-600 text-sm mb-4">Cash flow analysis detects recurring payment delays from 3 key clients. Predictive model suggests adjusting payment terms to improve liquidity by 23%.</p>
                 <div className="flex items-center justify-between">
                   <span className="text-[#9b0e8d] text-sm font-semibold">ROI: +23%</span>
                   <ChevronRight className="h-4 w-4 text-gray-400" />
                 </div>
               </motion.div>
             </div>
            
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
              >
                                 <div className="flex items-center space-x-3 mb-4">
                   <MessageSquare className="h-6 w-6 text-[#9b0e8d]" />
                   <h3 className="font-semibold text-gray-900">Slack Integration</h3>
                 </div>
                                 <div className="bg-gray-50 rounded-lg p-4 mb-4">
                   <div className="text-sm text-gray-600 mb-2">
                     <strong>RL agent:</strong> New task recommendation:
                   </div>
                   <div className="text-sm text-gray-800 mb-2">
                     "Restock 25 units of Smart Light Bulbs"
                   </div>
                   <div className="text-sm text-[#9b0e8d] font-semibold mb-2">
                     Predicted ROI: +35% (~$435)
                   </div>
                  <div className="flex space-x-2">
                    <button className="bg-green-500 text-white px-3 py-1 rounded text-xs">
                      ✓ Approve
                    </button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded text-xs">
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
              >
                                 <div className="flex items-center space-x-3 mb-4">
                   <Calculator className="h-6 w-6 text-[#9b0e8d]" />
                   <h3 className="font-semibold text-gray-900">QuickBooks Execution</h3>
                 </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Purchase Order Created</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Inventory Updated</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Expense Recorded</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Showcase */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Seamlessly Integrates With Your Stack
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect your existing tools in minutes. No complex setup, no disruption to your workflow.
            </p>
          </motion.div>

          {/* Integration Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
            {[
              { name: 'SHOPIFY', color: 'text-green-600' },
              { name: 'QUICKBOOKS', color: 'text-blue-600' },
              { name: 'SLACK', color: 'text-purple-600' },
              { name: 'STRIPE', color: 'text-indigo-600' },
              { name: 'ZAPIER', color: 'text-orange-600' },
              { name: 'AIRTABLE', color: 'text-yellow-600' },
            ].map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:bg-white hover:shadow-lg transition-all cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center mb-3 ${integration.color}`}>
                  <div className="w-8 h-8 bg-current rounded opacity-20"></div>
                </div>
                <span className="text-sm font-semibold text-gray-700">{integration.name}</span>
              </motion.div>
            ))}
          </div>

          {/* Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-500 text-sm mb-4">Coming Soon</p>
            <div className="flex flex-wrap justify-center items-center gap-6 opacity-50">
              {['SALESFORCE', 'HUBSPOT', 'NOTION', 'ASANA'].map((name) => (
                <span key={name} className="text-sm font-medium text-gray-400">{name}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced reinforcement learning model designed to optimize your operations and maximize ROI, and a robust combination of LLM and RAG to to create actionable tasks for your business daily.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 className="h-8 w-8" />,
                title: "Smart Decisions",
                description: "Reinforcement learning agent predicts what decision generates most ROI based on your data"
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "Strategic Tasks",
                description: "Based on your integrations, daily actionable tasks for you and your team members that drive profit"
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Shopify, Slack, QuickBooks",
                description: "Robust integrations with your existing tools (completely optional - you choose what to connect)"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -5 }}
                className="text-center group"
              >
                                 <div className="bg-[#9b0e8d]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#9b0e8d]/20 transition-colors">
                   <div className="text-[#9b0e8d]">{feature.icon}</div>
                 </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* User Control Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                  You're Always in Control
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Worried about AI taking over? Don't be. Ventry is designed to empower, not replace you.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#C9F223]/20 rounded-full p-2 mt-1">
                      <CheckCircle className="h-5 w-5 text-[#142E24]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Choose Your Tasks</h3>
                      <p className="text-gray-600">You decide which AI suggestions to approve or reject. Every recommendation requires your explicit approval.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#C9F223]/20 rounded-full p-2 mt-1">
                      <CheckCircle className="h-5 w-5 text-[#142E24]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Manual or Automatic</h3>
                      <p className="text-gray-600">Auto-execution only activates when you choose to connect QuickBooks. You can always run tasks manually.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#C9F223]/20 rounded-full p-2 mt-1">
                      <CheckCircle className="h-5 w-5 text-[#142E24]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Full Transparency</h3>
                      <p className="text-gray-600">See exactly why each task is recommended with detailed AI reasoning and ROI predictions.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="bg-gray-50 rounded-2xl p-8"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">AI Suggestion</span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                      PENDING YOUR APPROVAL
                    </span>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-2">Update Product Pricing</h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Market analysis suggests 8% price increase for premium products
                    </p>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-[#C9F223] text-[#142E24] py-2 px-4 rounded-lg text-sm font-medium">
                        ✓ You Approve
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium">
                        ✗ You Reject
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Your choice:</span> Connect QuickBooks for auto-execution or keep it manual
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Founder Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute top-10 right-10 w-64 h-64 border border-[#C9F223]/10 rounded-full"
          />
          <motion.div
            animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 left-10 w-8 h-8 bg-[#C9F223]/20 rounded-full"
          />
          <motion.div
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 right-20 w-4 h-4 bg-[#9b0e8d]/30 rounded-full"
          />
          <div className="absolute top-20 left-1/4 w-px h-32 bg-gradient-to-b from-[#C9F223]/30 to-transparent" />
          <div className="absolute bottom-32 right-1/3 w-32 h-px bg-gradient-to-r from-[#9b0e8d]/30 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-[#9b0e8d] text-sm font-semibold tracking-wide mb-4"
            >
              Leadership & Vision
            </motion.div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Meet the Founder
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Building the future of AI-powered business optimization
            </motion.p>
          </motion.div>

          {/* Enhanced Founder Card */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              whileHover={{ y: -10, boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)" }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 lg:p-16 shadow-2xl border border-white/50 max-w-4xl w-full relative"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255,255,255,0.3)"
              }}
            >
              {/* Floating Orbs */}
              <div className="absolute top-6 right-6 w-3 h-3 bg-[#C9F223] rounded-full animate-pulse"></div>
              <div className="absolute bottom-8 left-8 w-2 h-2 bg-[#9b0e8d] rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left: Photo and Basic Info */}
                <div className="text-center lg:text-left">
                  {/* Professional Photo */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    className="relative mb-8 inline-block"
                  >
                    <div className="relative">
                      <img 
                        src="/myphoto.jpg" 
                        alt="Jiaren Lyu - Founder & CEO"
                        className="w-64 h-64 object-cover rounded-2xl shadow-2xl"
                        style={{
                          filter: "drop-shadow(0 0 20px rgba(26, 66, 49, 0.3))"
                        }}
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[#142E24]/20 to-transparent"></div>
                    </div>
                    {/* Animated Border */}
                    <motion.div
                      animate={{ 
                        boxShadow: [
                          "0 0 20px rgba(201, 242, 35, 0.3)",
                          "0 0 40px rgba(201, 242, 35, 0.6)",
                          "0 0 20px rgba(201, 242, 35, 0.3)"
                        ]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute -inset-2 rounded-3xl border-2 border-[#C9F223]/30 pointer-events-none"
                    />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Jiaren Lyu</h3>
                    <p className="text-[#9b0e8d] font-semibold text-2xl mb-6">Founder & CEO</p>
                  </motion.div>
                </div>

                {/* Right: Fundraising & Contact */}
                <div className="space-y-8">
                  {/* Fundraising Status */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="relative"
                  >
                    <div className="bg-gradient-to-br from-[#142E24] to-[#2D5A44] rounded-2xl p-8 text-white relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#C9F223]/10 to-transparent"></div>
                      <div className="relative z-10">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-12 h-12 bg-[#C9F223] rounded-full flex items-center justify-center mb-6 mx-auto lg:mx-0"
                        >
                          <span className="text-[#142E24] text-2xl">🚀</span>
                        </motion.div>
                        <h4 className="text-2xl font-bold mb-4 text-center lg:text-left">Currently Raising Seed Round</h4>
                        <div className="space-y-3 text-center lg:text-left">
                          <p className="text-[#C9F223] font-semibold text-lg">
                            $200K - $1M Investment Range
                          </p>
                          <p className="text-white/80">
                            $3M Post-Money Valuation
                          </p>
                          <motion.div
                            animate={{ 
                              boxShadow: [
                                "0 0 10px rgba(201, 242, 35, 0.3)",
                                "0 0 20px rgba(201, 242, 35, 0.6)",
                                "0 0 10px rgba(201, 242, 35, 0.3)"
                              ]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="inline-block bg-[#C9F223]/20 text-[#C9F223] px-4 py-2 rounded-full text-sm font-bold border border-[#C9F223]/50"
                          >
                            Open for Investors
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Contact Links */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="space-y-4"
                  >
                    <h4 className="text-xl font-bold text-gray-900 text-center lg:text-left mb-6">Connect & Learn More</h4>
                    
                    <div className="space-y-3">
                      <motion.a 
                        href="https://jiaren-iota.vercel.app/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05, x: 10 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-4 p-4 bg-[#142E24] text-white rounded-xl hover:bg-[#2a5d42] transition-all shadow-lg group"
                      >
                        <div className="w-12 h-12 bg-[#C9F223] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Globe className="h-6 w-6 text-[#142E24]" />
                        </div>
                        <div>
                          <div className="font-semibold">Personal Website</div>
                          <div className="text-sm text-white/70">jiaren-iota.vercel.app</div>
                        </div>
                        <ChevronRight className="h-5 w-5 ml-auto group-hover:translate-x-1 transition-transform" />
                      </motion.a>
                      
                      <motion.a 
                        href="mailto:jiarenlyu@gmail.com"
                        whileHover={{ scale: 1.05, x: 10 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-4 p-4 bg-[#9b0e8d] text-white rounded-xl hover:bg-[#7a0b6f] transition-all shadow-lg group"
                      >
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="text-[#9b0e8d] text-xl">✉️</span>
                        </div>
                        <div>
                          <div className="font-semibold">Email Direct</div>
                          <div className="text-sm text-white/70">jiarenlyu@gmail.com</div>
                        </div>
                        <ChevronRight className="h-5 w-5 ml-auto group-hover:translate-x-1 transition-transform" />
                      </motion.a>
                      
                      <motion.a 
                        href="https://www.instagram.com/pascaldamonpacino/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05, x: 10 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg group"
                      >
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="text-purple-500 text-xl">📷</span>
                        </div>
                        <div>
                          <div className="font-semibold">Instagram</div>
                          <div className="text-sm text-white/70">@pascaldamonpacino</div>
                        </div>
                        <ChevronRight className="h-5 w-5 ml-auto group-hover:translate-x-1 transition-transform" />
                      </motion.a>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

             {/* Large VENTRY Section - Aviato Style */}
       <section className="bg-[#142E24]">
         {/* Content Section */}
         <div className="py-12">
           <div className="max-w-7xl mx-auto px-6 lg:px-8">
             <div className="grid lg:grid-cols-2 gap-12 items-start">
               {/* Left side - Logo and CTA */}
               <div className="space-y-8">
                 <div className="flex items-center justify-center lg:justify-start">
                   <span className="text-4xl font-bold text-white">VENTRY</span>
                 </div>
                 
                 <div className="space-y-4">
                   <p className="text-white/80 text-lg">Get the latest Ventry company updates</p>
                   
                   <div className="flex flex-col sm:flex-row gap-4 max-w-md items-center">
                     <input 
                       type="email" 
                       placeholder="What's your work email?"
                       value={footerEmail}
                       onChange={(e) => setFooterEmail(e.target.value)}
                       className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#C9F223]/50 w-full sm:w-auto"
                     />
                     <Button 
                       onClick={handleFooterDemoSubmit}
                       disabled={isSubmitting}
                       className="bg-[#C9F223] hover:bg-[#b8e01f] text-[#142E24] px-6 py-3 font-semibold rounded-lg whitespace-nowrap w-full sm:w-auto"
                     >
                       {isSubmitting ? 'Submitting...' : 'Book a demo'}
                     </Button>
                   </div>
                   {submitStatus === 'success' && (
                      <p className="text-sm text-green-400">Thank you! Your demo request has been submitted.</p>
                    )}
                    {submitStatus === 'error' && (
                      <p className="text-sm text-red-400">{submitErrorMessage || 'Please enter a valid email address.'}</p>
                    )}
                 </div>
               </div>
               
               {/* Right side - Company links */}
               <div className="flex justify-end">
                 <div className="space-y-4">
                   <h3 className="text-white font-semibold text-lg">Company</h3>
                   <ul className="space-y-3 text-white/70">
                     <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">X/Twitter</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                   </ul>
                 </div>
               </div>
             </div>
           </div>
         </div>
         
         {/* Large VENTRY Section at Bottom */}
         <div className="py-4 relative overflow-hidden">
           <div className="max-w-7xl mx-auto px-6 lg:px-8">
             <div className="flex items-center justify-center">
               {/* Large VENTRY text - centered */}
               <div className="text-[6rem] md:text-[8rem] lg:text-[10rem] xl:text-[12rem] font-bold text-white/10 tracking-tighter leading-none select-none">
                 VENTRY
               </div>
             </div>
           </div>
         </div>
         
         {/* Bottom links */}
         <div className="pb-6">
           <div className="max-w-7xl mx-auto px-6 lg:px-8">
             <div className="pt-6 border-t border-white/10">
               <div className="flex flex-col md:flex-row justify-between items-center">
                 <div className="flex space-x-6 text-sm text-white/60">
                   <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
                   <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                 </div>
                 <p className="text-sm text-white/60 mt-4 md:mt-0">
                   © Ventry 2024. All Rights Reserved.
                 </p>
               </div>
             </div>
           </div>
         </div>
       </section>

       {/* Email Modal */}
       <EmailModal
         isOpen={modalState.isOpen}
         onClose={closeModal}
         type={modalState.type}
         title={modalState.title}
         description={modalState.description}
       />
    </div>
  )
}

