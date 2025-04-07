import { FastifyReply, FastifyRequest } from "fastify";
import { makeCourseService } from "../../../services/factories/make-course-service";
import { FindCourseType } from "../../../@types/find-course-type";

export const find = async (request: FastifyRequest<{ Params: FindCourseType }>, response: FastifyReply) => {

    try {
        const { code } = request.params;

        const service = makeCourseService();
        const course = await service.findCourseByCode(code);

        response.status(200).send({ course: course.course });

    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }
}