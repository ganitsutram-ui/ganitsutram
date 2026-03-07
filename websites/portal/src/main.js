/*
Project: GanitSutram Platform
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07
*/
import { initCosmicScene } from './scenes/cosmic.js';
import { initBigbangScene } from './scenes/bigbang.js';
import { initVedicScene } from './scenes/vedic.js';
import { initBrainScene } from './scenes/brain.js';
import { initNumbersScene } from './scenes/numbers.js';
import { renderPersonaSelector } from './PersonaSelector.js';
import { renderAuthLayer } from './AuthLayer.js';

const scenes = [
  { id: 'cosmic', init: initCosmicScene },
  { id: 'bigbang', init: initBigbangScene },
  { id: 'vedic', init: initVedicScene },
  { id: 'brain', init: initBrainScene },
  { id: 'numbers', init: initNumbersScene }
];

function bootstrap() {
  const canvas = document.getElementById('scene-canvas');
  const textContainer = document.getElementById('scene-text-container');
  const authContainer = document.getElementById('auth-container');
  const personaContainer = document.getElementById('persona-container');
  const personaGrid = document.getElementById('persona-grid');

  // Pick a random scene
  const randomScene = scenes[Math.floor(Math.random() * scenes.length)];
  randomScene.init(canvas, textContainer);

  // Render the Persona buttons but keep container hidden at first
  renderPersonaSelector(personaGrid);

  // Inject a temporary 'Enter' button into the text container for the user to click to start Login
  setTimeout(() => {
    const enterBtn = document.createElement('button');
    enterBtn.className = 'glow-button g-enter-btn';
    enterBtn.innerHTML = 'Enter Portal <span style="margin-left:8px">→</span>';
    enterBtn.style.animation = 'FU 1s ease-out 2s forwards';
    enterBtn.style.opacity = '0';
    textContainer.appendChild(enterBtn);

    enterBtn.addEventListener('click', () => {
      // Hide title text
      textContainer.classList.add('hidden');
      // Show Auth layer
      authContainer.classList.remove('hidden');
      renderAuthLayer(authContainer, () => {
        // On Auth Success, show Personas
        personaContainer.classList.remove('hidden');
        personaContainer.style.animation = 'FU 0.8s forwards';
      });
    });
  }, 500);
}

bootstrap();

