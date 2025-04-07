import { FastifyReply, FastifyRequest } from "fastify";
import { GenericError } from "../../../errors/generic-error";
import { ErrorSchema } from "../../../schemas/error-schema";
import { makeDataLoadService } from "../../../services/factories/make-upload-service";
import { DownloadPDF } from "../../../@types/download-pdf";

export const downloadPdf = async (request: FastifyRequest<{ Body: DownloadPDF }>, response: FastifyReply) => {

    try {

        // Captura o token do cabeçalho Authorization
        const authHeader = request.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            response.status(401).send('Token de autenticação inválido ou ausente.');
            return;
        }

        const { url } = request.body;
        const service = makeDataLoadService();
        const pdfBuffer = await service.generatePDF(url, authHeader);

        // Define cabeçalhos para download
        response
            .header('Content-Type', 'application/pdf')
            .header('Content-Disposition', 'attachment; filename="page.pdf"')
            .send(pdfBuffer);

    } catch (error) {
        if (error instanceof GenericError) {
            response.status(400).send(new ErrorSchema(error));
        }
    }

}


