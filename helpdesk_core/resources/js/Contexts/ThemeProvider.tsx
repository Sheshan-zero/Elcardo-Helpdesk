import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    // Hardcode theme to 'dark' to preserve the premium glass UI
    const theme: Theme = 'dark';
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Apply dark theme to document body
    useEffect(() => {
        if (!mounted) return;

        const root = window.document.documentElement;
        const body = window.document.body;

        // Remove light class if it somehow got cached
        root.classList.remove('light');
        body.classList.remove('light');

        // Always add the dark class
        root.classList.add('dark');
    }, [mounted]);

    const setTheme = (newTheme: Theme) => {
        // No-op to prevent breaking any child components that call it
    };

    const toggleTheme = () => {
        // No-op
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
