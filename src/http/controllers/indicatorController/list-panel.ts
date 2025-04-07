import { FastifyReply, FastifyRequest } from "fastify";
import { makeIndicatorService } from "../../../services/factories/make-indicator-service";

export const listIndicator  = async (request: FastifyRequest, response: FastifyReply) => {

    try {

        const userId = request.user.sub;

        const service = makeIndicatorService();
        const result = await service.listAllIndicators(userId);

        response.status(200).send({ status: true, panels: result });
    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }
}