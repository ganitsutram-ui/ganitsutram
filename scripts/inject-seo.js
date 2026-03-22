/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'websites');

// Pages configurations
const pages = {
    'portal/index.html': {
        domain: 'ganitsutram.com',
        path: '',
        title: 'GanitSūtram | Vedic Mathematics Portal',
        desc: 'A living knowledge ecosystem built on Vedic mathematics. Explore digital roots, Nikhilam, Ūrdhva-Tiryak and more.',
        jsonld: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebSite",
                    "name": "GanitSūtram",
                    "url": 'http://localhost:5173',
                    "description": "A living knowledge ecosystem built on Vedic mathematics. Explore digital roots, Nikhilam, Ūrdhva-Tiryak and more.",
                    "potentialAction": {
                        "@type": "SearchAction",
                        "target": {
                            "@type": "EntryPoint",
                            "urlTemplate": "https://ganitsutram.com/search.html?q={search_term_string}"
                        },
                        "query-input": "required name=search_term_string"
                    }
                },
                {
                    "@type": "Organization",
                    "name": "AITDL",
                    "url": "https://aitdl.com",
                    "foundingDate": "2026",
                    "founder": {
                        "@type": "Person",
                        "name": "Jawahar R Mallah"
                    },
                    "sameAs": ["https://aitdl.com"]
                }
            ]
        }
    },
    'portal/gate.html': {
        domain: 'ganitsutram.com',
        path: 'gate.html',
        title: 'GanitSūtram | Enter Platform',
        desc: 'Enter the GanitSūtram platform. Choose your learning persona — Student, Teacher, Explorer, or School.'
    },
    'portal/search.html': {
        domain: 'ganitsutram.com',
        path: 'search.html',
        title: 'GanitSūtram | Search',
        desc: 'Search Vedic mathematics discoveries, operations, sutras, and learning content on GanitSūtram.'
    },
    'portal/cms.html': { domain: 'ganitsutram.com', path: 'cms.html', title: 'CMS | GanitSūtram', desc: 'Content Management System.' },
    'portal/analytics.html': { domain: 'ganitsutram.com', path: 'analytics.html', title: 'Analytics | GanitSūtram', desc: 'Platform Analytics.' },
    'portal/api-docs.html': { domain: 'ganitsutram.com', path: 'api-docs.html', title: 'API Docs | GanitSūtram', desc: 'API Documentation.' },
    'portal/reset-password.html': { domain: 'ganitsutram.com', path: 'reset-password.html', title: 'Reset Password | GanitSūtram', desc: 'Reset your password.' },

    'discoveries/index.html': {
        domain: 'discover.ganitsutram.com',
        path: '',
        title: 'GanitSūtram | Discoveries',
        desc: "Explore mathematical discoveries — Digital Root patterns, Kaprekar's Constant, Vedic multiplication and more.",
        jsonld: {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Mathematical Discoveries",
            "url": '',
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Digital Root", "url": "https://discover.ganitsutram.com/#digital-root" },
                { "@type": "ListItem", "position": 2, "name": "Nikhilam Navataścaramaṃ Daśataḥ", "url": "https://discover.ganitsutram.com/#nikhilam" },
                { "@type": "ListItem", "position": 3, "name": "Ūrdhva-Tiryak", "url": "https://discover.ganitsutram.com/#urdhva" },
                { "@type": "ListItem", "position": 4, "name": "Kaprekar's Constant", "url": "https://discover.ganitsutram.com/#kaprekar" }
            ]
        }
    },

    'learning/index.html': {
        domain: 'learn.ganitsutram.com',
        path: '',
        title: 'GanitSūtram | Learning',
        desc: 'Learn Vedic mathematics at your own pace. Practice problems, track progress, and earn badges.',
        jsonld: {
            "@context": "https://schema.org",
            "@type": "Course",
            "name": "Vedic Mathematics",
            "description": "Learn Vedic mathematics at your own pace. Practice problems, track progress, and earn badges.",
            "provider": {
                "@type": "Organization",
                "name": "AITDL",
                "url": "https://aitdl.com"
            },
            "url": '',
            "educationalLevel": "Beginner to Advanced",
            "inLanguage": ["en", "hi", "sa"],
            "isAccessibleForFree": true
        }
    },
    'learning/leaderboard.html': {
        domain: 'learn.ganitsutram.com',
        path: 'leaderboard.html',
        title: 'GanitSūtram | Leaderboard',
        desc: 'The GanitSūtram Hall of Vedic Champions. Compete globally, earn badges, rise through the ranks.'
    },
    'learning/practice.html': {
        domain: 'learn.ganitsutram.com',
        path: 'practice.html',
        title: 'GanitSūtram | Practice',
        desc: 'Practice Vedic mathematics problems — Beginner, Intermediate, and Advanced levels.'
    },
    'learning/profile.html': { domain: 'learn.ganitsutram.com', path: 'profile.html', title: 'Profile | GanitSūtram', desc: 'Your learning profile.' },
    'learning/admin.html': { domain: 'learn.ganitsutram.com', path: 'admin.html', title: 'Admin | GanitSūtram', desc: 'Learning Administration.' },

    'knowledge-map/index.html': {
        domain: 'map.ganitsutram.com',
        path: '',
        title: 'GanitSūtram | Knowledge Map',
        desc: 'Explore the GanitSūtram Knowledge Graph — an interactive map of Vedic mathematics concepts, sutras, and their relationships.',
        jsonld: {
            "@context": "https://schema.org",
            "@type": "Dataset",
            "name": "GanitSūtram Knowledge Graph",
            "description": "Knowledge graph of Vedic mathematics concepts, operations, sutras and their relationships.",
            "url": '',
            "creator": {
                "@type": "Organization",
                "name": "AITDL"
            },
            "license": "https://aitdl.com/license",
            "isAccessibleForFree": true
        }
    },

    'research-lab/index.html': {
        domain: 'lab.ganitsutram.com',
        path: '',
        title: 'GanitSūtram | Research Lab',
        desc: 'Experiment with Vedic mathematics tools — Pattern Detector, Digit Frequency Analyser, Fibonacci Explorer and more.'
    },

    'solver/index.html': {
        domain: 'solve.ganitsutram.com',
        path: '',
        title: 'GanitSūtram | Solver',
        desc: 'The GanitSūtram Solver — compute Digital Root, Nikhilam, Ūrdhva, Kaprekar and all Vedic operations instantly.',
        jsonld: {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "GanitSūtram Solver",
            "url": '',
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Any",
            "description": "The GanitSūtram Solver — compute Digital Root, Nikhilam, Ūrdhva, Kaprekar and all Vedic operations instantly.",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            }
        }
    }
};

