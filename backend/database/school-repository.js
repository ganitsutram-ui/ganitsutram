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
 * Gregorian: 2026-03-07
 *
 * Purpose: Repository for school and enrollment data access.
 *          Pure database operations — no business logic.
 */

const db = require('./db');

/**
 * Creates a new school record.
 */
async function createSchool({ schoolId, name, adminId, createdAt, studentCap = 100 }) {
    await db.run(`
        INSERT INTO schools (school_id, name, admin_id, student_cap, created_at)
        VALUES (?, ?, ?, ?, ?)
    `, schoolId, name, adminId, studentCap, createdAt);
    return await findSchoolById(schoolId);
}

/**
 * Finds a school by its admin user ID.
 */
async function findSchoolByAdminId(adminId) {
    return await db.get('SELECT * FROM schools WHERE admin_id = ?', adminId);
}

/**
 * Finds a school by its primary key.
 */
async function findSchoolById(schoolId) {
    return await db.get('SELECT * FROM schools WHERE school_id = ?', schoolId);
}

/**
 * Creates a new enrollment record.
 */
async function enrollStudent({ enrollmentId, schoolId, userId, enrolledAt }) {
    await db.run(`
        INSERT INTO enrollments (enrollment_id, school_id, user_id, enrolled_at, status)
        VALUES (?, ?, ?, ?, 'active')
    `, enrollmentId, schoolId, userId, enrolledAt);
    return await db.get('SELECT * FROM enrollments WHERE enrollment_id = ?', enrollmentId);
}

/**
 * Returns all enrollments for a school, joining user info.
 */
async function getEnrollments(schoolId) {
    return await db.all(`
        SELECT e.enrollment_id, e.school_id, e.user_id, e.enrolled_at, e.status,
               u.email, u.role
        FROM enrollments e
        JOIN users u ON u.user_id = e.user_id
        WHERE e.school_id = ?
        ORDER BY e.enrolled_at DESC
    `, schoolId);
}

/**
 * Returns the count of active enrollments in a school.
 */
async function getEnrollmentCount(schoolId) {
    const row = await db.get(
        "SELECT COUNT(*) as count FROM enrollments WHERE school_id = ? AND status = 'active'",
        schoolId
    );
    return row ? row.count : 0;
}

/**
 * Checks whether a user is already enrolled in a school.
 */
async function isEnrolled(schoolId, userId) {
    const row = await db.get(
        "SELECT enrollment_id FROM enrollments WHERE school_id = ? AND user_id = ? AND status = 'active'",
        schoolId, userId
    );
    return !!row;
}

/**
 * Updates the status of an enrollment (active | suspended).
 */
async function updateEnrollmentStatus(enrollmentId, status) {
    await db.run('UPDATE enrollments SET status = ? WHERE enrollment_id = ?', status, enrollmentId);
    return await db.get('SELECT * FROM enrollments WHERE enrollment_id = ?', enrollmentId);
}

/**
 * Finds an enrollment by its primary key.
 */
async function findEnrollmentById(enrollmentId) {
    return await db.get('SELECT * FROM enrollments WHERE enrollment_id = ?', enrollmentId);
}

/**
 * Finds a user by email.
 */
async function findUserByEmail(email) {
    return await db.get('SELECT user_id, email, role FROM users WHERE email = ?', email);
}

/**
 * Returns aggregated practice stats for all active students in a school.
 */
async function getPracticeStats(schoolId) {
    return await db.all(`
        SELECT pa.operation,
               COUNT(*) as attempts,
               SUM(pa.is_correct) as correct
        FROM practice_attempts pa
        JOIN enrollments e ON e.user_id = pa.user_id
        WHERE e.school_id = ? AND e.status = 'active'
        GROUP BY pa.operation
        ORDER BY attempts DESC
    `, schoolId);
}

/**
 * Returns aggregated progress stats for all active students in a school.
 */
async function getProgressStats(schoolId) {
    const totalRow = await db.get(`
        SELECT COUNT(*) as total
        FROM progress p
        JOIN enrollments e ON e.user_id = p.user_id
        WHERE e.school_id = ? AND e.status = 'active'
    `, schoolId);

    const activeRow = await db.get(`
        SELECT COUNT(DISTINCT p.user_id) as active
        FROM progress p
        JOIN enrollments e ON e.user_id = p.user_id
        WHERE e.school_id = ? AND e.status = 'active'
    `, schoolId);

    return {
        totalSolved: totalRow ? totalRow.total : 0,
        activeStudents: activeRow ? activeRow.active : 0
    };
}

/**
 * Returns per-student problem solve count for a school.
 */
async function getStudentSolveStats(schoolId) {
    return await db.all(`
        SELECT e.user_id,
               COUNT(p.progress_id) as solved
        FROM enrollments e
        LEFT JOIN progress p ON p.user_id = e.user_id
        WHERE e.school_id = ? AND e.status = 'active'
        GROUP BY e.user_id
    `, schoolId);
}

/**
 * Returns per-student accuracy stats from practice attempts.
 */
async function getStudentAccuracyStats(schoolId) {
    return await db.all(`
        SELECT e.user_id,
               COUNT(pa.attempt_id) as attempts,
               SUM(pa.is_correct) as correct
        FROM enrollments e
        LEFT JOIN practice_attempts pa ON pa.user_id = e.user_id
        WHERE e.school_id = ? AND e.status = 'active'
        GROUP BY e.user_id
    `, schoolId);
}

module.exports = {
    createSchool,
    findSchoolByAdminId,
    findSchoolById,
    enrollStudent,
    getEnrollments,
    getEnrollmentCount,
    isEnrolled,
    updateEnrollmentStatus,
    findEnrollmentById,
    findUserByEmail,
    getPracticeStats,
    getProgressStats,
    getStudentSolveStats,
    getStudentAccuracyStats
};
