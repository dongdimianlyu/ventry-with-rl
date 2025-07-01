import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Brain, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-slate-900">
            Ventry
          </div>
          <div className="space-x-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signin">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Your AI COO that tells you 
            <span className="text-blue-600"> what to focus on</span> every day
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Stop wondering what to work on next. Ventry analyzes your goals and generates 
            smart, actionable daily tasks that actually move your business forward.
          </p>
          <div className="space-x-4">
            <Link href="/auth/signin">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Focusing Today
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Stop the guesswork. Start the impact.
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Ventry combines AI intelligence with business expertise to give you 
            the clarity you need to make every day count.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Daily Actionable Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get 3-5 smart, prioritized tasks every day based on your goals. 
                No more wondering what to work on next.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Task Explanations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Every task comes with clear reasoning showing exactly why it matters 
                and how it connects to your goals.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Goal Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Simply input your quarterly, monthly, or weekly goals. Ventry 
                remembers them and tailors your daily tasks accordingly.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Feature 4 */}
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Expert Knowledge</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Powered by proven business strategies and operational playbooks. 
                Get recommendations backed by real expertise.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              How Ventry Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Three simple steps to transform your daily productivity
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Set Your Goals</h3>
              <p className="text-slate-600">
                Tell Ventry what you&apos;re trying to achieve this quarter, month, or week. 
                Be as specific or high-level as you want.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Get Smart Tasks</h3>
              <p className="text-slate-600">
                Every morning, Ventry analyzes your goals and generates 3-5 actionable 
                tasks that will actually move the needle.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Focus & Execute</h3>
              <p className="text-slate-600">
                Work through your prioritized tasks with confidence, knowing each one 
                is strategically aligned with your bigger picture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Benefits */}
      <section className="container mx-auto px-6 py-16">
        <div className="bg-slate-900 rounded-2xl text-white p-12 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Stop spinning your wheels. Start making progress.
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">85%</div>
              <p className="text-slate-300">More focused work sessions</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">3x</div>
              <p className="text-slate-300">Faster goal achievement</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">100%</div>
              <p className="text-slate-300">Clarity on daily priorities</p>
            </div>
          </div>
          <Link href="/auth/signin">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-100 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-slate-900 mb-4">Ventry</div>
              <p className="text-slate-600">
                Your AI COO for daily task prioritization and goal achievement.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Product</h3>
              <ul className="space-y-2 text-slate-600">
                <li><Link href="#" className="hover:text-slate-900">Features</Link></li>
                <li><Link href="#" className="hover:text-slate-900">Pricing</Link></li>
                <li><Link href="#" className="hover:text-slate-900">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Company</h3>
              <ul className="space-y-2 text-slate-600">
                <li><Link href="#" className="hover:text-slate-900">About</Link></li>
                <li><Link href="#" className="hover:text-slate-900">Blog</Link></li>
                <li><Link href="#" className="hover:text-slate-900">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Support</h3>
              <ul className="space-y-2 text-slate-600">
                <li><Link href="#" className="hover:text-slate-900">Help Center</Link></li>
                <li><Link href="#" className="hover:text-slate-900">Privacy</Link></li>
                <li><Link href="#" className="hover:text-slate-900">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-8 pt-8 text-center text-slate-600">
            <p>&copy; 2024 Ventry. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
