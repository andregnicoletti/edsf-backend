import { FastifyReply, FastifyRequest } from "fastify";
import { makePanelService } from "../../../services/factories/make-panel-service";
import { PanelFind } from "../../../@types/panel-find";
import { PanelUpdate } from "../../../@types/panel-update";

export const updatePanel = async (request: FastifyRequest<{ Body: PanelUpdate, Params: PanelFind }>, response: FastifyReply) => {

    try {

        const userId = request.user.sub;
        const { panelName, panelType, configuration } = request.body;
        const { panelId } = request.params

        const service = makePanelService();
        const result = await service.updatePanel(userId, panelId, panelName, panelType, configuration);

        response.status(200).send({ status: true, filter: result });
    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }
}