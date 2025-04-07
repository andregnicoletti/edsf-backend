import { CourseServiceErrors } from "../errors/code-errors";
import { CourseEntity } from "@prisma/client";
import { ServiceError } from "../errors/service-error";
import { CourseRepository } from "../repositories/interface/course-repository";
import { t } from "i18next";
import { AuthenticateService } from "./authenticate-service";
import { IndicatorRepository } from "../repositories/interface/indicator-repository";
import { IndicatorCourseRepository } from "../repositories/interface/indicator-course-repository";
import logger from "../config/logger";

interface CourseServiceResponse {
    course: CourseEntity
}

export class CourseService {

    constructor(
        private courseRepository: CourseRepository,
        private auth: AuthenticateService,
        private indicatorRepository: IndicatorRepository,
        private indicatorCourseRepository: IndicatorCourseRepository,
    ) { }

    findCourseByCode = async (code: string): Promise<CourseServiceResponse> => {
        const course = await this.courseRepository.findByCode(code);
        if (course == null) {
            throw new ServiceError(t('messages.course_with_code_does_not_exist', { code }),
                CourseServiceErrors.ERROR_FIND_COURSE_BY_ID);
        }
        return { course }
    }

    listAllCourses = async (userId: string): Promise<CourseEntity[]> => {

        const out = [];

        const { company_id } = await this.auth.getProfile(userId);
        logger.info(`companyId: ${company_id}`)

        //procurar cad indicador com as assoc de curso
        const indicatorsEntity = await this.indicatorRepository.findAllByCompanyId(company_id);
        logger.info(`indicatorsEntity: ${indicatorsEntity.length}`);

        const courseIds = new Set<string>();
        for (const entity of indicatorsEntity) {
            logger.info(`Indicator id: ${entity.id}`);
            const result = await this.indicatorCourseRepository.listAllByIndicatorId(entity.id);
            result.forEach(i => courseIds.add(i.courseId))
        }

        for (const id of courseIds) {
            logger.info(`course id: ${id}`)
            const course = await this.findCourseById(id);

            console.log(course)

            out.push(course);
        }
        // return await this.courseRepository.findAll();
        return out;
    }

    listAllCoursesByIndicators = async (userId: string, indicators: string[]) => {
        const { company_id } = await this.auth.getProfile(userId);
        const courses = await this.courseRepository.findAllByCompanyIdAndIndicators(company_id, indicators);
        return courses;
    }

    createNewCourse = async (code: string, numberClass: number, averageDuration: number | null, courseDescription: string) => {

        if (!code) {
            throw new ServiceError(t('messages.course_code_is_required'),
                CourseServiceErrors.ERROR_FIELD_IS_REQUIRED);
        } else if (!numberClass) {
            throw new ServiceError(t('messages.number_of_class_is_required'),
                CourseServiceErrors.ERROR_FIELD_IS_REQUIRED);
        } else if (!courseDescription) {
            throw new ServiceError(t('messages.course_description_is_required'),
                CourseServiceErrors.ERROR_FIELD_IS_REQUIRED);
        } else if (!averageDuration) {
            throw new ServiceError(t('messages.average_duration_code_is_required'),
                CourseServiceErrors.ERROR_FIELD_IS_REQUIRED);
        }

        let course;
        try {
            course = await this.findCourseByCode(code);
        } catch (_error) {
            //ignora erro, só pode salvar caso não encontre outro curso com mesmo código
        }

        if (course) {
            throw new ServiceError(t('messages.course_with_code_already_exists', { code }),
                CourseServiceErrors.ERROR_COURSE_CODE_ALREADY_EXISTS)
        }

        const newCourse = await this.courseRepository.save({
            averageDuration,
            code,
            courseDescription,
            numberClass,
        });

        return { couse: newCourse }
    }

    removeCourseByCode = async (code: string) => {
        await this.courseRepository.deleteByCode(code);
    }

    getCourses = async (courses: string[]) => {
        return await this.courseRepository.dashboardFilterCourses(courses);
    }

    findCourseById = async (id: string): Promise<CourseEntity> => {
        const course = await this.courseRepository.findById(id);
        if (!course) {
            throw new ServiceError(t('messages.course_with_id_does_not_exist', { id }),
                CourseServiceErrors.ERROR_FIND_COURSE_BY_ID);
        }
        return course;
    }

    findCourseByCodes = async (coursesCode: string[]) => {
        return await this.courseRepository.findAllByCodes(coursesCode);
    }

    listAllCoursesWithoutFilters = async () => {
        return await this.courseRepository.findAll();
    }

    countTotalCourseByFilters = async (company_id: string, indicators: string[], courses: string[]) => {
        return await this.courseRepository.findByIndicators(company_id, indicators, courses);
    }

}