import { describe, expect, it } from "vitest";
import { makeCityService } from "./make-city-service";
import { CityService } from "../city-service";

describe('City Factory Tests', () => {

    it('should create city service', async () => {
        const service = await makeCityService();
        expect(service).instanceof(CityService);
    });

});