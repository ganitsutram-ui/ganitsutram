/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { VedicEngine } from '@/lib/vedic-engine';

const FALLBACK_CONCEPTS = [
    { id: "digital-root", title: "Digital Root", sutra: "Beejank", desc: "Reduce any number to a single digit.", inputs: 1, operations: ["digital-root", "digital-root-steps"] },
    { id: "squares-ending-5", title: "Squares Ending in 5", sutra: "Ekadhikena Purvena", desc: "Instantly square any number ending in 5.", inputs: 1, operations: ["squares-ending-5", "squares-ending-5-steps"] },
    { id: "multiply-by-11", title: "Multiply by 11", sutra: "Vedic 11x Pattern", desc: "Multiply any number by 11 using digit bridging.", inputs: 1, operations: ["multiply-by-11", "multiply-by-11-steps"] },
    { id: "nikhilam", title: "Nikhilam", sutra: "Nikhilam Navatashcaramam Dashatah", desc: "Multiply numbers near a power-of-10 base.", inputs: 2, operations: ["nikhilam", "nikhilam-steps"] },
    { id: "urdhva", title: "Urdhva Tiryak", sutra: "Urdhva Tiryagbhyam", desc: "General multiplication vertically and crosswise.", inputs: 2, operations: ["urdhva", "urdhva-steps"] }
];

