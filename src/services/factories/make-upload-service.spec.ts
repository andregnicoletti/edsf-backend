import { describe, expect, it } from "vitest";
import { makeDataLoadService } from "./make-upload-service";
import { DataLoadService } from "../data-load-service";

describe('Data Load Factory Tests', () => {

    it('should create data load service', async () => {
        const service = await makeDataLoadService();
        expect(service).instanceof(DataLoadService);
    });

});