"use client";

import React, { useEffect } from "react";

const SecurityWatermark: React.FC = () => {
    useEffect(() => {
        const hostname = window.location.hostname;
        const authorizedDomains = ["ganitsutram.com", "aitdl.com", "localhost", "127.0.0.1"];

        if (!authorizedDomains.some(domain => hostname.includes(domain))) {
            console.warn(
                "⚠️ UNAUTHORIZED USAGE DETECTED\n" +
                "This software (GanitSūtram) is property of AITDL Network.\n" +
                "Contact aitdlnetwork@outlook.com for licensing."
            );
        }
    }, []);

    return (
        <div 
            id="aitdl-security-watermark"
            className="fixed bottom-4 right-4 z-[9999] pointer-events-none select-none"
        >
            <div className="text-[10px] font-ancient text-white/5 tracking-widest whitespace-nowrap">
                GANITSUTRAM | AITDL NETWORK © 2026
            </div>
        </div>
    );
};

export default SecurityWatermark;
