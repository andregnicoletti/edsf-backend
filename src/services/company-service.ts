import { ServiceError } from "../errors/service-error";
import { CompanyServiceErrors } from "../errors/code-errors";
import { CompanyEntity } from "@prisma/client";
import { CompanyRepository } from "../repositories/interface/company-repository";
import { t } from "i18next";

interface CompanyServiceResponse {
    company: CompanyEntity
}

export class CompanyService {

    constructor(private companyRepository: CompanyRepository) { }

    findCompanyByCode = async (code: string): Promise<CompanyServiceResponse> => {
        const company = await this.companyRepository.findByCode(code);
        if (!company) {
            throw new ServiceError(t('messages.company_with_code_does_not_exists', { code }), CompanyServiceErrors.ERROR_COMPANY_CODE_DOESNT_EXISTIS);
        }
        return { company }
    }

    createNewCompany = async (code: string, companyDescription: string, businessSegment: string): Promise<CompanyServiceResponse> => {
        if (!code) {
            throw new ServiceError(t('messages.company_code_is_required'),
                CompanyServiceErrors.ERROR_COMPANY_CODE_IS_REQUIRED);
        } else if (!companyDescription) {
            throw new ServiceError(t('messages.organization_description_field_is_required'),
                CompanyServiceErrors.ERROR_COMPANY_DESCRIPTION_IS_REQUIRED);
        } else if (!businessSegment) {
            throw new ServiceError(t('messages.business_segment_is_required'),
                CompanyServiceErrors.ERROR_BUSINESS_SEGMENT_IS_REQUIRED);
        }

        let company;
        try {
            company = await this.findCompanyByCode(code);
        } catch (_error) {
            //ignora erro se não existir empresa com o código
        }

        if (company) {
            throw new ServiceError(t('messages.company_with_code_already_exists', { code }),
                CompanyServiceErrors.ERROR_COMPANY_CODE_ALREADY_EXISTS)
        }

        const newCompany = await this.companyRepository.save({
            code,
            companyDescription,
            businessSegment,
        })

        return { company: newCompany }

    }

    findCompanyById = async (companyId: string) => {
        const company = await this.companyRepository.findById(companyId);
        if (!company) {
            throw new ServiceError(t('messages.company_id_does_not_exist', { companyId }),
                CompanyServiceErrors.ERROR_COMPANY_ID_DOES_NOT_EXIST)
        }
        return company;
    }
}



