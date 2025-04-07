import { CourseEntity, Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { CourseRepository } from "../interface/course-repository";

const repository: CourseEntity[] = [
    {
        id: '1',
        code: 'C001',
        courseDescription: 'Course for test',
        averageDuration: new Prisma.Decimal(10),
        numberClass: 15
    },
    {
        id: '2',
        code: 'C002',
        courseDescription: 'Course for test 2',
        averageDuration: new Prisma.Decimal(20),
        numberClass: 5
    }
];

export class InMemoryCourseRepository implements CourseRepository {

    findAllByCodes(coursesCode: string[]): Promise<CourseEntity[]> {
        const filter = repository.filter(item => coursesCode.includes(item.code));
        return Promise.resolve(filter);
    }

    findById(id: string): Promise<CourseEntity | null> {
        const data = repository.find((item) => item.id === id);
        if (data) {
            return Promise.resolve(data);
        }
        return Promise.resolve(null);
    }

    dashboardFilterCourses(courses: string[]): Promise<CourseEntity[]> {
        const filter = repository.filter(item => courses.includes(item.code));
        return Promise.resolve(filter);
    }

    findAll(): Promise<CourseEntity[]> {
        return Promise.resolve(repository);
    }

    findByCode(code: string): Promise<CourseEntity | null> {
        const data = repository.find((item) => item.code === code);
        if (!data) {
            return Promise.resolve(null);
        }
        return Promise.resolve(data);
    }

    save(data: Prisma.CourseEntityCreateInput): Promise<CourseEntity> {
        data.id = randomUUID();
        repository.push(data as CourseEntity);
        return Promise.resolve(data as CourseEntity);
    }

    async deleteByCode(code: string): Promise<CourseEntity> {
        const entity = await this.findByCode(code);
        const index = repository.findIndex(item => item.id === entity?.id);

        if (index !== -1) {
            repository.splice(index, 1);
            return Promise.resolve(entity as CourseEntity);
        }

        throw new Error();

    }

}