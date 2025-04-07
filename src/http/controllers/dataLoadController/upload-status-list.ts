import { FastifyReply, FastifyRequest } from "fastify";
import { makeDataLoadService } from "../../../services/factories/make-upload-service";

export const uploadStatusList = async (request: FastifyRequest, response: FastifyReply) => {

    try {
        const userId = request.user.sub;
        const service = makeDataLoadService();

        const result = await service.listUploadStatus(userId);
        response.status(200).send({ status: true, uploadsDetails: result });
    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }

}



