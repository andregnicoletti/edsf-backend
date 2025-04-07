import { t } from "i18next";
import { GenericError } from "../errors/generic-error";
import { RecordRow } from "../services/data-load-service";
import { IndicatorService } from "../services/indicator-service";
import { EventResponse } from "./event";
import { ProcessCsvRow } from "./interface/process-csv-row";
import { UploadServiceError } from "../errors/code-errors";
import { ValueIndicatorUploadSchema } from "../@types/upload-schemas";
import logger from "../config/logger";

export class CreateIndicatorValue implements ProcessCsvRow {

    constructor(private indicatorService: IndicatorService) { }

    getCode(): string {
        return 'INDICATOR_VALUE'
    }

    execute = async (row: RecordRow): Promise<EventResponse> => {

        let out: EventResponse;

        const schema: ValueIndicatorUploadSchema = {
            producerCode: row['CODIGO_PRODUTOR'],
            indicatorCode: row['CODIGO_INDICADOR'],
            indicatorValue: row['VALOR_INDICADOR'],
            summaryGrouper: row['ANO_SUMARIZACAO'],
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
            const _entity = await this.indicatorService.summary(
                schema.indicatorCode,
                schema.producerCode,
                schema.indicatorValue,
                schema.summaryGrouper
            );

        } catch (error) {
            if (error instanceof Error) {
                schema.error = error.message;
                schema.status = false;
            } else {
                console.log('Erro desconhecido:', error)
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