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
            <div className="gs-footer-copy">
                <span>© GanitSūtram | AITDL | aitdl.com</span> &nbsp;|&nbsp;
                <span>Vikram Samvat: VS 2082 &nbsp;|&nbsp; Gregorian: 2026-03-07</span>
            </div>
        </footer>
    );
}
