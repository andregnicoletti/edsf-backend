import { describe, expect, it } from "vitest";
import { makeAuthenticateService } from "./make-authenticate-service";
import { AuthenticateService } from "../authenticate-service";

describe('Authenticate Factory Tests', () => {

    it('should create authenticate service', async () => {
        const service = await makeAuthenticateService();
        expect(service).instanceof(AuthenticateService);
    });

});