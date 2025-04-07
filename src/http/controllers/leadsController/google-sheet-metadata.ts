import { FastifyReply, FastifyRequest } from "fastify";
import { GoogleSheetService } from "../../../services/google-sheet";

export const getMetadata = async (_request: FastifyRequest, response: FastifyReply) => {

    const googleSheetService = new GoogleSheetService();
    const auth = await googleSheetService.getAuth();
    const data = await googleSheetService.metadata(auth);

    response.send(data)

}