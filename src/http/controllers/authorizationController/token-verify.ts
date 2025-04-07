import { FastifyReply, FastifyRequest } from "fastify";
import { makeAuthenticateService } from "../../../services/factories/make-authenticate-service";

export const tokenVerify = async (request: FastifyRequest, response: FastifyReply) => {

    try {

        // await request.jwtVerify();
        console.log(request.user.sub);

        const authenticateService = makeAuthenticateService();
        const user = await authenticateService.getProfile(request.user.sub);

        return response.status(200).send(user);
 
    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }

}



