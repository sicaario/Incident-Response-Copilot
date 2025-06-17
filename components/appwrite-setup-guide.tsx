"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, ExternalLink, Settings, AlertTriangle, Copy } from "lucide-react"
import { useState } from "react"

export function AppwriteSetupGuide() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(step)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Appwrite Configuration Required
          </CardTitle>
          <CardDescription>
            Your Appwrite project needs to be configured to allow user registration. Follow these steps:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Current Error:</strong> "The current user is not authorized to perform the requested action."
              <br />
              This means user registration is not enabled in your Appwrite project.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                  1
                </span>
                Open Appwrite Console
              </h3>
              <p className="text-sm text-muted-foreground mb-3">Go to your Appwrite console and select your project</p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => window.open("https://cloud.appwrite.io", "_blank")}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Appwrite Console
                </Button>
                <div className="text-xs text-muted-foreground">
                  Project ID: <code className="bg-muted px-1 rounded">{projectId}</code>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                  2
                </span>
                Enable Authentication
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Navigate to Auth → Settings and enable Email/Password authentication
              </p>
              <div className="bg-muted p-3 rounded text-sm space-y-2">
                <div>
                  • Go to <strong>Auth</strong> → <strong>Settings</strong>
                </div>
                <div>
                  • Under <strong>Auth Methods</strong>, enable <strong>Email/Password</strong>
                </div>
                <div>
                  • Under <strong>Registration</strong>, enable <strong>User Registration</strong>
                </div>
                <div>
                  • Disable <strong>Email Confirmation</strong> for testing (optional)
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                  3
                </span>
                Add Web Platform
              </h3>
              <p className="text-sm text-muted-foreground mb-3">Add your domain to the allowed platforms</p>
              <div className="bg-muted p-3 rounded text-sm space-y-2">
                <div>
                  • Go to <strong>Settings</strong> → <strong>Platforms</strong>
                </div>
                <div>
                  • Click <strong>Add Platform</strong> → <strong>Web</strong>
                </div>
                <div className="flex items-center space-x-2">
                  <span>• Add domain:</span>
                  <code className="bg-background px-2 py-1 rounded border">http://localhost:3000</code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard("http://localhost:3000", 3)}>
                    {copiedStep === 3 ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                  4
                </span>
                Create Database (Optional for now)
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Create database and collections for incident management
              </p>
              <div className="bg-muted p-3 rounded text-sm space-y-2">
                <div>
                  • Go to <strong>Databases</strong>
                </div>
                <div>
                  • Create database named <code>main</code>
                </div>
                <div>
                  • Create collection named <code>incidents</code>
                </div>
                <div>• Set permissions to allow users to create/read/update their own documents</div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                  ✓
                </span>
                Test Registration
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                After completing the above steps, refresh this page and try registering again
              </p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Need Help?</strong> If you're still having issues after following these steps, check the Appwrite
              documentation or contact support.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
