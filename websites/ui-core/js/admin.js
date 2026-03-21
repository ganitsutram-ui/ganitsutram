/*
 * GANITSUTRAM
 * A Living Knowledge Ecosystem for Mathematical Discovery
 *
 * Creator:   Jawahar R. Mallah
 */
/*
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Purpose: Unified Admin Dashboard frontend.
         Handles School Management, Platform Analytics, and CMS.
*/

(function () {
    'use strict';

    const API_BASE = (window.GanitConfig && window.GanitConfig.getApiBase) 
        ? window.GanitConfig.getApiBase() 
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

    function showToast(msg, type = 'success') {
        const toast = document.getElementById('gs-toast');
        if (!toast) return;
        toast.textContent = msg;
        toast.className = `gs-toast show ${type}`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    function setLoading(show) {
        const loading = document.getElementById('admin-loading');
        const layout = document.getElementById('admin-layout');
        const setup = document.getElementById('admin-setup');
        if (loading) loading.style.display = show ? 'block' : 'none';
        if (!show && layout) layout.style.display = 'flex';
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
        if (resp.status === 404) return null;
        if (!resp.ok) throw new Error('Failed to load dashboard.');
        const data = await resp.json();
        return data.dashboard;
    }

    async function fetchGlobalStats() {
        const resp = await fetch(`${API_BASE}/admin/global-stats`, {
            headers: { ...getAuthHeader() }
        });
        if (!resp.ok) throw new Error('Failed to load platform stats.');
        const data = await resp.json();
        return data.stats;
    }

    async function fetchCMSContent() {
        const resp = await fetch(`${API_BASE}/admin/cms-content`, {
            headers: { ...getAuthHeader() }
        });
        if (!resp.ok) throw new Error('Failed to load CMS content.');
        const data = await resp.json();
        return data.data;
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

    async function removeStudent(id) {
        const resp = await fetch(`${API_BASE}/admin/students/${id}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        });
        if (!resp.ok) {
            const data = await resp.json();
            throw new Error(data.error || 'Removal failed.');
        }
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

    function renderHeader(dashboard, role) {
        const nameEl = document.getElementById('admin-school-name');
        const emailEl = document.getElementById('admin-admin-email');
        const badgeEl = document.getElementById('admin-role-badge');
        
        if (nameEl) nameEl.textContent = (dashboard && dashboard.school) ? dashboard.school.name : 'Veda Knowledge Platform';
        if (emailEl) {
            const user = window.GanitAuth ? window.GanitAuth.getUser() : null;
            emailEl.textContent = user ? user.email : '';
        }
        if (badgeEl) {
            badgeEl.textContent = role === 'admin' ? 'Global Admin' : 'School Admin';
        }
    }

    function renderStats(dashboard) {
        if (!dashboard) return;
        const { enrollments, progressStats, practiceStats } = dashboard;
        const accuracy = practiceStats ? practiceStats.avgAccuracy : 0;

        setStatCard('stat-students', enrollments ? enrollments.length : 0);
        setStatCard('stat-active', progressStats ? progressStats.activeStudents : 0);
        setStatCard('stat-solved', progressStats ? progressStats.totalSolved : 0);
        setStatCard('stat-accuracy', `${accuracy}%`);
    }

    function renderGlobalStats(stats) {
        setStatCard('stat-global-users', stats.summary.totalUsers);
        setStatCard('stat-global-solves', stats.summary.totalSolves);
        setStatCard('stat-global-schools', stats.summary.totalSchools);
        setStatCard('stat-global-events', stats.summary.totalEvents);

        const barsEl = document.getElementById('global-op-bars');
        if (barsEl) {
            const opBreakdown = stats.topOperations || [];
            if (opBreakdown.length === 0) {
                barsEl.innerHTML = `<p class="gs-empty">No solve data.</p>`;
            } else {
                const max = Math.max(...opBreakdown.map(o => o.count), 1);
                barsEl.innerHTML = opBreakdown.slice(0, 8).map(o => {
                    const pct = Math.round((o.count / max) * 100);
                    return `
                        <div class="gs-op-bar-item">
                            <span class="gs-op-label">${o.operation}</span>
                            <div class="gs-op-bar-track"><div class="gs-op-bar-fill" style="width:${pct}%"></div></div>
                            <span class="gs-op-count">${o.count}</span>
                        </div>
                    `;
                }).join('');
            }
        }
    }

    function renderCMSContent(content) {
        const tbody = document.getElementById('cms-tbody');
        if (!tbody) return;
        if (content.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="gs-empty-table">No content items found.</td></tr>`;
            return;
        }
        tbody.innerHTML = content.map(c => `
            <tr>
                <td><strong>${c.title_en}</strong><br><small style="opacity:0.5">${c.slug}</small></td>
                <td><span class="gs-badge">${c.content_type}</span></td>
                <td>${c.category || '—'}</td>
                <td><span class="gs-status-pill ${c.published ? 'active' : 'suspended'}">${c.published ? 'PUBLISHED' : 'DRAFT'}</span></td>
                <td>
                    <button class="gs-page-btn" style="padding:0.2rem 0.6rem">Edit</button>
                </td>
            </tr>
        `).join('');
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
            tbody.innerHTML = `<tr><td colspan="5" class="gs-empty-table">No students found.</td></tr>`;
            if (paginationEl) paginationEl.innerHTML = '';
            return;
        }

        tbody.innerHTML = slice.map(s => `
            <tr>
                <td>${s.email}</td>
                <td>${s.role}</td>
                <td><span class="gs-status-pill ${s.status}">${s.status}</span></td>
                <td>${new Date(s.enrolled_at).toLocaleDateString()}</td>
                <td>
                    <button class="gs-table-remove-btn" onclick="GanitAdmin.removeStudentById('${s.enrollment_id}')">Remove</button>
                </td>
            </tr>
        `).join('');

        const totalPages = Math.ceil(students.length / PAGE_SIZE);
        if (paginationEl && totalPages > 1) {
            paginationEl.innerHTML = Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
                <button class="gs-page-btn ${p === _currentPage ? 'active' : ''}" onclick="GanitAdmin.goToPage(${p})">${p}</button>
            `).join('');
        } else if (paginationEl) paginationEl.innerHTML = '';
    }

    // ─── INIT & NAVIGATION ──────────────────────────────────────────────

    async function switchView(viewId) {
        const sections = document.querySelectorAll('.admin-view-section');
        const btns = document.querySelectorAll('.gs-admin-sidebar-btn');
        sections.forEach(s => s.classList.remove('active'));
        btns.forEach(b => b.classList.remove('active'));

        const target = document.getElementById(`view-${viewId}`);
        const btn = document.querySelector(`[data-view="${viewId}"]`);
        if (target) target.classList.add('active');
        if (btn) btn.classList.add('active');

        if (viewId === 'platform') {
            const stats = await fetchGlobalStats();
            renderGlobalStats(stats);
        } else if (viewId === 'cms') {
            const content = await fetchCMSContent();
            renderCMSContent(content);
        }
    }

    async function loadDashboard() {
        setLoading(true);
        const user = window.GanitAuth ? window.GanitAuth.getUser() : null;
        try {
            const dashboard = await fetchDashboard();
            setLoading(false);
            renderHeader(dashboard, user.role);

            if (dashboard) {
                renderStats(dashboard);
                renderStudentTable(dashboard.enrollments || [], 1);
            } else if (user.role === 'admin') {
                switchView('platform');
            } else {
                showSetupForm();
            }
        } catch (err) {
            setLoading(false);
            if (user.role === 'admin') {
                renderHeader(null, 'admin');
                switchView('platform');
            } else {
                showToast(err.message, 'error');
            }
        }
    }

    function init() {
        const user = window.GanitAuth ? window.GanitAuth.getUser() : null;
        const isLoggedIn = window.GanitAuth ? window.GanitAuth.isLoggedIn() : false;

        if (!isLoggedIn || !user || (user.role !== 'school' && user.role !== 'admin')) {
            const denied = document.getElementById('admin-access-denied');
            if (denied) denied.style.display = 'block';
            return;
        }

        const adminLayout = document.getElementById('admin-layout');
        if (adminLayout) adminLayout.style.display = 'flex';

        if (user.role === 'admin') {
            const sidebar = document.getElementById('admin-sidebar');
            const btnPlat = document.getElementById('btn-view-platform');
            const btnCMS = document.getElementById('btn-view-cms');
            if (sidebar) sidebar.style.display = 'flex';
            if (btnPlat) btnPlat.style.display = 'flex';
            if (btnCMS) btnCMS.style.display = 'flex';
        }

        loadDashboard();

        document.querySelectorAll('.gs-admin-sidebar-btn').forEach(b => {
            b.addEventListener('click', () => switchView(b.getAttribute('data-view')));
        });

        // Setup form listener
        const setupForm = document.getElementById('school-setup-form');
        if (setupForm) {
            setupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nameInput = document.getElementById('school-name-input');
                const name = nameInput.value.trim();
                if (!name) return;
                try {
                    await createSchool(name);
                    showToast('School created!');
                    await loadDashboard();
                } catch (err) { showToast(err.message, 'error'); }
            });
        }

        // Enroll form
        const enrollForm = document.getElementById('enroll-form');
        if (enrollForm) {
            enrollForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const input = document.getElementById('enroll-email-input');
                const email = input.value.trim();
                if (!email) return;
                try {
                    await enrollStudent(email);
                    input.value = '';
                    showToast('Student enrolled!');
                    await loadDashboard();
                } catch (err) { showToast(err.message, 'error'); }
            });
        }
    }

    window.GanitAdmin = {
        init,
        goToPage: (p) => renderStudentTable(_students, p),
        removeStudentById: async (id) => {
            if (confirm('Are you sure?')) {
                try {
                    await removeStudent(id);
                    showToast('Removed.');
                    await loadDashboard();
                } catch (e) { showToast(e.message, 'error'); }
            }
        }
    };

    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 50));

})();
