import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeAuthenticateService } from "../../../services/factories/make-authenticate-service";

export const authenticate = async (request: FastifyRequest<{ Body: { email: string, code: string } }>, response: FastifyReply) => {

    try {

        const authenticateBodySchema = z.object({
            email: z.string().email(),
            code: z.string(),
        });

        const { email, code } = authenticateBodySchema.parse(request.body);

        const service = makeAuthenticateService();
        const token = await service.authenticate(email, code, response);

        response.status(200).send({ status: true, token });

    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }

}



