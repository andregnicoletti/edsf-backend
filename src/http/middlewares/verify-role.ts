import { FastifyReply, FastifyRequest } from "fastify";
import { t } from "i18next";

export const verifyRole = (requiredRoles: string[] | string) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Converte para array caso seja uma string
            const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

            // Verifica se o usuário está presente no request
            const user = request.user;
            if (!user) {
                return reply.status(401).send({ error: t('error.unauthorized') });
            }

            // Verifica se o papel do usuário está na lista de papéis permitidos
            if (!rolesToCheck.includes(user.role)) {
                return reply.status(403).send({ error: t('error.forbidden') });
            }
        } catch (error) {
            console.error(error); // Utilize o Winston para logs no futuro
            return reply.status(500).send({ error: t('error.internalServerError') });
        }
    };
};
