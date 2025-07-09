'use client'

import { Button } from "@/components/ui/button"
import { ArrowRight, Brain, Users, Target, TrendingUp, Zap, Clock, Shield, Sparkles, Menu, X, CheckCircle, BarChart3, MessageSquare, Calculator } from "lucide-react"
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#00D632] rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-[#0A2A1A]" />
              </div>
              <span className="text-xl font-semibold text-[#0A2A1A] tracking-tight">
                Ventry
              </span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-[#0A2A1A] transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-[#0A2A1A] transition-colors font-medium">How it Works</a>
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-gray-600 hover:text-[#0A2A1A]">Sign In</Button>
              </Link>
              <Button className="bg-[#00D632] hover:bg-[#00B82A] text-[#0A2A1A] px-6 py-2 font-medium rounded-lg transition-all duration-200">
                Request a Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-[#0A2A1A]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-100">
              <div className="flex flex-col space-y-4 pt-4">
                <a href="#features" className="text-gray-600 hover:text-[#0A2A1A] transition-colors font-medium">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-[#0A2A1A] transition-colors font-medium">How it Works</a>
                <Link href="/auth/signin">
                  <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-[#0A2A1A]">Sign In</Button>
                </Link>
                <Button className="bg-[#00D632] text-[#0A2A1A] w-full font-medium">Request a Demo</Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 bg-[#E8F5E8] rounded-full text-[#0A2A1A] text-sm font-medium">
                <Zap className="w-4 h-4 mr-2" />
                AI-Powered Operations Partner
              </span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#0A2A1A] mb-8 leading-tight tracking-tight">
              You don't need an
              <br />
              <span className="text-gray-600">operating manager</span>
              <br />
              anymore.
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Ventry is an AI-powered operations partner built for SMEs generating $100K–$200K in monthly revenue. By integrating with Shopify, Slack, and QuickBooks, Ventry surfaces urgent, high-impact operational decisions — such as when to restock a product, pause an underperforming ad, or adjust supplier terms.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button size="lg" className="bg-[#00D632] hover:bg-[#00B82A] text-[#0A2A1A] px-8 py-4 text-lg font-medium rounded-lg transition-all duration-200">
                Request a Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/auth/signin">
                <Button variant="outline" size="lg" className="border-[#00D632] text-[#0A2A1A] hover:bg-[#E8F5E8] px-8 py-4 text-lg font-medium rounded-lg transition-all duration-200">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

             {/* Features Section */}
       <section id="features" className="py-20 bg-[#F8FDF8]">
         <div className="max-w-6xl mx-auto px-6 lg:px-8">
           <div className="text-center mb-16">
             <h2 className="text-4xl md:text-5xl font-bold text-[#0A2A1A] mb-6 tracking-tight">
               Intelligent decisions,
               <br />
               <span className="text-gray-600">automatic execution</span>
             </h2>
             <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
               Leveraging large language models and Retrieval-Augmented Generation (RAG), Ventry generates daily, context-specific task recommendations based on each store's unique sales, inventory, marketing, and financial data — not generic templates.
             </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             <div className="text-center">
               <div className="w-12 h-12 bg-[#0A2A1A] rounded-lg flex items-center justify-center mx-auto mb-4">
                 <Brain className="h-6 w-6 text-[#00D632]" />
               </div>
               <h3 className="text-lg font-semibold text-[#0A2A1A] mb-2">AI-Powered Insights</h3>
               <p className="text-gray-600 text-sm">Context-specific recommendations using LLMs and RAG technology</p>
             </div>
             
             <div className="text-center">
               <div className="w-12 h-12 bg-[#0A2A1A] rounded-lg flex items-center justify-center mx-auto mb-4">
                 <MessageSquare className="h-6 w-6 text-[#00D632]" />
               </div>
               <h3 className="text-lg font-semibold text-[#0A2A1A] mb-2">Slack Integration</h3>
               <p className="text-gray-600 text-sm">One-click approvals and seamless team communication</p>
             </div>
             
             <div className="text-center">
               <div className="w-12 h-12 bg-[#0A2A1A] rounded-lg flex items-center justify-center mx-auto mb-4">
                 <Calculator className="h-6 w-6 text-[#00D632]" />
               </div>
               <h3 className="text-lg font-semibold text-[#0A2A1A] mb-2">QuickBooks Execution</h3>
               <p className="text-gray-600 text-sm">Direct execution in your accounting system with ROI tracking</p>
             </div>
             
             <div className="text-center">
               <div className="w-12 h-12 bg-[#0A2A1A] rounded-lg flex items-center justify-center mx-auto mb-4">
                 <TrendingUp className="h-6 w-6 text-[#00D632]" />
               </div>
               <h3 className="text-lg font-semibold text-[#0A2A1A] mb-2">Reinforcement Learning</h3>
               <p className="text-gray-600 text-sm">Continuously learns from feedback to predict profitable actions</p>
             </div>
           </div>
         </div>
       </section>

             {/* How It Works Section */}
       <section id="how-it-works" className="py-20">
         <div className="max-w-6xl mx-auto px-6 lg:px-8">
           <div className="text-center mb-16">
             <h2 className="text-4xl md:text-5xl font-bold text-[#0A2A1A] mb-6 tracking-tight">
               From data to decisions
               <br />
               <span className="text-gray-600">in minutes</span>
             </h2>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="text-center lg:text-left">
               <div className="w-16 h-16 bg-[#E8F5E8] rounded-lg flex items-center justify-center mx-auto lg:mx-0 mb-6">
                 <span className="text-2xl font-bold text-[#0A2A1A]">1</span>
               </div>
               <h3 className="text-xl font-semibold text-[#0A2A1A] mb-4">Connect Your Systems</h3>
               <p className="text-gray-600 leading-relaxed">
                 Seamlessly integrate with Shopify, Slack, and QuickBooks to create a unified operational dashboard.
               </p>
             </div>
             
             <div className="text-center lg:text-left">
               <div className="w-16 h-16 bg-[#E8F5E8] rounded-lg flex items-center justify-center mx-auto lg:mx-0 mb-6">
                 <span className="text-2xl font-bold text-[#0A2A1A]">2</span>
               </div>
               <h3 className="text-xl font-semibold text-[#0A2A1A] mb-4">Receive Smart Recommendations</h3>
               <p className="text-gray-600 leading-relaxed">
                 Get daily, context-specific task recommendations with clear ROI estimates and confidence scores.
               </p>
             </div>
             
             <div className="text-center lg:text-left">
               <div className="w-16 h-16 bg-[#E8F5E8] rounded-lg flex items-center justify-center mx-auto lg:mx-0 mb-6">
                 <span className="text-2xl font-bold text-[#0A2A1A]">3</span>
               </div>
               <h3 className="text-xl font-semibold text-[#0A2A1A] mb-4">Execute with Confidence</h3>
               <p className="text-gray-600 leading-relaxed">
                 Approve actions via Slack and let Ventry execute directly in your systems while learning from results.
               </p>
             </div>
           </div>
         </div>
       </section>

             {/* Integration Showcase */}
       <section className="py-20 bg-[#F8FDF8]">
         <div className="max-w-6xl mx-auto px-6 lg:px-8">
           <div className="text-center mb-16">
             <h2 className="text-4xl md:text-5xl font-bold text-[#0A2A1A] mb-6 tracking-tight">
               Works with your
               <br />
               <span className="text-gray-600">existing tools</span>
             </h2>
           </div>
           
           <div className="flex justify-center items-center space-x-12 opacity-60">
             <div className="text-2xl font-bold text-gray-400">SHOPIFY</div>
             <div className="text-2xl font-bold text-gray-400">SLACK</div>
             <div className="text-2xl font-bold text-gray-400">QUICKBOOKS</div>
           </div>
         </div>
       </section>

             {/* CTA Section */}
       <section className="py-20">
         <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
           <h2 className="text-4xl md:text-5xl font-bold text-[#0A2A1A] mb-8 tracking-tight">
             Ready to transform
             <br />
             <span className="text-gray-600">your operations?</span>
           </h2>
           <p className="text-xl text-gray-600 mb-12 leading-relaxed">
             A reinforcement learning agent continuously learns from feedback and predicts the most profitable actions, providing clear ROI estimates and confidence scores.
           </p>
           
           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
             <Button size="lg" className="bg-[#00D632] hover:bg-[#00B82A] text-[#0A2A1A] px-8 py-4 text-lg font-medium rounded-lg transition-all duration-200">
               Request a Demo
               <ArrowRight className="ml-2 h-5 w-5" />
             </Button>
             <Link href="/auth/signin">
               <Button variant="outline" size="lg" className="border-[#00D632] text-[#0A2A1A] hover:bg-[#E8F5E8] px-8 py-4 text-lg font-medium rounded-lg transition-all duration-200">
                 Start Free Trial
               </Button>
             </Link>
           </div>
         </div>
       </section>

             {/* Large VENTRY Section */}
       <section className="py-32 bg-[#0A2A1A]">
         <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
           <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-bold text-[#00D632] tracking-tighter leading-none">
             VENTRY
           </h1>
           <p className="text-xl text-gray-300 mt-8 max-w-2xl mx-auto">
             The AI-powered operations partner that eliminates the need for an operating manager.
           </p>
         </div>
       </section>

             {/* Footer */}
       <footer className="bg-white border-t border-gray-100 py-12">
         <div className="max-w-6xl mx-auto px-6 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-center">
             <div className="flex items-center space-x-3 mb-4 md:mb-0">
               <div className="w-8 h-8 bg-[#00D632] rounded-lg flex items-center justify-center">
                 <Sparkles className="h-4 w-4 text-[#0A2A1A]" />
               </div>
               <span className="text-xl font-semibold text-[#0A2A1A] tracking-tight">
                 Ventry
               </span>
             </div>
             
             <div className="flex items-center space-x-8">
               <a href="#" className="text-gray-600 hover:text-[#0A2A1A] transition-colors">Privacy</a>
               <a href="#" className="text-gray-600 hover:text-[#0A2A1A] transition-colors">Terms</a>
               <a href="#" className="text-gray-600 hover:text-[#0A2A1A] transition-colors">Contact</a>
             </div>
           </div>
           
           <div className="mt-8 pt-8 border-t border-gray-100 text-center">
             <p className="text-gray-500 text-sm">
               © 2024 Ventry. All rights reserved.
             </p>
           </div>
         </div>
       </footer>
    </div>
  )
}
