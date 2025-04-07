import { t } from "i18next";
import { IndicatorServiceErrors } from "../errors/code-errors";
import { ServiceError } from "../errors/service-error";
import { GoalIndicatorRepository } from "../repositories/interface/goal-indicator-repository";
import { IndicatorCourseRepository } from "../repositories/interface/indicator-course-repository";
import { IndicatorRepository } from "../repositories/interface/indicator-repository";
import { ValueIndicatorRepository } from "../repositories/interface/sum-value-indicator-repository";
import { CompanyService } from "./company-service";
import { CourseService } from "./course-service";
import { ProducerService } from "./producer-service";
import { AuthenticateService } from "./authenticate-service";
import { GoalIndicatorEntity } from "@prisma/client";


export class IndicatorService {

    constructor(
        private indicatorRepository: IndicatorRepository,
        private indicatorCourseRepository: IndicatorCourseRepository,
        private valueIndicatorRepository: ValueIndicatorRepository,
        private goalIndicatorRepository: GoalIndicatorRepository,
        private companyService: CompanyService,
        private courseService: CourseService,
        private producerService: ProducerService,
        private authenticateService: AuthenticateService,
    ) { }

    findIndicatorByCode = async (indicatorCode: string) => {
        const indicator = await this.indicatorRepository.findByCode(indicatorCode);
        if (!indicator) {
            throw new ServiceError(t('messages.indicator_code_not_found', { indicatorCode }),
                IndicatorServiceErrors.ERROR_INDICATOR_CODE_DOESNT_EXISTIS);
        }

        return { indicator }
    }

    createNewIndicator = async (indicatorCode: string, descripton: string, companyCode: string) => {

        if (!indicatorCode) {
            throw new ServiceError(t('messages.indicator_code_is_required'),
                IndicatorServiceErrors.ERROR_FIELD_IS_REQUIRED);
        } else if (!descripton) {
            throw new ServiceError(t('messages.indicator_description_is_required'),
                IndicatorServiceErrors.ERROR_FIELD_IS_REQUIRED);
        } else if (!companyCode) {
            throw new ServiceError(t('messages.indicator_description_is_required'),
                IndicatorServiceErrors.ERROR_FIELD_IS_REQUIRED);
        }

        let entity
        try {
            entity = await this.findIndicatorByCode(indicatorCode);
        } catch (_error) {
            //ignoro erro se não existir um indicador com o mesmo código
        }

        // Verifico se já exite um indicador com mesmo código
        if (entity && entity.indicator.id) {
            throw new ServiceError(t('messages.indicator_code_already_exists', { indicatorCode }),
                IndicatorServiceErrors.ERROR_INDICATOR_CODE_ALREADY_EXISTS);
        }

        // Verifico se existe empresa cadastraca com o mesmo código
        const { company } = await this.companyService.findCompanyByCode(companyCode);

        const indicator = await this.indicatorRepository.save({
            code: indicatorCode,
            company_id: company.id,
            indicatorDescription: descripton,
        });

        return { indicator }
    }

    createNewIndicatorCourseAssoc = async (indicatorCode: string, courseCode: string) => {

        if (!indicatorCode) {
            throw new ServiceError(t('messages.indicator_code_is_required'),
                IndicatorServiceErrors.ERROR_FIELD_IS_REQUIRED);
        } else if (!courseCode) {
            throw new ServiceError(t('messages.indicator_code_is_required'),
                IndicatorServiceErrors.ERROR_FIELD_IS_REQUIRED);
        }

        const { indicator } = await this.findIndicatorByCode(indicatorCode);
        const { course } = await this.courseService.findCourseByCode(courseCode);

        let entity;
        try {
            entity = await this.indicatorCourseRepository.find(indicator.id, course.id);
        } catch (_error) {
            //ignora erro
        }

        if (entity) {
            throw new ServiceError(t('messages.relation_already_exists_indicator_course'),
                IndicatorServiceErrors.ERROR_TO_SAVE_INDICATOR_COURSE_ASSOC);
        }

        await this.indicatorCourseRepository.save({
            courseId: course.id,
            indicatorId: indicator.id,
        });
    }

