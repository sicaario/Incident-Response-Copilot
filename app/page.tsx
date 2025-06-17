"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Zap, Brain, Search, Database, Cloud, Terminal, Cpu, Code } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400 animate-pulse font-mono">INITIALIZING SYSTEM...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Animated Matrix-style background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.15),transparent_50%)]"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(56,189,248,0.1),transparent_50%)] animate-pulse"></div>

      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <Shield className="h-16 w-16 text-cyan-400 animate-pulse" />
              <div className="absolute inset-0 h-16 w-16 border-2 border-cyan-400 rounded-full animate-spin opacity-30"></div>
            </div>
          </div>

          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-mono tracking-wider">
            INCIDENT RESPONSE
          </h1>
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent font-mono">
            COPILOT
          </h2>

          <div className="max-w-4xl mx-auto mb-8">
            <p className="text-xl text-gray-300 mb-4 font-mono">&gt; AUTONOMOUS INCIDENT RESPONSE AUTOMATION</p>
            <p className="text-lg text-gray-400 font-mono leading-relaxed">
              Upload logs → Machine learning agents diagnose problems → Find root causes → Generate solutions
              automatically
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-lg px-8 py-4 border border-cyan-400/30 shadow-lg shadow-cyan-500/25"
            >
              <Link href="/auth/login">
                <Terminal className="mr-2 h-5 w-5" />
                ACCESS SYSTEM
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 font-mono text-lg px-8 py-4"
            >
              <Link href="/auth/register">
                <Code className="mr-2 h-5 w-5" />
                REGISTER
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="bg-gray-800/30 border-cyan-500/30 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 hover:border-cyan-400/50">
            <CardHeader>
              <Brain className="h-10 w-10 text-cyan-400 mb-3 animate-pulse" />
              <CardTitle className="text-cyan-400 font-mono">MULTI-AGENT PIPELINE</CardTitle>
              <CardDescription className="text-gray-300 font-mono text-sm">
                Machine learning agents for log parsing, root cause analysis, and solution generation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/30 border-green-500/30 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 hover:border-green-400/50">
            <CardHeader>
              <Search className="h-10 w-10 text-green-400 mb-3" />
              <CardTitle className="text-green-400 font-mono">WEB RESEARCH</CardTitle>
              <CardDescription className="text-gray-300 font-mono text-sm">
                Automatic search through StackOverflow, GitHub, and vendor docs for similar incidents
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/30 border-purple-500/30 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 hover:border-purple-400/50">
            <CardHeader>
              <Database className="h-10 w-10 text-purple-400 mb-3" />
              <CardTitle className="text-purple-400 font-mono">MEMORY STORAGE</CardTitle>
              <CardDescription className="text-gray-300 font-mono text-sm">
                Long-term memory for incident patterns and solutions using advanced ML
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/30 border-yellow-500/30 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 hover:border-yellow-400/50">
            <CardHeader>
              <Zap className="h-10 w-10 text-yellow-400 mb-3" />
              <CardTitle className="text-yellow-400 font-mono">FAST ANALYSIS</CardTitle>
              <CardDescription className="text-gray-300 font-mono text-sm">
                Powered by Groq LLaMA 3 70B for lightning-fast incident analysis
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/30 border-blue-500/30 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 hover:border-blue-400/50">
            <CardHeader>
              <Cloud className="h-10 w-10 text-blue-400 mb-3" />
              <CardTitle className="text-blue-400 font-mono">CLOUD-NATIVE</CardTitle>
              <CardDescription className="text-gray-300 font-mono text-sm">
                Fully hosted solution with distributed backend and storage
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/30 border-red-500/30 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 hover:border-red-400/50">
            <CardHeader>
              <Cpu className="h-10 w-10 text-red-400 mb-3" />
              <CardTitle className="text-red-400 font-mono">OPEN SOURCE</CardTitle>
              <CardDescription className="text-gray-300 font-mono text-sm">
                100% open-source for community adoption and contribution
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent font-mono">
            SYSTEM WORKFLOW
          </h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-3 font-mono font-bold text-lg group-hover:scale-110 transition-transform">
                01
              </div>
              <p className="text-sm font-mono text-cyan-400">UPLOAD LOGS</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-r from-green-600 to-cyan-600 text-white rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-3 font-mono font-bold text-lg group-hover:scale-110 transition-transform">
                02
              </div>
              <p className="text-sm font-mono text-green-400">ANALYSIS</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-3 font-mono font-bold text-lg group-hover:scale-110 transition-transform">
                03
              </div>
              <p className="text-sm font-mono text-purple-400">WEB RESEARCH</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-3 font-mono font-bold text-lg group-hover:scale-110 transition-transform">
                04
              </div>
              <p className="text-sm font-mono text-yellow-400">GET SOLUTIONS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
