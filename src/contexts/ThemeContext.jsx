import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })

  const [accent, setAccent] = useState(() => {
    return localStorage.getItem('theme-accent') || 'forest-green'
  })

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    localStorage.setItem('theme-accent', accent)
    document.documentElement.setAttribute('data-accent', accent)
  }, [accent])

  // Listen for native menu theme toggle
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onToggleTheme(() => {
        setIsDark(prev => !prev)
      })

      return () => {
        window.electronAPI.removeAllListeners('toggle-theme')
      }
    }
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  )
}