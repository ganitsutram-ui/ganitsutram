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
/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 *
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-08
 *
 * Purpose: SEO utility for dynamic meta tags, Open Graph, Twitter Cards, and JSON-LD structured data.
 */

window.GanitSEO = (function () {
    'use strict';
    const { CANONICAL_BASE, PORTAL_URL, DISCOVER_URL } = window.GanitConfig;

    function setMetaContent(nameOrProperty, content) {
        if (!content) return;

        let el = document.querySelector(`meta[name="${nameOrProperty}"]`);
        if (!el) el = document.querySelector(`meta[property="${nameOrProperty}"]`);

        if (el) {
            el.setAttribute('content', content);
        } else {
            const newMeta = document.createElement('meta');
            if (nameOrProperty.startsWith('og:') || nameOrProperty.startsWith('twitter:')) {
                // Technically og: uses property, twitter uses name, but some fallbacks use property/name interchangeably
                if (nameOrProperty.startsWith('og:')) {
                    newMeta.setAttribute('property', nameOrProperty);
                } else {
                    newMeta.setAttribute('name', nameOrProperty);
                }
            } else {
                newMeta.setAttribute('name', nameOrProperty);
            }
            newMeta.setAttribute('content', content);
            document.head.appendChild(newMeta);
        }
    }

    function removeLdJson(type) {
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        scripts.forEach(script => {
            try {
                const data = JSON.parse(script.innerHTML);
                if (data['@type'] === type || (data['@graph'] && data['@graph'].some(g => g['@type'] === type))) {
                    script.remove();
                }
            } catch (e) { }
        });
    }

    function appendLdJson(obj) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.innerHTML = JSON.stringify(obj);
        document.head.appendChild(script);
    }

    function updatePageMeta({ title, description, url, type, image }) {
        if (title) {
            document.title = title;
            setMetaContent('og:title', title);
            setMetaContent('twitter:title', title);
        }
        if (description) {
            setMetaContent('description', description);
            setMetaContent('og:description', description);
            setMetaContent('twitter:description', description);
        }
        if (url) {
            setMetaContent('og:url', url);
            let link = document.querySelector('link[rel="canonical"]');
            if (link) {
                link.setAttribute('href', url);
            } else {
                link = document.createElement('link');
                link.setAttribute('rel', 'canonical');
                link.setAttribute('href', url);
                document.head.appendChild(link);
            }
        }
        if (type) {
            setMetaContent('og:type', type);
        }
        if (image) {
            setMetaContent('og:image', image);
            setMetaContent('twitter:image', image);
        }
    }

    function setDiscoveryMeta(discovery) {
        const title = `${discovery.title} | GanitSūtram`;
        const description = discovery.excerpt_en || discovery.excerpt_hi || "Mathematical discovery on GanitSūtram.";
        const url = `${DISCOVER_URL}/#${discovery.slug}`;

        updatePageMeta({
            title,
            description,
            url,
            type: 'article',
            image: generateOGImage(discovery.title, 'Mathematical Discovery')
        });

        // Breadcrumbs JSON-LD
        removeLdJson('BreadcrumbList');
        appendLdJson({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": PORTAL_URL
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Discoveries",
                    "item": DISCOVER_URL
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": discovery.title,
                    "item": url
                }
            ]
        });
    }

    function setSearchMeta(query, resultCount) {
        if (!query) {
            updatePageMeta({ title: "Search | GanitSūtram" });
            return;
        }
        updatePageMeta({
            title: `Search: ${query} | GanitSūtram`,
            description: `${resultCount} results for '${query}' on GanitSūtram.`
        });
    }

    function injectBreadcrumbs(crumbs, containerEl) {
        if (!containerEl) return;

        let html = '<nav aria-label="breadcrumb" class="gs-breadcrumb"><ol style="list-style:none;padding:0;display:flex;gap:8px;font-size:0.85rem;color:rgba(255,255,255,0.6);margin-bottom:16px;">';

        const ldItems = [];

        crumbs.forEach((crumb, idx) => {
            const isLast = idx === crumbs.length - 1;
            if (isLast) {
                html += `<li aria-current="page" style="color:var(--accent-primary)">${crumb.label}</li>`;
            } else {
                html += `<li><a href="${crumb.url}" style="color:inherit;text-decoration:none">${crumb.label}</a> <span aria-hidden="true">&raquo;</span></li>`;
            }

            ldItems.push({
                "@type": "ListItem",
                "position": idx + 1,
                "name": crumb.label,
                "item": crumb.url || window.location.href
            });
        });
        html += '</ol></nav>';
        containerEl.innerHTML = html;

        removeLdJson('BreadcrumbList');
        appendLdJson({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": ldItems
        });
    }

    function generateOGImage(title, subtitle) {
        // Phase 21 Enhancement Stub
        // Returns static template until canvas implementation
        return `${CANONICAL_BASE}/assets/og-image.png`;
    }

    function init() {
        // Just verify existing tags. Real work is done when specific methods are called.
        // For static pages, tags should be populated in HTML.
    }

    return {
        init,
        updatePageMeta,
        setDiscoveryMeta,
        setSearchMeta,
        injectBreadcrumbs,
        generateOGImage
    };

})();
