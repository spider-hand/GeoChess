-- migrate:up
ALTER TABLE users
ADD COLUMN ai_easy_total_win INTEGER NOT NULL DEFAULT 0,
ADD COLUMN ai_easy_total_lose INTEGER NOT NULL DEFAULT 0,
ADD COLUMN ai_medium_total_win INTEGER NOT NULL DEFAULT 0,
ADD COLUMN ai_medium_total_lose INTEGER NOT NULL DEFAULT 0,
ADD COLUMN ai_hard_total_win INTEGER NOT NULL DEFAULT 0,
ADD COLUMN ai_hard_total_lose INTEGER NOT NULL DEFAULT 0;

ALTER TABLE users
DROP COLUMN ai_game_total_lose,
DROP COLUMN ai_game_total_win;

-- migrate:down
ALTER TABLE users
ADD COLUMN ai_game_total_win INTEGER NOT NULL DEFAULT 0,
ADD COLUMN ai_game_total_lose INTEGER NOT NULL DEFAULT 0;

ALTER TABLE users
DROP COLUMN ai_hard_total_lose,
DROP COLUMN ai_hard_total_win,
DROP COLUMN ai_medium_total_lose,
DROP COLUMN ai_medium_total_win,
DROP COLUMN ai_easy_total_lose,
DROP COLUMN ai_easy_total_win;
