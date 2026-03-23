/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';

export default function AuthModal() {
    const { isAuthModalOpen, closeAuthModal, authModalTab, openAuthModal, login, register, isLoading } = useAuth();
    const { t } = useI18n();
    
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirm, setRegConfirm] = useState('');
    const [role, setRole] = useState('student');
    
    const [error, setError] = useState('');

    if (!isAuthModalOpen) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(loginEmail, loginPassword);
        } catch (err: any) {
            setError(err.message || t('auth.errorLogin'));
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (regPassword !== regConfirm) {
            setError(t('auth.errorMatch'));
            return;
        }
        try {
            await register(regEmail, regPassword, role);
        } catch (err: any) {
            setError(err.message || t('auth.errorRegister'));
        }
    };

    return (
        <div className="gs-auth-overlay active">
            <div className="gs-auth-modal">
                <button className="gs-auth-close" onClick={closeAuthModal}>&times;</button>
                <div className="gs-auth-header">
                    <div className="gs-auth-logo">
                        <span className="sanskrit">गणित</span> {t('common.brand')}
                    </div>
                    <div className="gs-auth-tabs">
                        <button 
                            className={`gs-auth-tab ${authModalTab === 'login' ? 'active' : ''}`}
                            onClick={() => openAuthModal('login')}
                        >
                            {t('auth.loginTab')}
                        </button>
                        <button 
                            className={`gs-auth-tab ${authModalTab === 'register' ? 'active' : ''}`}
                            onClick={() => openAuthModal('register')}
                        >
                            {t('auth.registerTab')}
                        </button>
                    </div>
                </div>

                <div className="gs-auth-body">
                    {authModalTab === 'login' && (
                        <div className="gs-auth-panel active">
                            <form onSubmit={handleLogin}>
                                <div className="gs-auth-group">
                                    <label className="gs-auth-label">{t('auth.emailLabel')}</label>
                                    <input type="email" value={loginEmail} onChange={(e)=>setLoginEmail(e.target.value)} className="gs-auth-input" placeholder={t('auth.emailPlaceholder')} required />
                                </div>
                                <div className="gs-auth-group">
                                    <label className="gs-auth-label">{t('auth.passwordLabel')}</label>
                                    <div className="gs-auth-input-wrap">
                                        <input type="password" value={loginPassword} onChange={(e)=>setLoginPassword(e.target.value)} className="gs-auth-input" placeholder={t('auth.passwordPlaceholder')} required />
                                    </div>
                                </div>
                                {error && <div className="gs-auth-error" style={{ display: 'block', marginBottom: '10px' }}>{error}</div>}
                                <button type="submit" className="gs-auth-submit" disabled={isLoading}>
                                    {isLoading ? <span className="gs-auth-spinner" style={{display: 'inline-block'}}></span> : null}
                                    {t('auth.loginBtn')}
                                </button>
                            </form>
                            <div className="gs-auth-switch">
                                {t('auth.noAccount')} <span className="gs-auth-switch-link" onClick={() => openAuthModal('register')}>{t('auth.registerTab')} &rarr;</span>
                            </div>
                        </div>
                    )}

                    {authModalTab === 'register' && (
                        <div className="gs-auth-panel active">
                            <form onSubmit={handleRegister}>
                                <div className="gs-auth-group">
                                    <label className="gs-auth-label">{t('auth.emailLabel')}</label>
                                    <input type="email" value={regEmail} onChange={(e)=>setRegEmail(e.target.value)} className="gs-auth-input" placeholder={t('auth.emailPlaceholder')} required />
                                </div>
                                <div className="gs-auth-group">
                                    <label className="gs-auth-label">{t('auth.passwordLabel')}</label>
                                    <div className="gs-auth-input-wrap">
                                        <input type="password" value={regPassword} onChange={(e)=>setRegPassword(e.target.value)} className="gs-auth-input" placeholder={t('auth.passwordPlaceholder')} required />
                                    </div>
                                </div>
                                <div className="gs-auth-group">
                                    <label className="gs-auth-label">{t('auth.confirmPasswordLabel')}</label>
                                    <input type="password" value={regConfirm} onChange={(e)=>setRegConfirm(e.target.value)} className="gs-auth-input" placeholder={t('auth.passwordPlaceholder')} required />
                                </div>
                                <div className="gs-auth-group">
                                    <label className="gs-auth-label">{t('auth.roleLabel')}</label>
                                    <div className="gs-auth-roles">
                                        {['student', 'teacher', 'parent', 'adult', 'school', 'admin'].map((r) => (
                                            <div 
                                                key={r}
                                                className={`gs-auth-role ${role === r ? 'active' : ''}`} 
                                                onClick={() => setRole(r)}
                                            >
                                                {r === 'student' ? t('auth.roleStudent') : 
                                                 r === 'teacher' ? t('auth.roleTeacher') : 
                                                 r === 'parent' ? t('auth.roleParent') : 
                                                 r === 'adult' ? t('auth.roleAdult') : 
                                                 r === 'school' ? t('auth.roleSchool') : 
                                                 t('auth.roleAdmin')}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {error && <div className="gs-auth-error" style={{ display: 'block', marginBottom: '10px' }}>{error}</div>}
                                <button type="submit" className="gs-auth-submit" disabled={isLoading}>
                                    {isLoading ? <span className="gs-auth-spinner" style={{display: 'inline-block'}}></span> : null}
                                    {t('auth.registerBtn')}
                                </button>
                            </form>
                            <div className="gs-auth-switch">
                                {t('auth.hasAccount')} <span className="gs-auth-switch-link" onClick={() => openAuthModal('login')}>{t('auth.loginTab')} &rarr;</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="gs-auth-footer">
                    {t('common.brand')} | {t('common.tagline')}
                </div>
            </div>
        </div>
    );
}
