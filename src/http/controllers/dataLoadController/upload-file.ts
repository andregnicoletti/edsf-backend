import { FastifyReply, FastifyRequest } from "fastify";
import { makeDataLoadService } from "../../../services/factories/make-upload-service";

export const dataUpload = async (request: FastifyRequest, response: FastifyReply) => {

    try {

        const userId = request.user.sub;

        const parts = request.parts(); // Use o método `parts` para lidar com múltiplos arquivos
        const service = makeDataLoadService();
        const result = await service.processCsv(parts, userId);
        response.status(200).send({ status: true, uploadDetails: result });
    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }
}



