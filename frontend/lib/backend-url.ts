export async function getBackendUrl() {
  // Check if we're running in Electron
  if (typeof window !== 'undefined' && window.electronAPI) {
    try {
      return await window.electronAPI.getBackendUrl();
    } catch (error) {
      console.error('Failed to get backend URL from Electron:', error);
    }
  }
  
  // Fallback to localhost for development
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
}

export async function fetchFromBackend(endpoint: string, options: RequestInit = {}) {
  const backendUrl = await getBackendUrl();
  const response = await fetch(`${backendUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  
  return response.json();
} 