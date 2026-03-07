/*
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07

Purpose: Portal-specific logic for the main landing page.
         Ambient canvas engine and dynamic stats.
*/

(function () {
    'use strict';

    const API_BASE = window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api'
        : 'https://api.ganitsutram.com/api';

    const API_CONCEPTS = `${API_BASE}/concepts`;
    const API_DISCOVERIES = `${API_BASE}/discoveries`;
    const API_PATTERNS = `${API_BASE}/patterns/vedic`;

    document.addEventListener('DOMContentLoaded', () => {
        initAmbientCanvas();
        initStatsAndConcepts();
        initScrollEffects();
    });

    /**
     * Ambient Canvas Engine: Floating glyphs and particles.
     */
    function initAmbientCanvas() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let glyphs = [];

        const devanagari = ['अ', 'इ', 'उ', 'ए', 'ओ', 'क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह', 'ॐ'];

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.2;
                this.vy = (Math.random() - 0.5) * 0.2;
                this.size = Math.random() * 2;
                this.alpha = Math.random() * 0.5;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) this.reset();
            }
            draw() {
                ctx.fillStyle = `rgba(255, 179, 0, ${this.alpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        class Glyph {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * width;
                this.y = height + 100;
                this.vy = -(Math.random() * 0.5 + 0.2);
                this.char = devanagari[Math.floor(Math.random() * devanagari.length)];
                this.size = Math.random() * 15 + 10;
                this.alpha = 0;
                this.targetAlpha = Math.random() * 0.3;
            }
            update() {
                this.y += this.vy;
                if (this.alpha < this.targetAlpha) this.alpha += 0.005;
                if (this.y < -100) this.reset();
            }
            draw() {
                ctx.font = `${this.size}px "Noto Serif Devanagari"`;
                ctx.fillStyle = `rgba(255, 179, 0, ${this.alpha})`;
                ctx.fillText(this.char, this.x, this.y);
            }
        }

        function init() {
            resize();
            for (let i = 0; i < 50; i++) particles.push(new Particle());
            for (let i = 0; i < 15; i++) glyphs.push(new Glyph());
            window.addEventListener('resize', resize);
            loop();
        }

        function loop() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => { p.update(); p.draw(); });
            glyphs.forEach(g => { g.update(); g.draw(); });
            requestAnimationFrame(loop);
        }

        init();
    }

    /**
     * Dynamic Stats and Concepts.
     */
    async function initStatsAndConcepts() {
        try {
            const [conceptsRes, discoveriesRes, patternsRes] = await Promise.allSettled([
                fetch(API_CONCEPTS),
                fetch(API_DISCOVERIES),
                fetch(API_PATTERNS)
            ]);

            let concepts = [];
            if (conceptsRes.status === 'fulfilled' && conceptsRes.value.ok) {
                concepts = await conceptsRes.value.json();
                const opsEl = document.getElementById('stat-ops');
                if (opsEl) opsEl.textContent = concepts.length;
            }

            if (discoveriesRes.status === 'fulfilled' && discoveriesRes.value.ok) {
                const discData = await discoveriesRes.value.json();
                const discoEl = document.getElementById('stat-discoveries');
                if (discoEl) discoEl.textContent = discData.total || discData.discoveries?.length || 8;
            }

            if (patternsRes.status === 'fulfilled' && patternsRes.value.ok) {
                const patData = await patternsRes.value.json();
                const patEl = document.getElementById('stat-patterns');
                if (patEl) patEl.textContent = patData.total || 6;
            }

            // Concept Strip
            const strip = document.getElementById('concept-strip');
            if (strip && concepts.length) {
                strip.innerHTML = concepts.map(c => `
                    <a href="https://discover.ganitsutram.com" class="gs-concept-card">
                        <span class="gs-concept-icon">${getIconFor(c.id)}</span>
                        <h3>${c.title}</h3>
                        <span class="gs-concept-sutra">${c.sutra}</span>
                        <p class="gs-eco-tag" style="opacity:0.6">${c.desc}</p>
                    </a>
                `).join('');
            }

            initCountUp();

        } catch (err) {
            console.error("Failed to load platform stats.");
        }
    }

    function getIconFor(id) {
        const icons = {
            'digital-root': '🔢',
            'squares-ending-5': '⬛',
            'multiply-by-11': '✖️',
            'nikhilam': '📐',
            'urdhva': '⚡'
        };
        return icons[id] || '✨';
    }

    /**
     * Stats Count-up Animation.
     */
    function initCountUp() {
        const stats = document.querySelectorAll('.gs-stat-val');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const end = parseInt(target.textContent);
                    if (isNaN(end)) return;
                    animateValue(target, 0, end, 1500);
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(s => observer.observe(s));
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function initScrollEffects() {
        const nav = document.querySelector('.gs-nav');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.style.background = "rgba(4, 1, 16, 0.95)";
                nav.style.padding = "1rem 0";
            } else {
                nav.style.background = "rgba(4, 1, 16, 0.75)";
                nav.style.padding = "1.4rem 0";
            }
        });
    }

})();
