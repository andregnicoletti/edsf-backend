import { FastifyInstance } from "fastify";
import { verifyJWT } from "../../middlewares/verify-jwt";
import { UserTermsType } from "../../../@types/user-terms";
import { updateUserTerms } from "./user-terms";
import { verifyRole } from "../../middlewares/verify-role";

const tags: [string] = ['User'];

export const UserController = async (app: FastifyInstance) => {

    app.post<{ Body: UserTermsType }>('/user/terms', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            summary: 'Termos de uso e privacidade',
            body: {
                type: 'object',
                properties: {
                    terms: {
                        type: 'boolean',
                        description: 'Lista de cidades'
                    },
                },
            }
        }
    }, updateUserTerms);

}
