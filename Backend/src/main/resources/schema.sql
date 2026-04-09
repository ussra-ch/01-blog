-- -------------------------------------------------------------
--  USERS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL       PRIMARY KEY,
    username    VARCHAR(50)     NOT NULL UNIQUE,
    email       VARCHAR(100)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    avatar_url  VARCHAR(500),
    bio         VARCHAR(300),
    role        VARCHAR(10)     NOT NULL DEFAULT 'USER'
                                CHECK (role IN ('USER', 'ADMIN')),
    is_banned   BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);


-- -------------------------------------------------------------
--  POSTS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
    id          BIGSERIAL       PRIMARY KEY,
    user_id     BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200)    NOT NULL,
    description TEXT,
    media_url   VARCHAR(500),
    media_type  VARCHAR(10)     CHECK (media_type IN ('IMAGE', 'VIDEO')),
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);


-- -------------------------------------------------------------
--  COMMENTS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comments (
    id          BIGSERIAL       PRIMARY KEY,
    post_id     BIGINT          NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id     BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content     TEXT            NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);


-- -------------------------------------------------------------
--  LIKES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS likes (
    id          BIGSERIAL       PRIMARY KEY,
    post_id     BIGINT          NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id     BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),

    -- a user can only like a post once
    CONSTRAINT unique_like UNIQUE (post_id, user_id)
);


-- -------------------------------------------------------------
--  SUBSCRIPTIONS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
    id              BIGSERIAL   PRIMARY KEY,
    follower_id     BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),

    -- a user can only follow another user once
    CONSTRAINT unique_subscription UNIQUE (follower_id, following_id),
    -- a user cannot follow themselves
    CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);


-- -------------------------------------------------------------
--  NOTIFICATIONS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(20)     NOT NULL CHECK (type IN ('NEW_POST', 'NEW_COMMENT', 'NEW_LIKE')),
    message         TEXT            NOT NULL,
    is_read         BOOLEAN         NOT NULL DEFAULT FALSE,
    related_post_id BIGINT          REFERENCES posts(id) ON DELETE SET NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);


-- -------------------------------------------------------------
--  REPORTS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
    id                  BIGSERIAL       PRIMARY KEY,
    reporter_id         BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id    BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason              TEXT            NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),

    -- a user can only report another user once
    CONSTRAINT unique_report UNIQUE (reporter_id, reported_user_id),
    -- a user cannot report themselves
    CONSTRAINT no_self_report CHECK (reporter_id <> reported_user_id)
);


-- -------------------------------------------------------------
--  INDEXES
-- -------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_posts_user_id         ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id      ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id         ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_follower ON subscriptions(follower_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON reports(reported_user_id);