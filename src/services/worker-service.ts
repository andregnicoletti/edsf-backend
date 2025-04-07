import { WorkerCourseAssocEntity } from "@prisma/client"
import { WorkerServiceError } from "../errors/code-errors"
import { ServiceError } from "../errors/service-error"
import { WorkerCourseAssocRepository } from "../repositories/interface/worker-course-assoc-repository"
import { CityService } from "./city-service"
import { CourseService } from "./course-service"
import { t } from "i18next";
import { parseTextToDate } from "../lib/date-utils"
import logger from "../config/logger"

interface WorkerServiceResponse {
    worker: WorkerCourseAssocEntity
}

export class WorkerService {

    constructor(
        private workerCourseAssocRepository: WorkerCourseAssocRepository,
        private courseService: CourseService,
        private cityService: CityService,
    ) { }

    enroll = async (cpf: string, courseCode: string, cityName: string, uf: string, initDateTxt?: string, endDateTxt?: string, lastAccessDate?: string): Promise<WorkerServiceResponse> => {

        if (!cpf) {
            throw new ServiceError(t('messages.cpf_is_required'),
                WorkerServiceError.ERROR_FIELD_IS_REQUIRED)
        } else if (!courseCode) {
            throw new ServiceError(t('messages.cpf_is_required'),
                WorkerServiceError.ERROR_FIELD_IS_REQUIRED)
        } else if (!cityName) {
            throw new ServiceError(t('messages.city_name_is_required'),
                WorkerServiceError.ERROR_FIELD_IS_REQUIRED)
        } else if (!uf) {
            throw new ServiceError(t('messages.state_name_is_required'),
                WorkerServiceError.ERROR_FIELD_IS_REQUIRED)
        } else if (!initDateTxt) {
            throw new ServiceError(t('messages.initial_date_is_required'),
                WorkerServiceError.ERROR_FIELD_IS_REQUIRED)
        }

        const initDate = parseTextToDate(initDateTxt);
        let endDate: Date | undefined | null = null;
        if (endDateTxt) {
            endDate = parseTextToDate(endDateTxt);
        }

        if (!initDate) {
            throw new ServiceError(t('messages.initial_date_is_required'),
                WorkerServiceError.ERROR_FIELD_IS_REQUIRED)
        }

        //verifico se o curso existe
        const courseEntity = await this.courseService.findCourseByCode(courseCode);

        //verifico se a cidade é válida
        const cityEntity = await this.cityService.findCityByNameAndUf(cityName, uf);

        //verifico se a data inicial é menor do que a data final
        logger.info(`Checking dates: initDate=${initDate}, endDate=${endDate}`);
        if (endDate && initDate.getTime() > endDate.getTime()) {
            throw new ServiceError(t('messages.initial_date_must_be_less_than_end_date'),
                WorkerServiceError.ERROR_INVALID_DATES);
        }

        let lastAccess: Date | undefined | null = null;
        if (lastAccessDate) {
            lastAccess = parseTextToDate(lastAccessDate);
        }

        //verifico se o cpf + courseCode + initDate já existir no banco apenas retorna o objeto
        const isThePersonEnrolled = await this.verifyEnroll(cpf, courseEntity.course.id, initDate);
        if (!isThePersonEnrolled) {
            //fazer a matricula
            const worker = await this.workerCourseAssocRepository.save({
                city_id: cityEntity.city.id,
                completionDate: endDate,
                course_id: courseEntity.course.id,
                cpf,
                registrationDate: initDate,
                lastAccessDate: lastAccess,
            });
            return { worker }

        } else if (isThePersonEnrolled && endDate !== isThePersonEnrolled.completionDate) {
            //SE pessoa já inscrita mais tiver data de conclusão diferente de null, atualizar a data de conclusão
            //Fazer um update de DATA CONCLUSAO
            const worker = await this.workerCourseAssocRepository.updateCompletionDate(
                cpf,
                initDate,
                courseEntity.course.id,
                endDate,
            );
            return { worker }
        } else {
            logger.info(`Worker course Assoc already exists with cpf: ${cpf}, course code: ${courseCode} and date: ${initDate}`)
            return { worker: isThePersonEnrolled }
        }
    }

    verifyEnroll = async (cpf: string, courseId: string, initDate: Date): Promise<WorkerCourseAssocEntity | null> => {
        try {
            const entity = await this.workerCourseAssocRepository.getWorkerCourseAssocById(cpf, courseId, initDate);
            return entity
        } catch (error) {
            logger.warn(error)
            return null
        }
    }

    getEnrollById = async (cpf: string, courseId: string, initDate: Date) => {
        try {
            const entity = await this.workerCourseAssocRepository.getWorkerCourseAssocById(cpf, courseId, initDate);
            return entity;
        }
        catch (error) {
            logger.warn(error)
            throw new ServiceError(t('messages.enroll_id_not_found', { cpf, courseId, initDate }),
                WorkerServiceError.ERROR_ID_NOT_FOUND);
        }
    }

}