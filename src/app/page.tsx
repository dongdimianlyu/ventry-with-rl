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
      <span className="text-[#C9F223] text-xs font-medium">ROI: +145%</span>
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
      <span className="text-[#C9F223] text-sm font-semibold">ROI: +{Math.floor(Math.random() * 200 + 100)}%</span>
      <ChevronRight className="h-4 w-4 text-gray-400" />
    </div>
  </motion.div>
)

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
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
                <Button className="bg-[#C9F223] hover:bg-[#b8e01f] text-[#1A4231] px-6 py-2 text-sm font-semibold rounded-md">
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
                <Button className="w-full bg-[#C9F223] hover:bg-[#b8e01f] text-[#1A4231] text-sm font-semibold">
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
                <Sparkles className="h-4 w-4 text-[#C9F223] mr-2" />
                <span className="text-[#C9F223] text-sm font-medium">
                  Your AI COO is here
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
                <span className="text-[#C9F223]">Chief Operating</span>
                <br />
                Officer
              </motion.h1>
              
              {/* Subheadline */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-xl text-white/80 leading-relaxed max-w-xl"
              >
                [Subheadline about AI-powered operations management for SMEs. Analyze business context, generate strategic tasks, execute via Slack + QuickBooks with human approval.]
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
            
            {/* Floating Task Cards */}
            <div className="relative">
              <div className="space-y-4">
                <FloatingTaskCard delay={1.0} className="ml-8" />
                <FloatingTaskCard delay={1.2} className="mr-8" />
                <FloatingTaskCard delay={1.4} className="ml-4" />
              </div>
              
              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.6, duration: 0.6 }}
                className="mt-8 grid grid-cols-2 gap-4"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="text-2xl font-bold text-[#C9F223]">145%</div>
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
              <div className="bg-[#C9F223]/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#C9F223]/20 transition-colors">
                <Database className="h-10 w-10 text-[#1A4231]" />
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
                <Brain className="h-10 w-10 text-[#1A4231]" />
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
              <div className="bg-[#C9F223]/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#C9F223]/20 transition-colors">
                <Workflow className="h-10 w-10 text-[#1A4231]" />
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
              <LiveDemoCard 
                title="Restock Smart Light Bulbs" 
                type="Inventory Task" 
                status="approved" 
                delay={0.2}
              />
              <LiveDemoCard 
                title="Optimize Email Campaign ROI" 
                type="Marketing Task" 
                status="pending" 
                delay={0.4}
              />
              <LiveDemoCard 
                title="Review Q3 Cash Flow" 
                type="Finance Task" 
                status="analyzing" 
                delay={0.6}
              />
            </div>
            
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <MessageSquare className="h-6 w-6 text-[#C9F223]" />
                  <h3 className="font-semibold text-gray-900">Slack Integration</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>VentryBot:</strong> New task recommendation:
                  </div>
                  <div className="text-sm text-gray-800 mb-2">
                    "Restock 25 units of Smart Light Bulbs"
                  </div>
                  <div className="text-sm text-[#C9F223] font-semibold mb-2">
                    Predicted ROI: +145% (~$435)
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
                  <Calculator className="h-6 w-6 text-[#C9F223]" />
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
              [Feature Section Title]
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              [Feature section description]
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 className="h-8 w-8" />,
                title: "[Feature 1 Title]",
                description: "[Feature 1 Description]"
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "[Feature 2 Title]",
                description: "[Feature 2 Description]"
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "[Feature 3 Title]",
                description: "[Feature 3 Description]"
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
                <div className="bg-[#C9F223]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#C9F223]/20 transition-colors">
                  <div className="text-[#1A4231]">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Trusted by SME Teams
            </h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center"
          >
            {['[Company 1]', '[Company 2]', '[Company 3]', '[Company 4]'].map((company, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-gray-400 font-semibold">{company}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-[#1A4231] relative overflow-hidden">
        <GeometricDecorations />
        
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
              [Final CTA Headline]
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              [Final value proposition and call to action]
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-[#C9F223] hover:bg-[#b8e01f] text-[#1A4231] px-8 py-4 text-lg font-semibold rounded-lg">
                  Start Free Trial
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-lg">
                  Schedule Demo
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A4231] border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/ventry-logo.png" 
                  alt="Ventry Logo" 
                  className="w-6 h-6 object-contain"
                />
                <span className="text-xl font-bold text-white">Ventry</span>
              </div>
              <p className="text-white/60 text-sm">
                Your AI Chief Operating Officer
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-[#C9F223]">Features</a></li>
                <li><a href="#" className="hover:text-[#C9F223]">Pricing</a></li>
                <li><a href="#" className="hover:text-[#C9F223]">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-[#C9F223]">About</a></li>
                <li><a href="#" className="hover:text-[#C9F223]">Careers</a></li>
                <li><a href="#" className="hover:text-[#C9F223]">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-[#C9F223]">Documentation</a></li>
                <li><a href="#" className="hover:text-[#C9F223]">Blog</a></li>
                <li><a href="#" className="hover:text-[#C9F223]">Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-white/60">
              © 2024 Ventry. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-white/60 mt-4 md:mt-0">
              <a href="#" className="hover:text-[#C9F223]">Privacy Policy</a>
              <a href="#" className="hover:text-[#C9F223]">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

