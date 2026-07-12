-- migrate:up
ALTER TABLE users
ADD COLUMN country TEXT;

-- migrate:down
ALTER TABLE users
DROP COLUMN country;
