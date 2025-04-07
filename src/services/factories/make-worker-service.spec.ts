import { describe, expect, it } from "vitest";
import { makeWorkerService } from "./make-worker-service";
import { WorkerService } from "../worker-service";

describe('Worker Service Factory Tests', () => {

    it('should create worker service', async () => {
        const service = await makeWorkerService();
        expect(service).instanceof(WorkerService);
    });

});