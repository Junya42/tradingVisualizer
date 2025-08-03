export async function DELETE(request: Request, { params }: { params: { name: string } }) {
    try {
      const response = await fetch(`http://localhost:8000/deleteStrategy/${params.name}`, {
        method: "DELETE",
      })
  
      if (!response.ok) {
        const error = await response.json()
        return Response.json(error, { status: response.status })
      }
  
      const data = await response.json()
      return Response.json(data)
    } catch (error) {
      return Response.json({ error: "Failed to delete strategy" }, { status: 500 })
    }
  }
  