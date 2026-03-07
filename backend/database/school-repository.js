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
function createSchool({ schoolId, name, adminId, createdAt, studentCap = 100 }) {
    db.prepare(`
        INSERT INTO schools (school_id, name, admin_id, student_cap, created_at)
        VALUES (?, ?, ?, ?, ?)
    `).run(schoolId, name, adminId, studentCap, createdAt);
    return findSchoolById(schoolId);
}

/**
 * Finds a school by its admin user ID.
 */
function findSchoolByAdminId(adminId) {
    return db.prepare('SELECT * FROM schools WHERE admin_id = ?').get(adminId);
}

/**
 * Finds a school by its primary key.
 */
function findSchoolById(schoolId) {
    return db.prepare('SELECT * FROM schools WHERE school_id = ?').get(schoolId);
}

/**
 * Creates a new enrollment record.
 */
function enrollStudent({ enrollmentId, schoolId, userId, enrolledAt }) {
    db.prepare(`
        INSERT INTO enrollments (enrollment_id, school_id, user_id, enrolled_at, status)
        VALUES (?, ?, ?, ?, 'active')
    `).run(enrollmentId, schoolId, userId, enrolledAt);
    return db.prepare('SELECT * FROM enrollments WHERE enrollment_id = ?').get(enrollmentId);
}

/**
 * Returns all enrollments for a school, joining user info.
 */
function getEnrollments(schoolId) {
    return db.prepare(`
        SELECT e.enrollment_id, e.school_id, e.user_id, e.enrolled_at, e.status,
               u.email, u.role
        FROM enrollments e
        JOIN users u ON u.user_id = e.user_id
        WHERE e.school_id = ?
        ORDER BY e.enrolled_at DESC
    `).all(schoolId);
}

/**
 * Returns the count of active enrollments in a school.
 */
function getEnrollmentCount(schoolId) {
    const row = db.prepare(
        "SELECT COUNT(*) as count FROM enrollments WHERE school_id = ? AND status = 'active'"
    ).get(schoolId);
    return row ? row.count : 0;
}

/**
 * Checks whether a user is already enrolled in a school.
 */
function isEnrolled(schoolId, userId) {
    const row = db.prepare(
        "SELECT enrollment_id FROM enrollments WHERE school_id = ? AND user_id = ? AND status = 'active'"
    ).get(schoolId, userId);
    return !!row;
}

/**
 * Updates the status of an enrollment (active | suspended).
 */
function updateEnrollmentStatus(enrollmentId, status) {
    db.prepare('UPDATE enrollments SET status = ? WHERE enrollment_id = ?').run(status, enrollmentId);
    return db.prepare('SELECT * FROM enrollments WHERE enrollment_id = ?').get(enrollmentId);
}

/**
 * Finds an enrollment by its primary key.
 */
function findEnrollmentById(enrollmentId) {
    return db.prepare('SELECT * FROM enrollments WHERE enrollment_id = ?').get(enrollmentId);
}

/**
 * Finds a user by email.
 */
function findUserByEmail(email) {
    return db.prepare('SELECT user_id, email, role FROM users WHERE email = ?').get(email);
}

/**
 * Returns aggregated practice stats for all active students in a school.
 */
function getPracticeStats(schoolId) {
    const rows = db.prepare(`
        SELECT pa.operation,
               COUNT(*) as attempts,
               SUM(pa.is_correct) as correct
        FROM practice_attempts pa
        JOIN enrollments e ON e.user_id = pa.user_id
        WHERE e.school_id = ? AND e.status = 'active'
        GROUP BY pa.operation
        ORDER BY attempts DESC
    `).all(schoolId);
    return rows;
}

/**
 * Returns aggregated progress stats for all active students in a school.
 */
function getProgressStats(schoolId) {
    const totalRow = db.prepare(`
        SELECT COUNT(*) as total
        FROM progress p
        JOIN enrollments e ON e.user_id = p.user_id
        WHERE e.school_id = ? AND e.status = 'active'
    `).get(schoolId);

    const activeRow = db.prepare(`
        SELECT COUNT(DISTINCT p.user_id) as active
        FROM progress p
        JOIN enrollments e ON e.user_id = p.user_id
        WHERE e.school_id = ? AND e.status = 'active'
    `).get(schoolId);

    return {
        totalSolved: totalRow ? totalRow.total : 0,
        activeStudents: activeRow ? activeRow.active : 0
    };
}

/**
 * Returns per-student problem solve count for a school.
 */
function getStudentSolveStats(schoolId) {
    return db.prepare(`
        SELECT e.user_id,
               COUNT(p.progress_id) as solved
        FROM enrollments e
        LEFT JOIN progress p ON p.user_id = e.user_id
        WHERE e.school_id = ? AND e.status = 'active'
        GROUP BY e.user_id
    `).all(schoolId);
}

/**
 * Returns per-student accuracy stats from practice attempts.
 */
function getStudentAccuracyStats(schoolId) {
    return db.prepare(`
        SELECT e.user_id,
               COUNT(pa.attempt_id) as attempts,
               SUM(pa.is_correct) as correct
        FROM enrollments e
        LEFT JOIN practice_attempts pa ON pa.user_id = e.user_id
        WHERE e.school_id = ? AND e.status = 'active'
        GROUP BY e.user_id
    `).all(schoolId);
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
