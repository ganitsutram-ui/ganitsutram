/*
 * GANITSUTRAM
 * A Living Knowledge Ecosystem for Mathematical Discovery
 *
 * "यथा शिखा मयूराणां नागानां मणयो यथा
 *  तद्वद् वेदाङ्गशास्त्राणां गणितं मूर्ध्नि वर्तते"
 *
 * As the crest of a peacock, as the gem on the hood
 * of a cobra — so stands mathematics at the crown
 * of all knowledge.
 *                                       — Brahmagupta
 *                                         628 CE · Brahmasphutasiddhanta
 *
 * Creator:   Jawahar R. Mallah
 * Email:     jawahar@aitdl.com
 * GitHub:    https://github.com/jawahar-mallah
 * Websites:  https://ganitsutram.com
 *            https://aitdl.com
 *
 * Then:  628 CE · Brahmasphutasiddhanta
 * Now:   8 March MMXXVI · Vikram Samvat 2082
 *
 * Copyright © 2026 Jawahar R. Mallah · AITDL | GANITSUTRAM
 *
 * Developer Note:
 * If you intend to reuse this code, please respect
 * the creator and the work behind it.
 */
/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: Authentication Logic & Session Management.
 *          Handles API calls, forms, and memory-only session state.
 */

(function () {
    // --- PRIVATE STATE (Persisted if possible) ---
    let currentUser = null;

    // Retrieve token safely with proactive/synchronous refresh check
    async function getToken() {
        const token = localStorage.getItem('gs_token');
        if (!token) return null;

        // Base64 decode middle part for exp
        try {
            const payloadBase64 = token.split('.')[1];
            const payload = JSON.parse(atob(payloadBase64));
            const expMs = payload.exp * 1000;
            const now = Date.now();

            // If expiring in next 2 mins, force synchronous refresh
            if (expMs - now < 120000) {
                const refreshed = await silentRefresh();
                if (refreshed) {
                    return localStorage.getItem('gs_token');
                } else {
                    return null;
                }
            }
        } catch (e) {
            console.warn('Invalid token structure', e);
            clearAuth();
            return null;
        }

        return token;
    }

    const _getTokenSync = () => localStorage.getItem('gs_token'); // Internal pure getter

    // Initialize currentUser from stored token if valid
    const token = _getTokenSync();
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp * 1000 > Date.now()) {
                currentUser = {
                    userId: payload.userId,
                    email: payload.email,
                    role: payload.role
                };
            } else {
                silentRefresh(); // Attempt asynchronous background refresh
            }
        } catch (e) {
            // Invalid token, clear it
            clearAuth();
        }
    }

    const API_BASE = '/api';

    const AUTH_BASE = `${API_BASE}/auth`;

    // --- TOAST SYSTEM ---
    function showToast(message, type = 'info') {
        const container = document.getElementById('gs-toast-container') || createToastContainer();
        const toast = document.createElement('div');
        toast.className = `gs-toast gs-toast-${type}`;

        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
        toast.innerHTML = `
            <span class="gs-toast-icon">${icon}</span>
            <span class="gs-toast-message">${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }

    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'gs-toast-container';
        container.className = 'gs-toast-container';
        document.body.appendChild(container);
        return container;
    }

    // --- FORM VALIDATION & STRENGTH ---
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function checkPassStrength(pass) {
        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/\d/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        const labels = ["Weak", "Fair", "Strong", "Very Strong"];
        const colors = ["#ff4d4d", "#ffa500", "#2ecc71", "#00a3ff"];

        return {
            score,
            label: labels[score - 1] || "Too Short",
            color: colors[score - 1] || "#555"
        };
    }

    // --- UI UPDATES ---
    function updateNavState() {
        const navRight = document.querySelector('.nav-right');
        if (!navRight) return;

        if (currentUser) {
            const initial = currentUser.email.charAt(0).toUpperCase();
            const learnBase = window.location.hostname === 'localhost' ? '/learning' : '';
            navRight.innerHTML = `
                        <div class="user-profile-wrap">
                            <div class="user-avatar-circle" id="userAvatarTrigger">
                                ${initial}
                            </div>
                            <div class="user-email-display">${currentUser.email.split('@')[0]}</div>
                            <div class="user-dropdown" id="userAuthDropdown">
                                <a href="${learnBase}/profile.html" class="dropdown-item">My Profile</a>
                                <a href="${learnBase}/profile.html#progress" class="dropdown-item">My Progress</a>
                                ${currentUser.role === 'admin' ? '<div class="dropdown-divider"></div><a href="/portal/analytics.html" class="dropdown-item" style="color:var(--color-primary);font-weight:bold;">🛡️ Analytics</a>' : ''}
                                <div class="dropdown-divider"></div>
                                <div class="dropdown-item" onclick="window.GanitAuth.logout()">Logout</div>
                            </div>
                        </div>
                    `;

            // Dropdown Toggle
            const trigger = document.getElementById('userAvatarTrigger');
            const dropdown = document.getElementById('userAuthDropdown');
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('active');
            });
            document.addEventListener('click', () => dropdown.classList.remove('active'));
        } else {
            navRight.innerHTML = `
                <button class="nav-link btn-ghost" onclick="window.GanitAuth.openModal('login')">Sign In</button>
                <a href="gate.html" class="nav-cta">Enter Platform &rarr;</a>
            `;
        }
    }

    // --- API INTEGRATION ---
    async function apiRegister(email, password, role) {
        try {
            const resp = await fetch(`${AUTH_BASE}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });
            const data = await resp.json();
            if (resp.ok) {
                handleAuthSuccess(data);
                showToast("Welcome to GanitSūtram!", "success");
                document.dispatchEvent(new CustomEvent('ganit:auth:login', { detail: { user: currentUser } }));
            } else {
                showToast(data.error || "Registration failed", "error");
            }
        } catch (err) {
            showToast("Network error. Try again.", "error");
        }
    }

    async function apiLogin(email, password) {
        try {
            const resp = await fetch(`${AUTH_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await resp.json();
            if (resp.ok) {
                handleAuthSuccess(data);
                showToast("Welcome back!", "success");
                document.dispatchEvent(new CustomEvent('ganit:auth:login', { detail: { user: currentUser } }));
            } else {
                showToast(data.error || "Login failed", "error");
            }
        } catch (err) {
            showToast("Network error. Try again.", "error");
        }
    }

    function handleAuthSuccess(data) {
        if (data.token) {
            localStorage.setItem('gs_token', data.token);
            if (data.refreshToken) {
                localStorage.setItem('gs_refresh_token', data.refreshToken);
            }
            currentUser = data.user;
            updateNavState();
            closeModal();
            setTimeout(() => {
                showToast("Welcome to GanitSūtram!");
                // Optionally redirect to profile or learning app if intended based on location
            }, 300);
        }
    }

    // --- REFRESH TOKEN MECHANICS ---
    let isRefreshing = false;
    let refreshPromise = null;

    async function silentRefresh() {
        const refreshToken = localStorage.getItem('gs_refresh_token');
        if (!refreshToken) {
            clearAuth();
            return false;
        }

        if (isRefreshing) return refreshPromise; // Deduplicate concurrent refresh requests

        isRefreshing = true;
        refreshPromise = (async () => {
            try {
                const res = await fetch(`${AUTH_BASE}/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken })
                });

                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('gs_token', data.token);
                    localStorage.setItem('gs_refresh_token', data.refreshToken);

                    // Recover memory state
                    const payload = JSON.parse(atob(data.token.split('.')[1]));
                    currentUser = { userId: payload.userId, email: payload.email, role: payload.role };
                    updateNavState();
                    return true;
                } else {
                    console.warn('Silent refresh rejected.');
                    clearAuth();
                    return false;
                }
            } catch (err) {
                console.error('Silent refresh network error:', err);
                return false;
            } finally {
                isRefreshing = false;
                refreshPromise = null;
            }
        })();

        return refreshPromise;
    }

    function proactiveRefresh() {
        const token = _getTokenSync();
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expMs = payload.exp * 1000;
            // Background check: if < 2 mins left, refresh now
            if (expMs - Date.now() < 120000) {
                silentRefresh();
            }
        } catch (e) {
            // Drop invalid
            clearAuth();
        }
    }

    // Set a lightweight heartbeat to proactively refresh active tabs
    setInterval(proactiveRefresh, 10 * 60 * 1000); // Check every 10 mins

    function clearAuth() {
        currentUser = null;
        localStorage.removeItem('gs_token');
        localStorage.removeItem('gs_refresh_token');
        updateNavState();
        document.dispatchEvent(new CustomEvent('ganit:auth:logout'));
    }

    async function apiLogout() {
        try {
            await fetch(`${AUTH_BASE}/logout`, { method: 'POST' });
        } catch (e) { }
        clearAuth();
        showToast("Logged out.", "info");
    }

    // --- MODAL ACTIONS ---
    function openModal(tab = 'login') {
        const overlay = document.getElementById('gs-auth-overlay');
        overlay.classList.add('active');
        switchTab(tab);
    }

    function closeModal() {
        const overlay = document.getElementById('gs-auth-overlay');
        overlay.classList.remove('active');
        // Clear forms on close
        document.querySelectorAll('.gs-auth-panel form').forEach(f => f.reset());
    }

    function switchTab(tab) {
        const tabs = document.querySelectorAll('.gs-auth-tab');
        const panels = document.querySelectorAll('.gs-auth-panel');

        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
        panels.forEach(p => p.classList.toggle('active', p.id === `${tab}Panel`));
    }

    // Add forgot password panel if it doesn't exist
    function ensureForgotPanel() {
        if (document.getElementById('forgotPanel')) return;

        const authBody = document.querySelector('.gs-auth-body');
        if (!authBody) return;

        const panel = document.createElement('div');
        panel.id = 'forgotPanel';
        panel.className = 'gs-auth-panel';
        panel.innerHTML = `
            <form id="forgotForm">
                <style>
                    .gs-forgot-header { text-align: center; margin-bottom: 20px; }
                    .gs-forgot-title { font-family: 'Syne', sans-serif; font-weight: 700; margin-bottom: 5px; color: var(--text-primary); }
                    .gs-forgot-desc { font-size: 0.9rem; color: var(--text-dim); }
                </style>
                <div class="gs-forgot-header">
                    <h3 class="gs-forgot-title">Reset Password</h3>
                    <p class="gs-forgot-desc">Enter your email and we'll send a link to reset your password.</p>
                </div>
                <div class="gs-auth-group">
                    <label class="gs-auth-label">Email Address</label>
                    <input type="email" name="email" class="gs-auth-input" placeholder="you@example.com" required>
                </div>
                <div id="forgotSuccessMsg" style="display:none; color: #2ecc71; font-size: 0.85rem; padding: 10px; background: rgba(46, 204, 113, 0.1); border-radius: 6px; margin-bottom: 15px; text-align: center;">
                    Check your email for a reset link.
                </div>
                <button type="submit" class="gs-auth-submit">
                    <span class="gs-auth-spinner"></span>
                    Send Reset Link &rarr;
                </button>
            </form>
            <div class="gs-auth-switch" style="margin-top: 20px;">
                <span class="gs-auth-switch-link gs-back-to-login">&larr; Back to Login</span>
            </div>
        `;
        authBody.appendChild(panel);

        panel.querySelector('.gs-back-to-login').addEventListener('click', () => {
            switchTab('login');
        });

        document.getElementById('forgotForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const email = form.querySelector('[name="email"]').value;
            const btn = form.querySelector('button[type="submit"]');
            const spinner = btn.querySelector('.gs-auth-spinner');
            const msg = document.getElementById('forgotSuccessMsg');

            if (!validateEmail(email)) return showToast("Invalid email format", "error");

            btn.disabled = true;
            if (spinner) spinner.style.display = 'block';
            msg.style.display = 'none';

            try {
                const resp = await fetch(`${AUTH_BASE}/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                if (resp.ok) {
                    msg.style.display = 'block';
                    form.querySelector('[name="email"]').value = '';
                } else {
                    showToast("Failed to request reset", "error");
                }
            } catch (err) {
                showToast("Network error. Try again.", "error");
            }

            btn.disabled = false;
            if (spinner) spinner.style.display = 'none';
        });
    }

    // --- DOM EVENT HANDLERS ---
    function initEventHandlers() {
        // Overlay Click Close
        const overlay = document.getElementById('gs-auth-overlay');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        // Toggle Password Visibility
        document.querySelectorAll('.gs-auth-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = btn.previousElementSibling;
                const isPass = input.type === 'password';
                input.type = isPass ? 'text' : 'password';
                btn.textContent = isPass ? 'Hide' : 'Show';
            });
        });

        // Tab Switching
        document.querySelectorAll('.gs-auth-tab').forEach(t => {
            t.addEventListener('click', () => switchTab(t.dataset.tab));
        });

        // Forgot Password Link
        document.querySelectorAll('.gs-auth-switch-link').forEach(link => {
            if (link.textContent.includes('Forgot')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    ensureForgotPanel();
                    document.querySelectorAll('.gs-auth-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.gs-auth-panel').forEach(p => p.classList.remove('active'));
                    document.getElementById('forgotPanel').classList.add('active');
                });
            }
        });

        // Role Selection
        document.querySelectorAll('.gs-auth-role').forEach(r => {
            r.addEventListener('click', () => {
                document.querySelectorAll('.gs-auth-role').forEach(x => x.classList.remove('active'));
                r.classList.add('active');
            });
        });

        // Strength Meter
        const regPass = document.getElementById('regPassword');
        const strengthDiv = document.querySelector('.gs-auth-strength');
        const bar = document.querySelector('.gs-auth-strength-bar');
        const text = document.querySelector('.gs-auth-strength-text');

        regPass.addEventListener('input', () => {
            if (!regPass.value) {
                strengthDiv.style.display = 'none';
                return;
            }
            strengthDiv.style.display = 'block';
            const { score, label, color } = checkPassStrength(regPass.value);
            bar.style.width = `${(score / 4) * 100}%`;
            bar.style.background = color;
            text.textContent = `Strength: ${label}`;
        });

        // Login Submit
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const email = form.querySelector('[name="email"]').value;
            const pass = form.querySelector('[name="password"]').value;
            const btn = form.querySelector('button[type="submit"]');
            const spinner = btn.querySelector('.gs-auth-spinner');

            if (!validateEmail(email)) return showToast("Invalid email format", "error");

            btn.disabled = true;
            if (spinner) spinner.style.display = 'block';
            await apiLogin(email, pass);
            btn.disabled = false;
            if (spinner) spinner.style.display = 'none';
        });

        // Register Submit
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const email = form.querySelector('[name="email"]').value;
            const pass = form.querySelector('[name="password"]').value;
            const confirm = form.querySelector('[name="confirmPassword"]').value;
            const roleEl = form.querySelector('.gs-auth-role.active');
            const btn = form.querySelector('button[type="submit"]');
            const spinner = btn.querySelector('.gs-auth-spinner');

            if (!validateEmail(email)) return showToast("Invalid email", "error");
            if (pass.length < 8) return showToast("Password too short", "error");
            if (pass !== confirm) return showToast("Passwords do not match", "error");
            if (!roleEl) return showToast("Please select a role", "error");

            btn.disabled = true;
            if (spinner) spinner.style.display = 'block';
            await apiRegister(email, pass, roleEl.dataset.role);
            btn.disabled = false;
            if (spinner) spinner.style.display = 'none';
        });
    }

    // --- INITIALIZATION ---
    function init() {
        initEventHandlers();
        updateNavState();
    }

    // EXPOSE GLOBALLY
    window.GanitAuth = {
        openModal,
        closeModal,
        isLoggedIn: () => !!token,
        getToken: () => token,
        getUser: () => currentUser,
        logout: apiLogout,
        init
    };

    // Auto-init when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
