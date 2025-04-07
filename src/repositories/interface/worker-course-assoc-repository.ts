import { Prisma, WorkerCourseAssocEntity } from "@prisma/client";

export interface DashStackedEntity {
    city_id: string,
    city_name: string,
    state: string,
    course_id: string,
    course_description: string,
    course_code: string,
    total_distinct_cpfs: number,
}

export interface DashLineEntity {
    city_name: string,
    state: string,
    total_enrolled: number,
    certified: number,
    in_training: number,
    city_id: string,
}

export interface DashWorkerCourseAssocEntity {
    cpf: string,
    registration_date: Date,
    completion_date: Date | null,
    last_access_date: Date | null,
    course_id: string,
    city_id: string,
    city_name: string,
    state: string,
}

export interface DashCities {
    city_id: string,
    city_name: string,
    state: string,
}


export interface DashTotalStudents {
    city_id: string,
    total_student: number,
}

export interface DashTotalCertified {
    city_id: string,
    total_certified: number,
}

export interface DashTotalSubscribers {
    city_id: string,
    total_subscribers: number,
}

export interface DashTotalProducers {
    city_id: string,
    total_producer: number,
}

export interface DashTotalGoal {
    producer_id: string,
    city_id: string,
    has_achieved_goal: number,
}

export interface DashTopOneCourse {
    course_name: string,
    total_enrollments: number,
    certified_people: number,
    people_in_training: number,
    total_lessons: number,
    average_duration: number,
}

export interface MinMaxYear {
    min_date: number,
    max_date: number,
}

export interface WorkerCourseAssocRepository {

    updateCompletionDate(cpf: string, registrationDate: Date, course_id: string, completionDate: Date | null | undefined): Promise<WorkerCourseAssocEntity>;

    countTotalTrainingByFilters(company_id: string, startOfMonth: Date | null, endOfMonth: Date, citiesId: string[], courses: string[], indicators: string[], producers: string[]): Promise<DashTotalSubscribers[]>;

    fetchMinAndMaxYears(): Promise<MinMaxYear>;

    getTopCitiesByRegistrations(company_id: string, startOfMonth: Date | null, endOfMonth: Date, citiesIds: string[], courses: string[], total: number, order: string, indicators: string[]): Promise<DashTotalStudents[]>;

    getCourseWithMostEnrollments(company_id: string, startOfMonth: Date | null, endOfMonth: Date, order: string, indicators: string[], courses: string[], cities: string[], producers: string[]): Promise<DashTopOneCourse[]>;

    countTotalGoalByFilters(company_id: string, yearFrom: string, yearTo: string, cities: string[], indicators: string[], courses: string[], producers: string[]): Promise<DashTotalGoal[]>;

    countTotalProducerByFilters(company_id: string, citiesId: string[], indicador: string[], courses: string[], yearFrom: string, YearTo: string, producers: string[]): Promise<DashTotalProducers[]>;

    countTotalCertifiedByFilters(company_id: string, startOfMonth: Date | null, endOfMonth: Date, arg3: string[], courses: string[], indicators: string[], producers: string[]): Promise<DashTotalCertified[]>;

    countTotalStudentByFilters(company_id: string, startOfMonth: Date | null, endOfMonth: Date, citiesId: string[], courses: string[], indicators: string[], producers: string[]): Promise<DashTotalStudents[]>;

    findCitiesIdByFilters(company_id: string, startOfMonth: Date | null, endOfMonth: Date, cities: string[], states: string[], courses: string[], indicators: string[], producers: string[]): Promise<DashCities[]>;

    subscribedStudentsAndCompany(company_id: string, startOfMonth: Date | null, endOfMonth: Date, cities: string[], states: string[], codes: string[], indicators: string[], producers: string[]): Promise<DashWorkerCourseAssocEntity[]>;

    dashLineChart(company_id: string, start: Date, end: Date, order: string, limit: number, courses: string[], cities: string[], indicators: string[]): Promise<DashLineEntity[]>;

    dashStackedColumnChartCoursesCompleted(company_id: string, startOfMonth: Date, endOfMonth: Date, order: string, courses: string[], cities: string[], indicators: string[]): Promise<DashStackedEntity[]>;

    dashStackedColumnChartCoursesNotCompleted(company_id: string, startOfMonth: Date | null, endOfMonth: Date, order: string, courses: string[], cities: string[], indicators: string[]): Promise<DashStackedEntity[]>;

    listPeopleByCourseAndCurrentMonthDistinctByCpf(coursesId: string[], startOfMonth: Date, endOfMonth: Date): Promise<WorkerCourseAssocEntity[]>;

    findByCoursesAndDateIdsDistinctByCityId(arg0: string[], startOfMonth: Date, endOfMonth: Date): Promise<WorkerCourseAssocEntity[]>;

    findByCoursesIdsDistinctByCityId(coursesByCompany: string[]): Promise<WorkerCourseAssocEntity[]>;

    countStudentsByData(startOfMonth: Date, endOfMonth: Date): Promise<number>;

    getWorkerCourseAssocById(cpf: string, courseCode: string, initDate: Date): Promise<WorkerCourseAssocEntity | null>;

    filterCountPeopleCertifiedInMonth(cityId: string, startDate: Date, endDate: Date): Promise<number>;

    findByCityIdDistinctByCityIdInMonth(cityId: string, startDate: Date, endDate: Date): Promise<WorkerCourseAssocEntity[]>;

    filterCountPeopleRegistredInMonth(cityId: string, startDate: Date, endDate: Date): Promise<number>;

    findByCityIdDistinctByCityId(id: string): Promise<WorkerCourseAssocEntity[]>;

    findByCityId(cityId: string): Promise<WorkerCourseAssocEntity[]>;

    save(data: Prisma.WorkerCourseAssocEntityUncheckedCreateInput): Promise<WorkerCourseAssocEntity>

}