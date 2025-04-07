// import { z } from "zod";
// import { CourseSchemas } from "../schemas";

// export type DeleteCourseType = z.infer<typeof CourseSchemas.Queries.Delete>


export type DeleteCourseType = {
    code: string,
}