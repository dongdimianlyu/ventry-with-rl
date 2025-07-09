'use client'

import { Button } from "@/components/ui/button"
import { ArrowRight, Brain, Users, Target, TrendingUp, Zap, Clock, Shield, Sparkles, Menu, X, CheckCircle, BarChart3, MessageSquare, Calculator, Play } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Navigation - Matching Aviato exactly */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white">
                Ventry
              </span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-white/80 hover:text-[#c9f222] transition-colors text-sm font-medium">Features</a>
              <a href="#how-it-works" className="text-white/80 hover:text-[#c9f222] transition-colors text-sm font-medium">How it Works</a>
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-white/80 hover:text-[#c9f222] text-sm">Login</Button>
              </Link>
              <Button className="bg-[#c9f222] hover:bg-[#b8e01f] text-[#023e34] px-6 py-2 text-sm font-semibold rounded-md">
                Get a demo
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Dark green background like Aviato */}
      <section className="min-h-screen bg-[#023e34] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center px-3 py-1 bg-[#c9f222]/10 border border-[#c9f222]/20 rounded-full">
                <span className="text-[#c9f222] text-sm font-medium">
                  We just launched Ventry AI
                </span>
                <ArrowRight className="ml-2 h-3 w-3 text-[#c9f222]" />
              </div>
              
              {/* Main Headline - Large and bold like Aviato */}
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight tracking-tight">
                AI Operations Partner for
                <br />
                <span className="text-[#c9f222]">SMEs</span>
              </h1>
              
              {/* Subheadline */}
              <p className="text-xl text-white/80 leading-relaxed max-w-xl">
                You don't need an operating manager anymore. Ventry handles the gnarly, messy, behind-the-scenes operational work so you can just build something great.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-4">
                  <input 
                    type="email" 
                    placeholder="Email"
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/60 flex-1 min-w-[200px] backdrop-blur-sm"
                  />
                  <Button className="bg-[#c9f222] hover:bg-[#b8e01f] text-[#023e34] px-6 py-3 font-semibold rounded-md whitespace-nowrap">
                    Request a demo
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Hero Image/Stats Area */}
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-2xl font-bold text-[#c9f222]">$200K</div>
                    <div className="text-sm text-white/60">Monthly Revenue</div>
                    <div className="text-xs text-[#c9f222] mt-1">Target SME Range</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-2xl font-bold text-[#c9f222]">74K</div>
                    <div className="text-sm text-white/60">Operations Automated</div>
                    <div className="text-xs text-[#c9f222] mt-1">Recent automation spike</div>
                  </div>
                </div>
                
                <div className="text-center py-4">
                  <div className="text-sm text-white/60 mb-2">Trusted by SME teams</div>
                  <div className="flex justify-center space-x-6 text-white/40 text-xs font-semibold">
                    <span>SHOPIFY</span>
                    <span>SLACK</span>
                    <span>QUICKBOOKS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Ventry Section - White background */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              What is Ventry?
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                The most intelligent operations partner built for SMEs generating $100K–$200K in monthly revenue.
              </h3>
              <div className="space-y-4 text-gray-600">
                <p>Leveraging large language models and Retrieval-Augmented Generation (RAG)</p>
                <p>Generates daily, context-specific task recommendations</p>
                <p>Integrates with Shopify, Slack, and QuickBooks seamlessly</p>
              </div>
              <Button className="mt-6 bg-[#9b0e8d] hover:bg-[#8a0c7a] text-white px-6 py-3 rounded-md">
                Try it
              </Button>
            </div>
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="text-6xl mb-4">🤖</div>
              <div className="text-sm text-gray-500">AI Operations Dashboard</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - White background with purple accents */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              The most comprehensive operations view there is, made accessible to you
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-gray-50 rounded-xl p-8 mb-4 group-hover:bg-[#9b0e8d]/5 transition-colors">
                <Brain className="h-12 w-12 text-[#9b0e8d] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
                <p className="text-gray-600 text-sm">Context-specific recommendations using LLMs and RAG technology</p>
              </div>
              <Button variant="outline" className="border-[#9b0e8d] text-[#9b0e8d] hover:bg-[#9b0e8d] hover:text-white">
                Try it
              </Button>
            </div>
            
            <div className="text-center group">
              <div className="bg-gray-50 rounded-xl p-8 mb-4 group-hover:bg-[#9b0e8d]/5 transition-colors">
                <MessageSquare className="h-12 w-12 text-[#9b0e8d] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Slack Integration</h3>
                <p className="text-gray-600 text-sm">One-click approvals and seamless team communication</p>
              </div>
              <Button variant="outline" className="border-[#9b0e8d] text-[#9b0e8d] hover:bg-[#9b0e8d] hover:text-white">
                Try it
              </Button>
            </div>
            
            <div className="text-center group">
              <div className="bg-gray-50 rounded-xl p-8 mb-4 group-hover:bg-[#9b0e8d]/5 transition-colors">
                <Calculator className="h-12 w-12 text-[#9b0e8d] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">QuickBooks Execution</h3>
                <p className="text-gray-600 text-sm">Direct execution in your accounting system with ROI tracking</p>
              </div>
              <Button variant="outline" className="border-[#9b0e8d] text-[#9b0e8d] hover:bg-[#9b0e8d] hover:text-white">
                Try it
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section - White with team photos layout */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Work wherever you work with our API
              </h3>
              <p className="text-gray-600 mb-6">
                Ventry connects seamlessly with Shopify, Slack, and QuickBooks. Powerful API enables an easy transition to data-driven operational decisions, no process disruption.
              </p>
              <Button className="bg-[#9b0e8d] hover:bg-[#8a0c7a] text-white px-6 py-3 rounded-md">
                Check it out
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Operations Dashboard</span>
                </div>
                <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Slack Integration</span>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">QuickBooks Sync</span>
                </div>
                <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Shopify Analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features List Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What we do</h2>
            <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Powerful features and intelligence for your operations
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              'AI-powered task generation',
              'Reinforcement learning optimization',
              'Seamless integrations',
              'ROI tracking and predictions',
              'One-click Slack approvals',
              'Real-time data processing'
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <h4 className="text-xl font-semibold text-gray-900">{feature}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
            We handle the hard operational work<br />
            so you can focus on your business.
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <input 
              type="email" 
              placeholder="Email"
              className="px-4 py-3 border border-gray-300 rounded-md flex-1 max-w-xs"
            />
            <Button className="bg-[#9b0e8d] hover:bg-[#8a0c7a] text-white px-6 py-3 rounded-md">
              Request a demo
            </Button>
          </div>
          
          <p className="text-sm text-gray-600">Get the latest Ventry company updates</p>
        </div>
      </section>

      {/* Large VENTRY Section */}
      <section className="py-32 bg-[#023e34]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-bold text-[#c9f222] tracking-tighter leading-none">
            VENTRY
          </h1>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-[#9b0e8d]">Careers</a></li>
                <li><a href="#" className="hover:text-[#9b0e8d]">Contact</a></li>
                <li><a href="#" className="hover:text-[#9b0e8d]">X/Twitter</a></li>
                <li><a href="#" className="hover:text-[#9b0e8d]">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © Ventry 2024. All Rights Reserved.
            </p>
            <div className="flex space-x-6 text-sm text-gray-600 mt-4 md:mt-0">
              <a href="#" className="hover:text-[#9b0e8d]">Terms & Conditions</a>
              <a href="#" className="hover:text-[#9b0e8d]">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
