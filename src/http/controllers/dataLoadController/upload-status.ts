import { FastifyReply, FastifyRequest } from "fastify";
import { makeDataLoadService } from "../../../services/factories/make-upload-service";
import { UploadCodeType } from "../../../@types/upload-code-type";

export const uploadStatus = async (request: FastifyRequest<{ Params: UploadCodeType }>, response: FastifyReply) => {

    try {
        const service = makeDataLoadService();
        // const { company, role, department } = request.user;
        const userId = request.user.sub;

        const { uploadId } = request.params;
        const result = await service.getUploadStatus(uploadId, userId);
        response.status(200).send({ status: true, uploadsDetails: result });
    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }

}



