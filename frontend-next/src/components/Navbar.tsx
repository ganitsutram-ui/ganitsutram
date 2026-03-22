"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
    const { user, openAuthModal, logout } = useAuth();
    const { locale, setLocale } = useI18n();
    const { theme, setTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="gs-nav" style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--glass-border)' }}>
            <div className="gs-nav-inner">
                <Link href="/portal" className="gs-nav-logo">
                    <span className="gs-nav-logo-dev">गणित</span>GanitSūtram
                </Link>
                <nav className={`gs-nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
                    <div className="nav-right">
                        <div className="gs-lang-switcher" style={{ display: 'flex', gap: '2px', marginRight: '0.5rem' }}>
                            <button title="Dark Theme" className={`gs-lang-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>🌙</button>
                            <button title="Light Theme" className={`gs-lang-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>☀️</button>
                            <button title="Manuscript Theme" className={`gs-lang-btn ${theme === 'manuscript' ? 'active' : ''}`} onClick={() => setTheme('manuscript')}>📜</button>
                        </div>
                        <div className="gs-lang-switcher" id="langSwitcher">
                            <button className={`gs-lang-btn ${locale === 'en' ? 'active' : ''}`} onClick={() => setLocale('en')}>EN</button>
                            <button className={`gs-lang-btn ${locale === 'hi' ? 'active' : ''}`} onClick={() => setLocale('hi')}>हि</button>
                            <button className={`gs-lang-btn ${locale === 'sa' ? 'active' : ''}`} onClick={() => setLocale('sa')}>सं</button>
                        </div>
                        
                        {user ? (
                            <button onClick={logout} className="nav-link btn-ghost">Logout</button>
                        ) : (
                            <button className="nav-link btn-ghost" onClick={() => openAuthModal('login')}>Sign In</button>
                        )}
                        <Link href="/gate" className="gs-nav-cta">Enter Platform &rarr;</Link>
                    </div>
                </nav>
                <button className="gs-nav-hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    ☰
                </button>
            </div>
        </header>
    );
}
