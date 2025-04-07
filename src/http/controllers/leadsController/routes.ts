import { FastifyInstance } from "fastify";
import { readerRows } from "./google-sheet-reader";
import { writerRows } from "./google-sheet-writer";
import { getMetadata } from "./google-sheet-metadata";
import { getLeadsChannel } from "./get-leads-channel"
import { verifyJWT } from "../../middlewares/verify-jwt";
import { CreateLeadType } from "../../../@types/create-lead-type";
import { verifyRole } from "../../middlewares/verify-role";

const tags: [string] = ['Potenciais consumidores'];

export const leadsController = async (app: FastifyInstance) => {

    app.get('/leads/metadata', {
        onRequest: [verifyJWT, verifyRole(['admin'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
        }
    }, getMetadata);

    app.get('/leads/sheet', {
        onRequest: [verifyJWT, verifyRole(['admin'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
        }
    }, readerRows);

    app.post<{ Body: CreateLeadType }>('/leads', {
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Adiciona um novo lead em um csv',
            body: {
                type: 'object',
                properties: {
                    data: {
                        type: 'object',
                        required: ['name', 'company', 'referralSource', 'message'],
                        properties: {
                            name: { type: 'string' },
                            company: { type: 'string' },
                            phone: { type: 'string' },
                            email: { type: 'string' },
                            referralSource: { type: 'string' },
                            message: { type: 'string' },
                        }
                    }
                }
            }
        }
    }, writerRows);

    app.get('/leads', {
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Retorna todos os canais de leads',
        }
    }, getLeadsChannel);
}
