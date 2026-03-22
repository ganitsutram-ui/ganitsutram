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
/*
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com
Purpose: Admin API router for management and analytics.
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
const analyticsService = require('../services/analytics-service');
const cmsService = require('../services/cms-service');
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

/**
 * GET /api/admin/global-stats
 * Returns platform-wide analytics. restricted to global admins.
 */
router.get('/global-stats', requireRole('admin'), async (req, res) => {
    try {
        const stats = await analyticsService.getPlatformDashboard({ days: req.query.days || 30 });
        res.json({ stats, attribution: ATTR });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/admin/cms-content
 * Returns all CMS content for management. restricted to global admins.
 */
router.get('/cms-content', requireRole('admin'), async (req, res) => {
    try {
        const type = req.query.type || 'all';
        const content = await cmsService.getContentForAdmin(type === 'all' ? null : type);
        res.json({ data: content, attribution: ATTR });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/admin/cms-content
 * Creates new content. Restricted to global admins.
 */
router.post('/cms-content', requireRole('admin'), async (req, res) => {
    try {
        const content = await cmsService.createContent(req.user.userId, req.body);
        res.status(201).json({ content, attribution: ATTR });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
