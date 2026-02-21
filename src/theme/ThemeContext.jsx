import { useState, useEffect, createContext, useContext } from 'react'

const ThemeContext = createContext()

/**
 * ThemeProvider - Manages theme state and persistence
 * 
 * Logic:
 * 1. Checks localStorage for a 'theme' preference on mount.
 * 2. Defaults to 'dark' if no preference is found.
 * 3. Applies the theme class (e.g., 'theme--light') to the body element.
 * 4. Provides theme and toggle function via context.
 */
export function ThemeProvider({ children }) {
    // Initialize theme from localStorage or default to 'dark'
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme')
        return savedTheme || 'dark'
    })

    // Synchronize theme with body class and localStorage
    useEffect(() => {
        const body = document.body

        // Remove both classes to ensure a clean state
        body.classList.remove('theme--light', 'theme--dark')

        // Add the current theme class
        body.classList.add(`theme--${theme}`)

        // Persist to localStorage
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark')
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

/**
 * Custom hook for using theme context
 */
export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