    summary = async (indicatorCode: string, producerCode: string, indicatorValue: string, summaryGrouper: string) => {

        if (!indicatorCode) {
            throw new ServiceError(t('messages.indicator_code_is_required'),
                IndicatorServiceErrors.ERROR_FIELD_IS_REQUIRED);
        } else if (!producerCode) {
            throw new ServiceError(t('messages.producer_code_is_required'),
                IndicatorServiceErrors.ERROR_FIELD_IS_REQUIRED);
        } else if (!indicatorValue) {
            throw new ServiceError(t('messages.indicator_value_is_required'),
                IndicatorServiceErrors.ERROR_FIELD_IS_REQUIRED);
        } else if (!summaryGrouper) {
            throw new ServiceError(t('messages.summary_grouper_code_is_required'),
                IndicatorServiceErrors.ERROR_FIELD_IS_REQUIRED);
        } else if (summaryGrouper.length !== 4) {
            throw new ServiceError(t('messages.summary_grouper_invalid_lenght'),
                IndicatorServiceErrors.ERROR_FIELD_SUMMARY_YEAR_IS_INVALID);
        }

        const { indicator } = await this.findIndicatorByCode(indicatorCode);
        const { producer } = await this.producerService.findProducerByCode(producerCode);

        //verifica se o registro existe no banco
        const data = await this.valueIndicatorRepository.findById(summaryGrouper, indicator.id, producer.id);
        if (data) {
            throw new ServiceError(t('messages.summary_key_already_exists'),
                IndicatorServiceErrors.ERROR_INDICATOR_CODE_ALREADY_EXISTS);
        }

        this.valueIndicatorRepository.save({
            indicator_id: indicator.id,
            indicatorValue: Number(indicatorValue),
            producer_id: producer.id,
            summaryGrouper
        });

    }

    private listIndicators = async (courseIds: string[]) => {
        const indicatorCourses = await this.indicatorCourseRepository.findAllByCouseId(courseIds);
        const indicatorsCoursesId = indicatorCourses.map(item => item.indicatorId);
        const indicators = await this.indicatorRepository.findAllByIndicatorId(indicatorsCoursesId);
        return indicators;
    }

    listCompanyIds = async (courseIds: string[]) => {
        const indicators = await this.listIndicators(courseIds);
        return indicators.map(i => i.company_id);
    }

    countIndicatorGoal = async (courseIds: string[]) => {
        const indicators = await this.listIndicators(courseIds);
        const indicatorIds = indicators.map(i => i.id);
        const goals = await this.goalIndicatorRepository.findAllByIndicatorId(indicatorIds);

        let result = 0;
        for (const goal of goals) {
            if (Number(goal.percentageAccomplished) >= 100) {
                result += 1;
            }
        }
        return result;
    }

    findAssocIndicatorCourseByCompanyId = async (company_id: string) => {
        const out: Set<string> = new Set();
        const indicators = await this.indicatorRepository.findAllByCompanyId(company_id);
        for (const indicator of indicators) {
            const assocIndicatorCourse = await this.indicatorCourseRepository.listAllByIndicatorId(indicator.id);
            assocIndicatorCourse.forEach(i => out.add(i.courseId));
        }
        return out;
    }

    listAllIndicators = async (userId: string) => {
        const { company_id } = await this.authenticateService.getProfile(userId);
        const indicators = await this.indicatorRepository.findAllByCompanyId(company_id);
        return indicators;
    }

    listAllIndicatorsByCourse = async (userId: string, courses: string[]) => {
        const { company_id } = await this.authenticateService.getProfile(userId);
        const indicators = await this.indicatorRepository.findAllByCompanyIdAndCourses(company_id, courses);
        return indicators;
    }


    getIndicator = async (userId: string, indicatorId: string) => {
        const { company_id } = await this.authenticateService.getProfile(userId);
        const indicators = await this.indicatorRepository.findAllByCompanyId(company_id);

        const indicator = indicators.find(item => item.id === indicatorId);

        if (!indicator) {
            throw new ServiceError(t('messages.indicator_id_not_found', { indicatorId }),
                IndicatorServiceErrors.ERROR_INDICATOR_ID_NOT_FOUND);
        }

        return indicator;
    }

    listGoalsByIndicatorsId = async (indicatorsId: string[]) => {
        return await this.goalIndicatorRepository.findAllByIndicatorId(indicatorsId)
    }

    getGoal = async (indicatorId: string, producerId: string, year: string): Promise<GoalIndicatorEntity | null> => {
        return await this.goalIndicatorRepository.findById(indicatorId, producerId, year);
    }

    getSumValueIndicatorById = async (goalYear: string, indicatorId: string, producerId: string) => {
        return await this.valueIndicatorRepository.findById(goalYear, indicatorId, producerId);
    }

}