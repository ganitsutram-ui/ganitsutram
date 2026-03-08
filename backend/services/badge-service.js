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
 * Purpose: Service for handling gamification badges and achievements.
 */

const repo = require('../database/badge-repository');

// Hardcoded badges for now. In a real app, these might be in a database table or JSON file.
const BADGES = [
    {
        id: 'awakening',
        name: 'Awakening',
        desc: 'Solve your first mathematical problem.',
        icon: 'lucide-sparkles',
        criteria: { type: 'solve', count: 1 }
    },
    {
        id: 'novice_calculator',
        name: 'Novice Calculator',
        desc: 'Solve 10 mathematical problems.',
        icon: 'lucide-calculator',
        criteria: { type: 'solve', count: 10 }
    },
    {
        id: 'math_enthusiast',
        name: 'Math Enthusiast',
        desc: 'Solve 50 mathematical problems.',
        icon: 'lucide-brain',
        criteria: { type: 'solve', count: 50 }
    },
    {
        id: 'ganit_guru',
        name: 'Ganit Guru',
        desc: 'Solve 100 mathematical problems.',
        icon: 'lucide-crown',
        criteria: { type: 'solve', count: 100 }
    },
    {
        id: 'steady_hand',
        name: 'Steady Hand',
        desc: 'Complete your first practice set.',
        icon: 'lucide-target',
        criteria: { type: 'practice', count: 1 }
    },
    {
        id: 'consistent_learner',
        name: 'Consistent Learner',
        desc: 'Maintain a 3-day login streak.',
        icon: 'lucide-flame',
        criteria: { type: 'streak', count: 3 }
    }
];

async function getAllBadges() {
    return BADGES;
}

async function getBadgeById(id) {
    return BADGES.find(b => b.id === id) || null;
}

async function getUserBadges(userId) {
    return await repo.getUserBadges(userId);
}

async function getBadgeProgress(userId, stats) {
    const earned = (await getUserBadges(userId)).map(ub => ub.badge_id);

    return BADGES.map(badge => {
        let progress = 0;
        let target = badge.criteria.count;
        let isEarned = earned.includes(badge.id);

        if (badge.criteria.type === 'solve') progress = stats.totalSolved || 0;
        if (badge.criteria.type === 'practice') progress = stats.totalPractice || 0;
        if (badge.criteria.type === 'streak') progress = stats.streak || 0;

        return {
            ...badge,
            earned: isEarned,
            progress: Math.min(progress, target),
            percent: Math.min(Math.floor((progress / target) * 100), 100)
        };
    });
}

/**
 * Checks and awards badges based on current stats.
 * Call this after significant user actions.
 */
async function checkAndAwardBadges(userId, stats) {
    const progress = await getBadgeProgress(userId, stats);
    const newAwards = [];

    for (const p of progress) {
        if (!p.earned && p.progress >= p.criteria.count) {
            const success = await repo.awardBadge(userId, p.id);
            if (success) newAwards.push(p);
        }
    }

    return newAwards;
}

module.exports = {
    getAllBadges,
    getBadgeById,
    getUserBadges,
    getBadgeProgress,
    checkAndAwardBadges
};
