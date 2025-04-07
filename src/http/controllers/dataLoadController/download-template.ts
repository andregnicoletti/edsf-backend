import { FastifyReply, FastifyRequest } from "fastify";
import { GenericError } from "../../../errors/generic-error";
import { ErrorSchema } from "../../../schemas/error-schema";
import { makeDataLoadService } from "../../../services/factories/make-upload-service";
import { DownloadTemplate } from "../../../@types/download-template";

export const downloadCsv = async (request: FastifyRequest<{ Querystring: DownloadTemplate }>, response: FastifyReply) => {

    try {

        const role = request.user.role;
        const { template } = request.query

        const service = makeDataLoadService();

        const file = await service.getFile(role, template);

        // Define o cabeçalho da resposta para download de arquivo
        response.header('Content-Disposition', `attachment; filename="${file.csvName}"`);
        response.header('Content-Type', 'text/csv');

        return response.send(file.fileStream);

    } catch (error) {
        if (error instanceof GenericError) {
            response.status(400).send(new ErrorSchema(error));
        }
    }

}


