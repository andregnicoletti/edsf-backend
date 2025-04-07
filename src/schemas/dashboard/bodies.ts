import { z } from "zod";

export const ListWorkerCourse = z.object({
    cities: z.array(z.string()).optional(),
    states: z.array(z.string()).optional(),
    courses: z.array(z.string()).optional(),
});





