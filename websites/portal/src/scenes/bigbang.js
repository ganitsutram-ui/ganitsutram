/*
Project: GanitSutram Platform
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07
*/
// Big Bang Mathematics Gate
export function initBigbangScene(canvas, textContainer) {
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    textContainer.innerHTML = `
    <p class="g-dev">॥ गणितसूत्रम् ॥</p>
    <h1 class="g-logo" style="margin-bottom: 1rem;">GanitSūtram</h1>
    
    <!-- Scene Extras -->
    <h2 class="scene-title" style="font-size: 2rem;">The Big Bang</h2>
    <p class="scene-quote">"In the beginning was energy.<br>Soon after came mathematics."</p>
    <div class="scene-formula">E = mc²</div>
  `;

    let particles = [];
    const cx = W / 2, cy = H / 2;

    for (let i = 0; i < 150; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        particles.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            decay: Math.random() * 0.02 + 0.01
        });
    }

    function draw() {
        ctx.fillStyle = 'rgba(4, 1, 16, 0.3)'; // Trail effect
        ctx.fillRect(0, 0, W, H);

        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2 * p.life, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, ${Math.round(200 * p.life)}, 50, ${p.life})`;
            ctx.fill();

            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            if (p.life <= 0) {
                p.x = cx; p.y = cy; p.life = 1.0;
            }
        });

        return requestAnimationFrame(draw);
    }

    return draw();
}

