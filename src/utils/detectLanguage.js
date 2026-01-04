const { franc } = require('franc');

// Arabic Unicode range detector
const ARABIC_REGEX = /[\u0600-\u06FF]/;

exports.detectLanguage = (text) => {
  if (!text || text.length < 3) return null;

    // ✅ Strong rule: Arabic script always wins
    if (ARABIC_REGEX.test(text)) {
        return 'ar';
    }

    // Fallback to franc for other languages
    const code = franc(text, { minLength: 10 });
    if (code === 'und') return null;

    const map = {
    eng: 'en',
    deu: 'de',
    fra: 'fr',
    spa: 'es',
    ita: 'it',
    por: 'pt',
    nld: 'nl',
    tur: 'tr',
    rus: 'ru'
    };

    return map[code] || null;
};
