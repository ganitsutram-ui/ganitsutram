/*
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07

Purpose: Ambient hero canvas animation — floating mathematical symbols.
         Lightweight canvas; no external libraries.
*/

(function () {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Mathematical symbols and numbers to float in the background
    const symbols = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '∞', 'π', '√', 'Σ', 'Δ', '∂', '∫', '≡', '÷', '×',
        'φ', 'α', 'β', 'ω', 'λ', '⊕', '∇', '∴', '∵', '≈'
    ];

    let particles = [];
    let W, H;

    function resize() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }

    function createParticle() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            symbol: symbols[Math.floor(Math.random() * symbols.length)],
            size: Math.random() * 14 + 10,
            alpha: Math.random() * 0.12 + 0.02,
            speed: Math.random() * 0.25 + 0.05,
            drift: (Math.random() - 0.5) * 0.3,
        };
    }

    function init() {
        particles = [];
        const count = Math.floor((W * H) / 18000);
        for (let i = 0; i < count; i++) {
            particles.push(createParticle());
        }
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, W, H);

        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = '#ffb300';
            ctx.font = `${p.size}px 'Space Grotesk', monospace`;
            ctx.fillText(p.symbol, p.x, p.y);
            ctx.restore();

            // Move upward slowly with a drift
            p.y -= p.speed;
            p.x += p.drift;

            // Reset when off screen
            if (p.y < -20 || p.x < -20 || p.x > W + 20) {
                p.x = Math.random() * W;
                p.y = H + 20;
            }
        });

        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
        resize();
        init();
    });

    resize();
    init();
    draw();
})();
