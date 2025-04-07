import { FastifyReply, FastifyRequest } from "fastify";
import { makePanelService } from "../../../services/factories/make-panel-service";
import { PanelFind } from "../../../@types/panel-find";

export const deletePanel = async (request: FastifyRequest<{ Params: PanelFind }>, response: FastifyReply) => {

    try {

        const { panelId } = request.params;
        const userId = request.user.sub;

        const service = makePanelService();
        const result = await service.deletePanel(userId, panelId);

        response.status(200).send({ status: true, panel: result });
    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }
}