-- migrate:up
CREATE TABLE ai_games (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    result TEXT CHECK (result IS NULL OR result IN ('win', 'lose', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- migrate:down
DROP TABLE ai_games;
