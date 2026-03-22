/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";
import React, { useEffect, useRef } from 'react';

export default function ArchivalBg() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const galaxyImgRef = useRef<HTMLImageElement>(null);
    const ringOverlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        const galaxyImg = galaxyImgRef.current;
        const ringOverlay = ringOverlayRef.current;

        if (!canvas || !container || !galaxyImg) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
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

        let animationFrameId: number;
        const drawStars = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach(s => {
                s.twinklePhase += s.twinkleSpeed;
                const alpha = s.opacity * (0.6 + 0.4 * Math.sin(s.twinklePhase));
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = s.hue
                    ? `hsla(${s.hue},${s.sat},90%,${alpha})`
                    : `rgba(255,255,255,${alpha})`;
                ctx.fill();

                s.y -= s.speed;
                if (s.y < -2) {
                    s.y = canvas.height + 2;
                    s.x = Math.random() * canvas.width;
                }
            });
            animationFrameId = requestAnimationFrame(drawStars);
        };
        drawStars();

        // Shooting stars
        const launchShootingStar = () => {
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
        };

        const shootInterval = setInterval(() => {
            if (Math.random() < 0.3) launchShootingStar();
        }, 4000);

        // Parallax
        let targetX = 0, targetY = 0, curX = 0, curY = 0;
        const onMouseMove = (e: MouseEvent) => {
            targetX = (e.clientX / window.innerWidth - 0.5) * 18;
            targetY = (e.clientY / window.innerHeight - 0.5) * 12;
        };
        document.addEventListener('mousemove', onMouseMove);

        let parallaxFrameId: number;
        const parallaxLoop = () => {
            curX += (targetX - curX) * 0.04;
            curY += (targetY - curY) * 0.04;
            if (galaxyImg) {
                galaxyImg.style.transform = `scale(1.1) translate(${curX}px,${curY}px)`;
            }
            parallaxFrameId = requestAnimationFrame(parallaxLoop);
        };
        parallaxLoop();

        // Sync with session epoch for seamless transitions
        let epoch = sessionStorage.getItem('gsGalaxyEpoch');
        if (!epoch) {
            epoch = Date.now().toString();
            sessionStorage.setItem('gsGalaxyEpoch', epoch);
        }
        const elapsed = (Date.now() - parseInt(epoch)) / 1000;
        
        galaxyImg.style.animationDelay = `-${elapsed}s, -${elapsed}s`;
        if (ringOverlay) ringOverlay.style.animationDelay = `-${elapsed}s`;

        const blooms = container.querySelectorAll('.nebula-bloom') as NodeListOf<HTMLElement>;
        blooms.forEach((bloom, i) => {
            const baseDelay = i * -3;
            bloom.style.animationDelay = `${baseDelay - elapsed}s`;
        });

        return () => {
            window.removeEventListener('resize', resize);
            document.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animationFrameId);
            cancelAnimationFrame(parallaxFrameId);
            clearInterval(shootInterval);
        };
    }, []);

    return (
        <div id="gs-archival-bg" className="gs-archival-bg" ref={containerRef}>
            <img 
                id="galaxy-img" 
                src="/assets/archival-galaxy.jpg" 
                alt="Cosmic galaxy background" 
                ref={galaxyImgRef} 
            />
            <div className="nebula-bloom bloom-1"></div>
            <div className="nebula-bloom bloom-2"></div>
            <div className="nebula-bloom bloom-3"></div>
            <div id="ring-overlay" ref={ringOverlayRef}></div>
            <canvas id="starfield" ref={canvasRef}></canvas>
            
            {/* Luminous background stars */}
            <div className="lum-star" style={{ top: '8%', left: '48%', width: '9px', height: '9px' }}></div>
            <div className="lum-star" style={{ top: '62%', left: '78%', width: '7px', height: '7px' }}></div>
            <div className="lum-star" style={{ top: '75%', left: '18%', width: '8px', height: '8px' }}></div>
            <div className="lum-star" style={{ top: '22%', left: '82%', width: '11px', height: '11px' }}></div>
            <div className="lum-star" style={{ top: '15%', left: '25%', width: '3px', height: '3px' }}></div>
        </div>
    );
}
