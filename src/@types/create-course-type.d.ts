// import { z } from "zod";
// import { CourseSchemas } from "../schemas";

// export type CreateCourseType = z.infer<typeof CourseSchemas.Bodies.Create>


export type CreateCourseType = {
    code: string,
    courseDescription: string,
    numberClass: number,
    averageDuration: number,
}