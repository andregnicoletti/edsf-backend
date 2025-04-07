-- Update Users
UPDATE "CAD_USUARIO"
SET "ID_ORGANIZACAO" = (select "ID_ORGANIZACAO" from "CAD_ORGANIZACAO" WHERE "CODIGO_ORGANIZACAO" = 'ORG2')
WHERE "EMAIL" IN ('teste2@cpqd.com.br', 'rogerio@jaentendiagro.com.br');

UPDATE "CAD_USUARIO"
SET "ID_ORGANIZACAO" = (select "ID_ORGANIZACAO" from "CAD_ORGANIZACAO" WHERE "CODIGO_ORGANIZACAO" = 'ORG1')
WHERE "EMAIL" IN ('teste@cpqd.com.br', 'mauricio@jaentendi.com.br');
