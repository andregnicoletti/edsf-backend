import { FastifyReply, FastifyRequest } from "fastify";
import { makeDataLoadService } from "../../../services/factories/make-upload-service";

export const uploadCodes = async (request: FastifyRequest, response: FastifyReply) => {

    try {

        const role = request.user.role;

        const service = makeDataLoadService();
        const result = await service.listUploadCodes(role);
        response.status(200).send({ status: true, codes: result });
    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }

}



