/*
Project: GanitSutram Platform
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07
*/
// Cosmic Order Gate Animation
export function initCosmicScene(canvas, textContainer) {
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Populate text
    textContainer.innerHTML = `
    <p class="g-dev">॥ गणितसूत्रम् ॥</p>
    <h1 class="g-logo">GanitSūtram</h1>
    <p class="g-tag">Discover the patterns hidden in every number.</p>
    
    <!-- Scene Extras -->
    <h1 class="scene-title">Cosmic Order</h1>
    <p class="scene-quote">"The universe is written in the language of mathematics."<br>— Galileo Galilei</p>
    <div class="scene-formula">F = G (m₁m₂ / r²)</div>
  `;

    let time = 0;
    function draw() {
        ctx.fillStyle = 'rgba(4, 1, 16, 0.2)';
        ctx.fillRect(0, 0, W, H);

        const cx = W / 2;
        const cy = H / 2;
        time += 0.005;

        // Draw orbits
        const orbits = [100, 200, 300, 450];
        ctx.strokeStyle = 'rgba(255, 100, 0, 0.1)';
        ctx.lineWidth = 1;
        orbits.forEach((r, i) => {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();

            // Planets
            const speed = (i + 1) * 0.5;
            const angle = time * speed;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, ${150 + i * 20}, 50, 0.8)`;
            ctx.fill();
        });

        return requestAnimationFrame(draw);
    }

    return draw();
}

