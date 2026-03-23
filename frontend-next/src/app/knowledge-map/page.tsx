/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

import React from 'react';
import KnowledgeMapClient from '@/components/KnowledgeMapClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Visual Knowledge Map',
    description: 'Explore the cosmic connections between Vedic mathematical concepts through our interactive visual knowledge graph.',
};

export default function KnowledgeMapPage() {
    return <KnowledgeMapClient />;
}
