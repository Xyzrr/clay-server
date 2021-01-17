CREATE TABLE documents (
    id serial PRIMARY KEY,
    type VARCHAR(64) NOT NULL,
    content jsonb NOT NULL
);