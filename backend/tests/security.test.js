/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

/*
 * GANITSUTRAM
 * A Living Knowledge Ecosystem for Mathematical Discovery
 *
 * "यथा शिखा मयूराणां नागानां मणयो यथा
 *  तद्वद् वेदाङ्गशास्त्राणां गणितं मूर्ध्नि वर्तते"
 *
 * As the crest of a peacock, as the gem on the hood
 * of a cobra — so stands mathematics at the crown
 * of all knowledge.
 *                                       — Brahmagupta
 *                                         628 CE · Brahmasphutasiddhanta
 *
 * Creator:   Jawahar R. Mallah
 * Email:     jawahar@aitdl.com
 * GitHub:    https://github.com/jawahar-mallah
 * Websites:  https://ganitsutram.com
 *            https://aitdl.com
 *
 * Then:  628 CE · Brahmasphutasiddhanta
 * Now:   8 March MMXXVI · Vikram Samvat 2082
 *
 * Copyright © 2026 Jawahar R. Mallah · AITDL | GANITSUTRAM
 *
 * Developer Note:
 * If you intend to reuse this code, please respect
 * the creator and the work behind it.
 */
/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 *
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-08
 *
 * Purpose: Verification tests for security infrastructure.
 */

const { getClientIP } = require('../middleware/ip-blacklist');
const securityRepo = require('../database/security-repository');
const ipBlacklist = require('../middleware/ip-blacklist');
const threatDetector = require('../middleware/threat-detector');

async function testSecurity() {
    console.log('--- Starting Security Infrastructure Tests ---');

    // 1. Test getClientIP
    const mockReqCF = {
        headers: { 'cf-connecting-ip': '1.1.1.1' },
        socket: { remoteAddress: '127.0.0.1' }
    };
    console.log('Testing getClientIP (Cloudflare):', getClientIP(mockReqCF) === '1.1.1.1' ? '✅' : '❌');

    const mockReqXFF = {
        headers: { 'x-forwarded-for': '2.2.2.2, 3.3.3.3' },
        socket: { remoteAddress: '127.0.0.1' }
    };
    console.log('Testing getClientIP (XFF):', getClientIP(mockReqXFF) === '2.2.2.2' ? '✅' : '❌');

    // 2. Test Blacklist Logic
    const testIP = '9.9.9.9';
    await securityRepo.blacklistIP(testIP, 'manual_test', 5, 'admin');
    ipBlacklist.invalidateCache();
    await ipBlacklist({ headers: {}, socket: { remoteAddress: testIP } }, { status: () => ({ json: () => { } }) }, () => { }); // Trigger cache refresh

    // Check if blacklisted
    const isBlocked = await securityRepo.isBlacklisted(testIP);
    console.log('Testing securityRepo.isBlacklisted (true case):', isBlocked === true ? '✅' : '❌');

    // 3. Test Whitelist Logic
    const whiteIP = '8.8.8.8';
    await securityRepo.whitelistIP(whiteIP, 'test_white');
    const isWhite = await securityRepo.isWhitelisted(whiteIP);
    console.log('Testing securityRepo.isWhitelisted:', isWhite === true ? '✅' : '❌');

    // 4. Test Threat Detection Signature
    const mockReqThreat = {
        clientIP: '7.7.7.7',
        originalUrl: '/api/test/../../etc/passwd',
        method: 'GET',
        headers: { 'user-agent': 'sqlmap/1.0' }
    };

    // We can't easily run the middleware without a full express app and supertest in this script environment easily,
    // but we can test the repository logging and thresholds.

    await threatDetector.handleThreat(mockReqThreat.clientIP, 'scanner', mockReqThreat, true);
    const blockedScanner = await securityRepo.isBlacklisted(mockReqThreat.clientIP);
    console.log('Testing Auto-block (Scanner):', blockedScanner === true ? '✅' : '❌');

    // Test SQLi threshold
    const sqliIP = '6.6.6.6';
    for (let i = 0; i < 3; i++) {
        await threatDetector.handleThreat(sqliIP, 'sql_injection', {
            originalUrl: '/',
            method: 'POST',
            body: { q: '1 OR 1=1' },
            headers: { 'user-agent': 'node-test' }
        });
    }
    ipBlacklist.invalidateCache();
    const blockedSQLi = await securityRepo.isBlacklisted(sqliIP);
    console.log('Testing Auto-block (SQLi Threshold=3):', blockedSQLi === true ? '✅' : '❌');

    // Clean up
    await securityRepo.removeFromBlacklist(testIP);
    await securityRepo.removeFromBlacklist(mockReqThreat.clientIP);
    await securityRepo.removeFromBlacklist(sqliIP);
    await securityRepo.removeFromWhitelist(whiteIP);

    console.log('--- Security Tests Completed ---');
}

if (require.main === module) {
    testSecurity().catch(console.error);
}
