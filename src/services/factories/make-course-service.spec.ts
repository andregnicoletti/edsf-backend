import { describe, expect, it } from "vitest";
import { makeCourseService } from "./make-course-service";
import { CourseService } from "../course-service";

describe('Course Factory Tests', () => {

    it('should create course service', async () => {
        const service = await makeCourseService();
        expect(service).instanceof(CourseService);
    });

});