export async function GET() {
    try {
      const response = await fetch("http://localhost:8000/getStrategies")
      const data = await response.json()
      return Response.json(data)
    } catch (error) {
      return Response.json({ error: "Failed to fetch strategies" }, { status: 500 })
    }
  }
  
  export async function POST(request: Request) {
    try {
      const formData = await request.formData()
  
      const response = await fetch("http://localhost:8000/createStrategy", {
        method: "POST",
        body: formData,
      })
  
      if (!response.ok) {
        const error = await response.json()
        return Response.json(error, { status: response.status })
      }
  
      const data = await response.json()
      return Response.json(data)
    } catch (error) {
      return Response.json({ error: "Failed to create strategy" }, { status: 500 })
    }
  }
  