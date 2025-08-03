"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Search, TrendingUp, DollarSign, Percent, Calendar, Trash2 } from "lucide-react"
import { fetchFromBackend, getBackendUrl } from "@/lib/backend-url"
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

interface BacktestResult {
  predictions: any[]
  results: any[]
  end_result: {
    total_return: number
    total_trades: number
    winning_trades: number
    losing_trades: number
    win_rate: number
    final_balance: number
    max_drawdown: number
    initial_amount?: number
    final_pourcent?: number
  }
}

export function BacktestResults() {
  const [searchName, setSearchName] = useState("")
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [backtestList, setBacktestList] = useState<Array<{
    name: string
    final_pourcent?: number
    initial_amount?: number
  }>>([])
  const [loadingList, setLoadingList] = useState(false)
  const { toast } = useToast()

  const searchBacktest = async (name?: string) => {
    const backtestName = name || searchName
    if (!backtestName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a backtest name",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const data = await fetchFromBackend(`/get/${backtestName}`)
      console.log(data);
      setResult(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch backtest",
        variant: "destructive",
      })
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const deleteBacktest = async () => {
    try {
      const backendUrl = await getBackendUrl()
      const response = await fetch(`${backendUrl}/delete/${searchName}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete backtest")

      toast({
        title: "Success",
        description: "Backtest deleted successfully",
      })
      setResult(null)
      setSearchName("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete backtest",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  const fetchBacktestList = async () => {
    try {
      setLoadingList(true)
      const data = await fetchFromBackend('/getAll')
      setBacktestList(data.backtests || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch backtest list",
        variant: "destructive",
      })
    } finally {
      setLoadingList(false)
    }
  }

  const selectBacktest = (backtest: { name: string; final_pourcent?: number; initial_amount?: number }) => {
    setSearchName(backtest.name)
    searchBacktest(backtest.name)
  }

  // Load backtest list on component mount
  useEffect(() => {
    fetchBacktestList()
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Search Section */}
        <div>
          <Label htmlFor="search">Search Backtest</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="search"
              placeholder="Enter backtest name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchBacktest()}
            />
            <Button onClick={() => searchBacktest()} disabled={loading}>
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Backtest List Section */}
        <div>
          <div className="flex items-center justify-between">
            <Label>Available Backtests</Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchBacktestList}
              disabled={loadingList}
            >
              {loadingList ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
          <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
            {backtestList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No backtests found. Click "Refresh" to load available backtests.
              </p>
            ) : (
              <div className="space-y-1">
                {backtestList.map((backtest) => (
                  <button
                    key={backtest.name}
                    onClick={() => selectBacktest(backtest)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>{backtest.name}</span>
                      {backtest.final_pourcent !== undefined && (
                        <span className={`text-xs font-medium ${
                          backtest.final_pourcent < 100 ? 'text-pink-700' : 'text-emerald-500'
                        }`}>
                          {backtest.final_pourcent.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Results for "{searchName}"</h3>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Backtest</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{searchName}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteBacktest} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Final Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(result.end_result.final_balance)}
                </div>
                {result.end_result.initial_amount && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Initial: {formatCurrency(result.end_result.initial_amount)}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Percent className="h-4 w-4 text-blue-600" />
                  Total Return
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${result.end_result.total_return >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatPercentage(result.end_result.total_return)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{formatPercentage(result.end_result.win_rate)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  Total Trades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{result.end_result.total_trades}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Trade Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Winning Trades</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {result.end_result.winning_trades}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Losing Trades</span>
                  <Badge variant="default" className="bg-red-100 text-red-800">
                    {result.end_result.losing_trades}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Max Drawdown</span>
                  <span className="font-medium text-red-600">{formatPercentage(result.end_result.max_drawdown)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Profit Factor</span>
                  <span className="font-medium">
                    {result.end_result.losing_trades > 0
                      ? (result.end_result.winning_trades / result.end_result.losing_trades).toFixed(2)
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Trade</span>
                  <span className="font-medium">
                    {result.end_result.total_trades > 0
                      ? formatCurrency((result.end_result.final_balance - 10000) / result.end_result.total_trades)
                      : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {result.predictions && result.predictions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {result.predictions.slice(-10).map((prediction, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="text-sm">{JSON.stringify(prediction)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