export default function SolverPage() {
    const { user, openAuthModal } = useAuth();
    const { t, formatNumber } = useI18n();

    const [concepts, setConcepts] = useState<any[]>(FALLBACK_CONCEPTS);
    const [selectedOp, setSelectedOp] = useState('');
    const [activeConcept, setActiveConcept] = useState<any>(null);

    const [inputA, setInputA] = useState('');
    const [inputB, setInputB] = useState('');
    const [inputSeq, setInputSeq] = useState('');

    const [warning, setWarning] = useState('');
    const [isSolving, setIsSolving] = useState(false);
    
    const [resultData, setResultData] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        // Find active concept
        if (selectedOp) {
            const opId = selectedOp.split('-steps')[0];
            const found = concepts.find(c => c.id === opId);
            setActiveConcept(found);
            validateInputs(found, inputA, inputB, inputSeq);
        } else {
            setActiveConcept(null);
            setWarning('');
        }
    }, [selectedOp]);

    // Live validation
    useEffect(() => {
        validateInputs(activeConcept, inputA, inputB, inputSeq);
    }, [inputA, inputB, inputSeq]);

    const validateInputs = (concept: any, a: string, b: string, seq: string) => {
        setWarning('');
        if (!concept) return;

        if (concept.id === 'squares-ending-5' && a) {
            if (parseInt(a) % 10 !== 5) {
                setWarning('⚠️ Number must end in 5 for this sutra.');
            }
        }

        if (concept.id === 'nikhilam' && a && b) {
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) {
                const baseA = Math.pow(10, Math.ceil(Math.log10(numA)));
                const baseB = Math.pow(10, Math.ceil(Math.log10(numB)));
                if (baseA !== baseB) {
                    setWarning('⚠️ Nikhilam works best for numbers near the SAME power of 10.');
                }
            }
        }
    };

    const handleSolve = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeConcept) return;

        setIsSolving(true);
        setResultData(null);

        try {
            // Use Client-side VedicEngine instead of API
            const result = VedicEngine.solve(selectedOp, inputA, inputB);
            
            setResultData({ data: result, concept: activeConcept });
            
            const histEntry = {
                op: activeConcept.title,
                sutra: activeConcept.sutra,
                inputA: result.inputA || result.input,
                inputB: result.inputB,
                result: result.result,
                time: new Date()
            };
            setHistory(prev => [histEntry, ...prev].slice(0, 10));
        } catch (err: any) {
            setWarning(err.message || 'Solver encountered an error.');
        } finally {
            setIsSolving(false);
        }
    };

    return (
        <main id="main-content">
            <div className="gs-container">
                <section className="gs-solver-layout">

                    {/* LEFT: Solver Bench */}
                    <div className="gs-solver-bench">
                        <h1 className="gs-hero-title" style={{ marginBottom: '3rem' }}>{t('solver.heading') || 'Mathematical Solver'}</h1>

                        <div className="gs-solver-card">
                            <form id="solver-form" onSubmit={handleSolve}>
                                {/* Operation Selection */}
                                <div className="gs-form-group" style={{ marginBottom: '2rem' }}>
                                    <label htmlFor="op-selector">{t('solver.operationLabel') || 'Select Operation'}</label>
                                    <select 
                                        id="op-selector" 
                                        className="gs-input gs-select" 
                                        value={selectedOp} 
                                        onChange={(e) => setSelectedOp(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>{t('solver.loadingOps') || 'Select an operation...'}</option>
                                        <optgroup label="Single Input">
                                            {concepts.filter(c => c.inputs === 1).map(c => (
                                                <React.Fragment key={c.id}>
                                                    <option value={c.operations[0]}>{c.title}</option>
                                                    <option value={c.operations[1]}>{c.title} + Steps</option>
                                                </React.Fragment>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Dual Input">
                                            {concepts.filter(c => c.inputs === 2).map(c => (
                                                <React.Fragment key={c.id}>
                                                    <option value={c.operations[0]}>{c.title}</option>
                                                    <option value={c.operations[1]}>{c.title} + Steps</option>
                                                </React.Fragment>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>

                                {/* Inputs */}
                                {activeConcept && activeConcept.inputType === 'sequence' && (
                                    <div className="gs-form-row">
                                        <div className="gs-input-group" style={{ gridColumn: 'span 2' }}>
                                            <label>{t('solver.seqLabel')}</label>
                                            <textarea 
                                                className="gs-input" 
                                                rows={3} 
                                                placeholder="Enter numbers separated by commas: 1,4,9,16,25"
                                                value={inputSeq}
                                                onChange={e => setInputSeq(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeConcept && activeConcept.inputs === 2 && activeConcept.inputType !== 'sequence' && (
                                    <div className="gs-form-row">
                                        <div className="gs-input-group">
                                            <label>{t('solver.firstLabel')}</label>
                                            <input 
                                                type="number" 
                                                className="gs-input" 
                                                placeholder="e.g. 98" 
                                                value={inputA}
                                                onChange={e => setInputA(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="gs-input-group">
                                            <label>{t('solver.secondLabel')}</label>
                                            <input 
                                                type="number" 
                                                className="gs-input" 
                                                placeholder="e.g. 97" 
                                                value={inputB}
                                                onChange={e => setInputB(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeConcept && activeConcept.inputs === 1 && activeConcept.inputType !== 'sequence' && (
                                    <div className="gs-form-row">
                                        <div className="gs-input-group">
                                            <label>{t('solver.numLabel')}</label>
                                            <input 
                                                type="number" 
                                                className="gs-input" 
                                                placeholder="e.g. 75"
                                                value={inputA}
                                                onChange={e => setInputA(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {warning && <div className="gs-warning-inline">{warning}</div>}

                                <button 
                                    type="submit" 
                                    className="gs-button gs-button-primary" 
                                    style={{ width: '100%', marginTop: '1rem' }}
                                    disabled={!selectedOp || isSolving}
                                >
                                    {isSolving ? 'Computing...' : (t('solver.solveBtn') || 'Solve Equation')}
                                </button>
                            </form>
                        </div>

                        {/* Result Panel */}
                        {resultData && (
                            <div className="gs-result-area">
                                <header className="gs-result-header">
                                    <h2 className="gs-result-title">{t('solver.resultHeading') || 'Operation Result'}</h2>
                                    <span className="gs-result-sutra">{resultData.concept.sutra}</span>
                                </header>
                                <div className="gs-equation">
                                    {resultData.data.inputB !== undefined 
                                        ? `${formatNumber(resultData.data.inputA)} × ${formatNumber(resultData.data.inputB)} = ${formatNumber(resultData.data.result)}`
                                        : `${formatNumber(resultData.data.input)} ➝ ${formatNumber(resultData.data.result)}`
                                    }
                                </div>
                                <div className="gs-pill-chain">
                                    {resultData.data.steps && resultData.data.steps.map((step: string, idx: number) => (
                                        <React.Fragment key={idx}>
                                            <div className="gs-pill">{step}</div>
                                            {idx < resultData.data.steps.length - 1 && <span className="gs-arrow">→</span>}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* History */}
                        <div className="gs-history-panel" style={{ marginTop: '4rem' }}>
                            <div className="gs-history-header">
                                <h3>{t('profile.history') || 'Session History'}</h3>
                                {history.length > 0 && (
                                    <button onClick={() => setHistory([])} className="gs-button" style={{ fontSize: '0.7rem', padding: '0.3rem 0.8rem' }}>
                                        {t('profile.clearAll') || 'Clear All'}
                                    </button>
                                )}
                            </div>
                            <table className="gs-history-table">
                                <thead>
                                    <tr>
                                        <th>{t('solver.thOperation')}</th>
                                        <th>{t('solver.thInput')}</th>
                                        <th>{t('solver.thResult')}</th>
                                        <th>{t('solver.thSutra')}</th>
                                        <th>{t('solver.thTime')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((h, i) => (
                                        <tr key={i}>
                                            <td>{h.op}</td>
                                            <td>{h.inputB !== undefined ? `${formatNumber(h.inputA)} × ${formatNumber(h.inputB)}` : formatNumber(h.inputA)}</td>
                                            <td style={{ color: 'var(--accent-primary)' }}>{formatNumber(h.result)}</td>
                                            <td>{h.sutra}</td>
                                            <td style={{ opacity: 0.5 }}>{h.time.toLocaleTimeString()}</td>
                                        </tr>
                                    ))}
                                    {history.length === 0 && (
                                        <tr><td colSpan={5} style={{ textAlign: 'center', opacity: 0.5 }}>{t('solver.noOps')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Progress Section */}
                        <section className="gs-progress-section" style={{ marginTop: '4rem' }}>
                            <div className="gs-progress-header">
                                <h2 className="gs-hero-title" style={{ fontSize: '2rem' }}>{t('profile.progress') || 'My Progress'}</h2>
                            </div>
                            {!user ? (
                                <div className="gs-progress-nudge">
                                    <p style={{ marginBottom: '1rem', color: 'var(--text-dim)' }}>{t('solver.journeyStart')}</p>
                                    <button onClick={() => openAuthModal('register')} className="gs-button gs-button-primary">
                                        Sign in to Save Progress &rarr;
                                    </button>
                                </div>
                            ) : (
                                <div className="gs-progress-nudge">
                                    <p style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>{t('solver.welcomeBack')}</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* RIGHT: Reference Panel */}
                    <aside className="gs-solver-sidebar">
                        <div className="gs-history-panel">
                            <h3 style={{ marginBottom: '2rem' }}>{t('solver.vedicRef') || 'Vedic Reference'}</h3>
                            <div className="gs-ref-panel">
                                {concepts.map(c => (
                                    <div className="gs-ref-item" key={c.id}>
                                        <div className="gs-ref-title">{c.title}</div>
                                        <span className="gs-ref-sutra">{c.sutra}</span>
                                        <p className="gs-ref-desc">{c.desc}</p>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', marginTop: '0.5rem' }}>
                                            {c.inputs === 2 ? 'Dual Input' : 'Single Input'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                </section>
            </div>
        </main>
    );
}
