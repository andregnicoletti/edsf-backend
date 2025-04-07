import { t } from "i18next";
import { UploadServiceError } from "../errors/code-errors";
import { GenericError } from "../errors/generic-error";
import { RecordRow } from "../services/data-load-service";
import { WorkerService } from "../services/worker-service";
import { EventResponse } from "./event";
import { ProcessCsvRow } from "./interface/process-csv-row";
import { WorkerCourseUploadSchema } from "../@types/upload-schemas";
import logger from "../config/logger";

export class CreateWorkerCourse implements ProcessCsvRow {

    constructor(private workerService: WorkerService) { }

    getCode(): string {
        return 'WORKER_COURSE'
    }

    execute = async (row: RecordRow): Promise<EventResponse> => {

        let out: EventResponse;

        const schema: WorkerCourseUploadSchema = {
            cpf: row['CPF'],
            courseCode: row['CODIGO_CURSO'],
            registrationDate: row['DATA_INSCRICAO'],
            lastAccessDate: row['DATA_ULT_ACESSO'],
            completionDate: row['DATA_CONCLUSAO'],
            cityName: row['CIDADE'],
            uf: row['UF'],
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
            const _entity = await this.workerService.enroll(
                schema.cpf,
                schema.courseCode,
                schema.cityName,
                schema.uf,
                schema.registrationDate,
                schema.completionDate,
                schema.lastAccessDate,
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