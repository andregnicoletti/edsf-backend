import { FastifyInstance } from "fastify";
import { textInfo } from "./info";
import { textTerms } from "./terms";
import { verifyJWT } from "../../middlewares/verify-jwt";
import { verifyRole } from "../../middlewares/verify-role";

const tags: [string] = ['Textos'];

export const markdownController = async (app: FastifyInstance) => {

    app.get('/static-info', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Informações',
        }
    }, textInfo);

    app.get('/static-terms', {
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Termos',
        }
    }, textTerms);

}
