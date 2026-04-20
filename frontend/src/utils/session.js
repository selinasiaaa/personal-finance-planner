export const API_BASE = import.meta.env.VITE_API_BASE || ''

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
export const isStrongPassword = (password) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)

export const getStoredUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

export const setStoredUser = (user, remember = true) => {
  const serialized = JSON.stringify(user)
  if (remember) {
    localStorage.setItem('user', serialized)
    sessionStorage.removeItem('user')
  } else {
    sessionStorage.setItem('user', serialized)
    localStorage.removeItem('user')
  }
}

export const clearStoredUser = () => {
  localStorage.removeItem('user')
  sessionStorage.removeItem('user')
}

export const apiRequest = async (path, options = {}) => {
  const config = {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  }

  const response = await fetch(`${API_BASE}${path}`, config)
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed.')
  }

  return data
}