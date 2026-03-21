/*
 * GANITSUTRAM
 * A Living Knowledge Ecosystem for Mathematical Discovery
 *
 * "यथा शिखा मयूराणां नागानां मणयो यथा
 *  तद्वद् वेदाङ्गशास्त्रणां गणितं मूर्ध्नि वर्तते"
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
 * Purpose: PostgreSQL DDL migrations for GanitSūtram backend.
 *          Contains an array of SQL commands to initialize the schema.
 */

const migrations = [
    `CREATE TABLE IF NOT EXISTS users (
        user_id       VARCHAR(36) PRIMARY KEY,
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role          VARCHAR(50) NOT NULL,
        display_name  VARCHAR(255),
        avatar_url    TEXT,
        created_at    TIMESTAMP NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS progress (
        progress_id   VARCHAR(36) PRIMARY KEY,
        user_id       VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        operation     VARCHAR(100) NOT NULL,
        input         TEXT,
        input_a       TEXT,
        input_b       TEXT,
        result        TEXT NOT NULL,
        steps         TEXT,
        solved_at     TIMESTAMP NOT NULL,
        time_taken_ms INTEGER
    )`,

    `CREATE TABLE IF NOT EXISTS sessions (
        session_id    VARCHAR(36) PRIMARY KEY,
        user_id       VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        created_at    TIMESTAMP NOT NULL,
        expires_at    TIMESTAMP NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS practice_attempts (
        attempt_id     VARCHAR(36) PRIMARY KEY,
        user_id        VARCHAR(36) REFERENCES users(user_id) ON DELETE CASCADE,
        operation      VARCHAR(100) NOT NULL,
        question       TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        user_answer    TEXT,
        is_correct     SMALLINT NOT NULL,
        difficulty     VARCHAR(50) NOT NULL,
        attempted_at   TIMESTAMP NOT NULL,
        time_taken_ms  INTEGER
    )`,

    `CREATE TABLE IF NOT EXISTS discoveries (
        discovery_id   VARCHAR(36) PRIMARY KEY,
        slug          VARCHAR(255) UNIQUE NOT NULL,
        title         VARCHAR(255) NOT NULL,
        icon          TEXT NOT NULL,
        sutra         TEXT,
        sutra_meaning TEXT,
        description   TEXT NOT NULL,
        long_desc     TEXT,
        example_input TEXT,
        example_output TEXT,
        category      VARCHAR(100) NOT NULL,
        difficulty    VARCHAR(50) NOT NULL,
        sort_order    INTEGER DEFAULT 0,
        created_at    TIMESTAMP NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS discovery_patterns (
        pattern_id    VARCHAR(36) PRIMARY KEY,
        discovery_id  VARCHAR(36) NOT NULL REFERENCES discoveries(discovery_id) ON DELETE CASCADE,
        pattern_label VARCHAR(255) NOT NULL,
        pattern_desc  TEXT NOT NULL,
        example       TEXT
    )`,

    `CREATE TABLE IF NOT EXISTS schools (
        school_id   VARCHAR(36) PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        admin_id    VARCHAR(36) REFERENCES users(user_id) ON DELETE SET NULL,
        student_cap INTEGER DEFAULT 100,
        created_at  TIMESTAMP NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS enrollments (
        enrollment_id VARCHAR(36) PRIMARY KEY,
        school_id     VARCHAR(36) NOT NULL REFERENCES schools(school_id) ON DELETE CASCADE,
        user_id       VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        enrolled_at   TIMESTAMP NOT NULL,
        status        VARCHAR(50) DEFAULT 'active'
    )`,

    `CREATE TABLE IF NOT EXISTS reset_tokens (
        token_id    VARCHAR(36) PRIMARY KEY,
        user_id     VARCHAR(36) REFERENCES users(user_id) ON DELETE CASCADE,
        token_hash  TEXT NOT NULL UNIQUE,
        expires_at  TIMESTAMP NOT NULL,
        used        SMALLINT DEFAULT 0,
        created_at  TIMESTAMP NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS refresh_sessions (
        session_id       VARCHAR(36) PRIMARY KEY,
        user_id          VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        refresh_token_hash TEXT NOT NULL UNIQUE,
        family_id        TEXT NOT NULL,
        device_hint      TEXT,
        ip_hint          TEXT,
        issued_at        TIMESTAMP NOT NULL,
        expires_at       TIMESTAMP NOT NULL,
        last_used_at     TIMESTAMP,
        rotated          SMALLINT DEFAULT 0,
        revoked          SMALLINT DEFAULT 0
    )`,

    `CREATE TABLE IF NOT EXISTS analytics_events (
        event_id     VARCHAR(36) PRIMARY KEY,
        event_type   VARCHAR(100) NOT NULL,
        user_id      VARCHAR(36),
        session_id   VARCHAR(36),
        operation    VARCHAR(100),
        metadata     TEXT,
        ip_hint      TEXT,
        user_agent   TEXT,
        created_at   TIMESTAMP NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS user_badges (
        user_badge_id  VARCHAR(36) PRIMARY KEY,
        user_id        VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        badge_id       VARCHAR(100) NOT NULL,
        earned_at      TIMESTAMP NOT NULL,
        notified       SMALLINT DEFAULT 0
    )`,

    `CREATE TABLE IF NOT EXISTS user_scores (
        score_id       VARCHAR(36) PRIMARY KEY,
        user_id        VARCHAR(36) NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
        display_name   VARCHAR(255),
        total_points   INTEGER DEFAULT 0,
        weekly_points  INTEGER DEFAULT 0,
        monthly_points INTEGER DEFAULT 0,
        streak         INTEGER DEFAULT 0,
        rank_global    INTEGER,
        rank_weekly    INTEGER,
        last_updated   TIMESTAMP NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS point_events (
        event_id       VARCHAR(36) PRIMARY KEY,
        user_id        VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        points         INTEGER NOT NULL,
        reason         VARCHAR(255) NOT NULL,
        operation      VARCHAR(100),
        created_at     TIMESTAMP NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS cms_content (
        content_id     VARCHAR(36) PRIMARY KEY,
        content_type   VARCHAR(100) NOT NULL,
        slug           VARCHAR(255) UNIQUE NOT NULL,
        title_en       VARCHAR(255) NOT NULL,
        title_hi       VARCHAR(255),
        title_sa       VARCHAR(255),
        body_en        TEXT NOT NULL,
        body_hi        TEXT,
        body_sa        TEXT,
        excerpt_en     TEXT,
        excerpt_hi     TEXT,
        excerpt_sa     TEXT,
        icon           TEXT,
        category       VARCHAR(100),
        difficulty     VARCHAR(50),
        tags           TEXT,
        sort_order     INTEGER DEFAULT 0,
        published      SMALLINT DEFAULT 0,
        featured       SMALLINT DEFAULT 0,
        author_id      VARCHAR(36) REFERENCES users(user_id),
        created_at     TIMESTAMP NOT NULL,
        updated_at     TIMESTAMP NOT NULL,
        published_at   TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS cms_revisions (
        revision_id    VARCHAR(36) PRIMARY KEY,
        content_id     VARCHAR(36) REFERENCES cms_content(content_id) ON DELETE CASCADE,
        author_id      VARCHAR(36) REFERENCES users(user_id),
        title_en       VARCHAR(255),
        body_en        TEXT,
        change_summary TEXT,
        created_at     TIMESTAMP NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS cms_media (
        media_id       VARCHAR(36) PRIMARY KEY,
        content_id     VARCHAR(36) REFERENCES cms_content(content_id) ON DELETE CASCADE,
        media_type     VARCHAR(100),
        label          VARCHAR(255),
        value          TEXT,
        sort_order     INTEGER DEFAULT 0
    )`,

    `CREATE TABLE IF NOT EXISTS notifications (
        notification_id  VARCHAR(36) PRIMARY KEY,
        user_id          VARCHAR(36) REFERENCES users(user_id) ON DELETE CASCADE,
        type             VARCHAR(100) NOT NULL,
        title            VARCHAR(255) NOT NULL,
        body             TEXT NOT NULL,
        icon             TEXT,
        action_url       TEXT,
        action_label     VARCHAR(255),
        read             SMALLINT DEFAULT 0,
        created_at       TIMESTAMP NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS notification_prefs (
        user_id           VARCHAR(36) PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
        badge_earned      SMALLINT DEFAULT 1,
        rank_up           SMALLINT DEFAULT 1,
        rank_milestone    SMALLINT DEFAULT 1,
        streak_milestone  SMALLINT DEFAULT 1,
        practice_result   SMALLINT DEFAULT 0,
        content_published SMALLINT DEFAULT 1,
        system            SMALLINT DEFAULT 1,
        weekly_reset      SMALLINT DEFAULT 1,
        points_awarded    SMALLINT DEFAULT 0,
        email_badge       SMALLINT DEFAULT 1,
        email_milestone   SMALLINT DEFAULT 1,
        email_system      SMALLINT DEFAULT 0
    )`,

    `CREATE TABLE IF NOT EXISTS search_index (
        doc_id      VARCHAR(36) PRIMARY KEY,
        doc_type    VARCHAR(100) NOT NULL,
        slug        VARCHAR(255),
        title       VARCHAR(255) NOT NULL,
        body        TEXT,
        tags        TEXT,
        category    VARCHAR(100),
        locale      VARCHAR(10) DEFAULT 'en',
        weight      INTEGER DEFAULT 1,
        updated_at  TIMESTAMP NOT NULL,
        search_vector TSVECTOR
    )`,

    // Replace FTS5 with GIN index on search_vector
    `CREATE INDEX IF NOT EXISTS search_idx_gin ON search_index USING GIN(search_vector)`,

    // Add trigger for auto-updating tsvector (Using English dictionary for general content, can be localized later)
    `CREATE OR REPLACE FUNCTION update_search_vector() RETURNS trigger AS $$
    BEGIN
      NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.tags, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.category, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(NEW.body, '')), 'D');
      RETURN NEW;
    END
    $$ LANGUAGE plpgsql;`,

    `DROP TRIGGER IF EXISTS tsvector_update ON search_index;`,

    `CREATE TRIGGER tsvector_update BEFORE INSERT OR UPDATE
    ON search_index FOR EACH ROW EXECUTE FUNCTION update_search_vector();`,

    `CREATE TABLE IF NOT EXISTS graph_nodes (
        node_id     VARCHAR(36) PRIMARY KEY,
        node_type   VARCHAR(100) NOT NULL,
        label       VARCHAR(255) NOT NULL,
        label_hi    VARCHAR(255),
        label_sa    VARCHAR(255),
        description TEXT,
        icon        TEXT,
        category    VARCHAR(100),
        url         TEXT,
        weight      INTEGER DEFAULT 1,
        metadata    TEXT
    )`,

    `CREATE TABLE IF NOT EXISTS graph_edges (
        edge_id     VARCHAR(36) PRIMARY KEY,
        source_id   VARCHAR(36) REFERENCES graph_nodes(node_id) ON DELETE CASCADE,
        target_id   VARCHAR(36) REFERENCES graph_nodes(node_id) ON DELETE CASCADE,
        edge_type   VARCHAR(100) NOT NULL,
        label       VARCHAR(255),
        weight      INTEGER DEFAULT 1
    )`,

    `CREATE TABLE IF NOT EXISTS search_history (
        history_id      VARCHAR(36) PRIMARY KEY,
        user_id         VARCHAR(36),
        query           TEXT NOT NULL,
        results_count   INTEGER,
        clicked_doc_id  VARCHAR(36),
        locale          VARCHAR(10),
        created_at      TIMESTAMP NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS ip_blacklist (
        id            VARCHAR(36) PRIMARY KEY,
        ip            VARCHAR(45) UNIQUE NOT NULL,
        reason        VARCHAR(100) NOT NULL,
        blocked_at    TIMESTAMP NOT NULL,
        expires_at    TIMESTAMP,
        blocked_by    VARCHAR(36),
        request_count INTEGER DEFAULT 0,
        last_seen     TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS ip_whitelist (
        id            VARCHAR(36) PRIMARY KEY,
        ip            VARCHAR(45) UNIQUE NOT NULL,
        label         VARCHAR(255),
        added_by      VARCHAR(36),
        added_at      TIMESTAMP NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS threat_log (
        id            VARCHAR(36) PRIMARY KEY,
        ip            VARCHAR(45) NOT NULL,
        threat_type   VARCHAR(100) NOT NULL,
        path          TEXT,
        method        VARCHAR(10),
        payload       TEXT,
        user_agent    TEXT,
        detected_at   TIMESTAMP NOT NULL,
        auto_blocked  SMALLINT DEFAULT 0
    )`,

    `CREATE INDEX IF NOT EXISTS idx_threat_log_ip_date ON threat_log(ip, detected_at DESC)`,

    `CREATE TABLE IF NOT EXISTS system_errors (
        error_id      VARCHAR(36) PRIMARY KEY,
        session_id    VARCHAR(255),
        url           TEXT,
        message       TEXT NOT NULL,
        stack         TEXT,
        user_agent    TEXT,
        created_at    TIMESTAMP NOT NULL
    )`
];

module.exports = { migrations };
