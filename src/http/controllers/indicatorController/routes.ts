import { FastifyInstance } from "fastify";
import { verifyJWT } from "../../middlewares/verify-jwt";
import { listIndicator } from "./list-panel";
import { getIndicator } from "./get-panel";
import { IndicatorFind } from "../../../@types/indicator-find";
import { verifyRole } from "../../middlewares/verify-role";

const tags: [string] = ['Indicadores'];

export const indicatorController = async (app: FastifyInstance) => {

    //GET /panels: Lista todos os painéis de uma organização.
    app.get('/indicator', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Lista todos os indicadores de uma organização.',
        }
    }, listIndicator);

    //GET /panels/:id: Retorna os detalhes de um painel específico.
    app.get<{ Params: IndicatorFind }>('/indicator/:indicatorId', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Retorna os detalhes de um indicador específico.',
            params: {
                type: 'object',
                properties: {
                    indicatorId: { type: 'string' }
                }
            }
        }
    }, getIndicator);

}
