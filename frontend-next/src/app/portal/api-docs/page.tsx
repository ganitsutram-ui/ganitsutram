/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";
import React, { useState, useEffect } from 'react';
import { useI18n } from '@/context/I18nContext';

const SECTIONS = [
    {
        id: 'auth', label: 'Authentication',
        endpoints: [
            {
                id: 'auth-register', method: 'POST', path: '/auth/register', auth: 'public',
                desc: 'Register a new user account. Returns a JWT token on success.',
                params: [
                    { name: 'email', type: 'string', req: true, desc: 'Valid email address' },
                    { name: 'password', type: 'string', req: true, desc: 'Min 8 characters' },
                    { name: 'role', type: 'string', req: true, desc: 'student | teacher | parent | adult | school | admin' }
                ],
                curl: `curl -X POST /api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com","password":"Test1234!","role":"student"}'`,
                success: 201, successBody: `{"token":"eyJ...","user":{"userId":"uuid","email":"test@example.com","role":"student"}}`
            },
            {
                id: 'auth-login', method: 'POST', path: '/auth/login', auth: 'public',
                desc: 'Authenticate an existing user. Returns a JWT token.',
                params: [
                    { name: 'email', type: 'string', req: true, desc: 'Registered email' },
                    { name: 'password', type: 'string', req: true, desc: 'Account password' }
                ],
                curl: `curl -X POST /api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com","password":"Test1234!"}'`,
                success: 200, successBody: `{"token":"eyJ...","user":{"userId":"uuid","email":"test@example.com","role":"student"}}`
            }
        ]
    },
    {
        id: 'solver', label: 'Solver',
        endpoints: [
            {
                id: 'solve', method: 'POST', path: '/solve', auth: 'public',
                desc: 'Run any Vedic mathematical operation. Authenticated users have results auto-saved to progress.',
                params: [
                    { name: 'operation', type: 'string', req: true, desc: 'Operation (e.g. digital-root, nikhilam)' },
                    { name: 'input', type: 'number', req: false, desc: 'Single operand' }
                ],
                curl: `curl -X POST /api/solve \\
  -H "Content-Type: application/json" \\
  -d '{"operation":"digital-root","input":98}'`,
                success: 200, successBody: `{"operation":"digital-root","input":98,"result":8}`
            }
        ]
    }
];

export default function ApiDocs() {
    const { t } = useI18n();
    const [activeSection, setActiveSection] = useState('overview');
    const [openSandbox, setOpenSandbox] = useState<string | null>(null);
    const [sandboxResponse, setSandboxResponse] = useState<Record<string, any>>({});

    const handleTryIt = (id: string) => {
        setOpenSandbox(openSandbox === id ? null : id);
    };

    const sendRequest = (id: string) => {
        setSandboxResponse(prev => ({ ...prev, [id]: "Sending request...\n\n{\n  \"status\": 200,\n  \"message\": \"Success\",\n  \"data\": {\n    \"ok\": true\n  }\n}" }));
    };

    return (
        <main className="docs-layout">
            {/* Sidebar */}
            <aside className="docs-sidebar">
                <nav>
                    <a href="#overview" className={`docs-nav-link ${activeSection === 'overview' ? 'active' : ''}`} onClick={() => setActiveSection('overview')}>Overview</a>
                    {SECTIONS.map(s => (
                        <div key={s.id} style={{ marginTop: '1.5rem' }}>
                            <div style={{ padding: '0 1.25rem', fontSize: '0.7rem', color: 'var(--fg-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{s.label}</div>
                            {s.endpoints.map(ep => (
                                <a 
                                    key={ep.id} 
                                    href={`#${ep.id}`} 
                                    className={`docs-nav-link ${activeSection === ep.id ? 'active' : ''}`}
                                    onClick={() => setActiveSection(ep.id)}
                                >
                                    <span className={`method-badge ${ep.method}`}>{ep.method.slice(0, 3)}</span>
                                    {ep.path}
                                </a>
                            ))}
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Content */}
            <div className="docs-content">
                <section id="overview" style={{ marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>GanitSūtram API</h1>
                    <p style={{ color: 'var(--fg-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                        The GanitSūtram API provides programmatic access to Vedic mathematical algorithms, 
                        pattern detection, and knowledge graph data. Use this reference to integrate Vedic 
                        discovery into your own applications.
                    </p>
                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#18181f', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--fg-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Base URL</div>
                        <code style={{ fontSize: '1rem', color: '#0ea5e9' }}>https://api.ganitsutram.com/api</code>
                    </div>
                </section>

                {SECTIONS.map(s => (
                    <section key={s.id} id={s.id} style={{ marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{s.label}</h2>
                        {s.endpoints.map(ep => (
                            <div key={ep.id} id={ep.id} className="docs-endpoint-card">
                                <div className="docs-endpoint-header">
                                    <span className={`method-badge ${ep.method}`}>{ep.method}</span>
                                    <span className="docs-endpoint-path">/api{ep.path}</span>
                                    <span className={`auth-badge ${ep.auth === 'public' ? 'public' : 'auth'}`} style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        {ep.auth === 'public' ? '🔓 Public' : '🔒 Auth'}
                                    </span>
                                </div>
                                <div style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: 'var(--fg-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{ep.desc}</div>
                                
                                <div style={{ padding: '1.5rem' }}>
                                    <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: '0.75rem' }}>Parameters</h4>
                                    <table className="params-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Type</th>
                                                <th>Req</th>
                                                <th>Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ep.params.map(p => (
                                                <tr key={p.name}>
                                                    <td className="param-name">{p.name}</td>
                                                    <td style={{ color: '#a78bfa', fontFamily: 'monospace' }}>{p.type}</td>
                                                    <td style={{ color: p.req ? 'var(--accent-primary)' : 'inherit' }}>{p.req ? 'Yes' : 'No'}</td>
                                                    <td>{p.desc}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <div style={{ marginTop: '2rem' }}>
                                        <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: '0.75rem' }}>Example Request</h4>
                                        <div className="docs-code-block">
                                            <div className="docs-code-block-header"><span>CURL</span></div>
                                            <pre><code>{ep.curl}</code></pre>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '2rem' }}>
                                        <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: '0.75rem' }}>Success Response</h4>
                                        <div className="docs-code-block">
                                            <div className="docs-code-block-header"><span>JSON</span></div>
                                            <pre><code>{ep.successBody}</code></pre>
                                        </div>
                                    </div>
                                </div>

                                <div className="docs-try-it">
                                    <button className="docs-try-it-toggle" onClick={() => handleTryIt(ep.id)}>
                                        ⚡ Try It Out
                                        <span>{openSandbox === ep.id ? '▲' : '▼'}</span>
                                    </button>
                                    {openSandbox === ep.id && (
                                        <div className="try-it-body">
                                            <div className="try-it-fields">
                                                {ep.params.map(p => (
                                                    <div key={p.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                        <label style={{ fontSize: '0.75rem', color: 'var(--fg-muted)' }}>{p.name}</label>
                                                        <input type="text" className="try-it-input" placeholder={p.desc} />
                                                    </div>
                                                ))}
                                            </div>
                                            <button className="gs-btn gs-btn-primary" style={{ marginTop: '1rem', width: 'fit-content' }} onClick={() => sendRequest(ep.id)}>Send Request →</button>
                                            {sandboxResponse[ep.id] && (
                                                <div className="try-it-response">{sandboxResponse[ep.id]}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </section>
                ))}
            </div>
        </main>
    );
}
