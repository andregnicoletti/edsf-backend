import { FastifyInstance } from "fastify";
import { list } from "./list";
import { find } from "./find";
import { create } from "./create";
import { listProducerByCities } from "./list-by-cities";
import { verifyJWT } from "../../middlewares/verify-jwt";
import { CreateProducerType } from "../../../@types/create-producer-type";
import { FindProducerType } from "../../../@types/find-producer-type";
import { ProducerFindByCity } from "../../../@types/producer-find-by-city";
import { listProducerByCityId } from "./list-by-cities-id";
import { ProducerFindByCityId } from "../../../@types/producer-find-by-city-id";
import { verifyRole } from "../../middlewares/verify-role";

const tags: [string] = ['Produtor'];

export const producerController = async (app: FastifyInstance) => {

    app.get<{ Querystring: ProducerFindByCity }>('/producer/find-by-city', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Pesquisa produtor por municipo',
            querystring: {
                type: 'object',
                properties: {
                    cityName: { type: 'string' },
                }
            }
        }
    }, listProducerByCities);

    app.get<{ Params: FindProducerType }>('/producer/:code', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Pesquisa produtor por código',
            params: {
                type: 'object',
                properties: {
                    code: { type: 'string' }
                }
            }
        }
    }, find);

    app.get('/producer', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Lista todos os produtores'
        }
    }, list);

    app.post<{ Body: CreateProducerType }>('/producer', {
        onRequest: [verifyJWT, verifyRole(['admin'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Cria um novo produtor',
            body: {
                type: 'object',
                required: ['companyCode', 'description', 'city', 'uf'],
                properties: {
                    companyCode: { type: 'string' },
                    description: { type: 'string' },
                    city: { type: 'string' },
                    uf: { type: 'string' },
                }
            }
        }
    }, create);

    app.post<{ Body: ProducerFindByCityId }>('/producer/find-by-cities-id', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Retorna todos os produtores de uma lista de cidades.',
            body: {
                type: 'object',
                required: ['ids'],
                properties: {
                    ids: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Lista de id de cidades'
                    },
                }
            }
        }
    }, listProducerByCityId);
}
