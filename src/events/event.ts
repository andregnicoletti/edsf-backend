import logger from "../config/logger";
import { CompanyService } from "../services/company-service";
import { CourseService } from "../services/course-service";
import { RecordRow } from "../services/data-load-service";
import { GoalIndicatorService } from "../services/goal-indicator-service";
import { IndicatorService } from "../services/indicator-service";
import { ProducerService } from "../services/producer-service";
import { WorkerService } from "../services/worker-service";
import { CreateCompany } from "./create-company";
import { CreateCourse } from "./create-course";
import { CreateGoalIndicator } from "./create-goal";
import { CreateIndicator } from "./create-indicator";
import { CreateIndicatorCourse } from "./create-indicator-course";
import { CreateIndicatorValue } from "./create-indicator-value";
import { CreateProducer } from "./create-producer";
import { CreateWorkerCourse } from "./create-worker-course";
import { EventError } from "./event-error";
import { ProcessCsvRow } from "./interface/process-csv-row";

export interface EventResponse {
    code: string,
    status: boolean,
    schema: object,
}

export enum EventType {
    NOVA_ORG = 'NOVA_ORG',
    NOVO_PRODUTOR = 'NOVO_PRODUTOR',
    NOVO_CURSO = 'NOVO_CURSO',
    NOVO_INDICADOR = 'NOVO_INDICADOR',
    NOVO_INDICADOR_CURSO = 'NOVO_INDICADOR_CURSO',
    NOVO_TRABALHADOR_CURSO = 'NOVO_TRABALHADOR_CURSO',
    NOVO_VALOR_INDICADOR = 'NOVO_VALOR_INDICADOR',
    NOVA_META = 'NOVA_META',
    EVENT_NOT_FOUND = 'EVENT_NOT_FOUND',
}

export class EventProcedure {

    private dispatchTable: { [key in EventType]: ProcessCsvRow };

    constructor(
        private companyService: CompanyService,
        private producerService: ProducerService,
        private indicatorService: IndicatorService,
        private goalIndicatorService: GoalIndicatorService,
        private courseService: CourseService,
        private workerService: WorkerService,
    ) {

        this.dispatchTable = {
            NOVA_ORG: new CreateCompany(this.companyService),
            NOVO_PRODUTOR: new CreateProducer(this.producerService),
            NOVO_INDICADOR: new CreateIndicator(this.indicatorService),
            NOVA_META: new CreateGoalIndicator(this.goalIndicatorService),
            NOVO_CURSO: new CreateCourse(this.courseService),
            NOVO_INDICADOR_CURSO: new CreateIndicatorCourse(this.indicatorService),
            NOVO_TRABALHADOR_CURSO: new CreateWorkerCourse(this.workerService),
            NOVO_VALOR_INDICADOR: new CreateIndicatorValue(this.indicatorService),
            EVENT_NOT_FOUND: new EventError(),
        }
    };

    // Função que usa a dispatch table para executar a operação correta
    public execute = async (event: EventType, row: RecordRow): Promise<EventResponse> => {
        const func = this.dispatchTable[event];
        logger.info(`Executando evento ${event}`);
        const out = await func.execute(row);
        logger.info(`executed: ${out.status}`)
        return out;
    };
}



