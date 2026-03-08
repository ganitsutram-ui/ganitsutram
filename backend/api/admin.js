/*
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07

Purpose: Admin API router for school management.
         Handles school creation, enrollment, and dashboard data.
*/

const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../auth/auth-middleware');
const {
    createSchool,
    enrollStudent,
    getSchoolDashboard,
    removeStudent
} = require('../services/school-service');
const repo = require('../database/school-repository');
const { errorResponse, successResponse } = require('../services/i18n-service');

const ATTR = 'GanitSūtram | AITDL';

// All admin routes require authentication and school/admin role
router.use(requireAuth, requireRole('school', 'admin'));

/**
 * POST /api/admin/school
 * Creates a new school for the authenticated school admin.
 */
router.post('/school', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json(errorResponse(req.locale, 'errors.validation.requiredField'));

        const school = await createSchool(req.user.userId, name);
        res.status(201).json({ school, attribution: ATTR });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * GET /api/admin/dashboard
 * Returns the full dashboard for the authenticated school admin.
 */
router.get('/dashboard', async (req, res) => {
    try {
        const dashboard = await getSchoolDashboard(req.user.userId);
        if (!dashboard) {
            return res.status(404).json(errorResponse(req.locale, 'errors.general.notFound'));
        }
        res.json({ dashboard, attribution: ATTR });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/admin/enroll
 * Enrolls a student by email into the admin's school.
 */
router.post('/enroll', async (req, res) => {
    try {
        const { studentEmail } = req.body;
        if (!studentEmail) return res.status(400).json(errorResponse(req.locale, 'errors.validation.requiredField'));

        const school = await repo.findSchoolByAdminId(req.user.userId);
        if (!school) return res.status(404).json(errorResponse(req.locale, 'errors.general.notFound'));

        const enrollment = await enrollStudent(school.school_id, studentEmail);
        res.status(201).json({ enrollment, attribution: ATTR });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * GET /api/admin/students
 * Returns all enrolled students for the admin's school.
 */
router.get('/students', async (req, res) => {
    try {
        const school = await repo.findSchoolByAdminId(req.user.userId);
        if (!school) return res.status(404).json(errorResponse(req.locale, 'errors.general.notFound'));

        const students = await repo.getEnrollments(school.school_id);
        res.json({ students, total: students.length, attribution: ATTR });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /api/admin/students/:enrollmentId
 * Removes (suspends) a student from the admin's school.
 */
router.delete('/students/:enrollmentId', async (req, res) => {
    try {
        const school = await repo.findSchoolByAdminId(req.user.userId);
        if (!school) return res.status(404).json(errorResponse(req.locale, 'errors.general.notFound'));

        await removeStudent(school.school_id, req.params.enrollmentId, req.user.userId);
        res.json({ message: 'Student removed.', attribution: ATTR });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
