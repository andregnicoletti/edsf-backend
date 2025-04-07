import { FastifyReply, FastifyRequest } from "fastify";
import { makeDataLoadService } from "../../../services/factories/make-upload-service";

export const calculate = async (_request: FastifyRequest, response: FastifyReply) => {

    try {
        const service = makeDataLoadService();
        const result = await service.calculatePercentageRealized();
        response.status(200).send({ status: true, result });
    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }

}



