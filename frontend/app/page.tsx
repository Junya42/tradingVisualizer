"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StrategyManager } from "@/components/strategy-manager"
import { BacktestCreator } from "@/components/backtest-creator"
import { BacktestResults } from "@/components/backtest-results"
import { TrendingUp, FileCode, BarChart3 } from "lucide-react"

export default function BacktestDashboard() {
  const [activeTab, setActiveTab] = useState("strategies")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <TrendingUp className="h-10 w-10 text-blue-600" />
            Backtest Dashboard
          </h1>
          <p className="text-slate-600 text-lg">Manage your trading strategies and run comprehensive backtests</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="strategies" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Strategies
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Create Test
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="strategies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Strategy Management</CardTitle>
                <CardDescription>Upload, manage, and delete your trading strategies</CardDescription>
              </CardHeader>
              <CardContent>
                <StrategyManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Backtest</CardTitle>
                <CardDescription>Run a new backtest with your strategy and market data</CardDescription>
              </CardHeader>
              <CardContent>
                <BacktestCreator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Backtest Results</CardTitle>
                <CardDescription>View and analyze your backtest results</CardDescription>
              </CardHeader>
              <CardContent>
                <BacktestResults />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
