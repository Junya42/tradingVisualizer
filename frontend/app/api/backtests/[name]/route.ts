export async function GET(request: Request, { params }: { params: { name: string } }) {
    try {
      const response = await fetch(`http://localhost:8000/get/${params.name}`)
  
      if (!response.ok) {
        const error = await response.json()
        return Response.json(error, { status: response.status })
      }
  
      const data = await response.json()
      return Response.json(data)
    } catch (error) {
      return Response.json({ error: "Failed to fetch backtest" }, { status: 500 })
    }
  }
  
  export async function DELETE(request: Request, { params }: { params: { name: string } }) {
    try {
      const response = await fetch(`http://localhost:8000/delete/${params.name}`, {
        method: "DELETE",
      })
  
      if (!response.ok) {
        const error = await response.json()
        return Response.json(error, { status: response.status })
      }
  
      const data = await response.json()
      return Response.json(data)
    } catch (error) {
      return Response.json({ error: "Failed to delete backtest" }, { status: 500 })
    }
  }
  