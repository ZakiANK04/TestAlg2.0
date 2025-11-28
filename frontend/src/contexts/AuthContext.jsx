import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('access_token')
    if (token) {
      // Verify token is valid by fetching user profile
      axios.get('http://127.0.0.1:8000/api/auth/profile/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => {
          setUser(response.data)
          setIsAuthenticated(true)
          // Set default axios header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        })
        .catch(async (error) => {
          // Token might be expired, try to refresh
          const refreshToken = localStorage.getItem('refresh_token')
          if (refreshToken) {
            try {
              const refreshResponse = await axios.post('http://127.0.0.1:8000/api/auth/refresh/', {
                refresh: refreshToken
              })
              const newAccessToken = refreshResponse.data.access
              localStorage.setItem('access_token', newAccessToken)
              axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
              
              // Fetch user profile again
              const profileResponse = await axios.get('http://127.0.0.1:8000/api/auth/profile/', {
                headers: {
                  Authorization: `Bearer ${newAccessToken}`
                }
              })
              setUser(profileResponse.data)
              setIsAuthenticated(true)
            } catch (refreshError) {
              // Refresh failed, clear tokens
              localStorage.removeItem('access_token')
              localStorage.removeItem('refresh_token')
              setIsAuthenticated(false)
              setUser(null)
            }
          } else {
            localStorage.removeItem('access_token')
            setIsAuthenticated(false)
            setUser(null)
          }
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = (accessToken, refreshToken, userData) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

