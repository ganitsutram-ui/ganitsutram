/**
 * GANITSUTRAM | STILLNESS PROTOCOL
 * "Clarity over Speed. Always."
 * 
 * Part of the 'Mind Reset' (Chapter Zero) from the Golden Book.
 */

window.GanitStillness = (function() {
    'use strict';

    let overlay = null;
    let timer = null;
    let secondsLeft = 60;

    const vedaQuote = {
        sa: "पूर्णमदः पूर्णमिदं पूर्णात् पूर्णमुदच्यते।",
        en: "That is infinite. This is infinite. From the infinite, the infinite arises."
    };

    function createOverlay() {
        overlay = document.createElement('div');
        overlay.id = 'gs-stillness-overlay';
        overlay.innerHTML = `
            <div class="stillness-content">
                <div class="stillness-veda">${vedaQuote.sa}</div>
                <div class="stillness-translation">${vedaQuote.en}</div>
                
                <div class="stillness-circle-container">
                    <div class="stillness-circle"></div>
                    <div class="stillness-instruction">Breathe In</div>
                </div>

                <div class="stillness-timer">60</div>
                <div class="stillness-sub">"Clarity over Speed. Always."</div>
                
                <button class="stillness-skip" style="display:none;">Focus Achieved (Skip)</button>
            </div>
            <style>
                #gs-stillness-overlay {
                    position: fixed; inset: 0; z-index: 9999;
                    background: radial-gradient(circle at center, #0a041a, #040110);
                    display: flex; align-items: center; justify-content: center;
                    color: white; text-align: center; font-family: 'Syne', sans-serif;
                    opacity: 0; transition: opacity 1s ease;
                }
                .stillness-content { max-width: 600px; padding: 2rem; }
                .stillness-veda { font-family: 'Noto Serif Devanagari', serif; font-size: 1.5rem; margin-bottom: 0.5rem; opacity: 0.8; }
                .stillness-translation { font-style: italic; font-size: 1rem; margin-bottom: 3rem; opacity: 0.6; }
                
                .stillness-circle-container { position: relative; width: 200px; height: 200px; margin: 0 auto 2rem; }
                .stillness-circle {
                    width: 100%; height: 100%; border: 2px solid rgba(255,85,0,0.3); border-radius: 50%;
                    animation: breathe 8s ease-in-out infinite;
                }
                .stillness-instruction {
                    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
                    font-size: 1.2rem; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;
                    animation: instructionFade 8s ease-in-out infinite;
                }
                
                .stillness-timer { font-family: 'Unbounded', sans-serif; font-size: 3rem; font-weight: 900; margin-bottom: 1rem; color: var(--accent-primary, #ff5500); }
                .stillness-sub { font-size: 0.9rem; letter-spacing: 1px; opacity: 0.5; }
                
                .stillness-skip {
                    margin-top: 3rem; background: transparent; border: 1px solid rgba(255,255,255,0.2);
                    color: white; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; transition: all 0.3s;
                }
                .stillness-skip:hover { background: rgba(255,255,255,0.1); border-color: white; }

                @keyframes breathe {
                    0%, 100% { transform: scale(0.8); background: rgba(255,85,0,0.05); }
                    50% { transform: scale(1.2); background: rgba(255,85,0,0.2); }
                }
                @keyframes instructionFade {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
            </style>
        `;
        document.body.appendChild(overlay);

        const instruction = overlay.querySelector('.stillness-instruction');
        setInterval(() => {
            const isExpanding = overlay.querySelector('.stillness-circle').getBoundingClientRect().width > 150;
            instruction.textContent = isExpanding ? "Breathe Out" : "Breathe In";
        }, 4000);
    }

    function start(callback) {
        if (!overlay) createOverlay();
        
        overlay.style.display = 'flex';
        setTimeout(() => overlay.style.opacity = '1', 10);

        secondsLeft = 60;
        const timerEl = overlay.querySelector('.stillness-timer');
        const skipBtn = overlay.querySelector('.stillness-skip');

        // Show skip button after 10 seconds for returning users
        setTimeout(() => skipBtn.style.display = 'inline-block', 10000);
        
        skipBtn.onclick = () => finish(callback);

        timer = setInterval(() => {
            secondsLeft--;
            timerEl.textContent = secondsLeft;
            if (secondsLeft <= 0) {
                finish(callback);
            }
        }, 1000);
    }

    function finish(callback) {
        clearInterval(timer);
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
            if (callback) callback();
        }, 1000);
    }

    return {
        init: start
    };
})();
