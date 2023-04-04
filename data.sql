DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text NOT NULL,
    join_at timestamp without time zone NOT NULL,
    last_login_at timestamp with time zone
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    from_username text NOT NULL REFERENCES users ON DELETE CASCADE,
    to_username text NOT NULL REFERENCES users ON DELETE CASCADE,
    body text NOT NULL,
    sent_at timestamp with time zone NOT NULL,
    read_at timestamp with time zone
);

INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at) 
VALUES
('eddie123', '$2b$12$DxGUSeUO8T71X4waAGJvRODEXhqmXQmfk2wYAAdJeaSqTMZoizbYO', 'eddie', 'aviles', '9494444444',  NOW()::timestamp, NOW()),
('nancy123','$2b$12$A89.yxoTFm/.iA3P9lJB1.wT1ejtzfihguyphNqIdSzpBzURq.z8O', 'nancy', 'aviles', '9494444444',  NOW()::timestamp, NOW()),
('eric123','$2b$12$HenQaqTWBtrO0bI7mffCU.ZyIrjVtBc8hY8nr5.mfVen80FtqzGK.', 'eric', 'aviles', '9494444444',  NOW()::timestamp, NOW());

INSERT INTO messages (from_username, to_username, body, sent_at, read_at)
VALUES
('eddie123', 'nancy123', 'hello nancy', NOW(), NOW()),
('nancy123', 'eddie123', 'hello eddie', NOW(), NOW());