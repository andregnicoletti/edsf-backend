import { FastifyReply, FastifyRequest } from "fastify";
import { makeAuthenticateService } from "../../../services/factories/make-authenticate-service";


export const sendCode = async (request: FastifyRequest<{ Body: { email: string } }>, response: FastifyReply) => {

    try {

        const { email } = request.body;

        const service = makeAuthenticateService();
        const accessCode = await service.generateAccessCode(email);

        response.status(200).send({ status: true, message: 'Código gerado.', accessCode });

    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }

}



