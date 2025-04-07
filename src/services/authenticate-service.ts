import { FastifyReply } from "fastify";
import { GenericError } from "../errors/generic-error";
import { ServiceError } from "../errors/service-error";
import { UserService } from "./user-service";
import { AuthenticateServiceErrors } from "../errors/code-errors";
import crypto from 'crypto';
import { t } from "i18next";
import logger from "../config/logger";
import { SessionRepository } from "../repositories/interface/session-repository";

export interface SessionData {
    userId: string,
    token: string,
    valid: boolean,
}

export class AuthenticateService {

    constructor(
        private sessionRepository: SessionRepository,
        private userService: UserService
    ) { }

    authenticate = async (email: string, code: string, response: FastifyReply) => {
        try {

            // const user = await this.userService.findUserByEmail(email);
            const user = await this.userService.findUserByEmailWithCompany(email);

            logger.info(`user: ${user.id}`)
            logger.info(`code: ${code}`)

            // const doesRandomCodeMAtches = await compare(code, user.code);
            const doesRandomCodeMAtches = code === user.code ? true : false;

            if (!doesRandomCodeMAtches) {
                throw new ServiceError(t('messages.invalid_credentials'),
                    AuthenticateServiceErrors.ERROR_INVALID_CREDENTIALS);
            }

            const token = await response.jwtSign(
                {
                    company: user.company_id, // Para limitar os dados à empresa do usuário.
                    role: user.role, // Para definir permissões (por exemplo, admin, manager, user).
                    department: '', // Para filtrar por departamento (ex.: marketing, finance).
                    companyDescription: user.companyDescription,
                },
                {
                    sign: {
                        sub: user.id,
                        expiresIn: '1h',
                    }
                },
            )

            // Salva o token na tabela de sessões
            const data: SessionData = {
                userId: user.id,
                token: token,
                valid: true,
            }
            await this.sessionRepository.save(data);

            return `Bearer ${token}`;

        } catch (error) {
            if (error instanceof GenericError) {
                throw new ServiceError(error.message, AuthenticateServiceErrors.ERROR_INVALID_CREDENTIALS);
            }
        }
    }

    getProfile = async (userId: string) => {
        const user = await this.userService.getUserById(userId);
        // return user;
        return {
            ...user,
            code: undefined,
        }
    }

    generateAccessCode = async (email: string) => {

        // Retorna usuário cadastrado
        const _user = await this.userService.findUserByEmail(email);

        // TODO - Habilitar geração de código aleatório depois
        // Gera o código
        const code = this.generateCode();

        // Salva código gerado no banco de dados
        // await this.userService.updateAccessCode(user.id, code);

        //TODO - enviar código por email ou SMS

        return code;

    }

    // Função auxiliar para gerar um código aleatório
    private generateCode = (): string => {
        return crypto.randomInt(100000, 999999).toString();
    }


    logout = async (userId: string, response: FastifyReply) => {
        try {

            // Atualiza todas as sessões do usuário para inválido
            await this.sessionRepository.stopSession(userId);

            // Se estiver usando cookies para armazenar o token
            response.clearCookie('token');

            // Responda ao cliente confirmando o logout
            return { message: t('messages.logout_success') };
        } catch (error) {
            if (error instanceof Error) {
                logger.error(`Erro no logout: ${error.message}`);
                throw new ServiceError(t('messages.logout_error'), AuthenticateServiceErrors.ERROR_LOGOUT);
            }
        }
    };

    verifyToken = async (token: string) => {
        const session = await this.sessionRepository.findFirst(token, true);

        if (!session) {
            throw new ServiceError(t('messages.invalid_token'), AuthenticateServiceErrors.ERROR_INVALID_TOKEN);
        }

        return session;
    };

}