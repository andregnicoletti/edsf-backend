import { FastifyReply, FastifyRequest } from "fastify";
import { UserTermsType } from "../../../@types/user-terms";
import { makeUserService } from "../../../services/factories/make-user-service";

export const updateUserTerms = async (request: FastifyRequest<{ Body: UserTermsType }>, response: FastifyReply) => {

    try {

        const userId = request.user.sub;
        const { terms } = request.body;

        const service = makeUserService();
        const result = await service.updateUserTerms(userId, terms, response);

        response.status(200).send({ status: true, data: result });
    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }
}