import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const amount = parseFloat(formData.get('amount') as string)
    const strategyName = formData.get('strategy_name') as string
    const file = formData.get('file') as File
    
    if (!name || !amount || !strategyName || !file) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    const backendResponse = await fetch(`${backendUrl}/create`, {
      method: 'POST',
      body: formData,
    })

    if (!backendResponse.ok) {
      let errorMessage = 'Failed to create backtest'
      try {
        const errorData = await backendResponse.json()
        errorMessage = errorData.detail || errorMessage
      } catch {
        // If response is not JSON, try to get text
        try {
          const errorText = await backendResponse.text()
          errorMessage = errorText || errorMessage
        } catch {
          // Use default error message
        }
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating backtest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    const backendResponse = await fetch(`${backendUrl}/getAll`, {
      method: 'GET',
    })

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch backtests' },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching backtests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 