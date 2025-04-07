import { t } from "i18next";
import { UserServiceErrors } from "../errors/code-errors";
import { ServiceError } from "../errors/service-error";
import { UserRepository } from "../repositories/interface/user-repository";
import { CompanyService } from "./company-service";
import logger from "../config/logger";
import { FastifyReply } from "fastify";
import { PrismaSessionRepository } from "../repositories/prisma/prisma-session-repository";
import { AuthenticateService } from "./authenticate-service";

export class UserService {

    private authenticateService = new AuthenticateService(new PrismaSessionRepository(), this);

    constructor(
        private userRepository: UserRepository,
        private companyService: CompanyService,
    ) { }

    findUserByEmail = async (email: string) => {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new ServiceError(t('messages.user_not_found'),
                UserServiceErrors.ERROR_USER_NOT_FOUND);
        }

        return user;
    }

    getUserById = async (userId: string | null) => {
        if (!userId) {
            throw new ServiceError(t('messages.user_id_is_required'),
                UserServiceErrors.ERROR_USER_ID_IS_REQUIRED);
        }

        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new ServiceError(t('messages.user_not_found'),
                UserServiceErrors.ERROR_USER_NOT_FOUND);
        }

        return user;
    }

    updateAccessCode = async (userId: string, code: string) => {
        this.userRepository.updateUserCode(userId, code);
    }

    findUserByEmailWithCompany = async (email: string) => {
        const user = await this.findUserByEmail(email);
        const { companyDescription } = await this.companyService.findCompanyById(user?.company_id);
        return { ...user, companyDescription }
    }

    updateUserTerms = async (userId: string, terms: boolean, response: FastifyReply) => {

        const { id, lgpdConsent, lgpdAgreementDate } = await this.getUserById(userId);

        logger.info(`UserID: ${id}, LGPD Consent: ${lgpdConsent}, LGPD Agreement Date: ${lgpdAgreementDate}`);

        const update = await this.userRepository.updateConsent(userId, terms, new Date());

        if (!update.lgpdConsent) {
            this.authenticateService.logout(userId, response);
        }

        return update;

    }

    createUser = async (email: string, dddphone: string, companyCode: string, genCode?: string) => {
        const user = await this.userRepository.findByEmail(email);

        console.log(">>>>>>>>>>>>>>>> user: ", user);

        if (user) {
            throw new ServiceError(t('messages.user_mail_already_exists'),
                UserServiceErrors.ERROR_USER_EMAIL_ALREADY_EXISTS);
        }

        const { company } = await this.companyService.findCompanyByCode(companyCode);

        const data = {
            email,
            phone: dddphone,
            code: genCode,
            company_id: company.id
        }

        return await this.userRepository.save(data);

    }

}