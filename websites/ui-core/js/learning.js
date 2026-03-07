/*
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07

Purpose: Learning Platform interactive logic.
         Tab management and persona-specific content rendering.
*/

(function () {
    'use strict';

    const LEARNING_DATA = {
        student: {
            title: "Student Path",
            desc: "Structured modules from basics to advanced Vedic techniques designed for mastery.",
            modules: [
                { icon: "🔢", title: "Digital Root & Beejank", level: "Beginner", url: "#" },
                { icon: "⬛", title: "Squares Ending in 5", level: "Beginner", url: "#" },
                { icon: "✖️", title: "Multiply by 11", level: "Intermediate", url: "#" },
                { icon: "🔄", title: "Nikhilam Sutra", level: "Intermediate", url: "#" },
                { icon: "⬆️", title: "Urdhva Tiryak", level: "Advanced", url: "#" },
                { icon: "🌀", title: "Pattern Recognition", level: "Advanced", url: "#" }
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

        // Update header
        titleEl.textContent = data.title;
        descEl.textContent = data.desc;

        // Render grid with animation reset
        gridEl.style.opacity = '0';

        // 1. Static modules
        let modules = [...data.modules];

        // 2. CMS-driven modules
        try {
            const lang = localStorage.getItem('gs_locale') || 'en';
            const res = await fetch(`${window.GanitUI.API_BASE || '/api'}/cms/content?type=lesson&category=${persona}&locale=${lang}`);
            if (res.ok) {
                const cmsData = await res.json();
                const cmsModules = cmsData.content.map(c => ({
                    icon: c.icon || "📚",
                    title: c.title,
                    level: c.difficulty || "Beginner",
                    url: `lesson.html?slug=${c.slug}`
                }));
                modules = [...modules, ...cmsModules];
            }
        } catch (e) {
            console.warn("Could not fetch CMS lessons", e);
        }

        setTimeout(() => {
            gridEl.innerHTML = modules.map(m => `
                <div class="gs-module-card">
                    <div class="gs-module-icon">${m.icon}</div>
                    <span class="gs-badge badge-${m.level.toLowerCase()}">${m.level}</span>
                    <h3>${m.title}</h3>
                    <a href="${m.url}" class="gs-button gs-button-primary">Start →</a>
                </div>
            `).join('');
            gridEl.style.opacity = '1';
        }, 100);
    }

})();
