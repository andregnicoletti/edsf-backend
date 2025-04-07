import { t } from "i18next";
import { GenericError } from "../errors/generic-error";
import { CompanyService } from "../services/company-service";
import { RecordRow } from "../services/data-load-service";
import { EventResponse } from "./event";
import { ProcessCsvRow } from "./interface/process-csv-row";
import { UploadServiceError } from "../errors/code-errors";
import { CompanyUploadSchema } from "../@types/upload-schemas";
import logger from "../config/logger";

export class CreateCompany implements ProcessCsvRow {

    private companyService: CompanyService;

    constructor(companyService: CompanyService) {
        this.companyService = companyService;
    }

    getCode(): string {
        return 'COMPANY'
    }

    execute = async (row: RecordRow): Promise<EventResponse> => {

        let out: EventResponse;

        const schema: CompanyUploadSchema = {
            companyCode: row['CODIGO_ORGANIZACAO'],
            companyDescription: row['DESC_ORGANIZACAO'],
            businessSegment: row['SEGMENTO_NEGOCIO'],
            event: row['TIPO_CADASTRO'],
            status: true,
        };

        try {

            Object.entries(schema).forEach(([key, value]) => {
                logger.info('key: ' + key + ' value: ' + value);
                if (value == undefined) {
                    throw new GenericError(t('messages.invalid_layout_to_event'),
                        UploadServiceError.ERROR_INVALID_LAYOUT);
                }
            })

            //Salvar dados do csv para histórico com informacao de status e erros
            const _ewCourse = await this.companyService.createNewCompany(schema.companyCode, schema.companyDescription, schema.businessSegment);


        } catch (error) {
            if (error instanceof Error) {
                schema.error = error.message;
                schema.status = false;
            }
        } finally {
            out = {
                code: this.getCode(),
                status: schema.status ? schema.status : false,
                schema,
            }
        }

        return Promise.resolve(out);

    }

}