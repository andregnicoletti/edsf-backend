import { describe, expect, it } from "vitest";
import { makeUserService } from "./make-user-service";
import { UserService } from "../user-service";

describe('User Service Factory Tests', () => {

    it('should create user service', async () => {
        const service = await makeUserService();
        expect(service).instanceof(UserService);
    });

});