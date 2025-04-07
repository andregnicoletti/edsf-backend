import { FastifyReply, FastifyRequest } from "fastify";
import { t } from "i18next";
import { makeAuthenticateService } from "../../services/factories/make-authenticate-service";

interface DecodedToken {
    sub: string;
    company: string;
    role: string;
    department: string;
    companyDescription: string;
}

export const verifyJWT = async (request: FastifyRequest, response: FastifyReply) => {

    try {

        const authenticateService = makeAuthenticateService();

        const token = request.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new Error(t('messages.token_not_send'));
        }

        await authenticateService.verifyToken(token);

        // Verifica o token usando o serviço
        const decoded = await request.jwtVerify<DecodedToken>();

        // Popula o request.user com os dados decodificados
        request.user = {
            sub: decoded.sub, // ID do usuário
            company: decoded.company,
            role: decoded.role,
            department: decoded.department,
            companyDescription: decoded.companyDescription,
        };

        await request.jwtVerify();

    } catch (error) {
        console.log(error)
        return response.status(401).send({ status: false, message: t('messages.unauthorized') })
    }

}