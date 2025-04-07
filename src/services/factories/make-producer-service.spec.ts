import { describe, expect, it } from "vitest";
import { makeProducerService } from "./make-producer-service";
import { ProducerService } from "../producer-service";

describe('Producer Factory Tests', () => {

    it('should create producer service', async () => {
        const service = await makeProducerService();
        expect(service).instanceof(ProducerService);
    });

});