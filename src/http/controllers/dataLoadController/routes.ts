import { FastifyInstance } from "fastify";
import { dataUpload } from "./upload-file";
import { downloadCsv } from "./download-template";
import { uploadStatus } from "./upload-status";
import { downloadProcessedCsv } from "./download-processed-csv";
import { uploadList } from "./upload-list";
import { uploadStatusList } from "./upload-status-list";
import { uploadCodes } from "./upload-codes";
import { calculate } from "./calculate";
import { verifyJWT } from "../../middlewares/verify-jwt";
import { UploadCodeType } from "../../../@types/upload-code-type";
import { DownloadTemplate } from "../../../@types/download-template";
import { downloadPdf } from "./download-pdf";
import { DownloadPDF } from "../../../@types/download-pdf";
import { verifyRole } from "../../middlewares/verify-role";

const tags: [string] = ['Carga de dados'];

export const dataLoadController = async (app: FastifyInstance) => {

    app.post<{ Body: DownloadPDF }>('/download/pdf', {
        onRequest: [verifyJWT, verifyRole(['admin'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Teste Gerador pdf',
            body: {
                type: 'object',
                required: ['url'],
                properties: {
                    url: { type: 'string' },
                }
            }
        }
    }, downloadPdf);

    app.get<{ Querystring: DownloadTemplate }>('/download/csv', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Download do .csv de template',
            querystring: {
                type: 'object',
                properties: {
                    template: { type: 'string' }
                }
            }
        }
    }, downloadCsv);

    app.get<{ Params: UploadCodeType }>('/download/csv/:uploadId', {
        onRequest: [verifyJWT, verifyRole(['admin'])],
        schema: {
            description: 'Gera um arquivo CSV para download',
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Baixar CSV',
            params: {
                type: 'object',
                properties: {
                    uploadId: { type: 'string' }
                },
                required: ['uploadId']
            },
            response: {
                200: {
                    description: 'Arquivo CSV gerado com sucesso',
                    type: 'string',
                    format: 'binary',
                    headers: {
                        'Content-Type': {
                            type: 'string',
                            example: 'text/csv',
                        },
                        'Content-Disposition': {
                            type: 'string',
                            example: 'attachment; filename="upload-template.csv"',
                        },
                    },
                },
            },
        },
    }, downloadProcessedCsv);

    app.post('/upload', {
        onRequest: [verifyJWT, verifyRole(['admin'])],
        schema: {
            description: 'Faz o upload de múltiplos arquivos CSV com identificadores',
            tags,
            security: [{ BearerAuth: [] }],
            consumes: ['multipart/form-data'],
            body: {
                type: 'array',
                properties: {
                    file: {
                        type: 'array',
                        items: {
                            type: 'string',
                            format: 'binary',
                            description: 'Arquivos CSV para upload'
                        }
                    }
                },
                required: ['file']
            }
        }
    }, dataUpload);

    app.get('/upload', {
        onRequest: [verifyJWT, verifyRole(['admin'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Lista todos os uploads',
        }
    }, uploadList);

    app.get('/upload/codes', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Lista todos os códigos para upload',
        }
    }, uploadCodes);

    app.get('/upload/detail', {
        onRequest: [verifyJWT, verifyRole(['admin'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Status de upload dos csv',
        }
    }, uploadStatusList);

    app.get<{ Params: UploadCodeType }>('/upload/detail/:uploadId', {
        onRequest: [verifyJWT, verifyRole(['admin'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Status de upload',
        }
    }, uploadStatus);

    app.get('/upload/execute', {
        onRequest: [verifyJWT, verifyRole(['admin'])],
        schema: {
            tags,
            summary: 'Calcula percentual realizado',
        }
    }, calculate);

}
