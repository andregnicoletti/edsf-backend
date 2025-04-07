// import { z } from "zod";
// import { ProducerSchemas } from "../schemas";

// export type CreateProducerType = z.infer<typeof ProducerSchemas.Bodies.Create>

export type CreateProducerType = {
    producerCode: string,
    companyCode: string,
    description: string,
    city: string,
    uf: string,
}