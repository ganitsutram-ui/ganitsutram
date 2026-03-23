/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
    const { user, openAuthModal, logout } = useAuth();
    const { locale, setLocale, t } = useI18n();
    const { theme, setTheme, fontScale, setFontScale } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="gs-nav" style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--glass-border)' }}>
            <div className="gs-nav-inner">
                <Link href="/portal" className="gs-nav-logo">
                    <span className="gs-nav-logo-dev">गणित</span>{t('common.brand')}
                </Link>
                <nav className={`gs-nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
                    <div className="nav-right">
                        <div className="gs-lang-switcher" style={{ display: 'flex', gap: '2px', marginRight: '0.5rem' }}>
                            <button title={t('nav.fontDecrease')} className="gs-lang-btn" onClick={() => setFontScale(fontScale - 0.1)}>A-</button>
                            <button title={t('nav.fontReset')} className={`gs-lang-btn ${fontScale === 1 ? 'active' : ''}`} onClick={() => setFontScale(1)}>A</button>
                            <button title={t('nav.fontIncrease')} className="gs-lang-btn" onClick={() => setFontScale(fontScale + 0.1)}>A+</button>
                        </div>
                        <div className="gs-lang-switcher" style={{ display: 'flex', gap: '2px', marginRight: '0.5rem' }}>
                            <button title={t('nav.darkMode')} className={`gs-lang-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>🌙</button>
                            <button title={t('nav.lightMode')} className={`gs-lang-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>☀️</button>
                            <button title={t('nav.manuscriptMode')} className={`gs-lang-btn ${theme === 'manuscript' ? 'active' : ''}`} onClick={() => setTheme('manuscript')}>📜</button>
                        </div>
                        <div className="gs-lang-switcher" id="langSwitcher">
                            <button className={`gs-lang-btn ${locale === 'en' ? 'active' : ''}`} onClick={() => setLocale('en')}>EN</button>
                            <button className={`gs-lang-btn ${locale === 'hi' ? 'active' : ''}`} onClick={() => setLocale('hi')}>हि</button>
                            <button className={`gs-lang-btn ${locale === 'sa' ? 'active' : ''}`} onClick={() => setLocale('sa')}>सं</button>
                        </div>
                        
                        {user ? (
                            <button onClick={logout} className="nav-link btn-ghost">{t('nav.logout')}</button>
                        ) : (
                            <button className="nav-link btn-ghost" onClick={() => openAuthModal('login')}>{t('nav.signIn')}</button>
                        )}
                        <Link href="/gate" className="gs-nav-cta">{t('nav.enterPlatform')}</Link>
                    </div>
                </nav>
                <button className="gs-nav-hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    ☰
                </button>
            </div>
        </header>
    );
}
