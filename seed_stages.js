// seed_stages.js
const db = require('./backend/database/db');
const crypto = require('crypto');

const STAGES = [
    { title: "Stage 1: The Foundation", slug: "stage-1-foundation", excerpt: "Introduction to Beejank and basic number patterns.", body: "The foundation of Vedic Mathematics lies in understanding the core nature of numbers. In this stage, you will learn about Digital Roots (Beejank), the significance of 9, and how ancient sages viewed the decimal system.", order: 1 },
    { title: "Stage 2: Linear Light", slug: "stage-2-linear-light", excerpt: "Mastering Addition and Subtraction using Vedic Sutras.", body: "Subtraction and addition become effortless when you understand the concepts of complements and base numbers. This stage covers lightning-fast linear operations.", order: 2 },
    { title: "Stage 3: Lightning Multiplication", slug: "stage-3-multiplication", excerpt: "Nikhilam and Urdhva-Tiryak methods.", body: "Go beyond traditional tables. Learn the Nikhilam (All from 9 and last from 10) and Urdhva-Tiryak (Vertically and Crosswise) methods for multiplying any numbers in seconds.", order: 3 },
    { title: "Stage 4: Divine Division", slug: "stage-4-division", excerpt: "Paravartya and Flag Division techniques.", body: "Division is often considered the hardest operation, but Vedic Sutras like Paravartya and Dhvajanka (Flag Division) turn it into a simple multiplication-like process.", order: 4 },
    { title: "Stage 5: Powers & Roots", slug: "stage-5-powers", excerpt: "Squaring, Cubing, and finding Square roots instantly.", body: "Extracting square roots and calculating squares of large numbers becomes a mental exercise. This stage focuses on the symmetry of exponents.", order: 5 },
    { title: "Stage 6: Algebraic Bliss", slug: "stage-6-algebra", excerpt: "Solving equations with Vedic logic.", body: "Vedic Algebra is not about formulas, but about identifying patterns. Solve simultaneous and quadratic equations by mere observation (Puranapuranabhyam).", order: 6 },
    { title: "Stage 7: The Master’s Path", slug: "stage-7-mastery", excerpt: "Advanced Calculus and complex problem solving.", body: "The ultimate peak of Vedic mathematics. Exploring Calculus, Coordinate Geometry, and Trigonometry through the lens of the 16 Sutras.", order: 7 }
];

async function seed() {
    try {
        console.log("Seeding 7 Learning Stages...");
        const now = new Date().toISOString();
        
        for (const s of STAGES) {
            const exists = await db.get("SELECT 1 FROM cms_content WHERE slug = ?", s.slug);
            if (exists) {
                console.log(`Skipping ${s.slug} (already exists)`);
                continue;
            }

            await db.run(`
                INSERT INTO cms_content (
                    content_id, content_type, slug, 
                    title_en, body_en, excerpt_en,
                    category, difficulty,
                    sort_order, published, featured,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, 
            crypto.randomUUID(), 'lesson', s.slug,
            s.title, s.body, s.excerpt,
            'learning-path', 'Beginner',
            s.order, 1, 1,
            now, now);
            console.log(`Seeded: ${s.slug}`);
        }
        
        console.log("All Stages seeded successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Seeding failed:", e);
        process.exit(1);
    }
}

seed();
