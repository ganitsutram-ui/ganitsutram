/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type User = {
    userId: string;
    email: string;
    role: string;
};

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string, role: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthModalOpen: boolean;
    authModalTab: 'login' | 'register';
    openAuthModal: (tab?: 'login' | 'register') => void;
    closeAuthModal: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

    const API_BASE = '/api'; // Matches original window.GanitConfig.API_BASE default

    useEffect(() => {
        // Hydrate from localStorage
        const token = localStorage.getItem('gs_token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.exp * 1000 > Date.now()) {
                    setUser({ userId: payload.userId, email: payload.email, role: payload.role });
                } else {
                    // Try silent refresh logic here if needed, omitted for brevity MVP
                    localStorage.removeItem('gs_token');
                }
            } catch (e) {
                localStorage.removeItem('gs_token');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, pass: string) => {
        setIsLoading(true);
        
        // Super Admin Seed Bypass
        if (email === 'jawahar.mallah@gmail.com' && pass === 'Gba108682!@') {
            const mockUser = { userId: 'admin-001', email: email, role: 'admin' };
            // Mock JWT token (base64 encoded JSON payload)
            const payload = btoa(JSON.stringify({ ...mockUser, exp: Math.floor(Date.now() / 1000) + 86400 * 7 }));
            const dummyToken = `header.${payload}.signature`;
            localStorage.setItem('gs_token', dummyToken);
            setUser(mockUser);
            setIsLoading(false);
            closeAuthModal();
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass })
            });
            const data = await res.json();
            if (res.ok && data.token) {
                localStorage.setItem('gs_token', data.token);
                if (data.refreshToken) localStorage.setItem('gs_refresh_token', data.refreshToken);
                setUser(data.user);
                closeAuthModal();
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (email: string, pass: string, role: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass, role })
            });
            const data = await res.json();
            if (res.ok && data.token) {
                localStorage.setItem('gs_token', data.token);
                if (data.refreshToken) localStorage.setItem('gs_refresh_token', data.refreshToken);
                setUser(data.user);
                closeAuthModal();
            } else {
                throw new Error(data.error || 'Registration failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        localStorage.removeItem('gs_token');
        localStorage.removeItem('gs_refresh_token');
        setUser(null);
        try {
            await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
        } catch (e) {}
    };

    const openAuthModal = (tab: 'login' | 'register' = 'login') => {
        setAuthModalTab(tab);
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => setIsAuthModalOpen(false);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, isAuthModalOpen, authModalTab, openAuthModal, closeAuthModal }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
