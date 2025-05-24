'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Send } from "lucide-react"
import { Scene } from '@/lib/scenes'

interface SceneCreatorProps {
  sceneId: string
  initialPrompt: string
}

export default function SceneCreator({ sceneId, initialPrompt }: SceneCreatorProps) {
  const [sceneJson, setSceneJson] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSendingToV0, setIsSendingToV0] = useState(false)
  const router = useRouter()

  const handleSceneCreation = async () => {
    try {
      const sceneObject: Scene = JSON.parse(sceneJson)

      // Ensure the scene ID matches
      if (sceneObject.id !== sceneId) {
        throw new Error('Scene ID in JSON does not match the expected ID')
      }

      // Validate other required fields
      if (!sceneObject.text || !sceneObject.location || !sceneObject.season ||
          !sceneObject.storyPhase || !sceneObject.choices || sceneObject.choices.length === 0) {
        throw new Error('Missing required fields in scene JSON')
      }

      // Ensure storyPhase is a valid enum value
      // if (!Object.values(StoryPhase).includes(sceneObject.storyPhase)) {
      //   throw new Error('Invalid story phase')
      // }

      const response = await fetch('/api/persistScene', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sceneObject),
      })

      if (!response.ok) {
        throw new Error('Failed to persist scene')
      }

      setSuccess(true)
      setError(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      setSuccess(false)
    }
  }

  const handleSendToV0 = async () => {
    setIsSendingToV0(true)
    try {
      const response = await fetch('/api/sendToV0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: initialPrompt }),
      })

      if (!response.ok) {
        throw new Error('Failed to send prompt to v0')
      }

      const data = await response.json()
      setSceneJson(data.response)
      setSuccess(true)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while sending to v0')
      setSuccess(false)
    } finally {
      setIsSendingToV0(false)
    }
  }

  return (
      <Card className="w-full max-w-2xl mx-auto mt-4">
        <CardHeader>
          <CardTitle>Create New Scene: {sceneId}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="info" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Scene Creation Prompt</AlertTitle>
            <AlertDescription>{initialPrompt}</AlertDescription>
          </Alert>
          <div className="flex justify-end mb-2">
            <Button onClick={handleSendToV0} disabled={isSendingToV0}>
              <Send className="mr-2 h-4 w-4" />
              {isSendingToV0 ? 'Sending...' : 'Send to v0'}
            </Button>
          </div>
          <Textarea
              value={sceneJson}
              onChange={(e) => setSceneJson(e.target.value)}
              placeholder="Enter the scene JSON here..."
              rows={20}
              className="w-full mb-4"
          />
          <Button onClick={handleSceneCreation} className="w-full">
            Create Scene
          </Button>
          {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}
          {success && (
              <Alert variant="success" className="mt-4">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>Scene created and persisted successfully!</AlertDescription>
              </Alert>
          )}
        </CardContent>
      </Card>
  )
}