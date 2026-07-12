-- migrate:up
ALTER TABLE users
ADD COLUMN ai_game_total_win INTEGER NOT NULL DEFAULT 0,
ADD COLUMN ai_game_total_lose INTEGER NOT NULL DEFAULT 0;

CREATE TABLE ai_game_moves (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL REFERENCES ai_games (id) ON DELETE CASCADE,
    move_index INTEGER NOT NULL,
    country TEXT NOT NULL,
    actor TEXT NOT NULL CHECK (actor IN ('start', 'player', 'ai')),
    user_id TEXT REFERENCES users (user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (game_id, move_index)
);

-- migrate:down
DROP TABLE ai_game_moves;

ALTER TABLE users
DROP COLUMN ai_game_total_lose,
DROP COLUMN ai_game_total_win;
