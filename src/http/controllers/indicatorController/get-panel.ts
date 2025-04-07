import { FastifyReply, FastifyRequest } from "fastify";
import { IndicatorFind } from "../../../@types/indicator-find";
import { makeIndicatorService } from "../../../services/factories/make-indicator-service";

export const getIndicator = async (request: FastifyRequest<{ Params: IndicatorFind }>, response: FastifyReply) => {

    try {
        const { indicatorId } = request.params;
        const userId = request.user.sub;

        const service = makeIndicatorService();
        const result = await service.getIndicator(userId, indicatorId);

        response.status(200).send({ status: true, panel: result });
    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }
}