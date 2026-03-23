/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

"use client";
import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/context/I18nContext';

export default function Footer() {
    const { t } = useI18n();

    return (
        <footer className="gs-footer">
            <div className="gs-footer-inner">
                <div className="gs-footer-brand">
                    <div className="gs-nav-logo">
                        <span className="gs-nav-logo-dev">गणित</span>GanitSūtram
                    </div>
                    <p>{t('footer.tagline')}</p>
                </div>
                <div className="gs-footer-nav-cols">
                    <div className="gs-footer-col">
                        <div className="gs-footer-col-title">{t('nav.learn')}</div>
                        <Link href="/gate">{t('footer.enterGate')}</Link>
                        <Link href="/learning">{t('footer.learningHub')}</Link>
                    </div>
                </div>
            </div>
            <div className="gs-footer-center">
                <div className="gs-vikram-badge">
                    <span className="gs-vikram-label">{t('footer.vikramLabel')}</span>
                    <span className="gs-vikram-val">VS 2083</span>
                </div>
            </div>
            <div className="gs-footer-copy">
                <span>{t('footer.copyright')}</span>
            </div>
        </footer>
    );
}
