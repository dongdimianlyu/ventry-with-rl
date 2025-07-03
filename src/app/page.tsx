'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Brain, Users, Target, TrendingUp, Zap, Clock, Shield, Sparkles, Star, ChevronLeft, ChevronRight, Menu, X, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

const testimonials = [
  {
    quote: "Ventry transformed how our team approaches daily priorities. We're 3x more productive and finally aligned on what matters.",
    author: "Sarah Chen",
    role: "CEO, TechStart Inc.",
    rating: 5
  },
  {
    quote: "The AI explanations are game-changing. Finally understand why each task is important and how it connects to our bigger goals.",
    author: "Marcus Rodriguez", 
    role: "Founder, GrowthLab",
    rating: 5
  },
  {
    quote: "Ventry eliminated the daily 'what should we work on?' meetings. Our team knows exactly what to focus on each morning.",
    author: "Emma Thompson",
    role: "COO, Scale Solutions",
    rating: 5
  }
]

export default function LandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className="min-h-screen bg-[#2F5249] overflow-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-[#2F5249]/95 backdrop-blur-lg shadow-xl border-b border-[#C9F223]/10' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#C9F223] rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-[#2F5249]" />
              </div>
              <span className="text-3xl font-bold text-white tracking-tight">
                Ventry
              </span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-10">
              <a href="#features" className="text-white/80 hover:text-[#C9F223] transition-all duration-300 font-medium text-lg">Features</a>
              <a href="#how-it-works" className="text-white/80 hover:text-[#C9F223] transition-all duration-300 font-medium text-lg">How it Works</a>
              <a href="#testimonials" className="text-white/80 hover:text-[#C9F223] transition-all duration-300 font-medium text-lg">Testimonials</a>
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-white/80 hover:text-[#C9F223] hover:bg-[#C9F223]/10 text-lg">Sign In</Button>
              </Link>
              <Link href="/auth/signin">
                <Button className="bg-[#C9F223] hover:bg-[#C9F223]/90 text-[#2F5249] px-8 py-3 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-6 pb-6 border-t border-[#C9F223]/20 bg-[#2F5249]/95 backdrop-blur-lg rounded-2xl">
              <div className="flex flex-col space-y-6 pt-6">
                <a href="#features" className="text-white/80 hover:text-[#C9F223] transition-colors font-medium text-lg">Features</a>
                <a href="#how-it-works" className="text-white/80 hover:text-[#C9F223] transition-colors font-medium text-lg">How it Works</a>
                <a href="#testimonials" className="text-white/80 hover:text-[#C9F223] transition-colors font-medium text-lg">Testimonials</a>
                <Link href="/auth/signin">
                  <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-[#C9F223]">Sign In</Button>
                </Link>
                <Link href="/auth/signin">
                  <Button className="bg-[#C9F223] text-[#2F5249] w-full font-bold">Get Started</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2F5249] via-[#1a332b] to-[#2F5249]"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#C9F223]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-[#C9F223]/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C9F223]/3 rounded-full blur-3xl"></div>
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(201, 242, 35, 0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-6 py-32 text-center relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Badge */}
            <div className="mb-8 animate-fade-in-up">
              <span className="inline-flex items-center px-6 py-3 bg-[#C9F223]/10 backdrop-blur-sm rounded-full text-[#C9F223] text-sm font-semibold mb-8 border border-[#C9F223]/20">
                <Zap className="w-4 h-4 mr-2" />
                AI-Powered Chief Operating Officer
              </span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-black text-white mb-8 leading-none animate-fade-in-up delay-200 tracking-tight">
              Stop the
              <span className="text-[#C9F223] block"> guesswork.</span>
              Start the
              <span className="text-[#C9F223]"> impact.</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-2xl md:text-3xl text-white/80 mb-16 max-w-5xl mx-auto leading-relaxed animate-fade-in-up delay-400 font-light">
              Ventry is your AI‑powered Chief Operating Officer in a box—designed to take the guesswork and grunt work out of running teams so founders can focus on strategy and growth.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up delay-600">
              <Link href="/auth/signin">
                <Button size="lg" className="bg-[#C9F223] hover:bg-[#C9F223]/90 text-[#2F5249] px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                  Start Your Free Trial
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:border-[#C9F223] px-12 py-6 text-xl font-semibold rounded-2xl backdrop-blur-sm transition-all duration-300">
                Watch Demo
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-20 animate-fade-in-up delay-800">
              <p className="text-white/60 text-sm mb-6">Trusted by forward-thinking teams</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="text-white/40 font-bold text-lg">TECHSTART</div>
                <div className="text-white/40 font-bold text-lg">GROWTHLAB</div>
                <div className="text-white/40 font-bold text-lg">SCALE SOLUTIONS</div>
              </div>
            </div>
          </div>
        </div>

        {/* Diagonal Section Break */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-20 fill-white">
            <path d="M0,120L48,110C96,100,192,80,288,85.3C384,91,480,123,576,128C672,133,768,111,864,96C960,80,1056,72,1152,74.7L1200,77.3L1200,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-6xl md:text-7xl font-black text-[#2F5249] mb-8 tracking-tight">
              Built for
              <span className="text-[#C9F223]"> modern teams</span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
              From the moment you onboard, Ventry asks about your role, company size, and priorities, then generates razor‑sharp, personalized daily task lists.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
            {[
              {
                icon: <Target className="h-10 w-10" />,
                title: "Smart Daily Tasks",
                description: "Each morning you'll see only the essentials: clear titles, timestamps, and priority badges color‑coded for urgency.",
              },
              {
                icon: <Brain className="h-10 w-10" />,
                title: "AI-Powered Insights",
                description: "One tap expands any card into a full‑screen overlay revealing detailed instructions and rationale for why this task matters.",
              },
              {
                icon: <Users className="h-10 w-10" />,
                title: "Team Coordination",
                description: "Each member appears with their own horizontal task lanes, so you can glance at who's responsible for what.",
              },
              {
                icon: <TrendingUp className="h-10 w-10" />,
                title: "Proven Frameworks",
                description: "Draws on impact–effort prioritization, SMART goals, and proven workflows to ensure actionable suggestions.",
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 shadow-lg bg-white">
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto mb-6 w-20 h-20 bg-[#2F5249] rounded-3xl flex items-center justify-center text-[#C9F223] group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold text-[#2F5249] mb-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed text-lg">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Wave Transition */}
        <div className="relative">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-20 fill-[#2F5249]">
            <path d="M0,0L48,10C96,20,192,40,288,35.3C384,29,480,0,576,0C672,0,768,29,864,40C960,53,1056,59,1152,56L1200,53.3L1200,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 bg-[#2F5249]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-6xl md:text-7xl font-black text-white mb-8 tracking-tight">
              How
              <span className="text-[#C9F223]"> Ventry works</span>
            </h2>
            <p className="text-2xl text-white/80 max-w-4xl mx-auto font-light leading-relaxed">
              Three simple steps to transform your daily productivity and team coordination
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16 max-w-7xl mx-auto">
            {[
              {
                step: "01",
                title: "Onboard & Configure",
                description: "Tell Ventry about your role, company size, core priorities, and team capabilities. Upload any non‑confidential context to personalize your experience.",
                icon: <Zap className="h-12 w-12" />
              },
              {
                step: "02", 
                title: "Receive Daily Tasks",
                description: "Every morning, get razor‑sharp, personalized task lists. Each task shows clear priority, timestamp, and connects to your bigger strategic goals.",
                icon: <Clock className="h-12 w-12" />
              },
              {
                step: "03",
                title: "Execute with Confidence", 
                description: "Work through prioritized tasks knowing each one is strategically aligned. Track progress and let Ventry learn from your patterns.",
                icon: <Shield className="h-12 w-12" />
              }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-12">
                  <div className="w-32 h-32 bg-[#C9F223] rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-xl relative">
                    <div className="text-[#2F5249] font-black text-2xl absolute top-4 left-4">{step.step}</div>
                    <div className="text-[#2F5249]">{step.icon}</div>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-6">{step.title}</h3>
                <p className="text-white/80 leading-relaxed text-xl font-light">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-6xl md:text-7xl font-black text-[#2F5249] mb-8 tracking-tight">
              Trusted by
              <span className="text-[#C9F223]"> leaders</span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-light">
              See how Ventry transforms daily operations for growing teams
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl p-16 text-center relative shadow-2xl border border-gray-100">
              <div className="flex justify-center mb-8">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="h-8 w-8 text-[#C9F223] fill-current" />
                ))}
              </div>
              
              <blockquote className="text-3xl md:text-4xl text-[#2F5249] font-medium mb-12 leading-relaxed">
                &ldquo;{testimonials[currentTestimonial].quote}&rdquo;
              </blockquote>
              
              <div className="flex items-center justify-center space-x-6">
                <div className="w-20 h-20 bg-[#2F5249] rounded-full flex items-center justify-center">
                  <span className="text-[#C9F223] font-bold text-xl">
                    {testimonials[currentTestimonial].author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-[#2F5249] font-bold text-2xl">{testimonials[currentTestimonial].author}</p>
                  <p className="text-gray-600 text-lg">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-center space-x-4 mt-12">
                <button 
                  onClick={prevTestimonial}
                  className="w-16 h-16 bg-[#2F5249]/10 hover:bg-[#2F5249]/20 rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="h-8 w-8 text-[#2F5249]" />
                </button>
                <button 
                  onClick={nextTestimonial}
                  className="w-16 h-16 bg-[#2F5249]/10 hover:bg-[#2F5249]/20 rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="h-8 w-8 text-[#2F5249]" />
                </button>
              </div>

              {/* Dots */}
              <div className="flex justify-center space-x-3 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-4 h-4 rounded-full transition-colors ${
                      index === currentTestimonial ? 'bg-[#C9F223]' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-[#2F5249] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#2F5249] to-[#1a332b]"></div>
        <div className="absolute top-20 right-20 w-80 h-80 bg-[#C9F223]/5 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-6xl md:text-7xl font-black text-white mb-12 tracking-tight">
            Ready to stop the
            <span className="text-[#C9F223]"> guesswork?</span>
          </h2>
          <p className="text-2xl text-white/80 mb-16 max-w-5xl mx-auto leading-relaxed font-light">
            An always‑on, adaptive ops engine that learns as you go, prevents redundancy, and refines recommendations so your team moves forward with clarity and confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <Link href="/auth/signin">
              <Button size="lg" className="bg-[#C9F223] hover:bg-[#C9F223]/90 text-[#2F5249] px-16 py-8 text-2xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                Start Free Trial
                <ArrowRight className="ml-4 h-7 w-7" />
              </Button>
            </Link>
            <div className="text-center">
              <p className="text-white/60 text-lg">
                No credit card required • 14-day free trial
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2F5249] py-20 border-t border-[#C9F223]/10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-[#C9F223] rounded-xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-[#2F5249]" />
                </div>
                <span className="text-3xl font-bold text-white">
                  Ventry
                </span>
              </div>
              <p className="text-white/70 leading-relaxed text-lg">
                Your AI‑powered Chief Operating Officer designed for modern teams.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-6 text-xl">Product</h3>
              <ul className="space-y-4 text-white/70 text-lg">
                <li><a href="#features" className="hover:text-[#C9F223] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#C9F223] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#C9F223] transition-colors">Demo</a></li>
                <li><a href="#" className="hover:text-[#C9F223] transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-6 text-xl">Company</h3>
              <ul className="space-y-4 text-white/70 text-lg">
                <li><a href="#" className="hover:text-[#C9F223] transition-colors">About</a></li>
                <li><a href="#" className="hover:text-[#C9F223] transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-[#C9F223] transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-[#C9F223] transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-6 text-xl">Support</h3>
              <ul className="space-y-4 text-white/70 text-lg">
                <li><a href="#" className="hover:text-[#C9F223] transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-[#C9F223] transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-[#C9F223] transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-[#C9F223] transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[#C9F223]/20 pt-12 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-lg">
              © 2024 Ventry. All rights reserved.
            </p>
            <div className="flex space-x-8 mt-6 md:mt-0">
              <a href="#" className="text-white/60 hover:text-[#C9F223] transition-colors">
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                </svg>
              </a>
              <a href="#" className="text-white/60 hover:text-[#C9F223] transition-colors">
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="text-white/60 hover:text-[#C9F223] transition-colors">
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 3.462-2.175 4.741-1.279 1.279-2.883 2.006-4.741 2.175-.445.04-.875.04-1.292 0-1.858-.169-3.462-.896-4.741-2.175C3.34 11.622 2.613 10.018 2.444 8.16c-.04-.445-.04-.875 0-1.292.169-1.858.896-3.462 2.175-4.741C5.898 1.848 7.502 1.121 9.36.952c.445-.04.875-.04 1.292 0 1.858.169 3.462.896 4.741 2.175 1.279 1.279 2.006 2.883 2.175 4.741.04.417.04.847 0 1.292z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
