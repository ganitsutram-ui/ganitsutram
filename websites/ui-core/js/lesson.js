/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

/*
 * GANITSUTRAM
 * Lesson Viewer Logic
 */

(function () {
    'use strict';

    const { API_BASE } = window.GanitConfig;
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    document.addEventListener('DOMContentLoaded', () => {
        if (!slug) {
            window.location.href = 'index.html';
            return;
        }
        init();
    });

    async function init() {
        await fetchAndRenderLesson();
    }

    async function fetchAndRenderLesson() {
        const titleEl = document.getElementById('lesson-title');
        const excerptEl = document.getElementById('lesson-excerpt');
        const bodyEl = document.getElementById('lesson-body');
        const subGrid = document.getElementById('sub-module-grid');
        const subSection = document.getElementById('sub-modules-section');

        try {
            const lang = localStorage.getItem('gs_locale') || 'en';
            const res = await fetch(`${API_BASE}/cms/content/${slug}?locale=${lang}`);
            
            if (!res.ok) throw new Error("Lesson not found");

            const { content } = await res.json();
            
            // Render main content
            titleEl.textContent = content.title;
            excerptEl.textContent = content.excerpt || "";
            
            // Use GanitUI to render body (markdown + math support)
            if (window.GanitUI && window.GanitUI.renderMarkdown) {
                bodyEl.innerHTML = window.GanitUI.renderMarkdown(content.body);
            } else {
                bodyEl.innerHTML = content.body;
            }

            // Fetch related modules (where tag equals this slug)
            await fetchSubModules(content.slug, subGrid, subSection, lang);

        } catch (e) {
            console.error(e);
            titleEl.textContent = "Error";
            bodyEl.innerHTML = `<div class="gs-error-msg">Failed to load lesson: ${e.message}</div>`;
        }
    }

    async function fetchSubModules(parentSlug, grid, section, lang) {
        try {
            // Fetch modules categorized as 'lesson-module' and tagged with parentSlug
            const res = await fetch(`${API_BASE}/cms/content/lesson?locale=${lang}&category=lesson-module`);
            if (res.ok) {
                const data = await res.json();
                const modules = (data.data || data.content).filter(m => m.tags === parentSlug);
                
                if (modules.length > 0) {
                    section.style.display = 'block';
                    grid.innerHTML = modules.map(m => `
                        <article class="gs-module-card">
                            <div class="gs-module-icon">${m.icon || "📚"}</div>
                            <span class="gs-badge badge-${m.difficulty?.toLowerCase() || 'beginner'}">${m.difficulty || 'Beginner'}</span>
                            <h3>${m.title}</h3>
                            <p class="gs-module-desc">${m.excerpt || ''}</p>
                            <a href="lesson.html?slug=${m.slug}" class="gs-button gs-button-primary">Start →</a>
                        </article>
                    `).join('');
                }
            }
        } catch (e) {
            console.warn("Could not fetch sub-modules", e);
        }
    }

})();
