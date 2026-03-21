// Extracted and modularized from myarchives/Background.html

window.initArchivalBg = function() {
    const container = document.getElementById('gs-archival-bg');
    const canvas = document.getElementById('starfield');
    const galaxyImg = document.getElementById('galaxy-img');
    
    if (!container || !canvas || !galaxyImg) return;
    
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const STAR_COUNT = 220;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.4 + 0.2,
        speed: Math.random() * 0.15 + 0.02,
        opacity: Math.random() * 0.7 + 0.15,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        hue: Math.random() < 0.15 ? (Math.random() < 0.5 ? 200 : 50) : 0,
        sat: Math.random() < 0.15 ? '60%' : '0%',
    }));

    let frame = 0;
    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frame++;
        stars.forEach(s => {
            s.twinklePhase += s.twinkleSpeed;
            const alpha = s.opacity * (0.6 + 0.4 * Math.sin(s.twinklePhase));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = s.hue
                ? `hsla(${s.hue},${s.sat},90%,${alpha})`
                : `rgba(255,255,255,${alpha})`;
            ctx.fill();

            // Drift upward slowly
            s.y -= s.speed;
            if (s.y < -2) {
                s.y = canvas.height + 2;
                s.x = Math.random() * canvas.width;
            }
        });
        requestAnimationFrame(drawStars);
    }
    drawStars();

    /* ── Shooting stars ── */
    function launchShootingStar() {
        const el = document.createElement('div');
        el.className = 'shooting-star';
        const startX = Math.random() * 80 + 5;
        const startY = Math.random() * 40;
        const angle = 20 + Math.random() * 30;
        el.style.cssText = `left:${startX}%;top:${startY}%;`;
        container.appendChild(el);

        const dist = 300 + Math.random() * 300;
        const dx = Math.cos((angle * Math.PI) / 180) * dist;
        const dy = Math.sin((angle * Math.PI) / 180) * dist;
        const dur = 600 + Math.random() * 600;

        el.animate([
            { opacity: 0, transform: 'translate(0,0)' },
            { opacity: 1, transform: `translate(${dx * 0.1}px,${dy * 0.1}px)` },
            { opacity: 0, transform: `translate(${dx}px,${dy}px)` }
        ], { duration: dur, easing: 'ease-in' }).onfinish = () => el.remove();
    }

    // Fire occasionally
    let shootTimeout;
    function scheduleShoot() {
        launchShootingStar();
        shootTimeout = setTimeout(scheduleShoot, 4000 + Math.random() * 8000);
    }
    scheduleShoot();

    /* ── Subtle parallax on mouse move ── */
    let targetX = 0, targetY = 0, curX = 0, curY = 0;
    document.addEventListener('mousemove', e => {
        targetX = (e.clientX / window.innerWidth - 0.5) * 18;
        targetY = (e.clientY / window.innerHeight - 0.5) * 12;
    });

    function parallaxLoop() {
        curX += (targetX - curX) * 0.04;
        curY += (targetY - curY) * 0.04;
        if(galaxyImg) {
            galaxyImg.style.transform = `scale(1.1) translate(${curX}px,${curY}px)`;
        }
        requestAnimationFrame(parallaxLoop);
    }
    parallaxLoop();

    // --- SEAMLESS PAGE TRANSITION SYNC ---
    // Persists the animation timings across page loads to prevent "restart" bumps
    let epoch = sessionStorage.getItem('gsGalaxyEpoch');
    if (!epoch) {
        epoch = Date.now();
        sessionStorage.setItem('gsGalaxyEpoch', epoch);
    }
    const elapsed = (Date.now() - epoch) / 1000;
    
    if (galaxyImg) {
        // galaxyImg has two animations: galaxyDrift, galaxyBreath
        galaxyImg.style.animationDelay = `-${elapsed}s, -${elapsed}s`;
    }
    
    const ringOverlay = document.getElementById('ring-overlay');
    if (ringOverlay) {
        ringOverlay.style.animationDelay = `-${elapsed}s`;
    }
    
    document.querySelectorAll('.nebula-bloom').forEach(bloom => {
        let baseDelay = 0;
        if (bloom.classList.contains('bloom-2')) baseDelay = -3;
        if (bloom.classList.contains('bloom-3')) baseDelay = -6;
        bloom.style.animationDelay = `${baseDelay - elapsed}s`;
    });
};
