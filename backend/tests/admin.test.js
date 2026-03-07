const crypto = require('crypto');
const db = require('../database/db');

async function api(method, path, body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`http://localhost:3000${path}`, options);
    let data;
    try {
        data = await res.json();
    } catch (e) {
        data = null;
    }
    return { status: res.status, data };
}

describe('Admin API Tests', () => {
    let adminEmail = `test_qa_admin_${crypto.randomBytes(4).toString('hex')}@ganitsutram.com`;
    let studentEmail = `test_qa_student_${crypto.randomBytes(4).toString('hex')}@ganitsutram.com`;
    let adminToken = '';
    let studentToken = '';
    let studentId = null;

    it('Register school admin + create school -> 201', async () => {
        const res = await api('POST', '/api/auth/register', {
            email: adminEmail,
            password: 'StrongPassword123!',
            role: 'admin'
        });
        expect(res.status).toBe(201);

        const loginRes = await api('POST', '/api/auth/login', { email: adminEmail, password: 'StrongPassword123!' });
        adminToken = loginRes.data.token;

        const schoolRes = await api('POST', '/api/admin/school', { name: 'QA Test School' }, adminToken);
        expect(schoolRes.status).toBe(201);
    });

    it('Register student + enroll -> 201', async () => {
        const res = await api('POST', '/api/auth/register', {
            email: studentEmail,
            password: 'StrongPassword123!',
            role: 'student'
        });
        expect(res.status).toBe(201);
        if (res.data && res.data.user) studentId = res.data.user.id;

        const loginRes = await api('POST', '/api/auth/login', { email: studentEmail, password: 'StrongPassword123!' });
        studentToken = loginRes.data.token;

        const enrollRes = await api('POST', '/api/admin/enroll', { studentEmail }, adminToken);
        expect(enrollRes.status).toBe(201);
    });

    it('GET /api/admin/dashboard -> 200 with stats', async () => {
        const res = await api('GET', '/api/admin/dashboard', null, adminToken);
        expect(res.status).toBe(200);
        expect(res.data.dashboard).toBeTruthy();
    });

    it('GET /api/admin/students -> students array', async () => {
        const res = await api('GET', '/api/admin/students', null, adminToken);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.data.students)).toBeTruthy();
    });

    it('Student token on admin routes -> 403', async () => {
        const res = await api('GET', '/api/admin/dashboard', null, studentToken);
        expect(res.status).toBe(403);
    });

    it('DELETE /api/admin/students/:id -> 200', async () => {
        if (!studentId) {
            const getRes = await api('GET', '/api/admin/students', null, adminToken);
            if (getRes.data.students && getRes.data.students.length > 0) {
                studentId = getRes.data.students[0].id;
            }
        }
        if (studentId) {
            const res = await api('DELETE', `/api/admin/students/${studentId}`, null, adminToken);
            expect(res.status).toBe(200);
        }
    });

    it('Clean up test users', async () => {
        db.prepare('DELETE FROM users WHERE email IN (?, ?)').run(adminEmail, studentEmail);
    });
});
