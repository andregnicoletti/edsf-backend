import { FastifyInstance } from "fastify";
import { healthCheck } from "./health-check";

export const healthController = async (app: FastifyInstance) => {

    app.get('/health', {
        schema: {
            tags: ['Check'],
            security: [{ BearerAuth: [] }],
            summary: 'Verifica status do serviço'
        }
    }, healthCheck);
}
