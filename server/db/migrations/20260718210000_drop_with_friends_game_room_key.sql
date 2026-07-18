-- migrate:up
ALTER TABLE with_friends_games DROP COLUMN room_key;

-- migrate:down
ALTER TABLE with_friends_games ADD COLUMN room_key TEXT;
