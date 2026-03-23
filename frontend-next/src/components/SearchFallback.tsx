/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";
import React from 'react';
import { useI18n } from '@/context/I18nContext';

export default function SearchFallback() {
    const { t } = useI18n();
    return (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
            {t('search.loadingSearch')}
        </div>
    );
}
