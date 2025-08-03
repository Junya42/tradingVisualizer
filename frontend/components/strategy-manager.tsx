"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Trash2, FileCode, Plus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Strategy {
  name: string
}

export function StrategyManager() {
  const [strategies, setStrategies] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const fetchStrategies = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/strategies")
      if (!response.ok) throw new Error("Failed to fetch strategies")
      const data = await response.json()
      setStrategies(data.strategies)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch strategies",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const uploadStrategy = async (file: File) => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("file", file)

      // Use the correct API endpoint path
      const response = await fetch("/api/strategies", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to upload strategy")
      }

      toast({
        title: "Success",
        description: "Strategy uploaded successfully",
      })
      fetchStrategies()

      // Reset the file input
      const fileInput = document.getElementById("strategy-upload") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload strategy",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const deleteStrategy = async (strategyName: string) => {
    try {
      const response = await fetch(`/api/strategies/${strategyName}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete strategy")

      toast({
        title: "Success",
        description: "Strategy deleted successfully",
      })
      fetchStrategies()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete strategy",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.name.endsWith(".py")) {
        toast({
          title: "Error",
          description: "Please upload a Python (.py) file",
          variant: "destructive",
        })
        return
      }
      uploadStrategy(file)
    }
  }

  useEffect(() => {
    fetchStrategies()
  }, [])

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Upload Strategy</h3>
          <p className="text-sm text-muted-foreground">Upload a Python file containing your trading strategy</p>
        </div>

        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
          <Label htmlFor="strategy-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              {uploading ? (
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Plus className="h-8 w-8 text-muted-foreground" />
              )}
              <div>
                <Button disabled={uploading} variant="outline" className="pointer-events-none bg-transparent">
                  {uploading ? "Uploading..." : "Choose Python File"}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Select a .py file containing your strategy function
                </p>
              </div>
            </div>
          </Label>
          <Input id="strategy-upload" type="file" accept=".py" onChange={handleFileUpload} className="hidden" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Available Strategies</h3>
          <Badge variant="secondary">{strategies.length} strategies</Badge>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        ) : strategies.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FileCode className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No strategies found. Upload your first strategy to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {strategies.map((strategy) => (
              <Card key={strategy} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-blue-600" />
                      {strategy}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Strategy</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{strategy}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteStrategy(strategy)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="text-xs">
                    Python Strategy
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
