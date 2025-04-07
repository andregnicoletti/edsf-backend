import { FastifyInstance } from "fastify";
import { list } from "./list";
import { find } from "./find";
import { create } from "./create";
import { deleteCourse } from "./delete";
import { verifyJWT } from "../../middlewares/verify-jwt";
import { FindCourseType } from "../../../@types/find-course-type";
import { CreateCourseType } from "../../../@types/create-course-type";
import { DeleteCourseType } from "../../../@types/delete-course-type";
import { verifyRole } from "../../middlewares/verify-role";

const tags: [string] = ['Curso'];

export const courseController = async (app: FastifyInstance) => {

    app.get<{ Params: FindCourseType }>('/curso/:code', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Pesquisa curso por código',
            params: {
                type: 'object',
                properties: {
                    code: { type: 'string' }
                },
                required: ['code']
            },
        }
    }, find);

    app.get('/course', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Lista todos os cursos'
        }
    }, list);

    app.post<{ Body: CreateCourseType }>('/curso', {
        onRequest: [verifyJWT, verifyRole(['admin'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Cria um novo curso',
            body: {
                type: 'object',
                required: ['code', 'courseDescription', 'numberClass', 'averageDuration'],
                properties: {
                    code: { type: 'string' },
                    courseDescription: { type: 'string' },
                    numberClass: { type: 'integer' },
                    averageDuration: { type: 'number' },
                },
            }
        }
    }, create);

    app.delete<{ Querystring: DeleteCourseType }>('/curso/:code', {
        onRequest: [verifyJWT, verifyRole(['admin'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Apaga um curso por codigo',
            params: {
                type: 'object',
                properties: {
                    code: { type: 'string' }
                },
                required: ['code']
            }
        }
    }, deleteCourse);

}
