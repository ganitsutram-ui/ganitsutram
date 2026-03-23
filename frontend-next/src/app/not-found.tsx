/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

import type { Metadata } from 'next';
import NotFoundClient from './not-found-client';

export const metadata: Metadata = {
    title: 'त्रुटी ४०४ – GaṇitSūtram',
    description: 'हे पृष्ठ आढळले नाही. Page not found.',
};

export default function NotFound() {
    return <NotFoundClient />;
}
