"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, Zap, Brain, Search, Lightbulb, Terminal } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getAppwriteClient, appwriteConfig } from "@/lib/appwrite-client"
import { ID } from "appwrite"

export default function UploadPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [logText, setLogText] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<"file" | "text">("text")

  // Redirect to login if user isn't authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  // Handle file selection and automatically read text files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // If it's a text file, read it and show preview
      if (selectedFile.type.startsWith("text/") || selectedFile.name.endsWith(".log")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setLogText(e.target?.result as string)
        }
        reader.readAsText(selectedFile)
      }
    }
  }

  // Main upload and analysis handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Make sure we have either a file or text content
    if (!file && !logText.trim()) {
      toast({
        title: "UPLOAD ERROR",
        description: "Please upload a file or paste log content",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      let fileId = null

      // Upload file to storage if user selected one
      if (file) {
        const { storage } = getAppwriteClient()
        const uploadResponse = await storage.createFile(appwriteConfig.logsBucketId, ID.unique(), file)
        fileId = uploadResponse.$id
      }

      // Create the incident record in our database
      const { databases } = getAppwriteClient()
      const incident = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.incidentsCollectionId,
        ID.unique(),
        {
          user_id: user?.$id,
          timestamp: new Date().toISOString(),
          log_file_id: fileId || "",
          log_content: logText || "",
          resolution_status: "analyzing", 
          parsed_errors: "[]", 
          root_cause: "",
          external_context: "",
          recommended_solutions: "",
          memory_id: "",
        },
      )

      console.log("✅ Incident created:", incident.$id)

      // Take user to the incident page right away
      router.push(`/incident/${incident.$id}`)

      // Start the analysis in the background
      console.log("🚀 Starting analysis...")
      const analysisResponse = await fetch("/api/analyze-incident", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          incidentId: incident.$id,
          logContent: logText,
          fileId: fileId,
        }),
      })

      if (!analysisResponse.ok) {
        throw new Error(`Analysis failed: ${analysisResponse.status}`)
      }

      const analysisData = await analysisResponse.json()
      console.log("✅ Analysis completed:", analysisData)

      // Update the incident with our analysis results
      if (analysisData.success && analysisData.results) {
        console.log("📝 Updating incident with results...")
        await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.incidentsCollectionId, incident.$id, {
          parsed_errors: JSON.stringify(analysisData.results.parsed_errors || []),
          root_cause: analysisData.results.root_cause || "Unable to determine root cause",
          external_context: analysisData.results.external_context || "No external research available",
          recommended_solutions: analysisData.results.recommended_solutions || "No solutions generated",
          resolution_status: "resolved", // Mark as resolved when analysis completes
        })
        console.log("✅ Incident updated with analysis results")

        toast({
          title: "ANALYSIS COMPLETE",
          description: "Machine learning analysis completed successfully!",
        })
      } else {
        // If analysis failed, mark the incident as failed
        console.error("❌ Analysis failed:", analysisData)
        await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.incidentsCollectionId, incident.$id, {
          resolution_status: "failed",
          root_cause: "Analysis failed: " + (analysisData.error || "Unknown error"),
          recommended_solutions: "Analysis could not be completed. Please try uploading the logs again.",
        })

        toast({
          title: "ANALYSIS FAILED",
          description: analysisData.error || "Analysis could not be completed",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Upload error:", error)

      let errorMessage = "Failed to upload log file"

      // Give user helpful error messages
      if (error?.message?.includes("Invalid document structure")) {
        errorMessage = "Database configuration error. Please check the incident collection setup."
      } else if (error?.message) {
        errorMessage = error.message
      }

      toast({
        title: "UPLOAD FAILED",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  // Show loading screen while checking authentication
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400 animate-pulse font-mono">LOADING SYSTEM...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Cool animated background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)] animate-pulse"></div>

      {/* Page header with consistent styling */}
      <header className="relative border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-mono">
            UPLOAD INCIDENT LOGS
          </h1>
          <p className="text-gray-400 font-mono">Upload logs for machine learning analysis</p>
        </div>
      </header>

      <main className="relative container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main upload form */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardDescription className="text-gray-400 font-mono">
                  Upload log files or paste log content for instant analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Tab switcher for upload methods */}
                <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as "file" | "text")}>
                  <TabsList className="grid w-full grid-cols-2 bg-gray-700/50">
                    <TabsTrigger value="text" className="data-[state=active]:bg-cyan-600 font-mono">
                      <Terminal className="h-4 w-4 mr-2" />
                      PASTE LOGS
                    </TabsTrigger>
                    <TabsTrigger value="file" className="data-[state=active]:bg-cyan-600 font-mono">
                      <Upload className="h-4 w-4 mr-2" />
                      UPLOAD FILE
                    </TabsTrigger>
                  </TabsList>

                  <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    {/* Text input tab */}
                    <TabsContent value="text" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="logText" className="text-gray-300 font-mono">
                          LOG CONTENT
                        </Label>
                        <Textarea
                          id="logText"
                          value={logText}
                          onChange={(e) => setLogText(e.target.value)}
                          placeholder="2024-01-01 10:00:00 ERROR: Database connection failed
2024-01-01 10:00:01 ERROR: Unable to authenticate user
2024-01-01 10:00:02 WARN: Retrying connection..."
                          rows={16}
                          className="font-mono text-sm bg-gray-900 border-gray-600 text-green-400 placeholder:text-gray-500"
                        />
                        <p className="text-xs text-gray-400 font-mono">
                          Paste your error logs, stack traces, or any incident-related content
                        </p>
                      </div>
                    </TabsContent>

                    {/* File upload tab */}
                    <TabsContent value="file" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="file" className="text-gray-300 font-mono">
                          LOG FILE
                        </Label>
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-cyan-400 transition-colors">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <Input
                            id="file"
                            type="file"
                            onChange={handleFileChange}
                            accept=".log,.txt,.json,.yaml,.yml"
                            className="hidden"
                          />
                          <Label
                            htmlFor="file"
                            className="cursor-pointer text-cyan-400 hover:text-cyan-300 font-medium font-mono"
                          >
                            CLICK TO UPLOAD OR DRAG AND DROP
                          </Label>
                          <p className="text-xs text-gray-400 mt-2 font-mono">
                            Supported formats: .log, .txt, .json, .yaml, .yml (Max 10MB)
                          </p>
                        </div>
                        {/* Show selected file info */}
                        {file && (
                          <div className="flex items-center space-x-2 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                            <FileText className="h-4 w-4 text-cyan-400" />
                            <span className="text-sm text-white font-mono">{file.name}</span>
                            <span className="text-xs text-gray-400 font-mono">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Show preview of file content */}
                      {logText && (
                        <div className="space-y-2">
                          <Label className="text-gray-300 font-mono">PREVIEW</Label>
                          <div className="bg-gray-900 p-3 rounded-lg border border-gray-600 max-h-32 overflow-y-auto">
                            <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                              {logText.slice(0, 500)}
                              {logText.length > 500 && "..."}
                            </pre>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* Submit button */}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-mono font-medium py-3"
                      disabled={uploading || (!file && !logText.trim())}
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ANALYZING INCIDENT...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          START ANALYSIS
                        </>
                      )}
                    </Button>
                  </form>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with info */}
          <div className="space-y-6">
            {/* How it works section */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-cyan-400 font-mono">HOW IT WORKS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-mono font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-white flex items-center font-mono">
                      <Brain className="h-4 w-4 mr-2 text-cyan-400" />
                      LOG PARSING
                    </h4>
                    <p className="text-sm text-gray-400 font-mono">Extract errors, stack traces, and key information</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-mono font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-white flex items-center font-mono">
                      <Search className="h-4 w-4 mr-2 text-green-400" />
                      ROOT CAUSE ANALYSIS
                    </h4>
                    <p className="text-sm text-gray-400 font-mono">Identify potential failure points and causes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-mono font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-white flex items-center font-mono">
                      <Search className="h-4 w-4 mr-2 text-purple-400" />
                      WEB RESEARCH
                    </h4>
                    <p className="text-sm text-gray-400 font-mono">Search for similar incidents and solutions online</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-mono font-medium">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-white flex items-center font-mono">
                      <Lightbulb className="h-4 w-4 mr-2 text-yellow-400" />
                      SOLUTION GENERATION
                    </h4>
                    <p className="text-sm text-gray-400 font-mono">Provide actionable recommendations and fixes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pro tips section */}
            <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-cyan-400 font-mono">PRO TIPS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-300 font-mono">
                <p>• Include timestamps for better analysis</p>
                <p>• Paste complete stack traces when available</p>
                <p>• Include context around the error occurrence</p>
                <p>• Multiple error types help identify patterns</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
