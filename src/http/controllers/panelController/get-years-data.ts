import { FastifyReply, FastifyRequest } from "fastify";
import { makePanelService } from "../../../services/factories/make-panel-service";

export const getYearsData = async (request: FastifyRequest, response: FastifyReply) => {

    try {
        const userId = request.user.sub;

        const service = makePanelService();
        const result = await service.getYearsData(userId);

        response.status(200).send({ status: true, years: result });
    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }
}