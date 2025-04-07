import { t } from "i18next";
import { GenericError } from "../errors/generic-error";
import { RecordRow } from "../services/data-load-service";
import { IndicatorService } from "../services/indicator-service";
import { EventResponse } from "./event";
import { ProcessCsvRow } from "./interface/process-csv-row";
import { UploadServiceError } from "../errors/code-errors";
import { IndicatorCourseUploadSchema } from "../@types/upload-schemas";
import logger from "../config/logger";

export class CreateIndicatorCourse implements ProcessCsvRow {

    constructor(private indicatorService: IndicatorService) { }

    getCode(): string {
        return 'INDICATOR_COURSE'
    }

    execute = async (row: RecordRow): Promise<EventResponse> => {

        let out: EventResponse;

        const schema: IndicatorCourseUploadSchema = {
            indicatorCode: row['CODIGO_INDICADOR'],
            courseCode: row['CODIGO_CURSO'],
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
            const _entity = await this.indicatorService.createNewIndicatorCourseAssoc(
                schema.indicatorCode,
                schema.courseCode,
            );
          

        } catch (error) {
            if (error instanceof Error) {
                schema.status = false;
                schema.error = error.message;
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