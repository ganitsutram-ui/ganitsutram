/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type I18nContextType = {
    locale: string;
    setLocale: (locale: string) => void;
    t: (key: string, vars?: Record<string, string>) => string;
    isLoaded: boolean;
    formatNumber: (n: number) => string;
    formatDate: (date: string | Date) => string;
    formatYear: (year: number) => string;
};

const SUPPORTED_LOCALES = ['en', 'hi', 'sa'];
const DEFAULT_LOCALE = 'en';

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
    const [translations, setTranslations] = useState<Record<string, any>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // On mount, load default or saved locale
        const saved = localStorage.getItem('gs_locale') || navigator.language.split('-')[0];
        const initialLocale = SUPPORTED_LOCALES.includes(saved) ? saved : DEFAULT_LOCALE;
        setLocale(initialLocale);
    }, []);

    const fetchLocaleData = async (loc: string) => {
        try {
            const res = await fetch(`/locales/${loc}.json`);
            if (res.ok) {
                const data = await res.json();
                setTranslations(prev => ({ ...prev, [loc]: data }));
            }
        } catch (e) {
            console.error(`Failed to load locale ${loc}`);
        }
    };

    const setLocale = async (newLocale: string) => {
        if (!SUPPORTED_LOCALES.includes(newLocale)) return;
        setIsLoaded(false);
        
        const locToLoad = [newLocale];
        if (newLocale !== 'en' && !translations['en']) {
            locToLoad.push('en');
        }

        // Fetch missing data
        for (const loc of locToLoad) {
            if (!translations[loc]) {
                try {
                    const res = await fetch(`/locales/${loc}.json`);
                    if (res.ok) {
                        const data = await res.json();
                        // Update translations map locally to ensure atomic-like update if needed,
                        // but setTranslations is still needed for global state.
                        setTranslations(prev => ({ ...prev, [loc]: data }));
                        // We also store it in a temporary object if we wanted to be super safe,
                        // but React state batching in async handlers usually suffices.
                    }
                } catch (e) {
                    console.error(`Failed to load locale ${loc}`);
                }
            }
        }
        
        localStorage.setItem('gs_locale', newLocale);
        document.documentElement.lang = newLocale === 'sa' ? 'sa-Deva' : newLocale;
        
        // Final state updates
        setLocaleState(newLocale);
        setIsLoaded(true);
    };

    const resolveKey = (obj: any, path: string) => {
        if (!obj) return undefined;
        const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
        if (value === undefined && process.env.NODE_ENV === 'development') {
            // Optional: log missing keys in dev
        }
        return value;
    };

    const t = useCallback((key: string, vars: Record<string, string> = {}) => {
        let result = resolveKey(translations[locale], key);
        
        // Fallback to English
        if (result === undefined && locale !== 'en') {
            result = resolveKey(translations['en'], key);
        }
        
        if (result === undefined) {
            if (process.env.NODE_ENV === 'development') {
                console.warn(`[I18n] Missing key: ${key} for locale: ${locale}`);
            }
            return key;
        }

        if (typeof result !== 'string') return String(result);

        return result.replace(/\{\{(.*?)\}\}/g, (match, p1) => {
            const varName = p1.trim();
            return vars[varName] !== undefined ? vars[varName] : match;
        });
    }, [locale, translations]);

    const formatNumber = useCallback((n: number) => {
        const nfLocale = locale === 'hi' ? 'hi-IN' : locale === 'sa' ? 'hi-IN' : 'en-IN';
        return new Intl.NumberFormat(nfLocale).format(n);
    }, [locale]);

    const formatDate = useCallback((date: string | Date) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        const dfLocale = locale === 'hi' ? 'hi-IN' : locale === 'sa' ? 'hi-IN' : 'en-GB';
        return new Intl.DateTimeFormat(dfLocale, { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
    }, [locale]);

    const formatYear = useCallback((year: number) => {
        const yLocale = (locale === 'hi' || locale === 'sa') ? 'hi-IN-u-nu-deva' : 'en-IN';
        return new Intl.NumberFormat(yLocale, { useGrouping: false }).format(year);
    }, [locale]);

    return (
        <I18nContext.Provider value={{ locale, setLocale, t, isLoaded, formatNumber, formatDate, formatYear }}>
            {children}
        </I18nContext.Provider>
    );
}

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (context === undefined) throw new Error('useI18n must be used within an I18nProvider');
    return context;
};
