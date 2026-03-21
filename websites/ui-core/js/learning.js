/*
 * GANITSUTRAM
 * A Living Knowledge Ecosystem for Mathematical Discovery
 * 
 * Creator:   Jawahar R. Mallah
 */

(function () {
    'use strict';

    const LEARNING_DATA = {
        student: {
            title: "The Seven Stages Path",
            desc: "The complete self-learning curriculum from 'The Golden Book of Vedic Mathematics'. Follow the stages in order for absolute clarity.",
            modules: [
                { icon: "🛡️", title: "Stage 1: The Foundation", level: "Ch 0–2", desc: "Pattern recognition, Number sense, and the Mind Reset.", url: "lesson.html?stage=1" },
                { icon: "⚡", title: "Stage 2: Number Fluency", level: "Integrated", desc: "Addition, Subtraction, and the power of Complements.", url: "lesson.html?stage=2" },
                { icon: "🕉️", title: "Stage 3: The Vedic World", level: "Ch 3–7", desc: "The Sixteen Sūtras, Base Method, and Squaring logic.", url: "lesson.html?stage=3" },
                { icon: "✖️", title: "Stage 4: Crosswise Mastery", level: "Ch 8–9", desc: "Ūrdhva-Tiryagbhyām: The universal multiplication algorithm.", url: "lesson.html?stage=4" },
                { icon: "🌍", title: "Stage 5: Real-Life Maths", level: "Ch 10–12", desc: "Percentages, Distance-Speed-Time, and Budgets.", url: "lesson.html?stage=5" },
                { icon: "🌉", title: "Stage 6: The Bridge", level: "Ch 13–14", desc: "Word Problems and the transition to pure Algebra.", url: "lesson.html?stage=6" },
                { icon: "🏆", title: "Stage 7: Mastery", level: "Ch 15", desc: "The 100-Question Mastery Drill and Celebration.", url: "lesson.html?stage=7" }
            ]
        },
        teacher: {
            title: "Teacher Path",
            desc: "Comprehensive classroom tools, curriculum guides, and curated concept libraries.",
            modules: [
                { icon: "📋", title: "Curriculum Alignment Guide", level: "Resource", url: "#" },
                { icon: "🎯", title: "Concept Explanation Toolkit", level: "Resource", url: "#" },
                { icon: "📊", title: "Student Progress Dashboard", level: "Tool", url: "#" },
                { icon: "🧩", title: "Practice Problem Generator", level: "Tool", url: "#" }
            ]
        },
        parent: {
            title: "Parent Path",
            desc: "Guided pathways to help your child build confidence and mathematical curiosity at home.",
            modules: [
                { icon: "🏠", title: "Home Practice Guide", level: "Guide", url: "#" },
                { icon: "📈", title: "Track Your Child's Progress", level: "Tool", url: "#" },
                { icon: "💡", title: "Fun Maths Activities", level: "Activity", url: "#" }
            ]
        },
        adult: {
            title: "Adult Learner Path",
            desc: "Rediscover the structural beauty of mathematics at your own pace.",
            modules: [
                { icon: "🧠", title: "Mental Maths Foundations", level: "Beginner", url: "#" },
                { icon: "⚡", title: "Speed Calculation Secrets", level: "Intermediate", url: "#" },
                { icon: "🔍", title: "Mathematical Patterns", level: "Advanced", url: "#" }
            ]
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        initTabs();
    });

    /**
     * Initializes the tab switching logic.
     */
    function initTabs() {
        const tabBtns = document.querySelectorAll('.gs-tab-btn');
        const titleEl = document.getElementById('panel-title');
        const descEl = document.getElementById('panel-desc');
        const gridEl = document.getElementById('module-grid');

        if (!tabBtns.length || !gridEl) return;

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const persona = btn.getAttribute('data-persona');
                if (!LEARNING_DATA[persona]) return;

                // Update tab states
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Render content
                renderContent(persona, titleEl, descEl, gridEl);
            });
        });

        // Initialize with default (Student)
        renderContent('student', titleEl, descEl, gridEl);
    }

    /**
     * Renders modules for a specific persona.
     */
    async function renderContent(persona, titleEl, descEl, gridEl) {
        const data = LEARNING_DATA[persona];
        const { API_BASE } = window.GanitConfig;

        // Update header
        titleEl.textContent = data.title;
        descEl.textContent = data.desc;

        // Render grid with animation reset
        gridEl.style.opacity = '0';

        let displayModules = [];

        // 1. CMS-driven modules for the 'student' (7 Stages)
        if (persona === 'student') {
            try {
                const lang = localStorage.getItem('gs_locale') || 'en';
                const cmsUrl = `${API_BASE}/cms/content/lesson?locale=${lang}&category=learning-path`;
                const res = await fetch(cmsUrl);
                if (res.ok) {
                    const cmsData = await res.json();
                    const content = cmsData.data || cmsData.content;
                    if (content && content.length > 0) {
                        displayModules = content.map(c => ({
                            icon: c.icon || "🛡️",
                            title: c.title,
                            level: c.difficulty || "Beginner",
                            desc: c.excerpt || c.summary || "",
                            url: `lesson.html?slug=${c.slug}`
                        }));
                    }
                }
            } catch (e) {
                console.warn("Could not fetch CMS stages", e);
            }
        }

        // 2. Fallback to static if empty
        if (displayModules.length === 0) {
            displayModules = [...data.modules];
        }

        setTimeout(() => {
            gridEl.innerHTML = displayModules.map(m => `
                <article class="gs-module-card">
                    <div class="gs-module-icon">${m.icon}</div>
                    <span class="gs-badge badge-${m.level.toLowerCase().replace(/ /g, '-') || 'beginner'}">${m.level}</span>
                    <h3>${m.title}</h3>
                    <p class="gs-module-desc">${m.desc || ''}</p>
                    <a href="${m.url}" class="gs-button gs-button-primary">Start →</a>
                </article>
            `).join('');
            gridEl.style.opacity = '1';
        }, 100);
    }

    // EXPOSE
    window.GanitLearning = { renderContent };

})();
