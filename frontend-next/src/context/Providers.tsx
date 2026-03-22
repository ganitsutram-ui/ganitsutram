/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";

import { AuthProvider } from './AuthContext';
import { I18nProvider } from './I18nContext';
import { ThemeProvider } from './ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <I18nProvider>
                    {children}
                </I18nProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
