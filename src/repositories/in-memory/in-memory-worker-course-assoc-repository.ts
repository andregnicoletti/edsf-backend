import { Prisma, WorkerCourseAssocEntity } from "@prisma/client";
import { DashCities, DashLineEntity, DashStackedEntity, DashTopOneCourse, DashTotalCertified, DashTotalGoal, DashTotalProducers, DashTotalStudents, DashWorkerCourseAssocEntity, WorkerCourseAssocRepository } from "../interface/worker-course-assoc-repository";

const mock: WorkerCourseAssocEntity[] = [{
    city_id: '3',
    course_id: '1',
    cpf: '11122233344',
    registrationDate: new Date('01/01/2025'),
    completionDate: new Date('01/02/2025'),
    lastAccessDate: new Date('01/02/2025'),
}];

export class InMemoryWorkerCourseAssocRepository implements WorkerCourseAssocRepository {

    getTopCitiesByRegistrations(_company_id: string, _startOfMonth: Date, _endOfMonth: Date, _citiesIds: string[], _courses: string[], _total: number, _order: string): Promise<DashTotalStudents[]> {
        throw new Error("Method not implemented.");
    }

    dashStackedColumnChartCoursesCompleted(_company_id: string, _startOfMonth: Date, _endOfMonth: Date, _order: string, _courses: string[], _cities: string[]): Promise<DashStackedEntity[]> {
        throw new Error("Method not implemented.");
    }

    dashStackedColumnChartCoursesNotCompleted(_company_id: string, _startOfMonth: Date, _endOfMonth: Date, _order: string, _courses: string[], _cities: string[]): Promise<DashStackedEntity[]> {
        throw new Error("Method not implemented.");
    }

    getCourseWithMostEnrollments(_company_id: string, _startOfMonth: Date, _endOfMonth: Date, _order: string): Promise<DashTopOneCourse[]> {
        throw new Error("Method not implemented.");
    }

    countTotalGoalByFilters(_company_id: string, _currentYear: number): Promise<DashTotalGoal[]> {
        throw new Error("Method not implemented.");
    }
    countTotalProducerByFilters(_company_id: string, _citiesId: string[]): Promise<DashTotalProducers[]> {
        throw new Error("Method not implemented.");
    }
    countTotalCertifiedByFilters(_company_id: string, _startOfMonth: Date, _endOfMonth: Date, _arg3: string[], _courses: string[]): Promise<DashTotalCertified[]> {
        throw new Error("Method not implemented.");
    }
    countTotalStudentByFilters(_company_id: string, _startOfMonth: Date, _endOfMonth: Date, _citiesId: string[], _courses: string[]): Promise<DashTotalStudents[]> {
        throw new Error("Method not implemented.");
    }
    findCitiesIdByFilters(_company_id: string, _startOfMonth: Date, _endOfMonth: Date, _cities: string[], _states: string[], _courses: string[]): Promise<DashCities[]> {
        throw new Error("Method not implemented.");
    }
    subscribedStudentsAndCompany(_company_id: string, _startOfMonth: Date, _endOfMonth: Date, _cities: string[], _states: string[], _codes: string[]): Promise<DashWorkerCourseAssocEntity[]> {
        throw new Error("Method not implemented.");
    }
    dashLineChart(_company_id: string, _start: Date, _end: Date, _order: string, _limit: number): Promise<DashLineEntity[]> {
        throw new Error("Method not implemented.");
    }
    dashStackedColumnChart(_company_id: string, _coursesId: string[], _startOfMonth: Date, _endOfMonth: Date, _order: string, _limit: number, _courses: string[], _cities: string[]): Promise<DashStackedEntity[]> {
        throw new Error("Method not implemented.");
    }

