/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

// seed_sutras.js
const db = require('./backend/database/db');
const crypto = require('crypto');

const SUTRAS = [
    {
        slug: 'ekadhikena-purvena',
        title_en: 'Ekadhikena Purvena',
        title_hi: 'एकाधिकेन पूर्वेण',
        title_sa: 'एकाधिकेन पूर्वेण',
        excerpt_en: 'By one more than the previous one.',
        body_en: 'This Sutra is used for squaring numbers ending in 5, division by numbers ending in 9, etc.',
        category: 'Arithmetic',
        difficulty: 'Beginner',
        icon: '🔢',
        sort_order: 1
    },
    {
        slug: 'nikhilam-navatashcaramam-dashatah',
        title_en: 'Nikhilam Navatashcaramam Dashatah',
        title_hi: 'निखिलं नवतश्चरमिं दशतः',
        title_sa: 'निखिलं नवतश्चरमिं दशतः',
        excerpt_en: 'All from 9 and the last from 10.',
        body_en: 'The most famous Sutra for fast multiplication, especially for numbers close to a base (10, 100, 1000).',
        category: 'Multiplication',
        difficulty: 'Beginner',
        icon: '⚡',
        sort_order: 2
    },
    {
        slug: 'urdhva-tiryagbhyam',
        title_en: 'Urdhva-Tiryagbhyam',
        title_hi: 'ऊर्ध्वतिर्यग्भ्याम्',
        title_sa: 'ऊर्ध्वतिर्यग्भ्याम्',
        excerpt_en: 'Vertically and Crosswise.',
        body_en: 'A general formula for multiplication of any two numbers and for division as well.',
        category: 'Multiplication',
        difficulty: 'Intermediate',
        icon: '⚔️',
        sort_order: 3
    },
    {
        slug: 'paravartya-yojayet',
        title_en: 'Paravartya Yojayet',
        title_hi: 'परावर्त्य योजयेत्',
        title_sa: 'परावर्त्य योजयेत्',
        excerpt_en: 'Transpose and Apply.',
        body_en: 'Used for division by numbers slightly greater than a base, and for solving algebraic equations.',
        category: 'Division',
        difficulty: 'Advanced',
        icon: '🔄',
        sort_order: 4
    },
    {
        slug: 'shunyam-saamyasamuccaye',
        title_en: 'Shunyam Saamyasamuccaye',
        title_hi: 'शून्यं साम्यसमुच्चये',
        title_sa: 'शून्यं साम्यसमुच्चये',
        excerpt_en: 'When the Samuccaya is the same it is Zero.',
        body_en: 'Applied in solving complex algebraic equations by identifying symmetrical terms.',
        category: 'Algebra',
        difficulty: 'Advanced',
        icon: '⭕',
        sort_order: 5
    },
    {
        slug: 'anurupye-shunyamanyat',
        title_en: 'Anurupye Shunyamanyat',
        title_hi: 'आनुरूप्ये शून्यमन्यत्',
        title_sa: 'आनुरूप्ये शून्यमन्यत्',
        excerpt_en: 'If one is in ratio, the other is zero.',
        body_en: 'Used for solving simultaneous linear equations and special cases of ratios.',
        category: 'Algebra',
        difficulty: 'Intermediate',
        icon: '⚖️',
        sort_order: 6
    },
    {
        slug: 'sankalana-vyavakalanabhyam',
        title_en: 'Sankalana-Vyavakalanabhyam',
        title_hi: 'संकलनव्यवकलनाभ्याम्',
        title_sa: 'संकलनव्यवकलनाभ्याम्',
        excerpt_en: 'By Addition and by Subtraction.',
        body_en: 'Used for solving simultaneous equations where coefficients are interchanged.',
        category: 'Arithmetic',
        difficulty: 'Beginner',
        icon: '➕',
        sort_order: 7
    },
    {
        slug: 'puranapuranabhyam',
        title_en: 'Puranapuranabhyam',
        title_hi: 'पूरणापूरणाभ्याम्',
        title_sa: 'पूरणापूरणाभ्याम्',
        excerpt_en: 'By the Completion or Non-Completion.',
        body_en: 'Used in clearing fractions, auxiliary calculations, and completing the square.',
        category: 'Arithmetic',
        difficulty: 'Intermediate',
        icon: '🧩',
        sort_order: 8
    },
    {
        slug: 'chalana-kalanabhyam',
        title_en: 'Chalana-Kalanabhyam',
        title_hi: 'चलनकलनाभ्याम्',
        title_sa: 'चलनकलनाभ्याम्',
        excerpt_en: 'By Sequential Motion (Calculus).',
        body_en: 'The foundation of Vedic Calculus, used for finding roots of functions and differential steps.',
        category: 'Calculus',
        difficulty: 'Advanced',
        icon: '📈',
        sort_order: 9
    },
    {
        slug: 'yaavadunam',
        title_en: 'Yaavadunam',
        title_hi: 'यावदूनम्',
        title_sa: 'यावदूनम्',
        excerpt_en: 'By the Deficiency.',
        body_en: 'Used for squaring and cubing numbers close to a base.',
        category: 'Arithmetic',
        difficulty: 'Beginner',
        icon: '📉',
        sort_order: 10
    },
    {
        slug: 'vyashtisamashti',
        title_en: 'Vyashtisamashti',
        title_hi: 'व्यष्टिसमष्टिः',
        title_sa: 'व्यष्टिसमष्टिः',
        excerpt_en: 'Specific and General.',
        body_en: 'A logical Sutra for solving polynomials and analyzing specific cases vs general rules.',
        category: 'Logic',
        difficulty: 'Intermediate',
        icon: '🔭',
        sort_order: 11
    },
    {
        slug: 'sheshanyena-paramena',
        title_en: 'Sheshanyena Paramena',
        title_hi: 'शेषाण्येन चरमेण',
        title_sa: 'शेषाण्येन चरमेण',
        excerpt_en: 'The Remainder by the Last Digit.',
        body_en: 'Used for conversion of vulgar fractions into decimal fractions.',
        category: 'Division',
        difficulty: 'Advanced',
        icon: '🔢',
        sort_order: 12
    },
    {
        slug: 'sopaantyadvayamantyam',
        title_en: 'Sopaantyadvayamantyam',
        title_hi: 'सोपान्त्यद्वयमन्त्यम्',
        title_sa: 'सोपान्त्यद्वयमन्त्यम्',
        excerpt_en: 'The Ultimate and Twice the Penultimate.',
        body_en: 'Used in specific linear equations involving special denominators.',
        category: 'Algebra',
        difficulty: 'Advanced',
        icon: '🔱',
        sort_order: 13
    },
    {
        slug: 'ekanyunena-purvena',
        title_en: 'Ekanyunena Purvena',
        title_hi: 'एकन्यूनेन पूर्वेण',
        title_sa: 'एकन्यूनेन पूर्वेण',
        excerpt_en: 'By one less than the previous one.',
        body_en: 'Used for multiplication where one multiplier consists entirely of 9s.',
        category: 'Multiplication',
        difficulty: 'Beginner',
        icon: '➖',
        sort_order: 14
    },
    {
        slug: 'gunitasamuccayah',
        title_en: 'Gunitasamuccayah',
        title_hi: 'गुणितसमुच्चयः',
        title_sa: 'गुणितसमुच्चयः',
        excerpt_en: 'The Product of the Sum is the Sum of the Product.',
        body_en: 'A powerful verification technique using the Digital Root of terms.',
        category: 'Verification',
        difficulty: 'Intermediate',
        icon: '🔍',
        sort_order: 15
    },
    {
        slug: 'gunakasamuccayah',
        title_en: 'Gunakasamuccayah',
        title_hi: 'गुणकसमुच्चयः',
        title_sa: 'गुणकसमुच्चयः',
        excerpt_en: 'All the Multipliers.',
        body_en: 'Used in factorization of polynomials of higher degrees.',
        category: 'Algebra',
        difficulty: 'Advanced',
        icon: '📦',
        sort_order: 16
    }
];

async function seed() {
    try {
        console.log("Seeding 16 Vedic Sutras...");
        const now = new Date().toISOString();
        
        for (const s of SUTRAS) {
            // Check if already exists
            const exists = await db.get("SELECT 1 FROM cms_content WHERE slug = ?", s.slug);
            if (exists) {
                console.log(`Skipping ${s.slug} (already exists)`);
                continue;
            }

            // Using native crypto.randomUUID() supported in Node 16+
            const id = crypto.randomUUID();

            await db.run(`
                INSERT INTO cms_content (
                    content_id, content_type, slug, 
                    title_en, title_hi, title_sa, 
                    body_en, excerpt_en,
                    icon, category, difficulty,
                    sort_order, published, featured,
                    created_at, updated_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, 
            id, 'sutra', s.slug,
            s.title_en, s.title_hi, s.title_sa,
            s.body_en, s.excerpt_en,
            s.icon, s.category, s.difficulty,
            s.sort_order, 1, 1,
            now, now, now);
            console.log(`Seeded: ${s.slug}`);
        }
        
        console.log("All Sutras seeded successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Seeding failed:", e);
        process.exit(1);
    }
}

seed();
