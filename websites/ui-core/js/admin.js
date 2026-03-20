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
/*
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07

Purpose: School Admin Dashboard frontend module.
         Fetches live data from /api/admin and renders the full dashboard.
         Exported as window.GanitAdmin.
*/

(function () {
    'use strict';

    const API_BASE = window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api'
        : 'http://localhost:3000/api';

    const PAGE_SIZE = 10;

    // Module state
    let _students = [];
    let _currentPage = 1;

    // ─── HELPERS ────────────────────────────────────────────────────────

    function getAuthHeader() {
        const token = window.GanitAuth ? window.GanitAuth.getToken() : null;
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    function showToast(message, type = 'success') {
        const toast = document.getElementById('gs-admin-toast');
        if (!toast) return;
        toast.textContent = message;
        toast.className = `gs-toast ${type === 'error' ? 'error' : ''}`;
        // trigger show
        requestAnimationFrame(() => {
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3200);
        });
    }

    function setLoading(show) {
        const loading = document.getElementById('admin-loading');
        const layout = document.getElementById('admin-layout');
        const setup = document.getElementById('admin-setup');
        if (loading) loading.style.display = show ? 'block' : 'none';
        if (!show && layout) layout.style.display = 'grid';
        if (show && layout) layout.style.display = 'none';
        if (show && setup) setup.style.display = 'none';
    }

    function showSetupForm() {
        const loading = document.getElementById('admin-loading');
        const layout = document.getElementById('admin-layout');
        const setup = document.getElementById('admin-setup');
        if (loading) loading.style.display = 'none';
        if (layout) layout.style.display = 'none';
        if (setup) setup.style.display = 'block';
    }

    // ─── DATA FETCHING ───────────────────────────────────────────────────

    async function fetchDashboard() {
        const resp = await fetch(`${API_BASE}/admin/dashboard`, {
            headers: { ...getAuthHeader() }
        });
        if (resp.status === 404) return null; // no school yet
        if (!resp.ok) throw new Error('Failed to load dashboard.');
        const data = await resp.json();
        return data.dashboard;
    }

    async function enrollStudent(email) {
        const resp = await fetch(`${API_BASE}/admin/enroll`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify({ studentEmail: email })
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'Enrollment failed.');
        return data.enrollment;
    }

    async function removeStudent(enrollmentId) {
        const resp = await fetch(`${API_BASE}/admin/students/${enrollmentId}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'Removal failed.');
        return true;
    }

    async function createSchool(name) {
        const resp = await fetch(`${API_BASE}/admin/school`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify({ name })
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'School creation failed.');
        return data.school;
    }

    // ─── RENDER ─────────────────────────────────────────────────────────

    function renderHeader(dashboard) {
        const nameEl = document.getElementById('admin-school-name');
        const emailEl = document.getElementById('admin-admin-email');
        if (nameEl) nameEl.textContent = dashboard.school.name;
        if (emailEl) {
            const user = window.GanitAuth ? window.GanitAuth.getUser() : null;
            emailEl.textContent = user ? user.email : '';
        }
    }

    function renderStats(dashboard) {
        const { enrollments, progressStats, practiceStats } = dashboard;

        const accuracy = practiceStats ? practiceStats.avgAccuracy : 0;

        setStatCard('stat-students', enrollments ? enrollments.length : 0);
        setStatCard('stat-active', progressStats ? progressStats.activeStudents : 0);
        setStatCard('stat-solved', progressStats ? progressStats.totalSolved : 0);
        setStatCard('stat-accuracy', `${accuracy}%`);
    }

    function setStatCard(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    function renderStudentTable(students, page) {
        const tbody = document.getElementById('student-tbody');
        const paginationEl = document.getElementById('student-pagination');
        if (!tbody) return;

        _students = students;
        _currentPage = page || 1;

        const start = (_currentPage - 1) * PAGE_SIZE;
        const slice = students.slice(start, start + PAGE_SIZE);

        if (students.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="gs-empty-table">No students enrolled yet. Use the enroll panel above to add your first student.</td></tr>`;
            if (paginationEl) paginationEl.innerHTML = '';
            return;
        }

        tbody.innerHTML = slice.map(s => {
            const enrollDate = new Date(s.enrolled_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            return `
                <tr>
                    <td>${s.email}</td>
                    <td>${s.role}</td>
                    <td><span class="gs-status-pill ${s.status}">${s.status}</span></td>
                    <td>${enrollDate}</td>
                    <td>
                        <button class="gs-table-remove-btn" data-enrollment-id="${s.enrollment_id}" onclick="GanitAdmin.removeStudentById('${s.enrollment_id}')">
                            Remove
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Pagination
        const totalPages = Math.ceil(students.length / PAGE_SIZE);
        if (paginationEl && totalPages > 1) {
            paginationEl.innerHTML = Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
                <button class="gs-page-btn ${p === _currentPage ? 'active' : ''}" onclick="GanitAdmin.goToPage(${p})">${p}</button>
            `).join('');
        } else if (paginationEl) {
            paginationEl.innerHTML = '';
        }
    }

    function renderAnalytics(dashboard) {
        const { practiceStats, progressStats } = dashboard;
        const opBreakdown = (practiceStats && practiceStats.operationBreakdown) || [];

        // Operation bars
        const barsEl = document.getElementById('analytics-op-bars');
        if (barsEl) {
            if (!opBreakdown || opBreakdown.length === 0) {
                barsEl.innerHTML = `<p style="color:rgba(255,255,255,0.3);font-size:0.85rem;">No practice data yet.</p>`;
            } else {
                const maxAttempts = Math.max(...opBreakdown.map(s => s.attempts), 1);
                barsEl.innerHTML = opBreakdown.slice(0, 6).map(s => {
                    const pct = Math.round((s.attempts / maxAttempts) * 100);
                    return `
                        <div class="gs-op-bar-item">
                            <span class="gs-op-label">${s.operation.replace(/-/g, ' ')}</span>
                            <div class="gs-op-bar-track">
                                <div class="gs-op-bar-fill" style="width:${pct}%"></div>
                            </div>
                            <span class="gs-op-count">${s.attempts}</span>
                        </div>
                    `;
                }).join('');
            }
        }

        // Insights card
        const insightsEl = document.getElementById('analytics-insights');
        if (insightsEl) {
            const totalAttempts = practiceStats ? practiceStats.totalAttempts : 0;
            const accuracy = practiceStats ? `${practiceStats.avgAccuracy}%` : 'N/A';

            insightsEl.innerHTML = `
                <div class="gs-insight-item">
                    <span class="gs-insight-label">Total Problems Solved</span>
                    <span class="gs-insight-val">${progressStats ? progressStats.totalSolved : 0}</span>
                </div>
                <div class="gs-insight-item">
                    <span class="gs-insight-label">Practice Attempts</span>
                    <span class="gs-insight-val">${totalAttempts}</span>
                </div>
                <div class="gs-insight-item">
                    <span class="gs-insight-label">Overall Accuracy</span>
                    <span class="gs-insight-val">${accuracy}</span>
                </div>
                <div class="gs-insight-item">
                    <span class="gs-insight-label">Active Students</span>
                    <span class="gs-insight-val">${progressStats ? progressStats.activeStudents : 0}</span>
                </div>
            `;
        }
    }

    // ─── INIT & LOAD ─────────────────────────────────────────────────────

    async function loadDashboard() {
        setLoading(true);
        try {
            const dashboard = await fetchDashboard();
            if (!dashboard) {
                showSetupForm();
                return;
            }
            setLoading(false);
            renderHeader(dashboard);
            renderStats(dashboard);
            renderStudentTable(dashboard.enrollments || [], 1);
            renderAnalytics(dashboard);
        } catch (err) {
            setLoading(false);
            showToast(err.message || 'Failed to load dashboard.', 'error');
        }
    }

    function init() {
        // Access Guard: Must be logged in with school/admin role
        const user = window.GanitAuth ? window.GanitAuth.getUser() : null;
        const isLoggedIn = window.GanitAuth ? window.GanitAuth.isLoggedIn() : false;
        const accessDenied = document.getElementById('admin-access-denied');
        const adminRoot = document.getElementById('admin-root');

        if (!isLoggedIn || !user || (user.role !== 'school' && user.role !== 'admin')) {
            if (accessDenied) accessDenied.style.display = 'block';
            if (adminRoot) adminRoot.style.display = 'none';
            return;
        }

        if (adminRoot) adminRoot.style.display = 'block';
        loadDashboard();

        // Enroll form
        const enrollForm = document.getElementById('enroll-form');
        if (enrollForm) {
            enrollForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const emailInput = document.getElementById('enroll-email-input');
                const errEl = document.getElementById('enroll-error');
                const btn = enrollForm.querySelector('button[type="submit"]');
                const email = emailInput.value.trim();

                if (!email) { errEl.textContent = 'Please enter a student email.'; return; }
                errEl.textContent = '';
                btn.disabled = true;
                btn.textContent = 'Enrolling…';

                try {
                    await enrollStudent(email);
                    emailInput.value = '';
                    showToast(`${email} enrolled successfully!`);
                    await loadDashboard();
                } catch (err) {
                    errEl.textContent = err.message;
                } finally {
                    btn.disabled = false;
                    btn.textContent = 'Enroll';
                }
            });
        }

        // School setup form
        const setupForm = document.getElementById('school-setup-form');
        if (setupForm) {
            setupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nameInput = document.getElementById('school-name-input');
                const errEl = document.getElementById('setup-error');
                const btn = setupForm.querySelector('button[type="submit"]');
                const name = nameInput.value.trim();

                if (!name) { errEl.textContent = 'School name is required.'; return; }
                errEl.textContent = '';
                btn.disabled = true;
                btn.textContent = 'Creating…';

                try {
                    await createSchool(name);
                    showToast(`School "${name}" created!`);
                    await loadDashboard();
                } catch (err) {
                    errEl.textContent = err.message;
                    btn.disabled = false;
                    btn.textContent = 'Create School';
                }
            });
        }
    }

    // ─── PUBLIC API ──────────────────────────────────────────────────────

    window.GanitAdmin = {
        init,
        goToPage: (page) => renderStudentTable(_students, page),
        removeStudentById: async (enrollmentId) => {
            if (!confirm('Remove this student from your school?')) return;
            try {
                await removeStudent(enrollmentId);
                showToast('Student removed.');
                await loadDashboard();
            } catch (err) {
                showToast(err.message, 'error');
            }
        }
    };

    // Auto-init once GanitAuth is ready (auth.js fires DOMContentLoaded → init)
    document.addEventListener('DOMContentLoaded', () => {
        // Small defer to allow auth.js to set up GanitAuth first
        setTimeout(init, 50);
    });

})();
