"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Search,
  Brain,
  Lightbulb,
  RefreshCw,
  Copy,
  Download,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, use } from "react"
import { getAppwriteClient, appwriteConfig } from "@/lib/appwrite-client"
import { useToast } from "@/hooks/use-toast"

interface Incident {
  $id: string
  timestamp: string
  parsed_errors: string // JSON string
  root_cause: string
  resolution_status: string
  recommended_solutions: string
  external_context: string
  log_content: string
}

export default function IncidentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [loadingIncident, setLoadingIncident] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && resolvedParams.id) {
      fetchIncident()
    }
  }, [user, resolvedParams.id])

  // Auto-refresh for analyzing incidents
  useEffect(() => {
    if (incident && incident.resolution_status === "analyzing" && autoRefresh) {
      const interval = setInterval(() => {
        console.log("Auto-refreshing incident data...")
        fetchIncident()
      }, 3000) 

      return () => clearInterval(interval)
    }
  }, [incident, autoRefresh])

  // Stop auto-refresh when analysis is complete
  useEffect(() => {
    if (incident && incident.resolution_status !== "analyzing") {
      setAutoRefresh(false)
    }
  }, [incident])

  const fetchIncident = async () => {
    try {
      const { databases } = getAppwriteClient()
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.incidentsCollectionId,
        resolvedParams.id,
      )
      setIncident(response as Incident)
    } catch (error) {
      console.error("Failed to fetch incident:", error)
    } finally {
      setLoadingIncident(false)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "COPIED",
        description: `${label} copied to clipboard`,
      })
    } catch (error) {
      toast({
        title: "COPY FAILED",
        description: "Could not copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case "analyzing":
        return <Brain className="h-5 w-5 text-blue-400 animate-pulse" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-400" />
      default:
        return <AlertTriangle className="h-5 w-5 text-orange-400" />
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

  const getParsedErrors = (parsedErrorsString: string) => {
    try {
      if (!parsedErrorsString) return []
      const errors = JSON.parse(parsedErrorsString)
      return Array.isArray(errors) ? errors : []
    } catch (error) {
      console.error("Error parsing parsed_errors:", error)
      return []
    }
  }

  const formatMarkdownText = (text: string) => {
    if (!text) return ""

    // Convert markdown-style formatting to HTML
    const formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-400 font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-blue-300">$1</em>')
      // Code blocks
      .replace(
        /```(.*?)```/gs,
        '<pre class="bg-gray-800 p-3 rounded-lg my-2 overflow-x-auto"><code class="text-green-400">$1</code></pre>',
      )
      // Inline code
      .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-2 py-1 rounded text-green-400">$1</code>')
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-cyan-400 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-cyan-400 mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-cyan-400 mt-4 mb-2">$1</h1>')
      // Bullet points
      .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 mb-1">$1. $2</li>')
      // URLs
      .replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1">$1 <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>',
      )
      // Line breaks
      .replace(/\n/g, "<br>")

    return formatted
  }

  if (loading || loadingIncident || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400 animate-pulse font-mono">LOADING INCIDENT DATA...</p>
        </div>
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-white font-mono">INCIDENT NOT FOUND</h2>
          <p className="text-gray-400 mb-4 font-mono">The incident you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const parsedErrors = getParsedErrors(incident.parsed_errors)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)] animate-pulse"></div>

      <header className="relative border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-mono">
              INCIDENT ANALYSIS REPORT
            </h1>
            <p className="text-sm text-gray-400 font-mono">ID: {incident.$id}</p>
          </div>
          <div className="flex items-center space-x-3">
            {incident.resolution_status === "analyzing" && (
              <Button variant="outline" size="sm" onClick={fetchIncident} className="border-gray-700 font-mono">
                <RefreshCw className="h-4 w-4 mr-2" />
                REFRESH
              </Button>
            )}
            {getStatusIcon(incident.resolution_status)}
            <Badge className={`${getStatusColor(incident.resolution_status)} border font-mono`}>
              {incident.resolution_status.toUpperCase()}
            </Badge>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-4 py-8">
        {incident.resolution_status === "analyzing" && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg backdrop-blur-sm">
            <div className="flex items-center">
              <Brain className="h-5 w-5 text-blue-400 animate-pulse mr-3" />
              <div>
                <h3 className="font-medium text-blue-400 font-mono">ANALYSIS IN PROGRESS</h3>
                <p className="text-sm text-gray-300 font-mono">
                  Machine learning agents are analyzing your incident. This page will automatically update.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 font-mono">TIMESTAMP</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white font-mono">{new Date(incident.timestamp).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 font-mono">ERRORS DETECTED</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-cyan-400 font-mono">{parsedErrors.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 font-mono">STATUS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getStatusIcon(incident.resolution_status)}
                <span className="capitalize text-white font-mono">{incident.resolution_status}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-600 font-mono">
              OVERVIEW
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-cyan-600 font-mono">
              ANALYSIS
            </TabsTrigger>
            <TabsTrigger value="solutions" className="data-[state=active]:bg-cyan-600 font-mono">
              SOLUTIONS
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-cyan-600 font-mono">
              RAW LOGS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-cyan-400" />
                      <span className="font-mono">ROOT CAUSE ANALYSIS</span>
                    </div>
                    {incident.root_cause && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(incident.root_cause, "Root cause analysis")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {incident.root_cause ? (
                    <div
                      className="text-sm leading-relaxed text-gray-300 font-mono"
                      dangerouslySetInnerHTML={{ __html: formatMarkdownText(incident.root_cause) }}
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                      <span className="text-sm font-mono">ANALYSIS IN PROGRESS...</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
                      <span className="font-mono">DETECTED ERRORS</span>
                    </div>
                    {parsedErrors.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(parsedErrors.join("\n"), "Detected errors")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {parsedErrors.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {parsedErrors.map((error, index) => (
                        <div
                          key={index}
                          className="p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-300 font-mono"
                        >
                          {error}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                      <span className="text-sm font-mono">PARSING LOGS...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Search className="h-5 w-5 mr-2 text-green-400" />
                    <span className="font-mono">EXTERNAL RESEARCH CONTEXT</span>
                  </div>
                  {incident.external_context && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(incident.external_context, "Research context")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-400 font-mono">
                  Information gathered from web research and knowledge bases
                </CardDescription>
              </CardHeader>
              <CardContent>
                {incident.external_context ? (
                  <div className="overflow-y-auto">
                    <div
                      className="prose prose-sm max-w-none text-gray-300 font-mono"
                      dangerouslySetInnerHTML={{ __html: formatMarkdownText(incident.external_context) }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                    <span className="text-sm font-mono">RESEARCHING SIMILAR INCIDENTS...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="solutions">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-400" />
                    <span className="font-mono">RECOMMENDED SOLUTIONS</span>
                  </div>
                  {incident.recommended_solutions && (
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(incident.recommended_solutions, "Recommended solutions")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-400 font-mono">
                  Recommendations based on analysis and research
                </CardDescription>
              </CardHeader>
              <CardContent>
                {incident.recommended_solutions ? (
                  <div className="overflow-y-auto">
                    <div
                      className="prose prose-sm max-w-none text-gray-300 font-mono whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: formatMarkdownText(incident.recommended_solutions) }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                    <span className="text-sm font-mono">GENERATING SOLUTIONS...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-purple-400" />
                    <span className="font-mono">RAW LOG CONTENT</span>
                  </div>
                  {incident.log_content && (
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(incident.log_content, "Raw logs")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-400 font-mono">
                  Original log data uploaded for analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {incident.log_content ? (
                  <pre className="bg-gray-900 p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono text-green-400 border border-gray-700">
                    {incident.log_content}
                  </pre>
                ) : (
                  <p className="text-sm text-gray-400 font-mono">NO LOG CONTENT AVAILABLE</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
