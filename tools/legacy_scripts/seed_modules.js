/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

// seed_modules.js
const db = require('./backend/database/db');
const crypto = require('crypto');

const MODULES = [
    { 
        parent: "stage-1-foundation",
        slug: "intro-digital-roots",
        title: "Introduction to Digital Roots",
        excerpt: "Learn how to find the single-digit essence of any number.",
        body: "Digital Root (Beejank) is the single digit obtained by adding all the digits of a number until only one digit remains. For example, the Digital Root of 123 is 1+2+3 = 6. This is the cornerstone of Vedic verification.",
        order: 1
    },
    { 
        parent: "stage-1-foundation",
        slug: "the-magic-of-9",
        title: "The Master Key: 9",
        excerpt: "Why 9 is the most powerful number in Vedic maths.",
        body: "The number 9 has unique properties. In Digital Roots, 9 is treated as 0. Adding or subtracting 9 from any number does not change its Digital Root. This concept is used in 'Casting Out Nines'.",
        order: 2
    },
    { 
        parent: "stage-1-foundation",
        slug: "visualizing-patterns",
        title: "Visualizing Patterns",
        excerpt: "See mathematics as Mandalas and geometric symmetries.",
        body: "Vedic mathematics is inherently visual. By plotting Digital Roots onto a circle (Vedic Circle), we discover beautiful geometric patterns that reveal hidden symmetries in multiplication tables.",
        order: 3
    },
    { 
        parent: "stage-1-foundation",
        slug: "instant-complements",
        title: "Instant Complements",
        excerpt: "How to quickly find the 'best friend' of any number.",
        body: "Complements (Paraka) are numbers that add up to a base (10, 100, etc.). Quick calculation of complements is essential for the Nikhilam method. Example: The 10-complement of 7 is 3.",
        order: 4
    }
];

async function seed() {
    try {
        console.log("Seeding Stage 1 Modules...");
        const now = new Date().toISOString();
        
        for (const m of MODULES) {
            const exists = await db.get("SELECT 1 FROM cms_content WHERE slug = ?", m.slug);
            if (exists) {
                console.log(`Skipping ${m.slug}`);
                continue;
            }

            await db.run(`
                INSERT INTO cms_content (
                    content_id, content_type, slug, 
                    title_en, body_en, excerpt_en,
                    category, difficulty,
                    sort_order, published, featured,
                    tags,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, 
            crypto.randomUUID(), 'lesson', m.slug,
            m.title, m.body, m.excerpt,
            'lesson-module', 'Beginner',
            m.order, 1, 1,
            m.parent, // Use tags to link to parent stage for now
            now, now);
            console.log(`Seeded: ${m.slug}`);
        }
        
        console.log("All Modules seeded successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Seeding failed:", e);
        process.exit(1);
    }
}

seed();
