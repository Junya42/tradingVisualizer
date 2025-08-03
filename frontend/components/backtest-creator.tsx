"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Upload, Play, DollarSign, FileSpreadsheet } from "lucide-react"
import { fetchFromBackend, getBackendUrl } from "@/lib/backend-url"

export function BacktestCreator() {
  const [strategies, setStrategies] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    strategy_name: "",
  })
  const [csvFiles, setCsvFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [nextVersion, setNextVersion] = useState<number | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const { toast } = useToast()

  const fetchStrategies = async () => {
    try {
      const data = await fetchFromBackend("/getStrategies")
      setStrategies(data.strategies)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch strategies",
        variant: "destructive",
      })
    }
  }

  const fetchNextVersion = async (strategyName: string) => {
    try {
      const data = await fetchFromBackend(`/getBacktestsByStrategy/${strategyName}`)
      
      // Find the next version number
      const existingBacktests = data.backtests || []
      let version = 1
      while (existingBacktests.includes(`${strategyName}V${version}`)) {
        version++
      }
      setNextVersion(version)
    } catch (error) {
      console.error("Error fetching next version:", error)
      setNextVersion(1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount || !formData.strategy_name || csvFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in amount, strategy, and upload at least one CSV file",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const submitData = new FormData()
      if (formData.name && formData.name.trim()) {
        submitData.append("name", formData.name)
      }
      submitData.append("amount", formData.amount)
      submitData.append("strategy_name", formData.strategy_name)
      csvFiles.forEach((file, index) => {
        submitData.append("files", file)
      })

      const backendUrl = await getBackendUrl()
      const response = await fetch(`${backendUrl}/create`, {
        method: "POST",
        body: submitData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to create backtest")
      }

      const result = await response.json()
      toast({
        title: "Success",
        description: result.message || "Backtest created successfully",
      })

      // Reset form
      setFormData({ name: "", amount: "", strategy_name: "" })
      setCsvFiles([])
      const fileInput = document.getElementById("csv-upload") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create backtest",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    processFiles(files)
  }

  const processFiles = (files: File[]) => {
    const csvFiles = files.filter(file => file.name.endsWith(".csv"))
    
    if (csvFiles.length !== files.length) {
      toast({
        title: "Warning",
        description: "Some files were skipped. Only CSV files are supported.",
        variant: "destructive",
      })
    }
    
    if (csvFiles.length > 0) {
      setCsvFiles(csvFiles)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }

  useEffect(() => {
    fetchStrategies()
  }, [])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Play className="h-4 w-4" />
              Backtest Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Backtest Name (Optional)</Label>
              <Input
                id="name"
                placeholder="Leave empty for auto-generated name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {!formData.name && formData.strategy_name && nextVersion && (
                <p className="text-xs text-muted-foreground">
                  Will be named: {formData.strategy_name}V{nextVersion}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Initial Amount ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="10000.00"
                  className="pl-10"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="strategy">Strategy</Label>
              <Select
                value={formData.strategy_name}
                onValueChange={(value) => {
                  setFormData({ ...formData, strategy_name: value })
                  if (value) {
                    fetchNextVersion(value)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a strategy" />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map((strategy) => (
                    <SelectItem key={strategy} value={strategy}>
                      {strategy}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="h-4 w-4" />
              Market Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-upload">CSV Data Files</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="csv-upload" className="cursor-pointer flex-1">
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragOver 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {csvFiles.length > 0 ? `${csvFiles.length} file(s) selected` : "Click to upload or drag & drop CSV files"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Required columns: Time, Open, High, Low, Close, Volume
                    </p>
                    {isDragOver && (
                      <p className="text-xs text-blue-600 mt-2 font-medium">
                        Drop files here
                      </p>
                    )}
                  </div>
                </Label>
                <Input id="csv-upload" type="file" accept=".csv" multiple onChange={handleFileUpload} className="hidden" />
              </div>
            </div>

            {csvFiles.length > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 mb-2">
                  <strong>Files selected ({csvFiles.length}):</strong>
                </p>
                <div className="space-y-1">
                  {csvFiles.map((file, index) => (
                    <div key={index} className="text-xs text-green-600">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="flex items-center gap-2">
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {loading ? "Running Backtest..." : "Run Backtest"}
        </Button>
      </div>
    </form>
  )
}
