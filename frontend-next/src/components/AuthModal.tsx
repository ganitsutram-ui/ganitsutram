/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AuthModal() {
    const { isAuthModalOpen, closeAuthModal, authModalTab, openAuthModal, login, register, isLoading } = useAuth();
    
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
            setError(err.message || 'Login failed');
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (regPassword !== regConfirm) {
            setError("Passwords do not match");
            return;
        }
        try {
            await register(regEmail, regPassword, role);
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
        <div className="gs-auth-overlay active">
            <div className="gs-auth-modal">
                <button className="gs-auth-close" onClick={closeAuthModal}>&times;</button>
                <div className="gs-auth-header">
                    <div className="gs-auth-logo">
                        <span className="sanskrit">गणित</span> GanitSūtram
                    </div>
                    <div className="gs-auth-tabs">
                        <button 
                            className={`gs-auth-tab ${authModalTab === 'login' ? 'active' : ''}`}
                            onClick={() => openAuthModal('login')}
                        >
                            Login
                        </button>
                        <button 
                            className={`gs-auth-tab ${authModalTab === 'register' ? 'active' : ''}`}
                            onClick={() => openAuthModal('register')}
                        >
                            Register
                        </button>
                    </div>
                </div>

                <div className="gs-auth-body">
                    {authModalTab === 'login' && (
                        <div className="gs-auth-panel active">
                            <form onSubmit={handleLogin}>
                                <div className="gs-auth-group">
                                    <label className="gs-auth-label">Email Address</label>
                                    <input type="email" value={loginEmail} onChange={(e)=>setLoginEmail(e.target.value)} className="gs-auth-input" placeholder="you@example.com" required />
                                </div>
                                <div className="gs-auth-group">
                                    <label className="gs-auth-label">Password</label>
                                    <div className="gs-auth-input-wrap">
                                        <input type="password" value={loginPassword} onChange={(e)=>setLoginPassword(e.target.value)} className="gs-auth-input" placeholder="••••••••" required />
                                    </div>
                                </div>
                                {error && <div className="gs-auth-error" style={{ display: 'block', marginBottom: '10px' }}>{error}</div>}
                                <button type="submit" className="gs-auth-submit" disabled={isLoading}>
                                    {isLoading ? <span className="gs-auth-spinner" style={{display: 'inline-block'}}></span> : null}
                                    Login &rarr;
                                </button>
                            </form>
                            <div className="gs-auth-switch">
                                No account? <span className="gs-auth-switch-link" onClick={() => openAuthModal('register')}>Register &rarr;</span>
                            </div>
                        </div>
                    )}

                    {authModalTab === 'register' && (
                        <div className="gs-auth-panel active">
                            <form onSubmit={handleRegister}>
                                <div className="gs-auth-group">
                                    <label className="gs-auth-label">Email Address</label>
                                    <input type="email" value={regEmail} onChange={(e)=>setRegEmail(e.target.value)} className="gs-auth-input" placeholder="you@example.com" required />
                                </div>
                                <div className="gs-auth-group">
                                    <label className="gs-auth-label">Create Password</label>
                                    <div className="gs-auth-input-wrap">
                                        <input type="password" value={regPassword} onChange={(e)=>setRegPassword(e.target.value)} className="gs-auth-input" placeholder="••••••••" required />
                                    </div>
                                </div>
                                <div className="gs-auth-group">
                                    <label className="gs-auth-label">Confirm Password</label>
                                    <input type="password" value={regConfirm} onChange={(e)=>setRegConfirm(e.target.value)} className="gs-auth-input" placeholder="••••••••" required />
                                </div>
                                <div className="gs-auth-group">
                                    <label className="gs-auth-label">I am a...</label>
                                    <div className="gs-auth-roles">
                                        {['student', 'teacher', 'parent', 'adult', 'school', 'admin'].map((r) => (
                                            <div 
                                                key={r}
                                                className={`gs-auth-role ${role === r ? 'active' : ''}`} 
                                                onClick={() => setRole(r)}
                                            >
                                                {r === 'student' ? '🎓 Student' : r === 'teacher' ? '📋 Teacher' : r === 'parent' ? '🏠 Parent' : r === 'adult' ? '🧠 Adult Learner' : r === 'school' ? '🏫 School' : '🛡️ Admin'}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {error && <div className="gs-auth-error" style={{ display: 'block', marginBottom: '10px' }}>{error}</div>}
                                <button type="submit" className="gs-auth-submit" disabled={isLoading}>
                                    {isLoading ? <span className="gs-auth-spinner" style={{display: 'inline-block'}}></span> : null}
                                    Create Account &rarr;
                                </button>
                            </form>
                            <div className="gs-auth-switch">
                                Have an account? <span className="gs-auth-switch-link" onClick={() => openAuthModal('login')}>Login &rarr;</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="gs-auth-footer">
                    GanitSūtram | Ancient Roots. Modern Clarity.
                </div>
            </div>
        </div>
    );
}
