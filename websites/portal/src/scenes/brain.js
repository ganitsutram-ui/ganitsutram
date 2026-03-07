/*
Project: GanitSutram Platform
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07
*/
// Brain & Pattern Gate
export function initBrainScene(canvas, textContainer) {
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
    <h2 class="scene-title" style="font-size: 2rem;">Pattern Recognition</h2>
    <p class="scene-quote">"Mathematics is not memorization.<br>It is pattern recognition."</p>
    <div class="scene-formula">Fibonacci Sequence</div>
  `;

    let nodes = [];
    for (let i = 0; i < 50; i++) {
        nodes.push({
            x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - 0.5), vy: (Math.random() - 0.5)
        });
    }

    function draw() {
        ctx.fillStyle = 'rgba(4, 1, 16, 1)';
        ctx.fillRect(0, 0, W, H);

        // Move nodes
        nodes.forEach(n => {
            n.x += n.vx; n.y += n.vy;
            if (n.x < 0 || n.x > W) n.vx *= -1;
            if (n.y < 0 || n.y > H) n.vy *= -1;
        });

        // Draw connections
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = `rgba(150, 100, 255, ${1 - dist / 150})`;
                    ctx.stroke();
                }
            }
            ctx.beginPath();
            ctx.arc(nodes[i].x, nodes[i].y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }

        return requestAnimationFrame(draw);
    }

    return draw();
}

