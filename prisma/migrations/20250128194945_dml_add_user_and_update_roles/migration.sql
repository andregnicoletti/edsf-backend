-- Update Users
UPDATE "CAD_USUARIO"
SET "PERFIL" = 'admin'
WHERE "EMAIL" IN (
        'mauricio@jaentendi.com.br',
        'rogerio@jaentendiagro.com.br'
    );

INSERT INTO "CAD_USUARIO" (
        "ID_USUARIO",
        "EMAIL",
        "DDCELULARSMS",
        "CODIGO",
        "ID_ORGANIZACAO"
    )
VALUES (
        gen_random_uuid(),
        'teste2@cpqd.com.br',
        '1999999999',
        '1234',
        (
            SELECT "ID_ORGANIZACAO"
            FROM "CAD_ORGANIZACAO"
            WHERE "CODIGO_ORGANIZACAO" = 'ORG1'
        )
    );