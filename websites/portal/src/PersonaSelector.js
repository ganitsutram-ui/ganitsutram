/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

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
export function renderPersonaSelector(grid) {
  const personas = [
    { p: 'Student', icon: '🎒', text: 'Student', sub: 'Teal · Quest System', bgGrad: 'linear-gradient(135deg,rgba(0,191,168,.25),rgba(0,150,210,.15))' },
    { p: 'Teacher', icon: '👩‍🏫', text: 'Teacher', sub: 'Purple · Lesson Generator', bgGrad: 'linear-gradient(135deg,rgba(90,26,156,.3),rgba(150,60,220,.15))' },
    { p: 'Parent', icon: '👨‍👩‍👧', text: 'Parent', sub: 'Amber · Family Insights', bgGrad: 'linear-gradient(135deg,rgba(210,110,0,.25),rgba(250,170,0,.15))' },
    { p: 'Learner', icon: '🧠', text: 'Adult Learner', sub: 'Mono · Brain Protocol', bgGrad: 'linear-gradient(135deg,rgba(20,20,18,.45),rgba(60,60,55,.2))' },
    { p: 'School', icon: '🏛️', text: 'School', sub: 'Crimson · Observatory', bgGrad: 'linear-gradient(135deg,rgba(192,32,0,.25),rgba(230,90,40,.15))' }
  ];

  grid.innerHTML = personas.map(p => `
    <button class="gbtn" data-p="${p.p}">
      <span class="gi">${p.icon}</span>
      <span>${p.text}</span>
      <small>${p.sub}</small>
    </button>
  `).join('');

  grid.querySelectorAll('.gbtn').forEach(btn => {
    // Inject dynamic hover background
    const bgGrad = personas.find(p => p.p === btn.getAttribute('data-p')).bgGrad;
    const styleElem = document.createElement('style');
    styleElem.innerHTML = `.gbtn[data-p="${btn.getAttribute('data-p')}"]::before { background: ${bgGrad}; }`;
    document.head.appendChild(styleElem);

    btn.addEventListener('click', (e) => {
      const p = e.currentTarget.getAttribute('data-p');
      console.log(`Entering as ${p}`);
      const portalUrl = (window.GanitConfig && window.GanitConfig.PORTAL_URL) ? window.GanitConfig.PORTAL_URL : '/portal';
      window.location.href = `${portalUrl}/gate.html?persona=${p}`;
    });
  });
}
