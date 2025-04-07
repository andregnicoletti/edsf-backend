import { FastifyReply, FastifyRequest } from "fastify";
import { makeCourseService } from "../../../services/factories/make-course-service";

export const list = async (request: FastifyRequest, response: FastifyReply) => {

    try {

        const userId = request.user.sub;

        const service = makeCourseService();
        const courses = await service.listAllCourses(userId);

        response.status(200).send({ status: true, courses });

    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }
}