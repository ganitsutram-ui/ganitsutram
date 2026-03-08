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
/*
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07

Purpose: API Documentation page — data-driven rendering, sidebar nav,
         IntersectionObserver scroll-spy, Try It panels with live fetch,
         syntax highlighting, copy-to-clipboard.
*/

(function () {
    'use strict';

    const API_BASE = window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api'
        : 'https://api.ganitsutram.com/api';

    // ─── ENDPOINT DATA ───────────────────────────────────────────────
    const SECTIONS = [
        {
            id: 'auth', label: 'Authentication',
            endpoints: [
                {
                    id: 'auth-register', method: 'POST', path: '/auth/register', auth: 'public',
                    desc: 'Register a new user account. Returns a JWT token on success.',
                    params: [
                        { name: 'email', type: 'string', req: true, desc: 'Valid email address' },
                        { name: 'password', type: 'string', req: true, desc: 'Min 8 characters' },
                        { name: 'role', type: 'string', req: true, desc: 'student | teacher | parent | adult | school | admin' }
                    ],
                    curl: `curl -X POST ${API_BASE}/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com","password":"Test1234!","role":"student"}'`,
                    success: 201, successBody: `{"token":"eyJ...","user":{"userId":"uuid","email":"test@example.com","role":"student"}}`,
                    errors: [{ s: 400, c: 'Missing fields' }, { s: 409, c: 'Email already registered' }],
                    tryFields: [
                        { key: 'email', label: 'email', val: 'test@example.com', type: 'text' },
                        { key: 'password', label: 'password', val: 'Test1234!', type: 'text' },
                        { key: 'role', label: 'role', val: 'student', type: 'text' }
                    ]
                },
                {
                    id: 'auth-login', method: 'POST', path: '/auth/login', auth: 'public',
                    desc: 'Authenticate an existing user. Returns a JWT token.',
                    params: [
                        { name: 'email', type: 'string', req: true, desc: 'Registered email' },
                        { name: 'password', type: 'string', req: true, desc: 'Account password' }
                    ],
                    curl: `curl -X POST ${API_BASE}/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com","password":"Test1234!"}'`,
                    success: 200, successBody: `{"token":"eyJ...","user":{"userId":"uuid","email":"test@example.com","role":"student"}}`,
                    errors: [{ s: 400, c: 'Missing credentials' }, { s: 401, c: 'Invalid email or password' }],
                    tryFields: [
                        { key: 'email', label: 'email', val: 'test@example.com', type: 'text' },
                        { key: 'password', label: 'password', val: 'Test1234!', type: 'text' }
                    ]
                },
                {
                    id: 'auth-me', method: 'GET', path: '/auth/me', auth: 'auth',
                    desc: 'Returns the profile of the currently authenticated user.',
                    params: [], curl: `curl ${API_BASE}/auth/me \\
  -H "Authorization: Bearer <token>"`,
                    success: 200, successBody: `{"user":{"userId":"uuid","email":"you@example.com","role":"student"},"attribution":"GanitSūtram | AITDL"}`,
                    errors: [{ s: 401, c: 'Missing or invalid token' }], tryFields: []
                },
                {
                    id: 'auth-logout', method: 'POST', path: '/auth/logout', auth: 'auth',
                    desc: 'Invalidates the current session token.',
                    params: [], curl: `curl -X POST ${API_BASE}/auth/logout \\
  -H "Authorization: Bearer <token>"`,
                    success: 200, successBody: `{"message":"Logged out."}`,
                    errors: [{ s: 401, c: 'Unauthorised' }], tryFields: []
                }
            ]
        },
        {
            id: 'solver', label: 'Solver',
            endpoints: [
                {
                    id: 'solve', method: 'POST', path: '/solve', auth: 'public',
                    desc: 'Run any Vedic mathematical operation. Authenticated users have results auto-saved to progress.',
                    params: [
                        { name: 'operation', type: 'string', req: true, desc: 'Operation identifier (see table below)' },
                        { name: 'input', type: 'number', req: false, desc: 'Single-input operations' },
                        { name: 'inputA', type: 'number', req: false, desc: 'First operand (dual-input ops)' },
                        { name: 'inputB', type: 'number', req: false, desc: 'Second operand (dual-input ops)' }
                    ],
                    curl: `curl -X POST ${API_BASE}/solve \\
  -H "Content-Type: application/json" \\
  -d '{"operation":"digital-root","input":98}'`,
                    success: 200, successBody: `{"operation":"digital-root","input":98,"result":8,"attribution":"GanitSūtram | AITDL"}`,
                    errors: [{ s: 400, c: 'Missing operation or unknown operation' }, { s: 422, c: 'Invalid input for this operation' }],
                    tryFields: [
                        {
                            key: 'operation', label: 'operation', val: 'digital-root', type: 'select', opts: [
                                'digital-root', 'digital-root-steps', 'squares-ending-5', 'squares-ending-5-steps',
                                'multiply-by-11', 'multiply-by-11-steps', 'nikhilam', 'nikhilam-steps',
                                'urdhva', 'urdhva-steps', 'kaprekar', 'fibonacci', 'square-pattern', 'analyse-sequence'
                            ]
                        },
                        { key: 'input', label: 'input', val: '98', type: 'text' },
                        { key: 'inputA', label: 'inputA (dual ops)', val: '', type: 'text' },
                        { key: 'inputB', label: 'inputB (dual ops)', val: '', type: 'text' }
                    ]
                }
            ]
        },
        {
            id: 'concepts', label: 'Concepts',
            endpoints: [
                {
                    id: 'get-concepts', method: 'GET', path: '/concepts', auth: 'public',
                    desc: 'Returns all Vedic mathematical concept definitions used by the Solver.',
                    params: [], curl: `curl ${API_BASE}/concepts`,
                    success: 200, successBody: `{"concepts":[{"name":"digital-root","sutra":"बीजांक","description":"..."}],"attribution":"GanitSūtram | AITDL"}`,
                    errors: [], tryFields: []
                }
            ]
        },
        {
            id: 'patterns', label: 'Patterns',
            endpoints: [
                {
                    id: 'patterns-vedic', method: 'GET', path: '/patterns/vedic', auth: 'public',
                    desc: 'Returns all Vedic pattern definitions including sutras, descriptions, and examples.',
                    params: [], curl: `curl ${API_BASE}/patterns/vedic`,
                    success: 200, successBody: `{"patterns":[{"name":"nikhilam","sutra":"निखिलं...","description":"..."}],"total":6,"attribution":"GanitSūtram | AITDL"}`,
                    errors: [], tryFields: []
                },
                {
                    id: 'patterns-vedic-name', method: 'GET', path: '/patterns/vedic/:name', auth: 'public',
                    desc: 'Returns a single Vedic pattern by its identifier name.',
                    params: [{ name: ':name', type: 'string', req: true, desc: 'Pattern name e.g. nikhilam, urdhva, digital-root' }],
                    curl: `curl ${API_BASE}/patterns/vedic/nikhilam`,
                    success: 200, successBody: `{"pattern":{"name":"nikhilam","sutra":"निखिलं नवतश्चरमं दशततः","description":"..."},"attribution":"GanitSūtram | AITDL"}`,
                    errors: [{ s: 404, c: 'Pattern not found' }],
                    tryFields: [{ key: 'name', label: ':name (path param)', val: 'nikhilam', type: 'text' }]
                },
                {
                    id: 'patterns-analyse', method: 'POST', path: '/patterns/analyse', auth: 'public',
                    desc: 'Analyses a number sequence for Vedic patterns, digital root cycles, and structural relationships.',
                    params: [{ name: 'numbers', type: 'number[]', req: true, desc: 'Array of integers, min 3, max 100' }],
                    curl: `curl -X POST ${API_BASE}/patterns/analyse \\
  -H "Content-Type: application/json" \\
  -d '{"numbers":[1,4,9,16,25,36]}'`,
                    success: 200, successBody: `{"analysis":{"length":6,"min":1,"max":36,"digitalRoots":[1,4,9,7,7,9],"cycleDetected":false},"attribution":"GanitSūtram | AITDL"}`,
                    errors: [{ s: 400, c: 'numbers must be an array of 3–100 integers' }],
                    tryFields: [{ key: 'numbers', label: 'numbers (JSON array)', val: '[1,4,9,16,25,36]', type: 'text' }]
                },
                {
                    id: 'patterns-drCycle', method: 'POST', path: '/patterns/digital-root-cycle', auth: 'public',
                    desc: 'Detects digital root cycles within a numeric range.',
                    params: [
                        { name: 'start', type: 'number', req: true, desc: 'Range start (integer ≥ 1)' },
                        { name: 'end', type: 'number', req: true, desc: 'Range end (integer, max 1000)' }
                    ],
                    curl: `curl -X POST ${API_BASE}/patterns/digital-root-cycle \\
  -H "Content-Type: application/json" \\
  -d '{"start":1,"end":27}'`,
                    success: 200, successBody: `{"cycle":{"range":[1,27],"roots":[1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9],"periodLength":9},"attribution":"GanitSūtram | AITDL"}`,
                    errors: [{ s: 400, c: 'Invalid range' }],
                    tryFields: [
                        { key: 'start', label: 'start', val: '1', type: 'text' },
                        { key: 'end', label: 'end', val: '27', type: 'text' }
                    ]
                },
                {
                    id: 'patterns-kaprekar', method: 'POST', path: '/patterns/kaprekar', auth: 'public',
                    desc: 'Runs the Kaprekar routine on a 4-digit number, showing each step toward the constant 6174.',
                    params: [{ name: 'n', type: 'number', req: true, desc: '4-digit integer (not all same digits)' }],
                    curl: `curl -X POST ${API_BASE}/patterns/kaprekar \\
  -H "Content-Type: application/json" \\
  -d '{"n":3087}'`,
                    success: 200, successBody: `{"result":{"steps":[{"iteration":1,"desc":"8730 - 0378 = 8352"},{"iteration":2,"desc":"8532 - 2358 = 6174"}],"constant":6174,"iterationsNeeded":2},"attribution":"GanitSūtram | AITDL"}`,
                    errors: [{ s: 400, c: 'Must be a 4-digit number with non-identical digits' }],
                    tryFields: [{ key: 'n', label: 'n (4-digit)', val: '3087', type: 'text' }]
                },
                {
                    id: 'patterns-fibonacci', method: 'POST', path: '/patterns/fibonacci', auth: 'public',
                    desc: 'Generates Fibonacci numbers and their digital roots up to the given count, revealing the 24-step cycle.',
                    params: [{ name: 'count', type: 'number', req: true, desc: 'Number of terms (1–200)' }],
                    curl: `curl -X POST ${API_BASE}/patterns/fibonacci \\
  -H "Content-Type: application/json" \\
  -d '{"count":24}'`,
                    success: 200, successBody: `{"fibonacci":[1,1,2,3,5,8,13,21,34,55,89,144],"digitalRoots":[1,1,2,3,5,8,4,3,7,1,8,9],"attribution":"GanitSūtram | AITDL"}`,
                    errors: [{ s: 400, c: 'count must be between 1 and 200' }],
                    tryFields: [{ key: 'count', label: 'count', val: '24', type: 'text' }]
                },
                {
                    id: 'patterns-squares', method: 'POST', path: '/patterns/squares', auth: 'public',
                    desc: 'Detects the digital root pattern in perfect squares up to the given count.',
                    params: [{ name: 'count', type: 'number', req: true, desc: 'Number of squares to analyse (1–100)' }],
                    curl: `curl -X POST ${API_BASE}/patterns/squares \\
  -H "Content-Type: application/json" \\
  -d '{"count":9}'`,
                    success: 200, successBody: `{"squares":[{"n":1,"square":1,"digitalRoot":1},{"n":2,"square":4,"digitalRoot":4}],"attribution":"GanitSūtram | AITDL"}`,
                    errors: [{ s: 400, c: 'count must be 1–100' }],
                    tryFields: [{ key: 'count', label: 'count', val: '9', type: 'text' }]
                }
            ]
        },
        {
            id: 'discoveries', label: 'Discoveries',
            endpoints: [
                {
                    id: 'get-discoveries', method: 'GET', path: '/discoveries', auth: 'public',
                    desc: 'Returns all mathematical discoveries with optional category filtering.',
                    params: [{ name: 'category', type: 'string', req: false, desc: 'core | vedic | engine | pattern | foundation' }],
                    curl: `curl "${API_BASE}/discoveries?category=vedic"`,
                    success: 200, successBody: `{"discoveries":[{"slug":"nikhilam","title":"Nikhilam","category":"vedic","difficulty":"intermediate"}],"total":2,"attribution":"GanitSūtram | AITDL"}`,
                    errors: [],
                    tryFields: [{ key: 'category', label: 'category (optional)', val: '', type: 'text' }]
                },
                {
                    id: 'get-discovery', method: 'GET', path: '/discoveries/:slug', auth: 'public',
                    desc: 'Returns full detail for a single discovery including patterns, sutras, and examples.',
                    params: [{ name: ':slug', type: 'string', req: true, desc: 'Discovery slug e.g. digital-root, nikhilam' }],
                    curl: `curl ${API_BASE}/discoveries/digital-root`,
                    success: 200, successBody: `{"discovery":{"slug":"digital-root","title":"Digital Root","sutra":"बीजांक","patterns":[{"label":"9-cycle","desc":"..."}]},"attribution":"GanitSūtram | AITDL"}`,
                    errors: [{ s: 404, c: 'Discovery not found' }],
                    tryFields: [{ key: 'slug', label: ':slug (path param)', val: 'digital-root', type: 'text' }]
                }
            ]
        },
        {
            id: 'practice', label: 'Practice',
            endpoints: [
                {
                    id: 'get-practice', method: 'GET', path: '/practice', auth: 'public',
                    desc: 'Generates a set of practice questions. Correct answers are NOT returned — they must be submitted via /practice/check.',
                    params: [
                        { name: 'operation', type: 'string', req: false, desc: 'Operation filter or "all"' },
                        { name: 'difficulty', type: 'string', req: false, desc: 'beginner | intermediate | advanced' },
                        { name: 'count', type: 'number', req: false, desc: 'Questions to generate (default 5)' }
                    ],
                    curl: `curl "${API_BASE}/practice?operation=all&difficulty=beginner&count=3"`,
                    success: 200, successBody: `{"questions":[{"questionId":"uuid","operation":"digital-root","question":"Digital Root of 63?","difficulty":"beginner"}],"attribution":"GanitSūtram | AITDL"}`,
                    errors: [],
                    tryFields: [
                        { key: 'operation', label: 'operation', val: 'all', type: 'text' },
                        { key: 'difficulty', label: 'difficulty', val: 'beginner', type: 'text' },
                        { key: 'count', label: 'count', val: '3', type: 'text' }
                    ]
                },
                {
                    id: 'practice-check', method: 'POST', path: '/practice/check', auth: 'public',
                    desc: 'Validates a user\'s answer server-side. Saves attempt to database for authenticated users.',
                    params: [
                        { name: 'questionId', type: 'string', req: false, desc: 'ID from /practice response' },
                        { name: 'operation', type: 'string', req: true, desc: 'Operation type' },
                        { name: 'question', type: 'string', req: true, desc: 'The original question text' },
                        { name: 'userAnswer', type: 'string', req: true, desc: 'The user\'s submitted answer' },
                        { name: 'difficulty', type: 'string', req: false, desc: 'Used for logging' }
                    ],
                    curl: `curl -X POST ${API_BASE}/practice/check \\
  -H "Content-Type: application/json" \\
  -d '{"operation":"digital-root","question":"Digital Root of 63?","userAnswer":"9","difficulty":"beginner"}'`,
                    success: 200, successBody: `{"isCorrect":true,"correctAnswer":"9","message":"Correct! Well done.","attribution":"GanitSūtram | AITDL"}`,
                    errors: [{ s: 400, c: 'Missing userAnswer' }],
                    tryFields: [
                        { key: 'operation', label: 'operation', val: 'digital-root', type: 'text' },
                        { key: 'question', label: 'question', val: 'Digital Root of 63?', type: 'text' },
                        { key: 'userAnswer', label: 'userAnswer', val: '9', type: 'text' },
                        { key: 'difficulty', label: 'difficulty', val: 'beginner', type: 'text' }
                    ]
                },
                {
                    id: 'practice-stats', method: 'GET', path: '/practice/stats', auth: 'auth',
                    desc: 'Returns the authenticated user\'s aggregated practice performance — accuracy, attempts per operation, and mastery.',
                    params: [], curl: `curl ${API_BASE}/practice/stats \\
  -H "Authorization: Bearer <token>"`,
                    success: 200, successBody: `{"stats":{"totalAttempts":42,"overallAccuracy":71,"byOperation":[{"operation":"digital-root","attempts":20,"correct":17,"accuracy":85}]},"attribution":"GanitSūtram | AITDL"}`,
                    errors: [{ s: 401, c: 'Unauthorised' }], tryFields: []
                }
            ]
        },
        {
            id: 'progress', label: 'Progress',
            endpoints: [
                {
                    id: 'get-progress', method: 'GET', path: '/user-progress', auth: 'auth',
                    desc: 'Returns paginated progress entries for the authenticated user.',
                    params: [
                        { name: 'operation', type: 'string', req: false, desc: 'Filter by operation type' },
                        { name: 'limit', type: 'number', req: false, desc: 'Page size (default 50)' },
                        { name: 'offset', type: 'number', req: false, desc: 'Pagination offset (default 0)' }
                    ],
                    curl: `curl "${API_BASE}/user-progress?limit=10&offset=0" \\
  -H "Authorization: Bearer <token>"`,
                    success: 200, successBody: `{"userId":"uuid","total":24,"entries":[{"operation":"digital-root","input":98,"result":8,"solvedAt":"2026-03-07T10:00:00Z"}],"attribution":"GanitSūtram | AITDL"}`,
                    errors: [{ s: 401, c: 'Unauthorised' }], tryFields: []
                },
                {
                    id: 'post-progress', method: 'POST', path: '/user-progress', auth: 'auth',
                    desc: 'Manually saves a solved problem to the user\'s progress history.',
                    params: [
                        { name: 'operation', type: 'string', req: true, desc: 'Operation identifier' },
                        { name: 'input', type: 'any', req: false, desc: 'Single input (if applicable)' },
                        { name: 'inputA', type: 'any', req: false, desc: 'First operand (dual ops)' },
                        { name: 'inputB', type: 'any', req: false, desc: 'Second operand (dual ops)' },
                        { name: 'result', type: 'any', req: true, desc: 'Computed result' },
                        { name: 'steps', type: 'any[]', req: false, desc: 'Step-by-step breakdown' }
                    ],
                    curl: `curl -X POST ${API_BASE}/user-progress \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"operation":"digital-root","input":98,"result":8}'`,
                    success: 201, successBody: `{"progressId":"uuid","savedAt":"2026-03-07T10:00:00Z","attribution":"GanitSūtram | AITDL"}`,
                    errors: [{ s: 401, c: 'Unauthorised' }, { s: 422, c: 'Missing required fields' }], tryFields: []
                },
                {
                    id: 'progress-stats', method: 'GET', path: '/user-progress/stats', auth: 'auth',
                    desc: 'Returns computed statistics: total solved, streak, operations breakdown.',
                    params: [], curl: `curl ${API_BASE}/user-progress/stats \\
  -H "Authorization: Bearer <token>"`,
                    success: 200, successBody: `{"stats":{"totalSolved":24,"streak":3,"byOperation":[{"operation":"digital-root","count":10}]},"attribution":"GanitSūtram | AITDL"}`,
                    errors: [{ s: 401, c: 'Unauthorised' }], tryFields: []
                },
                {
                    id: 'delete-progress', method: 'DELETE', path: '/user-progress', auth: 'auth',
                    desc: 'Permanently clears all progress entries for the authenticated user. This action cannot be undone.',
                    params: [], curl: `curl -X DELETE ${API_BASE}/user-progress \\
  -H "Authorization: Bearer <token>"`,
                    success: 200, successBody: `{"message":"Progress cleared.","attribution":"GanitSūtram | AITDL"}`,
                    errors: [{ s: 401, c: 'Unauthorised' }], tryFields: []
                }
            ]
        },
        {
            id: 'admin', label: 'Admin',
            endpoints: [
                {
                    id: 'admin-school', method: 'POST', path: '/admin/school', auth: 'role',
                    desc: 'Creates a new school linked to the authenticated school admin. Only one school per admin.',
                    params: [{ name: 'name', type: 'string', req: true, desc: 'School name (min 2 chars)' }],
                    curl: `curl -X POST ${API_BASE}/admin/school \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <school_token>" \\
  -d '{"name":"Vedic Maths Academy"}'`,
                    success: 201, successBody: `{"school":{"schoolId":"uuid","name":"Vedic Maths Academy","studentCap":100},"attribution":"GanitSūtram | AITDL"}`,
                    errors: [{ s: 400, c: 'School already exists for this admin' }, { s: 403, c: 'Insufficient role' }], tryFields: []
                },
                {
                    id: 'admin-dashboard', method: 'GET', path: '/admin/dashboard', auth: 'role',
                    desc: 'Returns the full school dashboard: enrollment stats, practice analytics, and progress aggregates.',
                    params: [], curl: `curl ${API_BASE}/admin/dashboard \\
  -H "Authorization: Bearer <school_token>"`,
                    success: 200, successBody: `{"dashboard":{"school":{"name":"Vedic Maths Academy"},"enrollmentCount":12,"practiceStats":{"avgAccuracy":74},"progressStats":{"totalSolved":98,"activeStudents":8}},"attribution":"GanitSūtram | AITDL"}`,
                    errors: [{ s: 403, c: 'Insufficient role' }, { s: 404, c: 'No school found — create one first' }], tryFields: []
                },
                {
                    id: 'admin-enroll', method: 'POST', path: '/admin/enroll', auth: 'role',
                    desc: 'Enrolls a student (by email) into the admin\'s school. Student must already be registered.',
                    params: [{ name: 'studentEmail', type: 'string', req: true, desc: 'Registered student email address' }],
                    curl: `curl -X POST ${API_BASE}/admin/enroll \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <school_token>" \\
  -d '{"studentEmail":"student@example.com"}'`,
                    success: 201, successBody: `{"enrollment":{"enrollmentId":"uuid","schoolId":"uuid","userId":"uuid","status":"active"},"attribution":"GanitSūtram | AITDL"}`,
                    errors: [{ s: 400, c: 'Student not found or already enrolled' }, { s: 403, c: 'Insufficient role' }], tryFields: []
                },
                {
                    id: 'admin-students', method: 'GET', path: '/admin/students', auth: 'role',
                    desc: 'Returns all students enrolled in the admin\'s school with enrollment metadata.',
                    params: [], curl: `curl ${API_BASE}/admin/students \\
  -H "Authorization: Bearer <school_token>"`,
                    success: 200, successBody: `{"students":[{"email":"student@example.com","role":"student","status":"active","enrolledAt":"2026-03-07T10:00:00Z","enrollmentId":"uuid"}],"total":1,"attribution":"GanitSūtram | AITDL"}`,
                    errors: [{ s: 403, c: 'Insufficient role' }], tryFields: []
                },
                {
                    id: 'admin-remove', method: 'DELETE', path: '/admin/students/:id', auth: 'role',
                    desc: 'Suspends a student enrollment by enrollment ID. The student account is preserved.',
                    params: [{ name: ':id', type: 'string', req: true, desc: 'Enrollment ID to suspend' }],
                    curl: `curl -X DELETE ${API_BASE}/admin/students/<enrollmentId> \\
  -H "Authorization: Bearer <school_token>"`,
                    success: 200, successBody: `{"message":"Student removed.","attribution":"GanitSūtram | AITDL"}`,
                    errors: [{ s: 403, c: 'Insufficient role or not your school' }, { s: 404, c: 'Enrollment not found' }],
                    tryFields: [{ key: 'id', label: ':id (enrollment ID)', val: '', type: 'text' }]
                }
            ]
        },
        {
            id: 'health', label: 'Health',
            endpoints: [
                {
                    id: 'health', method: 'GET', path: '/health', auth: 'public',
                    desc: 'Health check endpoint. Returns API status, platform name, and attribution.',
                    params: [], curl: `curl ${API_BASE}/health`,
                    success: 200, successBody: `{"status":"ok","platform":"GanitSūtram","attribution":"Jawahar R Mallah | AITDL"}`,
                    errors: [], tryFields: []
                }
            ]
        }
    ];

    // ─── RENDER HELPERS ──────────────────────────────────────────────

    function methodBadge(method) {
        return `<span class="method-badge ${method}">${method}</span>`;
    }

    function authBadge(auth) {
        if (auth === 'public') return `<span class="auth-badge public">🔓 Public</span>`;
        if (auth === 'auth') return `<span class="auth-badge auth">🔒 Auth Required</span>`;
        if (auth === 'role') return `<span class="auth-badge role">🛡️ Role: school/admin</span>`;
        return '';
    }

    function paramsTable(params) {
        if (!params.length) return '<p style="color:var(--docs-fg-muted);font-size:0.8rem;margin:0.25rem 0;">No parameters.</p>';
        return `<table class="params-table"><thead><tr><th>Parameter</th><th>Type</th><th>Required</th><th>Description</th></tr></thead><tbody>
            ${params.map(p => `<tr>
                <td class="param-name">${p.name}</td>
                <td class="param-type">${p.type}</td>
                <td class="${p.req ? 'required-yes' : 'required-no'}">${p.req ? 'Yes' : 'No'}</td>
                <td>${p.desc}</td>
            </tr>`).join('')}
        </tbody></table>`;
    }

    function curlBlock(curl, id) {
        return `<div class="docs-code-block">
            <div class="docs-code-block-header">
                <span class="docs-code-lang">curl</span>
                <button class="docs-copy-btn" onclick="GanitApiDocs.copy(this)">Copy</button>
            </div>
            <pre><code class="language-bash hljs-target">${escHtml(curl)}</code></pre>
        </div>`;
    }

    function responseBlock(code, body) {
        return `<div class="docs-code-block">
            <div class="docs-code-block-header">
                <span class="docs-code-lang">JSON — ${code}</span>
                <button class="docs-copy-btn" onclick="GanitApiDocs.copy(this)">Copy</button>
            </div>
            <pre><code class="language-json hljs-target">${escHtml(body)}</code></pre>
        </div>`;
    }

    function errorsTable(errors) {
        if (!errors.length) return '';
        return `<table class="docs-errors-table"><thead><tr><th>Status</th><th>Condition</th></tr></thead><tbody>
            ${errors.map(e => `<tr><td class="param-name">${e.s}</td><td>${e.c}</td></tr>`).join('')}
        </tbody></table>`;
    }

    function tryItPanel(ep) {
        const hasTry = ep.tryFields.length > 0 || ep.auth === 'public' || ep.auth === 'auth';
        if (!hasTry) return '';
        const fields = ep.tryFields.map(f => {
            if (f.type === 'select') {
                return `<div class="try-it-field">
                    <label class="try-it-label">${f.label}</label>
                    <select class="try-it-select" data-key="${f.key}">
                        ${f.opts.map(o => `<option value="${o}"${o === f.val ? ' selected' : ''}>${o}</option>`).join('')}
                    </select>
                </div>`;
            }
            return `<div class="try-it-field">
                <label class="try-it-label">${f.label}</label>
                <input class="try-it-input" type="text" data-key="${f.key}" value="${escHtml(f.val)}" placeholder="${f.label}">
            </div>`;
        }).join('');

        const authNote = ep.auth === 'auth' || ep.auth === 'role'
            ? `<p style="font-size:0.75rem;color:var(--docs-fg-muted);margin:0 0 0.75rem;">Token from GanitAuth is used automatically if you are logged in.</p>`
            : '';

        return `<div class="docs-try-it">
            <button class="docs-try-it-toggle">
                <span>⚡ Try It</span>
                <span class="docs-try-it-chevron">▼</span>
            </button>
            <div class="docs-try-it-body" data-endpoint="${ep.id}" data-method="${ep.method}" data-path="${ep.path}" data-auth="${ep.auth === 'auth' || ep.auth === 'role'}">
                ${authNote}
                <div class="try-it-fields">${fields}</div>
                <button class="try-it-send-btn">Send Request →</button>
                <div class="try-it-response">
                    <div class="try-it-response-meta">
                        <span class="try-it-status"></span>
                        <span class="try-it-time"></span>
                    </div>
                    <div class="try-it-response-body"><pre><code class="language-json"></code></pre></div>
                </div>
            </div>
        </div>`;
    }

    function renderEndpointCard(ep) {
        return `<div class="docs-endpoint-card" id="${ep.id}" data-spy>
            <div class="docs-endpoint-header">
                ${methodBadge(ep.method)}
                <span class="docs-endpoint-path">${ep.path}</span>
                ${authBadge(ep.auth)}
            </div>
            <div class="docs-endpoint-desc">${ep.desc}${ep.auth === 'role' ? '<div class="docs-note" style="margin-top:0.5rem;">⚠️ Requires role: <strong>school</strong> or <strong>admin</strong>. Requests with other roles return 403 Forbidden.</div>' : ''}</div>
            <div class="docs-endpoint-body">
                ${ep.params.length ? `<div class="docs-sub-section"><p class="docs-sub-heading">Parameters</p>${paramsTable(ep.params)}</div>` : ''}
                <div class="docs-sub-section">
                    <p class="docs-sub-heading">Example Request</p>
                    ${curlBlock(ep.curl, ep.id)}
                </div>
                <div class="docs-sub-section">
                    <p class="docs-sub-heading">Success Response — ${ep.success}</p>
                    ${responseBlock(ep.success, ep.successBody)}
                </div>
                ${ep.errors.length ? `<div class="docs-sub-section"><p class="docs-sub-heading">Error Responses</p>${errorsTable(ep.errors)}</div>` : ''}
            </div>
            ${tryItPanel(ep)}
        </div>`;
    }

    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ─── OVERVIEW SECTION ────────────────────────────────────────────

    function renderOverview() {
        return `
        <section id="overview" class="docs-section" data-spy>
            <div class="docs-overview-hero">
                <h1 class="docs-overview-title">GanitSūtram API</h1>
                <div class="docs-badges">
                    <span class="docs-badge">REST</span>
                    <span class="docs-badge">JSON</span>
                    <span class="docs-badge accent">v1.0</span>
                    <span class="docs-badge">AITDL</span>
                </div>
                <p class="docs-overview-desc">
                    The GanitSūtram API provides programmatic access to Vedic mathematical algorithms,
                    pattern detection, user progress tracking, and educational tools. All responses are
                    JSON and include an <code style="font-family:var(--font-mono);font-size:0.85em;color:var(--docs-blue);">attribution</code> field.
                </p>
            </div>

            <div class="docs-info-grid">
                <div class="docs-info-box">
                    <div class="docs-info-box-label">Base URLs</div>
                    <div class="docs-url-row">
                        <span class="docs-url-env">DEV</span>
                        <span class="docs-url-val">http://localhost:3000/api</span>
                    </div>
                    <div class="docs-url-row">
                        <span class="docs-url-env">PROD</span>
                        <span class="docs-url-val">https://api.ganitsutram.com/api</span>
                    </div>
                </div>
                <div class="docs-info-box">
                    <div class="docs-info-box-label">Request Format</div>
                    <div style="font-family:var(--font-mono);font-size:0.75rem;color:var(--docs-fg-muted);line-height:1.8;">
                        <div><span style="color:var(--docs-blue);">Content-Type:</span> application/json</div>
                        <div><span style="color:var(--docs-blue);">Authorization:</span> Bearer &lt;token&gt;</div>
                    </div>
                </div>
            </div>

            <div class="docs-sub-section" style="margin-bottom:1.5rem;">
                <p class="docs-sub-heading">Success Response Format</p>
                <div class="docs-code-block">
                    <div class="docs-code-block-header"><span class="docs-code-lang">JSON</span><button class="docs-copy-btn" onclick="GanitApiDocs.copy(this)">Copy</button></div>
                    <pre><code class="language-json hljs-target">{\n  "result": 8,\n  "attribution": "GanitSūtram | AITDL"\n}</code></pre>
                </div>
            </div>
            <div class="docs-sub-section" style="margin-bottom:2rem;">
                <p class="docs-sub-heading">Error Response Format</p>
                <div class="docs-code-block">
                    <div class="docs-code-block-header"><span class="docs-code-lang">JSON</span><button class="docs-copy-btn" onclick="GanitApiDocs.copy(this)">Copy</button></div>
                    <pre><code class="language-json hljs-target">{\n  "error": "Description of what went wrong"\n}</code></pre>
                </div>
            </div>

            <div class="docs-sub-section">
                <p class="docs-sub-heading">HTTP Status Codes</p>
                <div class="docs-table-wrap">
                    <table class="docs-table">
                        <thead><tr><th>Code</th><th>Meaning</th></tr></thead>
                        <tbody>
                            <tr><td class="status-code s2">200 OK</td><td>Successful request</td></tr>
                            <tr><td class="status-code s2">201 Created</td><td>Resource successfully created</td></tr>
                            <tr><td class="status-code s4">400 Bad Request</td><td>Missing or malformed parameters</td></tr>
                            <tr><td class="status-code s4">401 Unauthorised</td><td>Invalid or missing Bearer token</td></tr>
                            <tr><td class="status-code s4">403 Forbidden</td><td>Authenticated but insufficient role</td></tr>
                            <tr><td class="status-code s4">404 Not Found</td><td>Resource does not exist</td></tr>
                            <tr><td class="status-code s4">409 Conflict</td><td>Duplicate resource (e.g. email already registered)</td></tr>
                            <tr><td class="status-code s4">422 Unprocessable Entity</td><td>Validation error from math engine (invalid input range)</td></tr>
                            <tr><td class="status-code s5">500 Server Error</td><td>Unexpected internal error</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>`;
    }

    // ─── SOLVER OPERATIONS TABLE ─────────────────────────────────────

    function renderSolverOpsTable() {
        const ops = [
            ['digital-root', 'Digital Root (Beejank)', 'Single'],
            ['digital-root-steps', 'Digital Root with steps', 'Single'],
            ['squares-ending-5', 'Squares ending in 5', 'Single'],
            ['squares-ending-5-steps', 'With steps', 'Single'],
            ['multiply-by-11', 'Multiply by 11', 'Single'],
            ['multiply-by-11-steps', 'With steps', 'Single'],
            ['nikhilam', 'Nikhilam multiplication', 'Dual (inputA × inputB)'],
            ['nikhilam-steps', 'Nikhilam with steps', 'Dual'],
            ['urdhva', 'Urdhva Tiryak', 'Dual (inputA × inputB)'],
            ['urdhva-steps', 'Urdhva with steps', 'Dual'],
            ['kaprekar', 'Kaprekar Routine', 'Single'],
            ['fibonacci', 'Fibonacci Sequence', 'Single (count)'],
            ['square-pattern', 'Square Pattern', 'Single (count)'],
            ['analyse-sequence', 'Sequence Analyser', 'Single (csv string)'],
        ];
        return `<div class="docs-sub-section">
            <p class="docs-sub-heading">Available Operations</p>
            <div class="docs-ops-grid">
                ${ops.map(([name, desc, type]) => `
                <div class="docs-op-item">
                    <div class="docs-op-name">${name}</div>
                    <div class="docs-op-desc">${desc}</div>
                    <div class="docs-op-type">${type}</div>
                </div>`).join('')}
            </div>
        </div>`;
    }

    // ─── FULL PAGE RENDER ────────────────────────────────────────────

    function renderContent() {
        const contentEl = document.getElementById('docs-main-content');
        if (!contentEl) return;

        let html = renderOverview();

        SECTIONS.forEach(section => {
            html += `<div class="docs-divider"></div>
            <section id="${section.id}" class="docs-section" data-spy>
                <h2 class="docs-section-title">${section.label}</h2>`;

            // Inject operations table after solver heading
            if (section.id === 'solver') html += renderSolverOpsTable();

            section.endpoints.forEach(ep => {
                html += renderEndpointCard(ep);
            });

            html += `</section>`;
        });

        contentEl.innerHTML = html;
    }

    // ─── SIDEBAR NAV RENDER ──────────────────────────────────────────

    function renderSidebarNav() {
        const navEl = document.getElementById('docs-nav');
        if (!navEl) return;

        let html = `<div class="docs-sidebar-section">
            <a class="docs-nav-link active" href="#overview">Overview</a>
        </div>`;

        SECTIONS.forEach(section => {
            html += `<div class="docs-sidebar-section">
                <a class="docs-nav-section-heading" href="#${section.id}">${section.label}</a>
                ${section.endpoints.map(ep => {
                const mc = ep.method.toLowerCase() === 'delete' ? 'del' : ep.method.toLowerCase();
                const shortPath = ep.path.replace(/^\//, '');
                return `<a class="docs-nav-link" href="#${ep.id}">
                        <span class="method-pill ${mc}">${ep.method.substring(0, 3)}</span>
                        /api/${shortPath}
                    </a>`;
            }).join('')}
            </div>`;
        });

        navEl.innerHTML = html;
    }

    // ─── SIDEBAR TOGGLE & SCROLL SPY ────────────────────────────────

    function initSidebar() {
        const toggle = document.getElementById('docs-menu-toggle');
        const sidebar = document.getElementById('docs-sidebar');
        const overlay = document.getElementById('docs-sidebar-overlay');

        if (toggle && sidebar && overlay) {
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                overlay.classList.toggle('open');
            });
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('open');
            });
        }

        document.querySelectorAll('.docs-nav-link[href^="#"]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const id = link.getAttribute('href').slice(1);
                const el = document.getElementById(id);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (sidebar) sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('open');
            });
        });
    }

    function initScrollSpy() {
        const navLinks = document.querySelectorAll('.docs-nav-link[href^="#"]');
        const sections = document.querySelectorAll('[data-spy]');
        if (!sections.length) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
                }
            });
        }, { rootMargin: `-64px 0px -55% 0px`, threshold: 0 });

        sections.forEach(s => observer.observe(s));
    }

    function initHighlighting() {
        if (typeof hljs !== 'undefined') {
            document.querySelectorAll('code.hljs-target').forEach(b => hljs.highlightElement(b));
        }
    }

    function initCopyButtons() {
        document.querySelectorAll('.docs-copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const block = btn.closest('.docs-code-block');
                const code = block && block.querySelector('code');
                if (code) copyToClipboard(code.textContent, btn);
            });
        });
    }

    function copyToClipboard(text, btn) {
        navigator.clipboard.writeText(text).then(() => {
            const orig = btn.textContent;
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 2000);
        }).catch(() => { });
    }

    function initTryIt() {
        document.querySelectorAll('.docs-try-it-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const body = btn.nextElementSibling;
                if (!body) return;
                const open = body.classList.contains('open');
                body.classList.toggle('open', !open);
                btn.classList.toggle('open', !open);
            });
        });
        document.querySelectorAll('.try-it-send-btn').forEach(btn => {
            btn.addEventListener('click', () => handleSend(btn));
        });
    }

    function getStatusClass(s) {
        if (s >= 200 && s < 300) return 's2';
        if (s >= 400 && s < 500) return 's4';
        return 's5';
    }

    function getAuthHeader() {
        if (window.GanitAuth && window.GanitAuth.isLoggedIn()) {
            return { Authorization: `Bearer ${window.GanitAuth.getToken()}` };
        }
        return {};
    }

    async function handleSend(btn) {
        const panel = btn.closest('.docs-try-it-body');
        if (!panel) return;

        const method = panel.dataset.method;
        let path = panel.dataset.path;
        const responseEl = panel.querySelector('.try-it-response');
        const statusEl = panel.querySelector('.try-it-status');
        const timeEl = panel.querySelector('.try-it-time');
        const bodyEl = panel.querySelector('.try-it-response-body pre code');

        btn.disabled = true; btn.textContent = 'Sending…';

        const inputs = {};
        panel.querySelectorAll('.try-it-input, .try-it-select').forEach(inp => {
            if (inp.value.trim()) inputs[inp.dataset.key] = inp.value.trim();
        });

        // Handle path params
        let url = API_BASE + path;
        Object.keys(inputs).forEach(k => {
            if (url.includes(`:${k}`)) { url = url.replace(`:${k}`, encodeURIComponent(inputs[k])); delete inputs[k]; }
        });

        // Parse JSON arrays for fields like "numbers"
        const body = {};
        Object.entries(inputs).forEach(([k, v]) => {
            try { body[k] = JSON.parse(v); } catch { body[k] = v; }
        });

        if (method === 'GET' && Object.keys(body).length) {
            url += '?' + new URLSearchParams(Object.entries(body).map(([k, v]) => [k, String(v)])).toString();
        }

        const headers = { 'Content-Type': 'application/json', ...getAuthHeader() };
        const opts = { method, headers };
        if (method !== 'GET' && method !== 'DELETE' && Object.keys(body).length) {
            opts.body = JSON.stringify(body);
        }

        const t0 = performance.now();
        try {
            const resp = await fetch(url, opts);
            const elapsed = Math.round(performance.now() - t0);
            let json; try { json = await resp.json(); } catch { json = { error: 'Non-JSON response' }; }

            if (responseEl) responseEl.classList.add('show');
            if (statusEl) { statusEl.textContent = `${resp.status} ${resp.statusText}`; statusEl.className = `try-it-status ${getStatusClass(resp.status)}`; }
            if (timeEl) timeEl.textContent = `${elapsed}ms`;
            if (bodyEl) { bodyEl.textContent = JSON.stringify(json, null, 2); if (typeof hljs !== 'undefined') hljs.highlightElement(bodyEl); }
        } catch (err) {
            if (responseEl) responseEl.classList.add('show');
            if (statusEl) { statusEl.textContent = 'Network Error'; statusEl.className = 'try-it-status s5'; }
            if (timeEl) timeEl.textContent = `${Math.round(performance.now() - t0)}ms`;
            if (bodyEl) bodyEl.textContent = `{ "error": "${err.message}" }`;
        } finally {
            btn.disabled = false; btn.textContent = 'Send Request →';
        }
    }

    // ─── INIT ──────────────────────────────────────────────────────

    function init() {
        renderSidebarNav();
        renderContent();
        initSidebar();
        initHighlighting();
        initCopyButtons();
        initTryIt();
        // Scroll spy needs a slight delay for DOM settle
        setTimeout(initScrollSpy, 100);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.GanitApiDocs = {
        init,
        copy: (btn) => {
            const block = btn.closest('.docs-code-block');
            const code = block && block.querySelector('code');
            if (code) copyToClipboard(code.textContent, btn);
        }
    };

})();
