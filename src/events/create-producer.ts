import { t } from "i18next";
import { GenericError } from "../errors/generic-error";
import { RecordRow } from "../services/data-load-service";
import { ProducerService } from "../services/producer-service";
import { EventResponse } from "./event";
import { ProcessCsvRow } from "./interface/process-csv-row";
import { UploadServiceError } from "../errors/code-errors";
import { ProducerUploadSchema } from "../@types/upload-schemas";
import logger from "../config/logger";


export class CreateProducer implements ProcessCsvRow {

    constructor(private producerService: ProducerService) { }

    getCode(): string {
        return 'PRODUCER'
    }

    execute = async (row: RecordRow): Promise<EventResponse> => {

        let out: EventResponse;

        const schema: ProducerUploadSchema = {
            producerCode: row['CODIGO_PRODUTOR'],
            producerDescription: row['DESC_PRODUTOR'],
            cityName: row['CIDADE'],
            uf: row['UF'],
            companyCode: row['CODIGO_ORGANIZACAO'],
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
            const _entity = await this.producerService.createNewProducer(
                schema.producerCode,
                schema.companyCode,
                schema.cityName,
                schema.uf,
                schema.producerDescription,
            );

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