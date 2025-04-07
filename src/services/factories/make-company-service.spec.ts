import { describe, expect, it } from "vitest";
import { makeCompanyService } from "./make-company-service";
import { CompanyService } from "../company-service";

describe('Company Factory Tests', () => {

    it('should create company service', async () => {
        const service = await makeCompanyService();
        expect(service).instanceof(CompanyService);
    });

});