const resourceHints = `
    <!-- DNS prefetch -->
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    

    <!-- Preconnect -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- Preload critical font -->
    <link rel="preload" href="https://fonts.gstatic.com/s/spacegrotesk/v15/V8mQoQDjQSkGpu8Xl10K8t1wX8N1pQ.woff2" as="font" type="font/woff2" crossorigin>
`;

const criticalCSS = `
    <style id="gs-critical-css">
        :root { --bg-deep: #040110; --fg-main: #ffffff; --accent-primary: #ff5500; }
        body { margin: 0; background: var(--bg-deep); color: var(--fg-main); }
        .gs-nav { position: fixed; width: 100%; z-index: 100; background: rgba(4,1,16,0.95); }
    </style>
`;

Object.keys(pages).forEach(file => {
    const fullPath = path.join(ROOT, file);
    if (!fs.existsSync(fullPath)) {
        console.warn('File not found', fullPath);
        return;
    }
    let html = fs.readFileSync(fullPath, 'utf8');

    const config = pages[file];
    const url = `https://${config.domain}/${config.path}`;

    // Clean existing SEO tags (primitive regexes to prevent dupes)
    html = html.replace(/<meta name="description"[\s\S]*?>/, '');
    html = html.replace(/<link rel="canonical"[\s\S]*?>/, '');
    html = html.replace(/<meta property="?og:[\s\S]*?>/g, '');
    html = html.replace(/<meta name="?twitter:[\s\S]*?>/g, '');
    html = html.replace(/<meta name="?keywords"?[\s\S]*?>/g, '');
    html = html.replace(/<style id="gs-critical-css">[\s\S]*?<\/style>/, '');

    const seoTags = `
    <meta name="description" content="${config.desc}">
    <meta name="keywords" content="Vedic mathematics, GanitSūtram, digital root, nikhilam, ancient maths, AITDL, Jawahar R Mallah">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="GanitSūtram">
    <meta property="og:title" content="${config.title}">
    <meta property="og:description" content="${config.desc}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="https://ganitsutram.com/assets/og-image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale" content="en_IN">
    <meta property="og:locale:alternate" content="hi_IN">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@aitdl">
    <meta name="twitter:title" content="${config.title}">
    <meta name="twitter:description" content="${config.desc}">
    <meta name="twitter:image" content="https://ganitsutram.com/assets/og-image.png">
`;

    // Inject SEO tags just before </head>
    html = html.replace(/<\/head>/i, seoTags + '\n</head>');

    // Inject resource hints & critical CSS before the first <link rel="stylesheet">
    if (html.includes('<link rel="stylesheet"')) {
        html = html.replace('<link rel="stylesheet"', resourceHints + criticalCSS + '\n    <link rel="stylesheet"');
    } else {
        html = html.replace(/<\/head>/i, resourceHints + criticalCSS + '\n</head>');
    }

    // Inject JSON-LD
    if (config.jsonld) {
        html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '');
        const jsonLdScript = `\n    <script type="application/ld+json">\n${JSON.stringify(config.jsonld, null, 2)}\n    </script>\n`;
        html = html.replace(/<\/head>/i, jsonLdScript + '</head>');
    }

    // Include seo.js script near ganit-ui.js
    if (!html.includes('seo.js')) {
        let regex = /(<script src="[^"]*ganit-ui\.js"><\/script>)/;
        if (html.match(regex)) {
            html = html.replace(regex, `<script src="../../ui-core/js/seo.js"></script>\n    $1`);
        } else {
            html = html.replace('</body>', `<script src="../../ui-core/js/seo.js"></script>\n</body>`);
        }
    }

    // Add skip link if not present
    if (!html.includes('gs-skip-link')) {
        html = html.replace(/<body[^>]*>/i, `$&
    <a href="#main-content" class="gs-skip-link">Skip to main content</a>`);
        // We'll trust there is a main tag to skip to or we can add id="main-content" to <main>
        html = html.replace(/<main>/i, '<main id="main-content">');
    }

    // Update <script> tags for defer/async
    // We defer all UI core and custom scripts
    html = html.replace(/<script src="([^"]+)"><\/script>/g, (match, src) => {
        if (src.includes('http')) return `<script src="${src}" async></script>`; // external
        return `<script src="${src}" defer></script>`;
    });

    // Update images lazy loading and async decoding
    html = html.replace(/<img ([^>]+)>/g, (match, attrs) => {
        let newAttrs = attrs;
        if (!newAttrs.includes('loading=')) newAttrs += ' loading="lazy"';
        if (!newAttrs.includes('decoding=')) newAttrs += ' decoding="async"';
        if (!newAttrs.includes('width=')) newAttrs += ' width="50" height="50"'; // Fallback
        return `<img ${newAttrs}>`;
    });

    fs.writeFileSync(fullPath, html, 'utf8');
    console.log('Updated ' + file);
});
