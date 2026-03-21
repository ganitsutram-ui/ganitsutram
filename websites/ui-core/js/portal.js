/*
 * GANITSUTRAM
 * A Living Knowledge Ecosystem for Mathematical Discovery
 *
 * "यथा शिखा मयूराणां नागानां मणयो यथा
 *  तद्वद् वेदाङ्गशास्त्राणां गणितं मूर्ध्नि वर्तते"
 *
 * Creator:   Jawahar R. Mallah
 * Copyright © 2026 Jawahar R. Mallah · AITDL | GANITSUTRAM
 */
/*
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com
Purpose: Portal-specific logic for the main landing page.
         Ambient 'Vedic Space' engine and dynamic stats.
*/

(function () {
    'use strict';

    // Use centralised config — never hardcode ports here
    const API_BASE = (window.GanitConfig && window.GanitConfig.API_BASE)
        ? window.GanitConfig.API_BASE
        : 'http://localhost:5002/api';  // safe fallback for dev

    const API_CONCEPTS = `${API_BASE}/concepts`;
    const API_DISCOVERIES = `${API_BASE}/discoveries`;
    const API_PATTERNS = `${API_BASE}/patterns/vedic`;


    function getTheme() {
        return document.documentElement.getAttribute('data-theme') || 'dark';
    }

    function getThemeColor(baseColor) {
        if (getTheme() === 'dark') return baseColor;
        if (baseColor === '#FFF' || baseColor === '#ffffff') return '#1A1A1A';
        if (baseColor === '#DEB84E') return '#FF6B35';
        if (baseColor.includes('rgba(222, 184, 78')) return baseColor.replace('rgba(222, 184, 78', 'rgba(255, 107, 53');
        return baseColor;
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname.includes('gate.html')) {
            initGateCosmos();
        } else {
            initAmbientCanvas();
        }
        initStatsAndConcepts();
        initScrollEffects();
    });

    /**
     * Gate Cosmos Engine: Twinkling stars and bright flares over galaxy background.
     */
    function initGateCosmos() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width, height;
        let stars = [];
        let flares = [];

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        class Star {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 1.5 + 0.5;
                this.alpha = Math.random();
                this.twinkleFactor = Math.random() * 0.05 + 0.01;
                this.isBright = Math.random() > 0.98;
            }
            update() {
                this.alpha += this.twinkleFactor;
                if (this.alpha > 1 || this.alpha < 0.2) this.twinkleFactor *= -1;
            }
            draw() {
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = getThemeColor(this.isBright ? '#FFF' : '#DEB84E');
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.isBright ? this.size * 1.5 : this.size, 0, Math.PI * 2);
                ctx.fill();
                if (this.isBright) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#FFF';
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }
        }

        class Flare {
            constructor() {
                this.reset();
                this.active = false;
            }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = 0;
                this.maxSize = Math.random() * 40 + 20;
                this.alpha = 0;
                this.speed = Math.random() * 0.02 + 0.01;
                this.grow = true;
            }
            update() {
                if (!this.active) {
                    if (Math.random() > 0.998) this.active = true;
                    return;
                }
                if (this.grow) {
                    this.size += this.speed * 20;
                    this.alpha += this.speed;
                    if (this.alpha >= 0.6) this.grow = false;
                } else {
                    this.size -= this.speed * 10;
                    this.alpha -= this.speed * 0.5;
                    if (this.alpha <= 0) {
                        this.active = false;
                        this.reset();
                    }
                }
            }
            draw() {
                if (!this.active || this.size <= 0) return;  // guard: size must be positive
                const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
                grad.addColorStop(0, `rgba(255, 255, 255, ${this.alpha})`);
                grad.addColorStop(0.3, `rgba(222, 184, 78, ${this.alpha * 0.5})`);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }

        }

        function init() {
            resize();
            stars = Array.from({ length: 150 }, () => new Star());
            flares = Array.from({ length: 3 }, () => new Flare());
            window.addEventListener('resize', resize);
            loop();
        }

        function loop() {
            ctx.clearRect(0, 0, width, height);
            stars.forEach(s => { s.update(); s.draw(); });
            flares.forEach(f => { f.update(); f.draw(); });
            requestAnimationFrame(loop);
        }

        init();
    }

    /**
     * Ambient 'Vedic Space' Engine: Floating numerals, symbols, and threads.
     */
    function initAmbientCanvas() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let threads = [];

        const symbols = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९', '∞', '∑', '√', 'π', '∆', 'Ω', '∫', '≈'];
        const colors = ['#DEB84E', '#C9A84C', '#A8832A', 'rgba(222, 184, 78, 0.3)'];

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
                this.vx = (Math.random() - 0.5) * 0.25;
                this.vy = (Math.random() - 0.5) * 0.25;
                this.char = symbols[Math.floor(Math.random() * symbols.length)];
                this.size = Math.random() * 12 + 8;
                this.alpha = Math.random() * 0.4;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.isGlyph = Math.random() > 0.7;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < -50 || this.x > width + 50 || this.y < -50 || this.y > height + 50) this.reset();
            }
            draw() {
                ctx.globalAlpha = this.alpha;
                if (this.isGlyph) {
                    ctx.font = `${this.size}px "Noto Serif Devanagari", "Cinzel", serif`;
                    ctx.fillStyle = getThemeColor(this.color);
                    ctx.fillText(this.char, this.x, this.y);
                } else {
                    ctx.fillStyle = getThemeColor(this.color);
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        class Thread {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.length = Math.random() * 300 + 150;
                this.angle = Math.random() * Math.PI * 2;
                this.speed = Math.random() * 0.4 + 0.1;
                this.opacity = Math.random() * 0.15;
            }
            update() {
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed;
                if (this.x < -300 || this.x > width + 300 || this.y < -300 || this.y > height + 300) this.reset();
            }
            draw() {
                ctx.globalAlpha = this.opacity;
                ctx.strokeStyle = getThemeColor('#DEB84E');
                ctx.lineWidth = 0.4;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + Math.cos(this.angle) * this.length, this.y + Math.sin(this.angle) * this.length);
                ctx.stroke();
            }
        }

        function init() {
            resize();
            particles = Array.from({ length: 60 }, () => new Particle());
            threads = Array.from({ length: 12 }, () => new Thread());
            window.addEventListener('resize', resize);
            loop();
        }

        function loop() {
            ctx.clearRect(0, 0, width, height);
            ctx.globalCompositeOperation = getTheme() === 'dark' ? 'lighter' : 'source-over';
            threads.forEach(t => { t.update(); t.draw(); });
            particles.forEach(p => { p.update(); p.draw(); });
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
            if (strip && concepts.length) {
                strip.innerHTML = concepts.map(c => `
                    <div class="gs-concept-card">
                        <div class="gs-concept-icon">${getIconFor(c.id)}</div>
                        <h3>${c.title}</h3>
                        <div class="gs-concept-sutra">${c.sutra || ''}</div>
                        <p class="gs-eco-tag">${c.desc}</p>
                        <a href="../discoveries/index.html?id=${c.id}" class="gs-platform-link" style="margin-top:auto">Explore Discovery &rarr;</a>
                    </div>
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
        if (!nav) return;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.style.background = "rgba(4, 8, 15, 0.98)";
                nav.style.padding = "0.8rem 0";
            } else {
                nav.style.background = "rgba(4, 8, 15, 0.95)";
                nav.style.padding = "1.2rem 0";
            }
        });
    }

})();
