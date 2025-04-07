import { FastifyReply, FastifyRequest } from "fastify";
import { GenericError } from "../../../errors/generic-error";
import { ErrorSchema } from "../../../schemas/error-schema";
import { makeCourseService } from "../../../services/factories/make-course-service";
import { CreateCourseType } from "../../../@types/create-course-type";

export const create = async (request: FastifyRequest<{ Body: CreateCourseType }>, response: FastifyReply) => {

    try {

        // const requestBody = requestBodyValidation.parse(request.body);
        const { code, averageDuration, courseDescription, numberClass } = request.body;

        const service = makeCourseService();
        const resp = await service.createNewCourse(code, numberClass, averageDuration, courseDescription);


        response.status(200).send({
            status: true,
            course: resp,
        });

    } catch (error) {
        if (error instanceof GenericError) {
            response.status(400).send(new ErrorSchema(error));
        }

        throw error;
    }
}