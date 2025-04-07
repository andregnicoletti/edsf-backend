
import { t } from "i18next";
import { UploadServiceError } from "../errors/code-errors";
import { GenericError } from "../errors/generic-error";
import { RecordRow } from "../services/data-load-service";
import { GoalIndicatorService } from "../services/goal-indicator-service";
import { EventResponse } from "./event";
import { ProcessCsvRow } from "./interface/process-csv-row";
import { GoalUploadSchema } from "../@types/upload-schemas";
import logger from "../config/logger";

export class CreateGoalIndicator implements ProcessCsvRow {

    constructor(private goalIndicatorService: GoalIndicatorService) { }

    getCode(): string {
        return 'GOAL'
    }

    execute = async (row: RecordRow): Promise<EventResponse> => {

        let out: EventResponse;

        const schema: GoalUploadSchema = {
            goalCode: row['CODIGO_META'],
            producerCode: row['CODIGO_PRODUTOR'],
            indicatorCode: row['CODIGO_INDICADOR'],
            goalYear: row['ANO_META'],
            goal: row['META'],
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
            const _entity = await this.goalIndicatorService.createNewGoal(
                schema.goalCode,
                schema.producerCode,
                schema.indicatorCode,
                schema.goalYear,
                schema.goal,
                0.0
            );

            this.goalIndicatorService.calculatePercentageRealized();


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