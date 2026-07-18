-- migrate:up
ALTER TABLE with_friends_games
    ADD COLUMN expired BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE with_friends_games
    DROP CONSTRAINT with_friends_games_player1_user_id_fkey,
    ALTER COLUMN player1_user_id DROP NOT NULL,
    ADD CONSTRAINT with_friends_games_player1_user_id_fkey
        FOREIGN KEY (player1_user_id) REFERENCES users (user_id) ON DELETE SET NULL,
    DROP CONSTRAINT with_friends_games_player2_user_id_fkey,
    ADD CONSTRAINT with_friends_games_player2_user_id_fkey
        FOREIGN KEY (player2_user_id) REFERENCES users (user_id) ON DELETE SET NULL;

-- migrate:down
DELETE FROM with_friends_games WHERE player1_user_id IS NULL;

ALTER TABLE with_friends_games
    DROP CONSTRAINT with_friends_games_player1_user_id_fkey,
    ALTER COLUMN player1_user_id SET NOT NULL,
    ADD CONSTRAINT with_friends_games_player1_user_id_fkey
        FOREIGN KEY (player1_user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    DROP CONSTRAINT with_friends_games_player2_user_id_fkey,
    ADD CONSTRAINT with_friends_games_player2_user_id_fkey
        FOREIGN KEY (player2_user_id) REFERENCES users (user_id) ON DELETE SET NULL,
    DROP COLUMN expired;
