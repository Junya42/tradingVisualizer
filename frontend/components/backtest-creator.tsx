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

export function BacktestCreator() {
  const [strategies, setStrategies] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    strategy_name: "",
  })
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchStrategies = async () => {
    try {
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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.amount || !formData.strategy_name || !csvFile) {
      toast({
        title: "Error",
        description: "Please fill in all fields and upload a CSV file",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const submitData = new FormData()
      submitData.append("name", formData.name)
      submitData.append("amount", formData.amount)
      submitData.append("strategy_name", formData.strategy_name)
      submitData.append("file", csvFile)

      const response = await fetch("/api/backtests", {
        method: "POST",
        body: submitData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to create backtest")
      }

      toast({
        title: "Success",
        description: "Backtest created successfully",
      })

      // Reset form
      setFormData({ name: "", amount: "", strategy_name: "" })
      setCsvFile(null)
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
    const file = event.target.files?.[0]
    if (file) {
      if (!file.name.endsWith(".csv")) {
        toast({
          title: "Error",
          description: "Please upload a CSV file",
          variant: "destructive",
        })
        return
      }
      setCsvFile(file)
    }
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
              <Label htmlFor="name">Backtest Name</Label>
              <Input
                id="name"
                placeholder="Enter backtest name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
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
                onValueChange={(value) => setFormData({ ...formData, strategy_name: value })}
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
              <Label htmlFor="csv-upload">CSV Data File</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="csv-upload" className="cursor-pointer flex-1">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {csvFile ? csvFile.name : "Click to upload CSV file"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Required columns: Time, Open, High, Low, Close, Volume
                    </p>
                  </div>
                </Label>
                <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </div>
            </div>

            {csvFile && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>File selected:</strong> {csvFile.name}
                </p>
                <p className="text-xs text-green-600 mt-1">Size: {(csvFile.size / 1024 / 1024).toFixed(2)} MB</p>
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
