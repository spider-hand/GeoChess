-- migrate:up
DROP TABLE with_friends_game_moves;

-- migrate:down
CREATE TABLE with_friends_game_moves (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL REFERENCES with_friends_games (id) ON DELETE CASCADE,
    move_index INTEGER NOT NULL,
    country TEXT NOT NULL,
    actor TEXT NOT NULL CHECK (actor IN ('start', 'player1', 'player2')),
    user_id TEXT REFERENCES users (user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (game_id, move_index)
);
