import { FastifyReply, FastifyRequest } from "fastify";
import { makeDataLoadService } from "../../../services/factories/make-upload-service";
import { UploadCodeType } from "../../../@types/upload-code-type";

export const downloadProcessedCsv = async (request: FastifyRequest<{ Params: UploadCodeType }>, response: FastifyReply) => {

    try {
        const service = makeDataLoadService();
        const userId = request.user.sub;

        const { uploadId } = request.params;
        const result = await service.getCsv(userId, uploadId);

        // Define os cabeçalhos para download do arquivo
        response.header('Content-Type', 'text/csv');
        response.header('Content-Disposition', `attachment; filename="${result.csvName}"`);

        // Envia o CSV
        // return response.send(result);
        response.status(200).send(result.csv);

    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }

}



