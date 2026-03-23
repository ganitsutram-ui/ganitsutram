/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

import React, { Suspense } from 'react';
import SearchClient from '@/components/SearchClient';
import SearchFallback from '@/components/SearchFallback';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Search Discoveries',
    description: 'Search through the ancient wisdom of Vedic Mathematics. Find sutras, concepts, and mathematical discoveries.',
};

export default function SearchPage() {
    return (
        <Suspense fallback={<SearchFallback />}>
            <SearchClient />
        </Suspense>
    );
}
