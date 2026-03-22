/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Purpose: Internationalisation Engine (Vanilla JS)
 */

window.GanitI18n = (function () {
    const SUPPORTED_LOCALES = ['en', 'hi', 'sa'];
    const DEFAULT_LOCALE = 'en';
    let currentLocale = DEFAULT_LOCALE;
    const translations = {}; // in-memory cache

    async function init(defaultLocaleOverride) {
        let savedLocale = localStorage.getItem('gs_locale');

        if (!savedLocale) {
            if (defaultLocaleOverride && SUPPORTED_LOCALES.includes(defaultLocaleOverride)) {
                savedLocale = defaultLocaleOverride;
            } else {
                const browserLang = navigator.language || navigator.userLanguage;
                savedLocale = browserLang.toLowerCase().startsWith('hi') ? 'hi' : 'en';
            }
        } else if (!SUPPORTED_LOCALES.includes(savedLocale)) {
            savedLocale = 'en';
        }

        currentLocale = savedLocale;
        await loadLocale(currentLocale);
        applyLocale();
        setHtmlLang(currentLocale);
        return currentLocale;
    }

    async function loadLocale(locale) {
        // Fallback to English if not 'en'
        if (locale !== 'en' && !translations['en']) {
            await fetchLocaleData('en');
        }

        if (!translations[locale]) {
            await fetchLocaleData(locale);
        }
    }

    async function fetchLocaleData(locale) {
        const cacheKey = `gs_locale_cache_${locale}`;
        const cached = localStorage.getItem(cacheKey);

        // Try network
        try {
            const basePath = window.GanitConfig ? window.GanitConfig.getBasePath() : '/websites/';
            const response = await fetch(`${basePath}ui-core/locales/${locale}.json`);
            if (response.ok) {
                const data = await response.json();
                translations[locale] = data;
                localStorage.setItem(cacheKey, JSON.stringify(data));
                return;
            }
        } catch (e) {
            console.warn(`[GanitI18n] Network fetch failed for locale ${locale}`);
        }

        // Fallback to cache if network fails
        if (cached) {
            try {
                translations[locale] = JSON.parse(cached);
                return;
            } catch (e) {
                console.warn(`[GanitI18n] Cache parse failed for locale ${locale}`);
            }
        }

        // Final fallback: empty object
        translations[locale] = {};
    }

    function t(key, vars = {}) {
        let result = resolveKey(translations[currentLocale], key);

        if (result === undefined && currentLocale !== 'en') {
            result = resolveKey(translations['en'], key);
        }

        if (result === undefined) {
            return key; // return key itself if not found anywhere
        }

        if (typeof result !== 'string') return result;

        // Handle interpolation
        return result.replace(/\{\{(.*?)\}\}/g, (match, p1) => {
            const varName = p1.trim();
            return vars[varName] !== undefined ? vars[varName] : match;
        });
    }

    function resolveKey(obj, path) {
        if (!obj) return undefined;
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    function applyLocale() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) {
                el.textContent = t(key);
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (key) {
                el.setAttribute('placeholder', t(key));
            }
        });

        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (key) {
                el.setAttribute('title', t(key));
            }
        });

        document.documentElement.dir = 'ltr'; // All current locales are LTR
    }

    async function setLocale(locale) {
        if (!SUPPORTED_LOCALES.includes(locale)) return;

        localStorage.setItem('gs_locale', locale);
        currentLocale = locale;

        await loadLocale(locale);
        setHtmlLang(locale);
        applyLocale();

        // Dispatch event
        const event = new CustomEvent('ganit:locale:changed', { detail: { locale } });
        window.dispatchEvent(event);
    }

    function setHtmlLang(locale) {
        const langMap = {
            'en': 'en',
            'hi': 'hi',
            'sa': 'sa-Deva'
        };
        document.documentElement.lang = langMap[locale] || 'en';
    }

    const DEVANAGARI_DIGITS = {
        '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
        '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
    };

    function toDevanagari(str) {
        return String(str).replace(/[0-9]/g, match => DEVANAGARI_DIGITS[match]);
    }

    function formatNumber(n, locale) {
        if (n === null || n === undefined) return '';
        const config = resolveKey(translations[locale], 'numbers') || resolveKey(translations['en'], 'numbers');
        if (!config) return n;

        const number = Number(n);
        if (isNaN(number)) return String(n);

        let formattedStr;
        if (config.lakhSystem) {
            formattedStr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 10 }).format(number);
        } else {
            formattedStr = new Intl.NumberFormat('en-US', { maximumFractionDigits: 10 }).format(number);
        }

        if (config.digitStyle === 'devanagari') {
            return toDevanagari(formattedStr);
        }

        return formattedStr;
    }

    function formatResult(n) {
        return formatNumber(n, currentLocale);
    }

    function formatDate(isoString) {
        if (!isoString) return '';
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return isoString;

        const config = resolveKey(translations[currentLocale], 'numbers') || resolveKey(translations['en'], 'numbers');
        const localeCode = config && config.locale ? config.locale : 'en-IN';

        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        let formattedStr;
        try {
            formattedStr = new Intl.DateTimeFormat(localeCode, options).format(date);
        } catch (e) {
            formattedStr = new Intl.DateTimeFormat('en-US', options).format(date);
        }

        if (config && config.digitStyle === 'devanagari') {
            return toDevanagari(formattedStr);
        }
        return formattedStr;
    }

    function getLocale() {
        return currentLocale;
    }

    function getAvailableLocales() {
        return SUPPORTED_LOCALES;
    }

    function initSwitcher() {
        const switchers = document.querySelectorAll('.gs-lang-btn');
        if (!switchers.length) return;

        // Set initial active state
        updateSwitcherState();

        // Attach listeners
        switchers.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.getAttribute('data-lang');
                if (lang) {
                    setLocale(lang);
                }
            });
        });

        // Listen for changes
        window.addEventListener('ganit:locale:changed', updateSwitcherState);
    }

    function updateSwitcherState() {
        const switchers = document.querySelectorAll('.gs-lang-btn');
        switchers.forEach(btn => {
            if (btn.getAttribute('data-lang') === currentLocale) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    return {
        init,
        loadLocale,
        setLocale,
        getLocale,
        getAvailableLocales,
        t,
        applyLocale,
        initSwitcher,
        setHtmlLang,
        formatNumber,
        formatResult,
        formatDate
    };
})();
