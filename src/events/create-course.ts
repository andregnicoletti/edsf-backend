
import { t } from "i18next";
import { UploadServiceError } from "../errors/code-errors";
import { GenericError } from "../errors/generic-error";
import { CourseService } from "../services/course-service";
import { RecordRow } from "../services/data-load-service";
import { EventResponse } from "./event";
import { ProcessCsvRow } from "./interface/process-csv-row";
import { CourseUploadSchema } from "../@types/upload-schemas";
import logger from "../config/logger";

export class CreateCourse implements ProcessCsvRow {

    constructor(private courseService: CourseService) { }

    getCode(): string {
        return 'COURSE'
    }

    execute = async (row: RecordRow): Promise<EventResponse> => {

        let out: EventResponse;

        const schema: CourseUploadSchema = {
            courseCode: row['CODIGO_CURSO'],
            courseDescription: row['DESC_CURSO'],
            numberClass: parseInt(row['QTD_AULAS']),
            averageDuration: parseFloat(row['DURACAO_MÉDIA']),
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
            const _newCourse = await this.courseService.createNewCourse(
                schema.courseCode,
                schema.numberClass,
                schema.averageDuration,
                schema.courseDescription
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