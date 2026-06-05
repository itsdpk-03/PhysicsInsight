/* ============================================================
   Physics Insight — Internationalization (i18n) Engine
   Supports bilingual: English (en) & Nepali (np)
   ============================================================ */

const I18n = (() => {
    let currentLang = 'en';
    let translations = { en: {}, np: {} };
    let loaded = false;

    /**
     * Initialize the i18n system.
     * Loads translations and sets language from localStorage or browser default.
     */
    async function init() {
        try {
            const [enRes, npRes] = await Promise.all([
                fetch('data/i18n/en.json').then(r => r.json()),
                fetch('data/i18n/np.json').then(r => r.json())
            ]);
            translations.en = enRes;
            translations.np = npRes;
            loaded = true;

            // Restore saved language or detect from browser
            const saved = localStorage.getItem('pi_language');
            if (saved && (saved === 'en' || saved === 'np')) {
                currentLang = saved;
            } else {
                // Auto-detect: if browser language contains 'ne' (Nepali), use Nepali
                const browserLang = navigator.language || navigator.userLanguage || 'en';
                currentLang = browserLang.startsWith('ne') ? 'np' : 'en';
            }

            document.documentElement.lang = currentLang === 'np' ? 'ne' : 'en';
        } catch (err) {
            console.warn('i18n: Could not load translations, using fallback.', err);
            loaded = false;
        }
    }

    /**
     * Get a nested translation value by dot-notation key.
     * e.g., t('nav.home') → translations[currentLang].nav.home
     * Falls back to English, then to the key itself.
     */
    function t(key) {
        const val = getNestedValue(translations[currentLang], key);
        if (val !== undefined && val !== null) return val;

        // Fallback to English
        if (currentLang !== 'en') {
            const enVal = getNestedValue(translations.en, key);
            if (enVal !== undefined && enVal !== null) return enVal;
        }

        // Fallback to key
        return key;
    }

    /**
     * Get bilingual text from an object with { en, np } keys.
     * Used for content from data files (chapters, questions, etc.)
     */
    function getBilingual(obj) {
        if (!obj) return '';
        if (typeof obj === 'string') return obj;
        return obj[currentLang] || obj.en || obj.np || '';
    }

    /**
     * Switch the current language and update the UI.
     */
    function setLanguage(lang) {
        if (lang !== 'en' && lang !== 'np') return;
        currentLang = lang;
        localStorage.setItem('pi_language', lang);
        document.documentElement.lang = lang === 'np' ? 'ne' : 'en';

        // Update all elements with data-i18n attribute
        updateDOM();

        // Dispatch custom event for components that need to react
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }

    /**
     * Toggle between English and Nepali.
     */
    function toggleLanguage() {
        setLanguage(currentLang === 'en' ? 'np' : 'en');
    }

    /**
     * Get the current language code.
     */
    function getLang() {
        return currentLang;
    }

    /**
     * Check if translations are loaded.
     */
    function isLoaded() {
        return loaded;
    }

    /**
     * Update all DOM elements with data-i18n attribute.
     */
    function updateDOM() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translated = t(key);

            // Handle different element types
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.getAttribute('data-i18n-attr') === 'placeholder') {
                    el.placeholder = translated;
                } else {
                    el.value = translated;
                }
            } else if (el.getAttribute('data-i18n-attr') === 'title') {
                el.title = translated;
            } else if (el.getAttribute('data-i18n-attr') === 'aria-label') {
                el.setAttribute('aria-label', translated);
            } else {
                el.textContent = translated;
            }
        });
    }

    // --- Helpers ---

    function getNestedValue(obj, key) {
        return key.split('.').reduce((acc, part) => {
            if (acc && typeof acc === 'object' && part in acc) {
                return acc[part];
            }
            return undefined;
        }, obj);
    }

    // Public API
    return {
        init,
        t,
        getBilingual,
        setLanguage,
        toggleLanguage,
        getLang,
        isLoaded,
        updateDOM
    };
})();
