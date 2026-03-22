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
        
        // Always ensure English fallback is loaded
        if (newLocale !== 'en' && !translations['en']) {
            await fetchLocaleData('en');
        }
        
        if (!translations[newLocale]) {
            await fetchLocaleData(newLocale);
        }
        
        localStorage.setItem('gs_locale', newLocale);
        document.documentElement.lang = newLocale === 'sa' ? 'sa-Deva' : newLocale;
        setLocaleState(newLocale);
        setIsLoaded(true);
    };

    const resolveKey = (obj: any, path: string) => {
        if (!obj) return undefined;
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const t = useCallback((key: string, vars: Record<string, string> = {}) => {
        let result = resolveKey(translations[locale], key);
        if (result === undefined && locale !== 'en') {
            result = resolveKey(translations['en'], key);
        }
        if (result === undefined) return key;

        if (typeof result !== 'string') return result;

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

    return (
        <I18nContext.Provider value={{ locale, setLocale, t, isLoaded, formatNumber, formatDate }}>
            {children}
        </I18nContext.Provider>
    );
}

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (context === undefined) throw new Error('useI18n must be used within an I18nProvider');
    return context;
};
