import { FastifyReply, FastifyRequest } from "fastify";
import { GoogleSheetService } from "../../../services/google-sheet";

export const readerRows = async (_request: FastifyRequest, response: FastifyReply) => {

    const googleSheetService = new GoogleSheetService();

    const auth = await googleSheetService.getAuth();
    const data = await googleSheetService.readSheet(auth)

    response.send(data.values);

}