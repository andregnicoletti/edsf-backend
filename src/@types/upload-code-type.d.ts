// import { z } from "zod";
// import { DownloadSchemas } from "../schemas";

// export type UploadCodeType = z.infer<typeof DownloadSchemas.Params.UploadCode>


export type UploadCodeType = {
    uploadId: string,
}