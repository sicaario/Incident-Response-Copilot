"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle, XCircle, AlertTriangle, Zap, Brain } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getAppwriteClient, appwriteConfig } from "@/lib/appwrite-client"
import { Query } from "appwrite"

interface Incident {
  $id: string
  timestamp: string
  parsed_errors: string 
  root_cause: string
  resolution_status: string
  recommended_solutions: string
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loadingIncidents, setLoadingIncidents] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchIncidents()
    }
  }, [user])

  const fetchIncidents = async () => {
    try {
      const { databases } = getAppwriteClient()
      const response = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.incidentsCollectionId, [
        Query.equal("user_id", user?.$id || ""),
        Query.orderDesc("timestamp"),
      ])
      setIncidents(response.documents as Incident[])
    } catch (error) {
      console.error("Failed to fetch incidents:", error)
    } finally {
      setLoadingIncidents(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "analyzing":
        return <Brain className="h-4 w-4 text-blue-400 animate-pulse" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "analyzing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    }
  }

  const getErrorCount = (parsedErrors: string) => {
    try {
      const errors = JSON.parse(parsedErrors || "[]")
      return Array.isArray(errors) ? errors.length : 0
    } catch {
      return 0
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400 animate-pulse font-mono">LOADING DASHBOARD...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)] animate-pulse"></div>

      <header className="relative border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-mono">
            INCIDENT RESPONSE COPILOT
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400 font-mono">Welcome, {user.name}</span>
            <Button
              variant="outline"
              onClick={logout}
              className="border-gray-700 text-gray-300 hover:text-white font-mono"
            >
              LOGOUT
            </Button>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-mono">
              DASHBOARD
            </h2>
            <p className="text-gray-400 font-mono">Manage your incident responses with machine learning analysis</p>
          </div>
          <Button
            asChild
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 font-mono"
          >
            <Link href="/upload">
              <Zap className="h-4 w-4 mr-2" />
              ANALYZE INCIDENT
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 font-mono">TOTAL INCIDENTS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400 font-mono">{incidents.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 font-mono">RESOLVED</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400 font-mono">
                {incidents.filter((i) => i.resolution_status === "resolved").length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 font-mono">FAILED</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400 font-mono">
                {incidents.filter((i) => i.resolution_status === "failed").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white font-mono">RECENT INCIDENTS</CardTitle>
            <CardDescription className="text-gray-400 font-mono">Your latest incident analysis reports</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingIncidents ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              </div>
            ) : incidents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2 text-white font-mono">NO INCIDENTS YET</h3>
                <p className="text-gray-400 mb-4 font-mono">
                  Upload your first log file to get started with machine learning incident analysis
                </p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 font-mono"
                >
                  <Link href="/upload">
                    <Zap className="h-4 w-4 mr-2" />
                    ANALYZE INCIDENT
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div
                    key={incident.$id}
                    className="border border-gray-700 rounded-lg p-4 bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(incident.resolution_status)}
                        <span className="font-medium text-white font-mono">#{incident.$id.slice(-8)}</span>
                        <Badge className={`${getStatusColor(incident.resolution_status)} border font-mono`}>
                          {incident.resolution_status.toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-400 font-mono">
                        {new Date(incident.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400 font-mono">
                          {getErrorCount(incident.parsed_errors)} errors detected
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-gray-600 text-gray-300 hover:text-white font-mono"
                      >
                        <Link href={`/incident/${incident.$id}`}>VIEW REPORT</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
