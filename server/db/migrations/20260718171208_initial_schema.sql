-- migrate:up
CREATE TABLE users (
    user_id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL CHECK (btrim(display_name) <> ''),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    country TEXT,
    ai_easy_total_win INTEGER NOT NULL DEFAULT 0,
    ai_easy_total_lose INTEGER NOT NULL DEFAULT 0,
    ai_medium_total_win INTEGER NOT NULL DEFAULT 0,
    ai_medium_total_lose INTEGER NOT NULL DEFAULT 0,
    ai_hard_total_win INTEGER NOT NULL DEFAULT 0,
    ai_hard_total_lose INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE ai_games (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    result TEXT CHECK (result IS NULL OR result IN ('win', 'lose', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE with_friends_games (
    id TEXT PRIMARY KEY,
    player1_user_id TEXT REFERENCES users (user_id) ON DELETE SET NULL,
    player2_user_id TEXT REFERENCES users (user_id) ON DELETE SET NULL,
    result TEXT CHECK (
        result IS NULL OR result IN ('player1_win', 'player2_win', 'cancelled')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expired BOOLEAN NOT NULL DEFAULT FALSE
);

-- migrate:down
DROP TABLE with_friends_games;
DROP TABLE ai_games;
DROP TABLE users;
