import { FastifyReply, FastifyRequest } from "fastify";
import { makeCourseService } from "../../../services/factories/make-course-service";
import { DeleteCourseType } from "../../../@types/delete-course-type";

export const deleteCourse = async (request: FastifyRequest<{ Querystring: DeleteCourseType }>, response: FastifyReply) => {

    const { code } = request.query;

    const service = makeCourseService();
    const resp = await service.removeCourseByCode(code);

    response.status(200).send({
        status: true,
        course: resp,
    });
}