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
      <span className="text-[#C9F223] text-xs font-medium">ROI: +30%</span>
      <div className="flex space-x-2">
        <button className="bg-[#C9F223] text-[#1A4231] px-3 py-1 rounded text-xs font-medium">
          Approve
        </button>
        <button className="bg-white/10 text-white/80 px-3 py-1 rounded text-xs font-medium">
          Reject
        </button>
      </div>
    </div>
  </motion.div>
)

// Geometric Background Decorations
const GeometricDecorations = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute top-20 right-20 w-32 h-32 border border-[#C9F223]/10 rounded-full"
    />
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-40 left-20 w-4 h-4 bg-[#C9F223]/20 rounded-full"
    />
    <motion.div
      animate={{ x: [0, 10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-1/2 right-40 w-2 h-2 bg-[#C9F223]/30 rounded-full"
    />
    <div className="absolute top-10 left-1/4 w-px h-20 bg-gradient-to-b from-[#C9F223]/20 to-transparent" />
    <div className="absolute bottom-20 right-1/3 w-20 h-px bg-gradient-to-r from-[#C9F223]/20 to-transparent" />
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
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -50])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

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
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-sm' : 'bg-transparent'
        }`}
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
                isScrolled ? 'text-[#1A4231]' : 'text-white'
              }`}>
                Ventry
              </span>
            </motion.div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className={`transition-colors text-sm font-medium ${
                isScrolled ? 'text-gray-600 hover:text-[#1A4231]' : 'text-white/80 hover:text-[#C9F223]'
              }`}>
                Features
              </a>
              <a href="#how-it-works" className={`transition-colors text-sm font-medium ${
                isScrolled ? 'text-gray-600 hover:text-[#1A4231]' : 'text-white/80 hover:text-[#C9F223]'
              }`}>
                How it Works
              </a>
              <a href="#demo" className={`transition-colors text-sm font-medium ${
                isScrolled ? 'text-gray-600 hover:text-[#1A4231]' : 'text-white/80 hover:text-[#C9F223]'
              }`}>
                Demo
              </a>
              <Link href="/auth/signin">
                <Button variant="ghost" className={`text-sm ${
                  isScrolled ? 'text-gray-600 hover:text-[#1A4231]' : 'text-white/80 hover:text-[#C9F223]'
                }`}>
                  Login
                </Button>
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={openGetDemoModal}
                  className="bg-[#C9F223] hover:bg-[#b8e01f] text-[#1A4231] px-6 py-2 text-sm font-semibold rounded-md"
                >
                  Get Demo
                </Button>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className={`md:hidden p-2 ${isScrolled ? 'text-[#1A4231]' : 'text-white'}`}
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
                <a href="#features" className="block text-gray-600 hover:text-[#1A4231] text-sm font-medium">
                  Features
                </a>
                <a href="#how-it-works" className="block text-gray-600 hover:text-[#1A4231] text-sm font-medium">
                  How it Works
                </a>
                <a href="#demo" className="block text-gray-600 hover:text-[#1A4231] text-sm font-medium">
                  Demo
                </a>
                <Link href="/auth/signin" className="block text-gray-600 hover:text-[#1A4231] text-sm font-medium">
                  Login
                </Link>
                <Button 
                  onClick={openGetDemoModal}
                  className="w-full bg-[#C9F223] hover:bg-[#b8e01f] text-[#1A4231] text-sm font-semibold"
                >
                  Get Demo
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="min-h-screen bg-[#1A4231] relative overflow-hidden">
        <GeometricDecorations />
        
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            <div className="space-y-8">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center px-4 py-2 bg-[#C9F223]/10 border border-[#C9F223]/20 rounded-full"
              >
                <Database className="h-4 w-4 text-[#C9F223] mr-2" />
                <span className="text-[#C9F223] text-sm font-medium">
                Your AI Operations Partner
                </span>
                <ArrowRight className="ml-2 h-3 w-3 text-[#C9F223]" />
              </motion.div>
              
              {/* Main Headline */}
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight tracking-tight"
              >
                Your AI
                <br />
                <span className="text-[#C9F223]">Operations</span>
                <br />
                <span className="text-[#C9F223]">Partner</span>
              </motion.h1>
              
              {/* Subheadline */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-xl text-white/80 leading-relaxed max-w-xl"
              >
                [AI-powered operations clarity for growing teams."
                  Understands your business, Cuts through the noise. Reveals where to focus. Aligns your company around for maximized profit]
              </motion.p>
              
              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openGetDemoModal}
                  className="bg-[#C9F223] hover:bg-[#b8e01f] text-[#1A4231] px-8 py-4 font-semibold rounded-lg cursor-pointer inline-flex items-center justify-center"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 font-semibold rounded-lg cursor-pointer inline-flex items-center justify-center"
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 ml-2" />
                </motion.div>
              </motion.div>
            </div>
            
                         {/* Single AI Task Card */}
             <div className="relative">
               <motion.div
                 initial={{ opacity: 0, y: 20, scale: 0.9 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 transition={{ delay: 1.0, duration: 0.6, ease: "easeOut" }}
                 className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6"
               >
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center space-x-2">
                     <div className="w-2 h-2 bg-[#C9F223] rounded-full"></div>
                     <span className="text-white/80 text-sm font-medium">AI Suggestion</span>
                   </div>
                   <span className="text-[#C9F223] text-xs font-semibold">HIGH ROI</span>
                 </div>
                 
                 <h4 className="text-white font-semibold text-lg mb-3">
                   Restock 25 units of Smart Light Bulbs
                 </h4>
                 
                 <p className="text-white/70 text-sm mb-4 leading-relaxed">
                   AI recommends immediate restock of 25 units for Home Automation category (Smart Light Bulbs) to optimize inventory levels and maximize revenue.
                 </p>
                 
                 <div className="bg-white/5 rounded-lg p-3 mb-4">
                   <p className="text-white/60 text-xs leading-relaxed">
                     <span className="text-[#C9F223] font-medium">Reasoning:</span> Seasonal uptick detected for smart home devices category. Machine learning model predicts ~3x sales increase over next 14 days based on historical patterns.
                   </p>
                 </div>
                 
                 <div className="flex items-center justify-between">
                   <span className="text-[#C9F223] text-sm font-medium">ROI: +30%</span>
                   <div className="flex space-x-2">
                     <button className="bg-[#C9F223] text-[#1A4231] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#b8e01f] transition-colors">
                       Approve
                     </button>
                     <button className="bg-white/10 text-white/80 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors">
                       Reject
                     </button>
                   </div>
                 </div>
               </motion.div>
               
               {/* Stats Cards */}
               <motion.div
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 1.4, duration: 0.6 }}
                 className="mt-8 grid grid-cols-2 gap-4"
               >
                 <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                   <div className="text-2xl font-bold text-[#C9F223]">75%</div>
                   <div className="text-sm text-white/60">Avg ROI Increase</div>
                 </div>
                 <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                   <div className="text-2xl font-bold text-[#C9F223]">87%</div>
                   <div className="text-sm text-white/60">Task Accuracy</div>
                 </div>
               </motion.div>
             </div>
          </div>
        </motion.div>
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
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              [Explanation of the 3-step process: Analyze ops data, Generate strategic tasks, Execute via integrations]
            </p>
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
                [Description of how AI analyzes business context from Shopify, QuickBooks, and other sources]
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
                             <div className="bg-[#C9F223]/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#C9F223]/20 transition-colors">
                 <Brain className="h-10 w-10 text-[#C9F223]" />
               </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Generate Strategic Tasks</h3>
              <p className="text-gray-600 mb-6">
                [Description of how RL algorithms create profit-maximizing tasks with ROI predictions]
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
                [Description of how tasks are executed through Slack approvals and QuickBooks actions]
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
              [Description of live demo showing AI task generation, Slack approvals, and QuickBooks execution]
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
                   <span className="text-[#9b0e8d] text-sm font-semibold">ROI: +67%</span>
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
                   <span className="text-[#9b0e8d] text-sm font-semibold">ROI: +127%</span>
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
                   <span className="text-[#9b0e8d] text-sm font-semibold">ROI: +43%</span>
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
              Advanced AI capabilities designed to optimize your operations and maximize ROI
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
                icon: <Zap className="h-8 w-8" />,
                title: "AI Tasks",
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
                      <CheckCircle className="h-5 w-5 text-[#1A4231]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Choose Your Tasks</h3>
                      <p className="text-gray-600">You decide which AI suggestions to approve or reject. Every recommendation requires your explicit approval.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#C9F223]/20 rounded-full p-2 mt-1">
                      <CheckCircle className="h-5 w-5 text-[#1A4231]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Manual or Automatic</h3>
                      <p className="text-gray-600">Auto-execution only activates when you choose to connect QuickBooks. You can always run tasks manually.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#C9F223]/20 rounded-full p-2 mt-1">
                      <CheckCircle className="h-5 w-5 text-[#1A4231]" />
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
                      <button className="flex-1 bg-[#C9F223] text-[#1A4231] py-2 px-4 rounded-lg text-sm font-medium">
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

             {/* Large VENTRY Section - Aviato Style */}
       <section className="bg-[#1A4231]">
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
                   
                   <div className="flex flex-col sm:flex-row gap-4 max-w-md">
                     <input 
                       type="email" 
                       placeholder="What's your work email?"
                       className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#C9F223]/50"
                     />
                     <Button 
                       onClick={openBookDemoModal}
                       className="bg-[#C9F223] hover:bg-[#b8e01f] text-[#1A4231] px-6 py-3 font-semibold rounded-lg whitespace-nowrap"
                     >
                       Book a demo
                     </Button>
                   </div>
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

