import { describe, expect, it } from "vitest";
import { makeDashboardService } from "./make-dashboard-service";
import { DashboardService } from "../dashboard-service";

describe('Dashboard Factory Tests', () => {

    it('should create dashboard service', async () => {
        const service = await makeDashboardService();
        expect(service).instanceof(DashboardService);
    });

});