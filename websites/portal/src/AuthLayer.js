/*
 * GANITSUTRAM
 * A Living Knowledge Ecosystem for Mathematical Discovery
 *
 * "यथा शिखा मयूराणां नागानां मणयो यथा
 *  तद्वद् वेदाङ्गशास्त्राणां गणितं मूर्ध्नि वर्तते"
 *
 * As the crest of a peacock, as the gem on the hood
 * of a cobra — so stands mathematics at the crown
 * of all knowledge.
 *                                       — Brahmagupta
 *                                         628 CE · Brahmasphutasiddhanta
 *
 * Creator:   Jawahar R. Mallah
 * Email:     jawahar@aitdl.com
 * GitHub:    https://github.com/jawahar-mallah
 * Websites:  https://ganitsutram.com
 *            https://aitdl.com
 *
 * Then:  628 CE · Brahmasphutasiddhanta
 * Now:   8 March MMXXVI · Vikram Samvat 2082
 *
 * Copyright © 2026 Jawahar R. Mallah · AITDL | GANITSUTRAM
 *
 * Developer Note:
 * If you intend to reuse this code, please respect
 * the creator and the work behind it.
 */
/*
Project: GanitSutram Platform
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07
*/
export function renderAuthLayer(container, onSuccess) {
    container.innerHTML = `
    <div class="auth-panel panel">
      <h2 class="ps-title" style="font-size: 2rem;">Access Gateway</h2>
      <p class="ps-subtitle" style="margin-bottom: 2rem;">Authenticate to enter the PrathamOne ecosystem.</p>
      
      <form id="auth-form" class="auth-form">
        <div class="input-group">
          <label for="email">Etheric Identity (Email)</label>
          <input type="email" id="email" required placeholder="name@domain.com" autocomplete="email">
        </div>
        
        <div class="input-group">
          <label for="password">Passkey</label>
          <input type="password" id="password" required placeholder="••••••••">
        </div>

        <button type="submit" class="glow-button auth-submit">Authenticate <span>→</span></button>
      </form>

      <div class="auth-footer">
        <a href="#" id="toggle-auth">Need an identity? Register here.</a>
      </div>
    </div>
  `;

    const form = container.querySelector('#auth-form');
    const toggleBtn = container.querySelector('#toggle-auth');
    let isLogin = true;

    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        const btn = container.querySelector('.auth-submit');
        const title = container.querySelector('.ps-title');

        if (isLogin) {
            title.textContent = 'Access Gateway';
            btn.innerHTML = 'Authenticate <span>→</span>';
            toggleBtn.textContent = 'Need an identity? Register here.';
        } else {
            title.textContent = 'Forge Identity';
            btn.innerHTML = 'Initialize <span>→</span>';
            toggleBtn.textContent = 'Already possess an identity? Enter here.';
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = container.querySelector('.auth-submit');
        const originalText = btn.innerHTML;

        // UI Loading state
        btn.innerHTML = 'Synchronizing...';
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.7';

        // Mock API Call delay
        setTimeout(() => {
            // Simulate success
            container.classList.add('hidden');
            onSuccess(); // Trigger the Persona grid
        }, 1500);
    });
}

