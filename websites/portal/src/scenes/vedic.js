/*
Project: GanitSutram Platform
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07
*/
// Ancient Bharat Knowledge Gate
export function initVedicScene(canvas, textContainer) {
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
    <h2 class="scene-title" style="font-size: 2rem; font-family:'Noto Serif Devanagari',serif;">Ancient Wisdom</h2>
    <p class="scene-quote">"Thousands of years ago, mathematicians discovered patterns that still guide numbers today."</p>
    <div class="scene-formula">Ekādhikena Pūrvena</div>
  `;

    let time = 0;
    function draw() {
        ctx.fillStyle = 'rgba(4, 1, 16, 0.2)';
        ctx.fillRect(0, 0, W, H);
        time += 0.01;

        // Draw some mystical glowing concentric circles (mandala-like)
        const cx = W / 2, cy = H / 2;
        for (let i = 1; i <= 5; i++) {
            ctx.beginPath();
            ctx.arc(cx, cy, i * 60 + Math.sin(time + i) * 20, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 180, 60, ${0.3 / i})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        return requestAnimationFrame(draw);
    }

    return draw();
}

