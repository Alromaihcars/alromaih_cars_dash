"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useNotifications } from "@/components/ui/notification"
import { Eye, EyeOff, Loader2, X, Save } from "lucide-react"

interface RequestHeader {
  enabled: boolean
  key: string
  value: string
}

interface ApiResponse {
  data?: any
  errors?: any[]
  status: number
  responseTime: number
}

export default function ApiTestingPage() {
  const { addNotification, NotificationContainer } = useNotifications()
  const [isTestingApi, setIsTestingApi] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [testResponse, setTestResponse] = useState<ApiResponse | null>(null)

  const [endpoint, setEndpoint] = useState("https://portal.alromaihcars.com/graphql")
  const [isRelayApi, setIsRelayApi] = useState(true)
  const [headers, setHeaders] = useState<RequestHeader[]>([
    { enabled: true, key: 'Content-Type', value: 'application/json' },
    { enabled: true, key: 'X-API-KEY', value: 'tHV8od3pntYTwhmSaqHSU0heV7uBrwe' }
  ])
  const [showSecrets, setShowSecrets] = useState(false)

  useEffect(() => {
    // Load saved configuration from localStorage
    const savedConfig = localStorage.getItem('api-config')
    if (savedConfig) {
      try {
        const { endpoint: savedEndpoint, headers: savedHeaders } = JSON.parse(savedConfig)
        setEndpoint(savedEndpoint)
        setHeaders(savedHeaders)
        addNotification({
          type: "info",
          title: "Configuration Loaded",
          message: "Saved API configuration has been restored",
          duration: 3000,
        })
      } catch (err) {
        console.error('Error loading saved configuration:', err)
      }
    }
  }, [])

  const handleTestConnection = async () => {
    if (!endpoint) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Please provide the GraphQL endpoint",
        duration: 3000,
      })
      return
    }

    setIsTestingApi(true)
    const startTime = Date.now()

    try {
      const requestHeaders: Record<string, string> = {}
      headers
        .filter(h => h.enabled)
        .forEach(h => {
          requestHeaders[h.key] = h.value
        })

      const response = await fetch(endpoint, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify({
          query: `query TestConnection {
  CarBrand(
    translation_fallback: true,
    limit: 1
  ) {
    id
    name
  }
}`
        })
      })

      const data = await response.json()
      const responseTime = Date.now() - startTime

      setTestResponse({
        data: data.data,
        errors: data.errors,
        status: response.status,
        responseTime
      })

      addNotification({
        type: data.errors ? "error" : "success",
        title: data.errors ? "Test Failed" : "Test Successful",
        message: data.errors 
          ? `Error: ${data.errors[0]?.message || "Unknown error"}` 
          : `Connection successful (${responseTime}ms)`,
        duration: 5000,
      })
    } catch (err) {
      const error = err as Error
      setTestResponse({
        errors: [{ message: error.message }],
        status: 500,
        responseTime: Date.now() - startTime
      })

      addNotification({
        type: "error",
        title: "Test Failed",
        message: `Error: ${error.message}`,
        duration: 5000,
      })
    } finally {
      setIsTestingApi(false)
    }
  }

  const toggleHeader = (index: number) => {
    setHeaders(headers.map((header, i) => 
      i === index ? { ...header, enabled: !header.enabled } : header
    ))
  }

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    setHeaders(headers.map((header, i) => 
      i === index ? { ...header, [field]: value } : header
    ))
  }

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  const addHeader = () => {
    setHeaders([...headers, { enabled: true, key: '', value: '' }])
  }

  const handleSave = async () => {
    try {
      // Save to localStorage for persistence
      localStorage.setItem('api-config', JSON.stringify({
        endpoint,
        headers
      }))

      addNotification({
        type: "success",
        title: "Configuration Saved",
        message: "API configuration has been saved successfully",
        duration: 3000,
      })
    } catch (err) {
      const error = err as Error
      addNotification({
        type: "error",
        title: "Save Failed",
        message: `Error: ${error.message}`,
        duration: 5000,
      })
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>GraphQL Endpoint</CardTitle>
          <CardDescription>Configure your GraphQL API endpoint and headers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Endpoint Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">POST</Label>
              <div className="flex items-center gap-2">
                <Label>Relay API</Label>
                <Switch checked={true} />
              </div>
            </div>
            <Input
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="Enter your GraphQL endpoint"
              className="font-mono text-sm"
            />
          </div>

          {/* Request Headers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Request Headers</Label>
              <Button variant="outline" size="sm" onClick={addHeader}>
                Add Header
              </Button>
            </div>
            <div className="space-y-2">
              {headers.map((header, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Switch
                    checked={header.enabled}
                    onCheckedChange={() => toggleHeader(index)}
                  />
                  <Input
                    value={header.key}
                    onChange={(e) => updateHeader(index, 'key', e.target.value)}
                    placeholder="Enter Key"
                    className="flex-1"
                  />
                  <Input
                    type={header.key.toLowerCase().includes('secret') && !showSecret ? "password" : "text"}
                    value={header.value}
                    onChange={(e) => updateHeader(index, 'value', e.target.value)}
                    placeholder="Enter Value"
                    className="flex-1 font-mono"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHeader(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showSecret ? "Hide" : "Show"} Secrets
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </Button>
            <Button onClick={handleTestConnection} disabled={isTestingApi} className="flex-1">
              {isTestingApi ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
          </div>

          {/* Response Display */}
          {testResponse && (
            <div className="space-y-2">
              <Label>Response</Label>
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Status: {testResponse.status}</span>
                  <span>Time: {testResponse.responseTime}ms</span>
                </div>
                <pre className="whitespace-pre-wrap overflow-x-auto text-sm">
                  {JSON.stringify(testResponse.data || testResponse.errors, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <NotificationContainer />
    </div>
  )
}
