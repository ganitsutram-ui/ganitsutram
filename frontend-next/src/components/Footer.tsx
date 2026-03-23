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
            <div className="gs-container">
                <div className="gs-footer-content">
                    <div className="gs-footer-brand">
                        <Link href="/" className="gs-nav-logo">
                            <span className="gs-nav-logo-dev">गणित</span>GanitSūtram
                        </Link>
                        <p className="gs-footer-tagline">{t('footer.tagline')}</p>
                    </div>

                    <div className="gs-footer-nav">
                        <Link href="/gate" className="gs-footer-link">{t('footer.enterGate')}</Link>
                        <Link href="/learning" className="gs-footer-link">{t('footer.learningHub')}</Link>
                        <Link href="/solver" className="gs-footer-link">{t('nav.solver')}</Link>
                    </div>

                    <div className="gs-vikram-badge-sleek">
                        <span className="label">{t('footer.vikramLabel')}</span>
                        <span className="value">VS 2083</span>
                    </div>
                </div>

                <div className="gs-footer-bottom">
                    <p className="gs-footer-copy">{t('footer.copyright')}</p>
                </div>
            </div>
        </footer>
    );
}
