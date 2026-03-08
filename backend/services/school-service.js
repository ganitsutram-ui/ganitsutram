/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 *
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 *
 * Purpose: Business logic for school management.
 *          Pure logic only — no HTTP, no DOM.
 */

const { v4: uuidv4 } = require('uuid');
const repo = require('../database/school-repository');
const db = require('../database/db');

/**
 * Creates a new school for a school admin.
 * Validates role and ensures no duplicate school per admin.
 *
 * @param {string} adminUserId
 * @param {string} schoolName
 * @returns {Object} school
 */
async function createSchool(adminUserId, schoolName) {
    // Validate admin role
    const admin = await db.get('SELECT role FROM users WHERE user_id = ?', adminUserId);
    if (!admin || !['school', 'admin'].includes(admin.role)) {
        throw new Error('Only school admins can create a school.');
    }

    // Prevent duplicate schools
    const existing = await repo.findSchoolByAdminId(adminUserId);
    if (existing) {
        throw new Error('A school already exists for this admin.');
    }

    if (!schoolName || schoolName.trim().length < 2) {
        throw new Error('School name must be at least 2 characters.');
    }

    const school = await repo.createSchool({
        schoolId: uuidv4(),
        name: schoolName.trim(),
        adminId: adminUserId,
        createdAt: new Date().toISOString(),
        studentCap: 100
    });

    return school;
}

/**
 * Enrolls a student into a school by email.
 *
 * @param {string} schoolId
 * @param {string} studentEmail
 * @returns {Object} enrollment
 */
async function enrollStudent(schoolId, studentEmail) {
    const school = await repo.findSchoolById(schoolId);
    if (!school) throw new Error('School not found.');

    const student = await repo.findUserByEmail(studentEmail);
    if (!student) throw new Error('Student not found. Ask them to register first.');
    if (student.role !== 'student') throw new Error('Only students can be enrolled.');

    if (await repo.isEnrolled(schoolId, student.user_id)) {
        throw new Error('Student is already enrolled in this school.');
    }

    const count = await repo.getEnrollmentCount(schoolId);
    if (count >= school.student_cap) {
        throw new Error(`School capacity (${school.student_cap}) reached.`);
    }

    const enrollment = await repo.enrollStudent({
        enrollmentId: uuidv4(),
        schoolId,
        userId: student.user_id,
        enrolledAt: new Date().toISOString()
    });

    return { ...enrollment, email: student.email };
}

/**
 * Returns the full school dashboard for an admin user.
 *
 * @param {string} adminUserId
 * @returns {Object} dashboard
 */
async function getSchoolDashboard(adminUserId) {
    const school = await repo.findSchoolByAdminId(adminUserId);
    if (!school) return null;

    const [enrollmentCount, enrollments, practiceOps, progressStats, solveStats, accuracyStats] = await Promise.all([
        repo.getEnrollmentCount(school.school_id),
        repo.getEnrollments(school.school_id),
        repo.getPracticeStats(school.school_id),
        repo.getProgressStats(school.school_id),
        repo.getStudentSolveStats(school.school_id),
        repo.getStudentAccuracyStats(school.school_id)
    ]);

    // Aggregate practice stats
    const totalAttempts = practiceOps.reduce((s, r) => s + r.attempts, 0);
    const totalCorrect = practiceOps.reduce((s, r) => s + r.correct, 0);
    const avgAccuracy = totalAttempts > 0
        ? Math.round((totalCorrect / totalAttempts) * 100)
        : 0;
    const topOperation = practiceOps.length > 0 ? practiceOps[0].operation : 'N/A';

    // Map solve count to userId
    const solveMap = {};
    solveStats.forEach(s => { solveMap[s.user_id] = s.solved; });
    const accMap = {};
    accuracyStats.forEach(a => {
        accMap[a.user_id] = a.attempts > 0
            ? Math.round((a.correct / a.attempts) * 100)
            : 0;
    });

    // Enrich enrollments with per-student stats
    const enrichedEnrollments = enrollments.map(e => ({
        ...e,
        solved: solveMap[e.user_id] || 0,
        accuracy: accMap[e.user_id] || 0
    }));

    return {
        school: {
            schoolId: school.school_id,
            name: school.name,
            studentCap: school.student_cap
        },
        enrollmentCount,
        enrollments: enrichedEnrollments,
        practiceStats: {
            totalAttempts,
            avgAccuracy,
            topOperation,
            operationBreakdown: practiceOps
        },
        progressStats
    };
}

/**
 * Removes (suspends) a student from a school.
 *
 * @param {string} schoolId
 * @param {string} enrollmentId
 * @param {string} adminUserId
 * @returns {Object} updated enrollment
 */
async function removeStudent(schoolId, enrollmentId, adminUserId) {
    const school = await repo.findSchoolByAdminId(adminUserId);
    if (!school || school.school_id !== schoolId) {
        throw new Error('Access denied. You do not own this school.');
    }

    const enrollment = await repo.findEnrollmentById(enrollmentId);
    if (!enrollment || enrollment.school_id !== schoolId) {
        throw new Error('Enrollment not found.');
    }

    return await repo.updateEnrollmentStatus(enrollmentId, 'suspended');
}

module.exports = {
    createSchool,
    enrollStudent,
    getSchoolDashboard,
    removeStudent
};