    async listPeopleByCourseAndCurrentMonthDistinctByCpf(coursesId: string[], startOfMonth: Date, endOfMonth: Date): Promise<WorkerCourseAssocEntity[]> {
        const distinctPeople = new Set<string>();
        return mock.filter(item => {
            const isInDateRange = item.registrationDate >= startOfMonth && item.registrationDate <= endOfMonth;
            const isCourseMatch = coursesId.includes(item.course_id);
            if (isInDateRange && isCourseMatch && !distinctPeople.has(item.cpf)) {
                distinctPeople.add(item.cpf);
                return true;
            }
            return false;
        });
    }

    async findByCoursesAndDateIdsDistinctByCityId(arg0: string[], startOfMonth: Date, endOfMonth: Date): Promise<WorkerCourseAssocEntity[]> {
        const uniqueCities = new Set<string>();
        return mock.filter(item => {
            const isInDateRange = item.registrationDate >= startOfMonth && item.registrationDate <= endOfMonth;
            const isCourseMatch = arg0.includes(item.course_id);
            if (isInDateRange && isCourseMatch && !uniqueCities.has(item.city_id)) {
                uniqueCities.add(item.city_id);
                return true;
            }
            return false;
        });
    }

    async findByCoursesIdsDistinctByCityId(coursesByCompany: string[]): Promise<WorkerCourseAssocEntity[]> {
        const uniqueCities = new Set<string>();
        return mock.filter(item => {
            if (coursesByCompany.includes(item.course_id) && !uniqueCities.has(item.city_id)) {
                uniqueCities.add(item.city_id);
                return true;
            }
            return false;
        });
    }

    async countStudentsByData(startOfMonth: Date, endOfMonth: Date): Promise<number> {
        return mock.filter(item => item.registrationDate >= startOfMonth && item.registrationDate <= endOfMonth).length;
    }

    async getWorkerCourseAssocById(cpf: string, courseCode: string, initDate: Date): Promise<WorkerCourseAssocEntity | null> {
        const entity = mock.find(item => item.cpf === cpf && item.course_id === courseCode && item.registrationDate >= initDate) || null;
        if (!entity) {
            throw new Error('WorkerCourseAssocEntity not found');
        }
        return entity;
    }

    async filterCountPeopleCertifiedInMonth(cityId: string, startDate: Date, endDate: Date): Promise<number> {
        return mock.filter(item => item.city_id === cityId && item.completionDate && item.completionDate >= startDate && item.completionDate <= endDate).length;
    }

    async findByCityIdDistinctByCityIdInMonth(cityId: string, startDate: Date, endDate: Date): Promise<WorkerCourseAssocEntity[]> {
        return mock.filter(item => item.city_id === cityId && item.registrationDate >= startDate && item.registrationDate <= endDate);
    }

    async filterCountPeopleRegistredInMonth(cityId: string, startDate: Date, endDate: Date): Promise<number> {
        return mock.filter(item => item.city_id === cityId && item.registrationDate >= startDate && item.registrationDate <= endDate).length;
    }

    async findByCityIdDistinctByCityId(id: string): Promise<WorkerCourseAssocEntity[]> {
        const uniqueCities = new Set<string>();
        return mock.filter(item => {
            if (item.city_id === id && !uniqueCities.has(item.city_id)) {
                uniqueCities.add(item.city_id);
                return true;
            }
            return false;
        });
    }

    async findByCityId(cityId: string): Promise<WorkerCourseAssocEntity[]> {
        return mock.filter(item => item.city_id === cityId);
    }

    async save(data: Prisma.WorkerCourseAssocEntityUncheckedCreateInput): Promise<WorkerCourseAssocEntity> {
        const newItem: WorkerCourseAssocEntity = {
            cpf: data.cpf,
            course_id: data.course_id,
            city_id: data.city_id,
            registrationDate: new Date(data.registrationDate),
            completionDate: data.completionDate ? new Date(data.completionDate) : null,
            lastAccessDate: data.lastAccessDate ? new Date(data.lastAccessDate) : null,
        };

        mock.push(newItem);
        return newItem;
    }


}
