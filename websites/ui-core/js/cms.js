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
 * Purpose: Content Management System logic for Admin Dashboard.
 */

(function () {
    const { API_BASE } = window.GanitConfig;
    const API_ROOT = API_BASE.replace('/api', '');

    const GanitCMS = {
        state: {
            content: [],
            total: 0,
            filters: {
                type: 'all',
                published: 'all',
                q: ''
            },
            pagination: {
                limit: 20,
                offset: 0
            },
            currentEditingId: null,
            currentLang: 'en'
        },

        init: async function () {
            console.log("GanitCMS: Initializing...");

            // 1. Auth Check
            const user = await this.checkAdminAuth();
            if (!user) return;

            // 2. DOM Cache
            this.cacheDOM();

            // 3. Bind Events
            this.bindEvents();

            // 4. Initial Fetch
            this.fetchContent();
        },

        checkAdminAuth: async function () {
            const token = localStorage.getItem('gs_token');
            if (!token) {
                window.location.href = `${window.GanitConfig.PORTAL_URL}/gate.html?return=cms.html`;
                return null;
            }

            try {
                const res = await fetch(`${API_ROOT}/api/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.role !== 'admin') {
                    alert("Unauthorized: Admin access required.");
                    window.location.href = 'index.html';
                    return null;
                }
                return data;
            } catch (err) {
                window.location.href = `${window.GanitConfig.PORTAL_URL}/gate.html`;
                return null;
            }
        },

        cacheDOM: function () {
            this.els = {
                contentTableBody: document.getElementById('contentTableBody'),
                listView: document.getElementById('listView'),
                placeholder: document.getElementById('contentPlaceholder'),
                cmsSearch: document.getElementById('cmsSearch'),
                statusFilter: document.getElementById('statusFilter'),
                typeFilters: document.querySelector('#typeFilters'),
                btnNewContent: document.getElementById('btnNewContent'),
                btnSyncDiscoveries: document.getElementById('btnSyncDiscoveries'),

                // Editor
                editorOverlay: document.getElementById('editorOverlay'),
                editorHeading: document.getElementById('editorHeading'),
                cmsForm: document.getElementById('cmsForm'),
                btnCancel: document.getElementById('btnCancel'),
                btnSaveDraft: document.getElementById('btnSaveDraft'),
                btnPublish: document.getElementById('btnPublish'),
                tabBtns: document.querySelectorAll('.cms-tab-btn'),
                tabContents: document.querySelectorAll('.cms-tab-content'),
                revisionBox: document.getElementById('revisionBox'),
                revisionList: document.getElementById('revisionList'),
                mediaList: document.getElementById('mediaList'),
                btnAddMedia: document.getElementById('btnAddMedia')
            };
        },

        bindEvents: function () {
            // Sidebar Filters
            this.els.typeFilters.addEventListener('click', (e) => {
                if (e.target.classList.contains('cms-filter-btn')) {
                    this.els.typeFilters.querySelectorAll('.cms-filter-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.state.filters.type = e.target.dataset.type;
                    this.state.pagination.offset = 0;
                    this.fetchContent();
                }
            });

            this.els.statusFilter.addEventListener('change', () => {
                this.state.filters.published = this.els.statusFilter.value;
                this.state.pagination.offset = 0;
                this.fetchContent();
            });

            let searchTimeout;
            this.els.cmsSearch.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.state.filters.q = this.els.cmsSearch.value;
                    this.fetchContent();
                }, 400);
            });

            // Action Buttons
            this.els.btnNewContent.addEventListener('click', () => this.openEditor());
            this.els.btnCancel.addEventListener('click', () => this.closeEditor());
            this.els.btnSyncDiscoveries.addEventListener('click', () => this.syncDiscoveries());

            this.els.btnSaveDraft.addEventListener('click', () => this.saveContent(false));
            this.els.btnPublish.addEventListener('click', () => this.saveContent(true));

            // Tabs
            this.els.tabBtns.forEach(btn => {
                btn.addEventListener('click', () => this.switchTab(btn.dataset.lang));
            });

            // Markdown Live Preview
            ['En', 'Hi', 'Sa'].forEach(lang => {
                const textarea = document.getElementById(`fldBody${lang}`);
                const preview = document.getElementById(`preview${lang}`);
                textarea.addEventListener('input', () => {
                    preview.innerHTML = this.renderMarkdown(textarea.value);
                });
            });

            // Markdown Toolbar
            document.querySelectorAll('.cms-md-toolbar button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const textareaId = btn.parentElement.dataset.for;
                    const cmd = btn.dataset.cmd;
                    this.applyMarkdownCmd(textareaId, cmd);
                });
            });

            // Media
            this.els.btnAddMedia.addEventListener('click', () => this.addMediaRow());
        },

        fetchContent: async function () {
            this.els.placeholder.style.display = 'flex';
            this.els.listView.style.display = 'none';

            let url = `${API_ROOT}/api/cms/admin/content?limit=${this.state.pagination.limit}&offset=${this.state.pagination.offset}`;
            if (this.state.filters.type !== 'all') url += `&type=${this.state.filters.type}`;
            if (this.state.filters.published !== 'all') url += `&published=${this.state.filters.published === 'published'}`;

            // If searching, use search API
            if (this.state.filters.q) url = `${API_ROOT}/api/cms/search?q=${encodeURIComponent(this.state.filters.q)}`;

            try {
                const res = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('gs_token')}` }
                });
                const data = await res.json();
                this.state.content = data.content || data.results || [];
                this.renderContentList();
            } catch (err) {
                console.error("Fetch error", err);
            } finally {
                this.els.placeholder.style.display = 'none';
                this.els.listView.style.display = 'block';
            }
        },

        renderContentList: function () {
            this.els.contentTableBody.innerHTML = this.state.content.map(item => `
                <tr data-id="${item.content_id}">
                    <td><span class="gs-badge gs-badge-sm">${item.content_type}</span></td>
                    <td><b>${item.title_en}</b><br><small class="gs-text-muted">${item.slug}</small></td>
                    <td>
                        <span class="cms-pill ${item.published ? 'cms-pill-published' : 'cms-pill-draft'}">
                            ${item.published ? 'Published' : 'Draft'}
                        </span>
                        ${item.featured ? '<span class="cms-pill cms-pill-featured">★</span>' : ''}
                    </td>
                    <td>${item.category || '-'}</td>
                    <td>
                        <small>
                            EN ${item.title_hi ? '• HI' : ''} ${item.title_sa ? '• SA' : ''}
                        </small>
                    </td>
                    <td><small>${new Date(item.updated_at).toLocaleDateString()}</small></td>
                    <td class="text-right">
                        <div class="cms-actions-cell">
                            <button class="gs-button gs-button-ghost gs-button-sm btn-edit" onclick="GanitCMS.openEditor('${item.content_id}')">Edit</button>
                            <button class="gs-button gs-button-ghost gs-button-sm" onclick="GanitCMS.togglePublish('${item.content_id}', ${item.published})">
                                ${item.published ? 'Unpublish' : 'Publish'}
                            </button>
                            <button class="gs-button gs-button-ghost gs-button-sm" onclick="GanitCMS.deleteContent('${item.content_id}')">🗑️</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        },

        openEditor: async function (contentId = null) {
            this.state.currentEditingId = contentId;
            this.els.cmsForm.reset();
            this.els.mediaList.innerHTML = '';
            this.els.revisionBox.style.display = 'none';
            this.els.editorHeading.innerText = contentId ? 'Edit Content' : 'New Content';

            if (contentId) {
                const item = this.state.content.find(i => i.content_id === contentId);
                if (item) this.fillForm(item);
                this.fetchRevisions(contentId);
                this.fetchMedia(contentId);
            }

            this.switchTab('en');
            this.els.editorOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            // Initial previews
            ['En', 'Hi', 'Sa'].forEach(l => {
                const text = document.getElementById(`fldBody${l}`).value;
                document.getElementById(`preview${l}`).innerHTML = this.renderMarkdown(text);
            });
        },

        fillForm: function (item) {
            const f = this.els.cmsForm;
            f.content_type.value = item.content_type;
            f.slug.value = item.slug;
            f.icon.value = item.icon || '';
            f.category.value = item.category || '';
            f.difficulty.value = item.difficulty || 'beginner';
            f.tags.value = item.tags ? JSON.parse(item.tags).join(', ') : '';
            f.sort_order.value = item.sort_order || 0;
            f.featured.checked = !!item.featured;
            f.published.checked = !!item.published;

            f.title_en.value = item.title_en;
            f.excerpt_en.value = item.excerpt_en || '';
            f.body_en.value = item.body_en;

            f.title_hi.value = item.title_hi || '';
            f.excerpt_hi.value = item.excerpt_hi || '';
            f.body_hi.value = item.body_hi || '';

            f.title_sa.value = item.title_sa || '';
            f.excerpt_sa.value = item.excerpt_sa || '';
            f.body_sa.value = item.body_sa || '';
        },

        saveContent: async function (publishImmediately) {
            const formData = new FormData(this.els.cmsForm);
            const data = Object.fromEntries(formData.entries());

            // Post-process
            data.featured = this.els.cmsForm.featured.checked ? 1 : 0;
            data.published = (publishImmediately || this.els.cmsForm.published.checked) ? 1 : 0;
            data.tags = JSON.stringify(data.tags.split(',').map(t => t.trim()).filter(t => t));

            const method = this.state.currentEditingId ? 'PUT' : 'POST';
            const url = this.state.currentEditingId
                ? `${API_ROOT}/api/cms/admin/content/${this.state.currentEditingId}`
                : `${API_ROOT}/api/cms/admin/content`;

            try {
                const res = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('gs_token')}`
                    },
                    body: JSON.stringify(data)
                });


                if (res.ok) {
                    this.closeEditor();
                    this.fetchContent();
                } else {
                    const err = await res.json();
                    alert("Error: " + (err.error || "Failed to save"));
                }
            } catch (err) {
                alert("Network error while saving.");
            }
        },

        togglePublish: async function (id, currentStatus) {
            const endpoint = currentStatus ? 'unpublish' : 'publish';
            try {
                const res = await fetch(`${API_ROOT}/api/cms/admin/content/${id}/${endpoint}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('gs_token')}` }
                });
                if (res.ok) this.fetchContent();
            } catch (err) { console.error(err); }
        },

        deleteContent: async function (id) {
            if (!confirm("Permanently delete this content?")) return;
            try {
                const res = await fetch(`${API_ROOT}/api/cms/admin/content/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('gs_token')}` }
                });
                if (res.ok) this.fetchContent();
            } catch (err) { console.error(err); }
        },

        syncDiscoveries: async function () {
            try {
                const res = await fetch(`${API_ROOT}/api/cms/admin/sync`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('gs_token')}` }
                });
                const data = await res.json();
                alert(`Sync Complete: ${data.synced} items synchronized.`);
                this.fetchContent();
            } catch (err) { console.error(err); }
        },

        fetchRevisions: async function (id) {
            try {
                const res = await fetch(`${API_ROOT}/api/cms/admin/content/${id}/revisions`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('gs_token')}` }
                });
                const data = await res.json();
                if (data.revisions && data.revisions.length > 0) {
                    this.els.revisionBox.style.display = 'block';
                    this.els.revisionList.innerHTML = data.revisions.map(r => `
                        <li class="cms-rev-item">
                            <div class="cms-rev-meta">
                                <b>${new Date(r.created_at).toLocaleString()}</b>
                            </div>
                            <div class="cms-rev-summary">${r.change_summary || 'No summary'}</div>
                        </li>
                    `).join('');
                }
            } catch (err) { console.error(err); }
        },

        // --- UI HELPERS ---

        closeEditor: function () {
            this.els.editorOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        },

        switchTab: function (lang) {
            this.state.currentLang = lang;
            this.els.tabBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
            this.els.tabContents.forEach(c => c.style.display = c.id === `tab-${lang}` ? 'block' : 'none');
        },

        addMediaRow: function (data = { label: '', value: '', media_type: 'example' }) {
            const row = document.createElement('div');
            row.className = 'cms-media-row';
            row.innerHTML = `
                <select class="cms-select cms-media-type">
                    <option value="example" ${data.media_type === 'example' ? 'selected' : ''}>Example</option>
                    <option value="formula" ${data.media_type === 'formula' ? 'selected' : ''}>Formula</option>
                    <option value="diagram" ${data.media_type === 'diagram' ? 'selected' : ''}>Diagram</option>
                </select>
                <input type="text" placeholder="Label/Value" class="cms-input cms-media-val" value="${data.label || data.value}">
                <button type="button" class="gs-button gs-button-sm btn-del-media">❌</button>
            `;
            row.querySelector('.btn-del-media').onclick = () => row.remove();
            this.els.mediaList.appendChild(row);
        },

        // --- MARKDOWN RENDERER ---
        renderMarkdown: function (text) {
            if (!text) return '';
            let html = text
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
                .replace(/\*(.*)\*/gim, '<i>$1</i>')
                .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' target='_blank'>$1</a>")
                .replace(/^\s*>\s+(.*$)/gim, '<blockquote>$1</blockquote>')
                .replace(/^\s*-\s+(.*$)/gim, '<ul><li>$1</li></ul>')
                .replace(/<\/ul>\n<ul>/gim, '')
                .replace(/`([^`]+)`/gim, '<code>$1</code>')
                .replace(/\n$/gim, '<br />');

            return html.split('\n').map(line => {
                if (!line.match(/<(h1|h2|h3|li|ul|blockquote|br)/)) {
                    return `<p>${line}</p>`;
                }
                return line;
            }).join('');
        },

        applyMarkdownCmd: function (id, cmd) {
            const el = document.getElementById(id);
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const text = el.value;
            const selected = text.substring(start, end);
            let replacement = '';

            switch (cmd) {
                case 'bold': replacement = `**${selected}**`; break;
                case 'italic': replacement = `*${selected}*`; break;
                case 'h2': replacement = `\n## ${selected}`; break;
                case 'h3': replacement = `\n### ${selected}`; break;
                case 'list': replacement = `\n- ${selected}`; break;
                case 'code': replacement = `\`${selected}\``; break;
                case 'link': replacement = `[${selected}](https://)`; break;
            }

            el.value = text.substring(0, start) + replacement + text.substring(end);
            el.dispatchEvent(new Event('input')); // Trigger preview
        }
    };

    window.GanitCMS = GanitCMS;
    document.addEventListener('DOMContentLoaded', () => GanitCMS.init());
})();
