/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

import React from 'react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="gs-footer">
            <div className="gs-footer-inner">
                <div className="gs-footer-brand">
                    <div className="gs-nav-logo">
                        <span className="gs-nav-logo-dev">गणित</span>GanitSūtram
                    </div>
                    <p>A mathematical knowledge ecosystem by AITDL.</p>
                </div>
                <div className="gs-footer-nav-cols">
                    <div className="gs-footer-col">
                        <div className="gs-footer-col-title">Learn</div>
                        <Link href="/gate">Enter Gate</Link>
                        <Link href="/learning">Learning Hub</Link>
                    </div>
                </div>
            </div>
            <div className="gs-footer-center">
                <div className="gs-vikram-badge">
                    <span className="gs-vikram-label">Vikram Samvat</span>
                    <span className="gs-vikram-val">VS 2083</span>
                </div>
            </div>
            <div className="gs-footer-copy">
                <span>© 2026 GanitSūtram | AITDL Network | aitdl.com</span>
            </div>
        </footer>
    );
}
