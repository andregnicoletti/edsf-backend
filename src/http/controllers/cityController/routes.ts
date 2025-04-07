import { FastifyInstance } from "fastify";
import { list } from "./list";
import { verifyJWT } from "../../middlewares/verify-jwt";
import { find } from "./find";
import { findByCity } from "./findByCity";
import { FindCitiesType } from "../../../@types/find-cities-type";
import { verifyRole } from "../../middlewares/verify-role";

const tags: [string] = ['Cidades'];

export const cityController = async (app: FastifyInstance) => {

    app.get<{ Querystring: FindCitiesType }>('/city', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Busca de cidades por nome e estado',
            querystring: {
                type: 'object',
                properties: {
                    cityName: { type: 'string' },
                    uf: { type: 'string' },
                }
            }
        }
    }, find);

    app.get<{ Querystring: FindCitiesType }>('/cities', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            summary: 'Busca de cidades por nome do municipio',
            querystring: {
                type: 'object',
                properties: {
                    cityName: { type: 'string' }
                }
            }
        }
    }, findByCity);

    app.get('/city/', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Lista todas as cidades'
        }
    }, list);

}
