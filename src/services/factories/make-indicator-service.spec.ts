import { describe, expect, it } from "vitest";
import { makeIndicatorService } from "./make-indicator-service";
import { IndicatorService } from "../indicator-service";

describe('Indicator Factory Tests', () => {

    it('should create indicator service', async () => {
        const service = await makeIndicatorService();
        expect(service).instanceof(IndicatorService);
    });

});