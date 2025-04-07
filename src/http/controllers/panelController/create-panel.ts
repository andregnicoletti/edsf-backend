import { FastifyReply, FastifyRequest } from "fastify";
import { PanelCreate } from "../../../@types/panel-create";
import { makePanelService } from "../../../services/factories/make-panel-service";

export const createPanel = async (request: FastifyRequest<{ Body: PanelCreate }>, response: FastifyReply) => {

    try {

        const userId = request.user.sub;
        const { panelName, panelType, configuration } = request.body;

        const service = makePanelService();
        const result = await service.createPanel(userId, panelName, panelType, configuration);

        response.status(200).send({ status: true, filter: result });
    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }
}