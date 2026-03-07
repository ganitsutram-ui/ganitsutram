/*
Project: GanitSutram Platform
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07
*/
// Living Numbers Gate
export function initNumbersScene(canvas, textContainer) {
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
    <h2 class="scene-title" style="font-size: 2rem;">Living Numbers</h2>
    <p class="scene-quote">"Every number hides a secret —<br>every pattern tells a story."</p>
    <div class="scene-formula">98 × 97 → 9506</div>
  `;

    let nums = [];
    const chars = '0123456789+×=';
    for (let i = 0; i < 100; i++) {
        nums.push({
            x: Math.random() * W, y: Math.random() * H,
            char: chars[Math.floor(Math.random() * chars.length)],
            speed: Math.random() * 2 + 1,
            size: Math.random() * 20 + 10
        });
    }

    function draw() {
        ctx.fillStyle = 'rgba(4, 1, 16, 0.4)';
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = 'rgba(0, 255, 170, 0.5)';
        ctx.textAlign = 'center';

        nums.forEach(n => {
            ctx.font = `bold ${n.size}px monospace`;
            ctx.fillText(n.char, n.x, n.y);
            n.y -= n.speed; // float up
            if (n.y < -50) {
                n.y = H + 50;
                n.x = Math.random() * W;
            }
        });

        return requestAnimationFrame(draw);
    }

    return draw();
}

