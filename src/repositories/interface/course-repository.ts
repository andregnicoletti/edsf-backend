import { CourseEntity, Prisma } from "@prisma/client";

export interface CourseVO {
    id: string,
    course_description: string,
    average_duration: number,
    code: string,
    number_class: number
}

export interface CourseRepository {

    findAllByCompanyIdAndIndicators(company_id: string, indicators: string[]): Promise<CourseEntity[]>;

    findByIndicators(company_id: string, indicators: string[], courses: string[],): Promise<CourseVO[]>;

    findAllByCodes(coursesCode: string[]): Promise<CourseEntity[]>;

    findById(id: string): Promise<CourseEntity | null>;

    dashboardFilterCourses(courses: string[]): Promise<CourseEntity[]>;

    findAll(): Promise<CourseEntity[]>;

    findByCode(code: string): Promise<CourseEntity | null>

    save(data: Prisma.CourseEntityCreateInput): Promise<CourseEntity>

    deleteByCode(code: string): Promise<CourseEntity>;

}