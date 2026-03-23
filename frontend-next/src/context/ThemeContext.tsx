/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'manuscript';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    fontScale: number;
    setFontScale: (scale: number) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    setTheme: () => {},
    fontScale: 1,
    setFontScale: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark');
    const [fontScale, setFontScaleState] = useState<number>(1);

    useEffect(() => {
        const savedTheme = localStorage.getItem('gs_theme') as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            setTheme('dark');
        }

        const savedScale = localStorage.getItem('gs_font_scale');
        if (savedScale) {
            setFontScale(parseFloat(savedScale));
        }
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('gs_theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const setFontScale = (scale: number) => {
        // Clamp scale between 0.8 and 1.5
        const clampedScale = Math.min(Math.max(scale, 0.8), 1.5);
        setFontScaleState(clampedScale);
        localStorage.setItem('gs_font_scale', clampedScale.toString());
        document.documentElement.style.setProperty('--gs-font-scale', clampedScale.toString());
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, fontScale, setFontScale }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
