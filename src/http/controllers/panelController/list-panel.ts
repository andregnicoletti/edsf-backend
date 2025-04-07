import { FastifyReply, FastifyRequest } from "fastify";
import { makePanelService } from "../../../services/factories/make-panel-service";

export const listPanels = async (request: FastifyRequest, response: FastifyReply) => {

    try {

        const userId = request.user.sub;

        const service = makePanelService();
        const result = await service.listPanel(userId);

        response.status(200).send({ status: true, panels: result });
    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }
}