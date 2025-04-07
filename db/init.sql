CREATE USER edsf_admin WITH PASSWORD 'edsf_passwd';

-- Tornar o usuário um superusuário (tem todas as permissões)
ALTER USER edsf_admin WITH SUPERUSER;

CREATE DATABASE edsf_db;
\connect edsf_db;
CREATE SCHEMA edsf_sch AUTHORIZATION edsf_admin;

GRANT CONNECT ON DATABASE edsf_db TO edsf_admin;
GRANT ALL PRIVILEGES ON SCHEMA edsf_sch TO edsf_admin;
