/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

import React from 'react';

export default function JsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GaṇitSūtram",
    "url": "https://ganitsutram.com",
    "logo": "https://ganitsutram.com/logo.png",
    "sameAs": [
      "https://twitter.com/aitdlnetwork",
      "https://github.com/ganitsutram-ui"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "aitdlnetwork@outlook.com",
      "contactType": "technical support"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "GaṇitSūtram",
    "url": "https://ganitsutram.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://ganitsutram.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
