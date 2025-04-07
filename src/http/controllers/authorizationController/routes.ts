import { FastifyInstance } from "fastify";
import { authenticate } from "./authenticate";
import { tokenVerify } from "./token-verify";
import { verifyJWT } from "../../middlewares/verify-jwt";
import { sendCode } from "./send-code";
import { verifyRole } from "../../middlewares/verify-role";

const tags: [string] = ['Autorização'];

export const authorizationController = async (app: FastifyInstance) => {

    app.post('/login', {
        schema: {
            tags,
            summary: 'Retorna um token de acesso',
            body: {
                type: 'object',
                required: ['email', 'code'],
                properties: {
                    email: { type: 'string' },
                    code: { type: 'string' },
                },
            }
        }
    }, authenticate);

    app.post('/send-code', {
        schema: {
            tags,
            summary: 'Retorna um código de acesso',
            body: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: { type: 'string' },
                },
            }
        }
    }, sendCode);

    app.post('/verify', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Verifica o token de acesso',
        }
    }, tokenVerify);

}