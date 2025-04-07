import { FastifyReply, FastifyRequest } from "fastify";
import { makeDataLoadService } from "../../../services/factories/make-upload-service";

export const uploadList = async (_request: FastifyRequest, response: FastifyReply) => {

    try {
        const service = makeDataLoadService();
        const result = await service.listAllUploads();
        response.status(200).send({ status: true, uploads: result });
    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }

}



