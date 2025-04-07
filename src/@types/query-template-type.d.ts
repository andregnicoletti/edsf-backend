// import { z } from "zod";
// import { DownloadSchemas } from "../schemas";

// export type QueryTemplateType = z.infer<typeof DownloadSchemas.Queries.Template>



export enum QueryTemplateType {
    'COURSE',
    'GOAL',
    'WORKER_COURSE',
    'INDICATOR_COURSE',
    'INDICATOR',
    'COMPANY',
    'PRODUCER',
    'INDICATOR_VALUE',
}