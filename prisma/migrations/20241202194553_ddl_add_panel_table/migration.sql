-- CreateTable
CREATE TABLE "PAINEL" (
    "ID_PAINEL" TEXT NOT NULL,
    "TIPO_PAINEL" TEXT NOT NULL,
    "CONFIGURACAO" JSONB NOT NULL,
    "ID_ORGANIZACAO" TEXT NOT NULL,
    "ID_USUARIO" TEXT NOT NULL,
    "DATA_CRIACAO" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DATA_ATUALIZACAO" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PAINEL_pkey" PRIMARY KEY ("ID_PAINEL")
);

-- AddForeignKey
ALTER TABLE "PAINEL" ADD CONSTRAINT "PAINEL_ID_ORGANIZACAO_fkey" FOREIGN KEY ("ID_ORGANIZACAO") REFERENCES "CAD_ORGANIZACAO"("ID_ORGANIZACAO") ON DELETE RESTRICT ON UPDATE CASCADE;
